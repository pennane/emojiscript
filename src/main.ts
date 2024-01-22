import { Repl } from './emojiscript/repl/repl'
import { createKeyboard } from './keyboard/keyboard'
import './style.css'

const DEFAULT_VALUE = `💬 fibonacci
📝🅰️➡️🔧🅱️ 🌅
  🅰️2️⃣📭🅱️🔸0️⃣🔸1️⃣📬
🌇

💬 tail recursive helper
📝🅰️2️⃣➡️🔧🅰️🔸🅱️🔸🅾️ 🌅
  🤔 🅰️ ⚖️ 0️⃣ 🌅 🔙 🅱️ 🌇
  🔙 🅰️2️⃣📭🅰️➖1️⃣🔸🅾️🔸🅱️➕🅾️📬
🌇

💬 70th member of the fibonacci sequence
🅰️📭7️⃣0️⃣📬
`

const app = document.querySelector<HTMLDivElement>('#app')!

const title = document.createElement('h1')
title.textContent = 'emojiscript'

const header = document.createElement('header')
const main = document.createElement('main')

const left = document.createElement('div')
left.classList.add('left')
const right = document.createElement('div')
right.classList.add('right')

const inputContainer = document.createElement('div')
inputContainer.classList.add('input-container')
const lineNumbers = document.createElement('aside')
lineNumbers.classList.add('line-numbers')

for (let i = 1; i <= 100; i++) {
  const line = document.createElement('div')
  line.textContent = String(i)
  lineNumbers.appendChild(line)
}

const input = document.createElement('textarea')
input.classList.add('input')

const output = document.createElement('pre')
output.classList.add('output')

const keyboard = createKeyboard(input)

const printLine = (line: string) => {
  while (output.firstChild) {
    output.removeChild(output.firstChild)
  }
  const el = document.createElement('pre')
  el.classList.add('line')
  el.textContent = line
  output.appendChild(el)
}

const repl = new Repl(printLine)

input.addEventListener('input', (e: any) => repl.evaluate(e.target.value))
input.value = DEFAULT_VALUE

inputContainer.appendChild(lineNumbers)
inputContainer.appendChild(input)

left.appendChild(keyboard)
left.appendChild(inputContainer)
right.appendChild(output)

header.appendChild(title)

main.appendChild(left)
main.appendChild(right)

app.appendChild(header)
app.appendChild(main)

repl.evaluate(input.value)
