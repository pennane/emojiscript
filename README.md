# Emojiscript

A toy language that accepts emoji and nothing else!

Built alongside with [Writing An Interpetter In Go](https://interpreterbook.com/)

”we’re not trying to reinvent the wheel, but to learn something”

### Roadmap

- [x] lexer
- [x] parser
- [x] evaluator
- [ ] lists and hashes

### Example syntax

```
📝 🅿️ℹ️ ➡️ 3️⃣⏺️1️⃣4️⃣🚀
📝 ♓ℹ️Ⓜ️🅾️Ⓜ️ ➡️ 🔧🅰️ 🔸 ️🅱️ 🌅
    🤔 🅰️ 🔼 🅱️ 🌅
        🅰️
    🌇 ⤵️ 🌅
        🅱️
    🌇
🌇🚀

📝 🅰️ ➡️ ♓ℹ️Ⓜ️🅾️Ⓜ️📭🅿️ℹ️ 🔸 3️⃣📬🚀

🅰️
```

(same approximated in js)

```js
const PI = 3.14

const HIMOM = (A, B) => {
  if (A > B) {
    return A
  } else {
    return B
  }
}

const A = HIMOM(PI, 3)

A // 3.14
```
