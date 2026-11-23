import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { formatProtocol } from './format.ts'
import { normalizeTranscript, stubProtocol } from './protocol.ts'
import { REFERENCE_PROTOCOL } from './reference.ts'
import { TRAINING_TRANSCRIPT } from './training.ts'

const trainingFile = readFileSync(new URL('../samples/transcript-demo.txt', import.meta.url), 'utf8')

test('учебный файл совпадает с константой в приложении', () => {
  assert.equal(normalizeTranscript(trainingFile), normalizeTranscript(TRAINING_TRANSCRIPT))
})

test('заглушка возвращает эталон для учебной расшифровки', () => {
  const protocol = stubProtocol(trainingFile)
  assert.deepEqual(protocol, REFERENCE_PROTOCOL)
  assert.equal(protocol.decisions.length, 3)
  assert.equal(protocol.tasks.length, 2)
  assert.equal(protocol.questions.length, 1)
  assert.equal(protocol.tasks[0]?.owner, 'Участник А')
  assert.equal(protocol.tasks[1]?.owner, 'Участник Б')
})

test('другой файл заменяет протокол, а не повторяет эталон', () => {
  const other = [
    'Ведущий: Принимаем решение: команда выбирает одну гипотезу.',
    'Участник А готовит черновик к среде.',
    'Участник Б: Открытый вопрос: нужен ли второй показ.',
  ].join('\n')
  const protocol = stubProtocol(other)
  assert.deepEqual(protocol.decisions, ['команда выбирает одну гипотезу.'])
  assert.deepEqual(protocol.tasks, [{ text: 'готовит черновик к среде', owner: 'Участник А' }])
  assert.deepEqual(protocol.questions, ['нужен ли второй показ?'])
})

test('скачиваемый текст содержит те же три блока', () => {
  const text = formatProtocol(REFERENCE_PROTOCOL)
  assert.match(text, /^Решения\n1\. Команда сдаёт одну спецификацию и один прототип\./)
  assert.match(text, /Задачи\n1\. Подготовить шаблон паспорта прототипа к пятнице — ответственный: Участник А\./)
  assert.match(text, /Открытые вопросы\n1\. До скольких страниц принимать файл расшифровки\?/)
  assert.equal(text.endsWith('\n'), true)
})
