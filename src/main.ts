import { Repl } from './emojiscript/repl/repl'
import { createKeyboard } from './keyboard/keyboard'
import './style.css'

const DEFAULT_VALUE = `💬 fibonacci
📝🅰️➡️🔧🅱️ 🌅
  🤔 🅱️ 🔽 1️⃣ 🌅 🔙0️⃣ 🌇
  🤔 🅱️ ⚖️ 1️⃣ 🌅 🔙1️⃣ 🌇
  🅰️📭🅱️➖1️⃣📬 ➕ 🅰️📭🅱️➖2️⃣📬
🌇


🅰️📭7️⃣📬
`

const app = document.querySelector<HTMLDivElement>('#app')!

const title = document.createElement('h1')
title.textContent = 'emojiscript'

const header = document.createElement('header')
const main = document.createElement('main')

const left = document.createElement('div')
const right = document.createElement('div')

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

left.appendChild(input)
left.appendChild(keyboard)
right.appendChild(output)

header.appendChild(title)

main.appendChild(left)
main.appendChild(right)

app.appendChild(header)
app.appendChild(main)

repl.evaluate(input.value)
