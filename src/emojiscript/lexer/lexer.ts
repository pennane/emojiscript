import { segmentEmojiString } from '../lib'
import {
  DATA_STRUCTURE_TO_TYPE,
  DELIMITER,
  DELIMITER_TO_TYPE,
  KEYWORD_TO_TYPE,
  OPERATOR_TO_TYPE,
  Token,
  isCharacter,
  isComment,
  isDataStructure,
  isDelimiter,
  isKeyword,
  isNumber,
  isOperator,
  newToken
} from '../token/token'

const WHITESPACE = [' ', '\t', '\n', '\r']

const hasWhitespace = (c: string | null) =>
  WHITESPACE.some((w) => c?.includes(w))

export class Lexer {
  private position: number
  private readPosition: number
  private input: string[]
  private ch: string | null

  constructor(input: string) {
    this.input = segmentEmojiString(input)
    this.position = -1
    this.readPosition = 0
    this.ch = null
  }

  nextToken(): Token {
    this.skipWhitespace()
    this.skipComments()
    const c = this.ch
    if (!c) return newToken('END_OF_FILE', 'END_OF_FILE')
    if (isNumber(c)) return this.readNumber()
    if (isOperator(c)) return this.readOperator()
    if (isDelimiter(c)) return this.readDelimiter()
    if (isKeyword(c)) return this.readKeyword()
    if (isDataStructure(c)) return this.readDataStructure()
    if (isCharacter(c)) return this.readIdentifier()
    return newToken('ILLEGAL', this.ch || 'unknown')
  }

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = null
    } else {
      this.ch = this.input[this.readPosition]
    }
    this.position = this.readPosition
    this.readPosition += 1
  }

  private peekChar(): string | null {
    if (this.readPosition >= this.input.length) {
      return null
    } else {
      return this.input[this.readPosition]
    }
  }

  private skipWhitespace(): void {
    this.readChar()
    let c = this.ch
    if (c === null) {
      return
    }
    while (hasWhitespace(c)) {
      this.readChar()
      c = this.ch
    }
  }

  private skipComments(): void {
    if (!isComment(this.ch)) return
    this.readChar()
    while (this.ch !== '\n' && this.ch !== null) {
      this.readChar()
    }
    this.readChar()
  }

  private readNumber(): Token {
    const startPosition = this.position

    while (
      isNumber(this.peekChar()) ||
      this.peekChar() === DELIMITER.DECIMAL_SEPARATOR
    ) {
      this.readChar()
    }

    return newToken(
      'NUMBER',
      this.input.slice(startPosition, this.readPosition)
    )
  }

  private readDataStructure(): Token {
    const type = DATA_STRUCTURE_TO_TYPE[this.ch!]
    return newToken(type, this.ch!)
  }

  private readOperator(): Token {
    const type = OPERATOR_TO_TYPE[this.ch! as keyof typeof OPERATOR_TO_TYPE]
    return newToken(type, this.ch!)
  }

  private readDelimiter(): Token {
    const type = DELIMITER_TO_TYPE[this.ch!]
    return newToken(type, this.ch!)
  }

  private readKeyword(): Token {
    const type = KEYWORD_TO_TYPE[this.ch!]
    return newToken(type, this.ch!)
  }

  private readIdentifier(): Token {
    const startPosition = this.position

    while (isCharacter(this.peekChar()) || isNumber(this.peekChar())) {
      this.readChar()
    }

    return newToken(
      'IDENTIFIER',
      this.input.slice(startPosition, this.readPosition)
    )
  }
}
