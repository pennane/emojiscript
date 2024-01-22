import {
  CHARACTER,
  COMMENT,
  DATA_STRUCTURE,
  DELIMITER,
  KEYWORD,
  NUMBER,
  OPERATOR
} from '../emojiscript/token/token'

type Section = [name: string, map: Record<string, string>]

const sections = [
  ['comments', COMMENT],
  ['operators', OPERATOR],
  ['numbers', NUMBER],
  ['characters', CHARACTER],
  ['delimiters', DELIMITER],
  ['keywords', KEYWORD],
  ['datastructures', DATA_STRUCTURE]
] as const satisfies Section[]

const createSection = ([name, map]: Section, focusTarget: HTMLElement) => {
  const section = document.createElement('section')
  section.classList.add('section')
  const title = document.createElement('h4')
  title.textContent = name
  const buttons = document.createElement('div')
  buttons.classList.add('buttons')

  for (const [key, value] of Object.entries(map)) {
    const button = document.createElement('button')
    button.textContent = value
    buttons.appendChild(button)
    button.title = key
    button.addEventListener('click', () => {
      focusTarget.focus()
      document.execCommand('insertText', false, value)
    })
  }

  section.appendChild(title)
  section.appendChild(buttons)
  return section
}
export const createKeyboard = (focusTarget: HTMLElement) => {
  const keyboard = document.createElement('div')
  keyboard.classList.add('keyboard')
  for (const section of sections) {
    keyboard.appendChild(createSection(section, focusTarget))
  }
  return keyboard
}
