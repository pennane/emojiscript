import { Repl } from './emojiscript/repl/repl'
import { createKeyboard } from './keyboard/keyboard'
import './style.css'

const DEFAULT_VALUE = `📝 🅰️ ➡️ 1️⃣🚀
📝 🅱️ ➡️ 2️⃣🚀
🤔 🅰️⚖️🅱️ 🌅
  ✅
🌇 ⤵️ 🌅
  ❌
🌇
`

const app = document.querySelector<HTMLDivElement>('#app')!

const left = document.createElement('div')
const right = document.createElement('div')

const input = document.createElement('textarea')
input.classList.add('input')

const output = document.createElement('pre')
output.classList.add('output')

const keyboard = createKeyboard(input)

const repl = new Repl((parsed) => (output.textContent = parsed))

input.addEventListener('input', (e: any) => repl.evaluate(e.target.value))
input.value = DEFAULT_VALUE

left.appendChild(input)
left.appendChild(keyboard)
right.appendChild(output)

app.appendChild(left)
app.appendChild(right)

repl.evaluate(input.value)
