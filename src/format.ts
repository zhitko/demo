import type { Decision, Protocol, TaskItem } from './types.ts'

export function formatTask(task: TaskItem): string {
  return `${task.text} — ответственный: ${task.owner}.`
}

export function formatDecision(decision: Decision): string {
  if (!decision.source) return decision.text
  return `${decision.text}\n   «${decision.source}»`
}

export function formatProtocol(protocol: Protocol): string {
  const sections = [
    section('Решения', protocol.decisions.map(formatDecision)),
    section('Задачи', protocol.tasks.map(formatTask)),
    section('Открытые вопросы', protocol.questions),
  ]
  return `${sections.join('\n\n')}\n`
}

function section(title: string, items: string[]): string {
  const lines = [title, ...items.map((item, index) => `${index + 1}. ${item}`)]
  return lines.join('\n')
}
