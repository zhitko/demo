import { useState } from 'react'
import { formatProtocol, formatTask } from './format.ts'
import { protocolFromLlm } from './llm.ts'
import { stubProtocol } from './protocol.ts'
import type { Protocol } from './types.ts'
import './App.css'

type SelectedFile = {
  name: string
  text: string
}

type ShownProtocol = {
  /** Текст, по которому построен текущий протокол. На экране базового прототипа не показывается. */
  sourceText: string
  protocol: Protocol
  elapsedMs: number
}

export default function App() {
  const [selected, setSelected] = useState<SelectedFile | null>(null)
  const [shown, setShown] = useState<ShownProtocol | null>(null)

  async function onFileChange(file: File | undefined) {
    if (!file) return
    setSelected({ name: file.name, text: await file.text() })
  }

  async function onBuild() {
    if (!selected) return
    const started = performance.now()
    const fromModel = await protocolFromLlm(selected.text)
    const protocol = fromModel ?? stubProtocol(selected.text)
    setShown({
      sourceText: selected.text,
      protocol,
      elapsedMs: performance.now() - started,
    })
  }

  function onDownload() {
    if (!shown) return
    const blob = new Blob([formatProtocol(shown.protocol)], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'protokol.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="page">
      <header className="intro">
        <p className="eyebrow">Прототип одного сценария</p>
        <h1>Протокол из расшифровки</h1>
        <p className="lead">
          Загрузите готовую расшифровку встречи, нажмите «Сделать протокол» и
          скачайте результат. Речь не распознаём: файл уже текстовый.
        </p>
        <p className="criterion">
          Критерий: не позже чем через минуту на экране протокол, три решения
          совпадают с оригиналом.
        </p>
      </header>

      <section className="controls" aria-label="Сценарий показа">
        <label className="choose">
          Выбрать файл
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(event) => {
              void onFileChange(event.target.files?.[0])
            }}
          />
        </label>
        <button type="button" className="primary" disabled={!selected} onClick={() => void onBuild()}>
          Сделать протокол
        </button>
        {selected ? <p className="file-name">Выбран файл: {selected.name}</p> : null}
      </section>

      {shown ? (
        <section className="result" aria-live="polite">
          <div className="result-head">
            <p className="ready">Протокол готов за {formatElapsed(shown.elapsedMs)}.</p>
            <button type="button" onClick={onDownload}>
              Скачать протокол
            </button>
          </div>
          <div className="blocks">
            <article className="block">
              <h2>Решения</h2>
              <ol>
                {shown.protocol.decisions.map((decision, index) => (
                  <li key={`${index}:${decision}`}>{decision}</li>
                ))}
              </ol>
            </article>
            <article className="block">
              <h2>Задачи</h2>
              <p className="block-note">с ответственными</p>
              <ol>
                {shown.protocol.tasks.map((task, index) => (
                  <li key={`${index}:${task.owner}:${task.text}`}>{formatTask(task)}</li>
                ))}
              </ol>
            </article>
            <article className="block">
              <h2>Открытые вопросы</h2>
              <ol>
                {shown.protocol.questions.map((question, index) => (
                  <li key={`${index}:${question}`}>{question}</li>
                ))}
              </ol>
            </article>
          </div>
        </section>
      ) : null}
    </main>
  )
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return 'меньше секунды'
  const seconds = ms / 1000
  return `${seconds.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} с`
}
