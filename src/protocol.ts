import { REFERENCE_PROTOCOL } from './reference.ts'
import { TRAINING_TRANSCRIPT } from './training.ts'
import type { Protocol, TaskItem } from './types.ts'

export function normalizeTranscript(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

/**
 * Детерминированная заглушка. Учебный файл даёт эталон дословно.
 * Другой текст разбирается по тем же речевым меткам, чтобы повторное
 * нажатие заменяло протокол, а не оставляло предыдущий результат.
 */
export function stubProtocol(transcript: string): Protocol {
  if (normalizeTranscript(transcript) === normalizeTranscript(TRAINING_TRANSCRIPT)) {
    return {
      decisions: REFERENCE_PROTOCOL.decisions.map((decision) => ({ ...decision })),
      tasks: REFERENCE_PROTOCOL.tasks.map((task) => ({ ...task })),
      questions: [...REFERENCE_PROTOCOL.questions],
    }
  }
  return extractProtocol(transcript)
}

function extractProtocol(transcript: string): Protocol {
  const decisions = [...transcript.matchAll(/^.*Принимаем решение:\s*([^\n]+).*$/gim)].flatMap(
    (match) => {
      const text = finishSentence(match[1] ?? '')
      const source = (match[0] ?? '').trim()
      if (!text || !source) return []
      return [{ text, source }]
    },
  )
  const questions = [...transcript.matchAll(/Открытый вопрос:\s*([^\n]+)/gi)].map(
    (match) => asQuestion(match[1] ?? ''),
  )
  const tasks: TaskItem[] = [
    ...transcript.matchAll(/Участник\s+([А-ЯЁA-Z])\s+(готовит|собирает)\s+([^.\n]+)/gi),
  ].flatMap((match) => {
    const letter = (match[1] ?? '').toLocaleUpperCase('ru-RU')
    const verb = (match[2] ?? '').toLocaleLowerCase('ru-RU')
    const detail = (match[3] ?? '').trim()
    if (!letter || !detail) return []
    return [{ text: `${verb} ${detail}`, owner: `Участник ${letter}` }]
  })
  return { decisions, tasks, questions }
}

function finishSentence(value: string): string {
  const text = value.trim().replace(/[.!?…]+$/u, '')
  return text ? `${text}.` : ''
}

function asQuestion(value: string): string {
  const text = value.trim().replace(/[.!?…]+$/u, '')
  return text ? `${text}?` : ''
}
