export type Decision = {
  text: string
  /** Строка расшифровки, из которой взято решение. */
  source: string
}

export type TaskItem = {
  text: string
  owner: string
}

export type Protocol = {
  decisions: Decision[]
  tasks: TaskItem[]
  questions: string[]
}
