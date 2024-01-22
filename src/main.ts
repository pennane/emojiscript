import { Repl } from './emojiscript/repl/repl'
import { createKeyboard } from './keyboard/keyboard'
import './style.css'

const DEFAULT_VALUE = `📝🆎➡️🔧🅰️🔸🅱️ 🌅
    🅰️✖️🅱️
🌇
📝🅰️2️⃣➡️🔧🅰️ 🌅
    🆎📭🅰️🔸2️⃣📬
🌇

🅰️2️⃣📭3️⃣📬
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

const repl = new Repl((parsed) => (output.textContent = parsed))

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
