import {
  Expression,
  ExpressionStatement,
  Identifier,
  LetStatement,
  NumberLiteral,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  createExpression,
  createExpressionStatement,
  createIdentifier,
  createLetStatement,
  createNumberLiteral,
  createPrefixExpression,
  createProgramNode,
  createReturnStatement
} from '../ast/ast'
import { Lexer } from '../lexer/lexer'
import { segmentEmojiString } from '../lib'
import { DELIMITER, NUMBER_TO_TYPE, Token, TokenType } from '../token/token'

type PrefixParseFn = () => Expression | null
type InfixParseFn = (expression: Expression) => Expression | null

enum ExpressionPrecedence {
  LOWEST = 0,
  EQUALS,
  LTGT,
  SUM,
  PRODUCT,
  PREFIX,
  CALL
}

const numberLiteralToNumber = (literal: string): number | null => {
  const parts = segmentEmojiString(literal)
  let seenDecimalSeparator = false
  const numbers = []
  for (const p of parts) {
    const number = NUMBER_TO_TYPE[p]
    if (number) {
      numbers.push(number)
    }
    if (p === DELIMITER.DECIMAL_SEPARATOR) {
      if (seenDecimalSeparator) {
        return null
      }
      seenDecimalSeparator = true
      numbers.push('.')
    }
  }

  const number = parseFloat(numbers.join(''))
  if (isNaN(number)) return null
  return number
}

export class Parser {
  private currentToken: Token
  private peekToken: Token
  private lexer: Lexer
  private errors: string[]
  private prefixParseFns: Map<TokenType, PrefixParseFn>
  private infixParseFns: Map<TokenType, InfixParseFn>

  constructor(lexer: Lexer) {
    this.currentToken = null as any
    this.peekToken = null as any
    this.errors = []

    this.lexer = lexer

    this.nextToken()
    this.nextToken()

    this.prefixParseFns = new Map()
    this.infixParseFns = new Map()

    this.registerPrefixParser('IDENTIFIER', this.parseIdentifier)
    this.registerPrefixParser('NUMBER', this.parseNumberLiteral)
    this.registerPrefixParser('MINUS', this.parsePrefixExpression)
    this.registerPrefixParser('BANG', this.parsePrefixExpression)
  }

  private registerPrefixParser(type: TokenType, fn: PrefixParseFn) {
    this.prefixParseFns.set(type, fn.bind(this))
  }

  private nextToken() {
    this.currentToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
    return this.currentToken
  }

  parseProgram(): Program {
    const statements = []

    while (this.currentToken.type !== 'END_OF_FILE') {
      const statement = this.parseStatement()
      if (statement !== null) {
        statements.push(statement)
      }
      this.nextToken()
    }

    return createProgramNode(statements)
  }

  getErrors(): string[] {
    return this.errors
  }

  private errorPeek(type: TokenType) {
    this.errors.push(
      `Expected the next token to be ${type} but got ${this.peekToken.type} instead`
    )
  }

  private errorNoPrefixParseFn(type: TokenType) {
    this.errors.push(`No prefix parser function found for ${type}`)
  }

  private errorInvalidNumber(value: string) {
    this.errors.push(`Invalid number. Could not parse ${value} to number`)
  }

  private currentIs(type: TokenType): boolean {
    return this.currentToken.type === type
  }

  private currentSomeOf(types: TokenType[]): boolean {
    return types.some((t) => this.currentIs(t))
  }

  private peekIs(type: TokenType): boolean {
    return this.peekToken.type === type
  }

  private peekSomeOf(types: TokenType[]): boolean {
    return types.some(this.peekIs)
  }

  private expectPeek(type: TokenType): boolean {
    if (this.peekToken.type === type) {
      this.nextToken()
      return true
    }
    this.errorPeek(type)
    return false
  }

  private parseStatement(): Statement | null {
    switch (this.currentToken.type) {
      case 'LET':
        return this.parseLetStatement()
      case 'RETURN':
        return this.parseReturnStatement()
      default:
        return this.parseExpressionStatement()
    }
  }

  private parseLetStatement(): LetStatement | null {
    const letToken = this.currentToken
    if (!this.expectPeek('IDENTIFIER')) {
      return null
    }

    const name = createIdentifier(this.currentToken)

    if (!this.expectPeek('ASSIGN')) {
      return null
    }

    while (!this.currentSomeOf(['END_OF_FILE', 'END_OF_LINE'])) {
      this.nextToken()
    }

    return createLetStatement(letToken, name, createExpression())
  }

  private parseReturnStatement(): ReturnStatement | null {
    const returnToken = this.currentToken
    this.nextToken()
    while (!this.currentSomeOf(['END_OF_FILE', 'END_OF_LINE'])) {
      this.nextToken()
    }
    return createReturnStatement(returnToken, createExpression())
  }

  private parseExpressionStatement(): ExpressionStatement | null {
    const expressionStatementToken = this.currentToken
    const expression = this.parseExpression(ExpressionPrecedence.LOWEST)
    if (this.peekIs('END_OF_LINE')) {
      this.nextToken()
    }
    return createExpressionStatement(expressionStatementToken, expression)
  }

  private parseExpression(precedence: ExpressionPrecedence): Expression | null {
    const prefixFn = this.prefixParseFns.get(this.currentToken.type)
    if (!prefixFn) {
      this.errorNoPrefixParseFn(this.currentToken.type)
      return null
    }
    const leftExpression = prefixFn()
    return leftExpression
  }

  private parsePrefixExpression(): PrefixExpression | null {
    const prefixExpressionToken = this.currentToken
    this.nextToken()
    const right = this.parseExpression(ExpressionPrecedence.PREFIX)
    return createPrefixExpression(prefixExpressionToken, right)
  }

  private parseIdentifier(): Identifier {
    return createIdentifier(this.currentToken)
  }

  private parseNumberLiteral(): NumberLiteral | null {
    const numberLiteralToken = this.currentToken
    const value = numberLiteralToNumber(numberLiteralToken.literal)
    if (!value) {
      this.errorInvalidNumber(numberLiteralToken.literal)
      return null
    }

    return createNumberLiteral(numberLiteralToken, value)
  }
}
