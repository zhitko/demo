export type TaskItem = {
  text: string
  owner: string
}

export type Protocol = {
  decisions: string[]
  tasks: TaskItem[]
  questions: string[]
}
