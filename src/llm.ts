import type { Protocol, TaskItem } from './types.ts'

type Env = {
  VITE_USE_LLM?: string
  VITE_LLM_URL?: string
  VITE_LLM_API_KEY?: string
}

/**
 * Выключено, пока VITE_USE_LLM не равен "true".
 * Ошибка сети или чужой ответ не ломают показ: вызывающий код берёт заглушку.
 */
export async function protocolFromLlm(
  transcript: string,
  env: Env = import.meta.env,
): Promise<Protocol | null> {
  if (env.VITE_USE_LLM !== 'true' || !env.VITE_LLM_URL) return null

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (env.VITE_LLM_API_KEY) headers.Authorization = `Bearer ${env.VITE_LLM_API_KEY}`

    const response = await fetch(env.VITE_LLM_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transcript,
        instruction:
          'Верни только JSON {decisions: string[], tasks: {text: string, owner: string}[], questions: string[]} на русском языке.',
      }),
    })
    if (!response.ok) return null
    return parseProtocol(await response.json())
  } catch {
    return null
  }
}

function parseProtocol(value: unknown): Protocol | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const decisions = stringList(record.decisions)
  const questions = stringList(record.questions)
  const tasks = taskList(record.tasks)
  if (!decisions || !questions || !tasks) return null
  return { decisions, tasks, questions }
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return null
  return value
}

function taskList(value: unknown): TaskItem[] | null {
  if (!Array.isArray(value)) return null
  const tasks: TaskItem[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return null
    const task = item as Record<string, unknown>
    if (typeof task.text !== 'string' || typeof task.owner !== 'string') return null
    tasks.push({ text: task.text, owner: task.owner })
  }
  return tasks
}
