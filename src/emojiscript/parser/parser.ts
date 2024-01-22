import {
  BlockStatement,
  Boolean,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  LetStatement,
  NumberLiteral,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  createBlockStatement,
  createBoolean,
  createCallExpression,
  createExpressionStatement,
  createFunctionLiteral,
  createIdentifier,
  createIfExpression,
  createInfixExpression,
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
type InfixParseFn = (expression: Expression | null) => Expression | null

enum ExpressionPrecedence {
  LOWEST = 0,
  OR,
  AND,
  EQUALS,
  LTGT,
  SUM,
  PRODUCT,
  PREFIX,
  CALL
}

const PRECEDENCES: Partial<Record<TokenType, ExpressionPrecedence>> = {
  PLUS: ExpressionPrecedence.SUM,
  MINUS: ExpressionPrecedence.SUM,
  TIMES: ExpressionPrecedence.PRODUCT,
  DIVISION: ExpressionPrecedence.PRODUCT,
  EQ: ExpressionPrecedence.EQUALS,
  GT: ExpressionPrecedence.LTGT,
  LT: ExpressionPrecedence.LTGT,
  CALL_START: ExpressionPrecedence.CALL,
  AND: ExpressionPrecedence.AND,
  OR: ExpressionPrecedence.OR
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
    this.registerPrefixParser('TRUE', this.parseBoolean)
    this.registerPrefixParser('FALSE', this.parseBoolean)
    this.registerPrefixParser('BLOCK_START', this.parseGroupedExpression)
    this.registerPrefixParser('CALL_START', this.parseGroupedExpression)
    this.registerPrefixParser('IF', this.parseIfExpression)
    this.registerPrefixParser('FUNCTION', this.parseFunctionLiteral)

    this.registerInfixParser('PLUS', this.parseInfixExpression)
    this.registerInfixParser('MINUS', this.parseInfixExpression)
    this.registerInfixParser('DIVISION', this.parseInfixExpression)
    this.registerInfixParser('TIMES', this.parseInfixExpression)
    this.registerInfixParser('EQ', this.parseInfixExpression)
    this.registerInfixParser('LT', this.parseInfixExpression)
    this.registerInfixParser('GT', this.parseInfixExpression)
    this.registerInfixParser('AND', this.parseInfixExpression)
    this.registerInfixParser('OR', this.parseInfixExpression)
    this.registerInfixParser('CALL_START', this.parseCallExpression)
  }

  private registerPrefixParser(type: TokenType, fn: PrefixParseFn) {
    this.prefixParseFns.set(type, fn.bind(this))
  }
  private registerInfixParser(type: TokenType, fn: InfixParseFn) {
    this.infixParseFns.set(type, fn.bind(this))
  }

  private nextToken() {
    this.currentToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
    return this.currentToken
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

  private expectPeek(type: TokenType): boolean {
    if (this.peekToken.type === type) {
      this.nextToken()
      return true
    }
    this.errorPeek(type)
    return false
  }

  private currentPrecendence(): ExpressionPrecedence {
    return PRECEDENCES[this.currentToken.type] || ExpressionPrecedence.LOWEST
  }

  private peekPrecendence(): ExpressionPrecedence {
    return PRECEDENCES[this.peekToken.type] || ExpressionPrecedence.LOWEST
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
    const letStatementToken = this.currentToken

    if (!this.expectPeek('IDENTIFIER')) {
      return null
    }

    const identifierToken = this.currentToken

    const name = createIdentifier(identifierToken)

    if (!this.expectPeek('ASSIGN')) {
      return null
    }
    this.nextToken()

    const value = this.parseExpression(ExpressionPrecedence.LOWEST)

    if (this.peekIs('END_OF_LINE')) {
      this.nextToken()
    }

    return createLetStatement(letStatementToken, name, value)
  }

  private parseReturnStatement(): ReturnStatement | null {
    const returnToken = this.currentToken
    this.nextToken()
    const value = this.parseExpression(ExpressionPrecedence.LOWEST)

    if (this.peekIs('END_OF_LINE')) {
      this.nextToken()
    }

    return createReturnStatement(returnToken, value)
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

    let leftExpression = prefixFn()
    while (!this.peekIs('END_OF_LINE') && precedence < this.peekPrecendence()) {
      const infix = this.infixParseFns.get(this.peekToken.type)
      if (!infix) {
        return leftExpression
      }

      this.nextToken()

      leftExpression = infix(leftExpression)
    }

    return leftExpression
  }

  private parsePrefixExpression(): PrefixExpression | null {
    const prefixExpressionToken = this.currentToken
    this.nextToken()
    const right = this.parseExpression(ExpressionPrecedence.PREFIX)
    return createPrefixExpression(prefixExpressionToken, right)
  }

  private parseInfixExpression(
    left: Expression | null
  ): InfixExpression | null {
    const infixExpressionToken = this.currentToken
    const precedence = this.currentPrecendence()
    this.nextToken()
    const right = this.parseExpression(precedence)

    return createInfixExpression(
      infixExpressionToken,
      left,
      right,
      infixExpressionToken.literal
    )
  }

  private parseIdentifier(): Identifier {
    return createIdentifier(this.currentToken)
  }

  private parseNumberLiteral(): NumberLiteral | null {
    const numberLiteralToken = this.currentToken
    const value = numberLiteralToNumber(numberLiteralToken.literal)
    if (value === null) {
      this.errorInvalidNumber(numberLiteralToken.literal)
      return null
    }

    return createNumberLiteral(numberLiteralToken, value)
  }

  private parseBoolean(): Boolean {
    const booleanToken = this.currentToken
    return createBoolean(booleanToken, this.currentIs('TRUE'))
  }

  private parseGroupedExpression(): Expression | null {
    const groupingToken = this.currentToken
    this.nextToken()
    const expression = this.parseExpression(ExpressionPrecedence.LOWEST)
    if (groupingToken.type === 'CALL_START' && !this.expectPeek('CALL_END')) {
      return null
    }
    if (groupingToken.type === 'BLOCK_START' && !this.expectPeek('BLOCK_END')) {
      return null
    }
    return expression
  }

  private parseIfExpression(): IfExpression | null {
    const ifExpressionToken = this.currentToken

    this.nextToken()
    const condition = this.parseExpression(ExpressionPrecedence.LOWEST)

    if (!condition) {
      return null
    }

    if (!this.expectPeek('BLOCK_START')) {
      return null
    }

    const consequence = this.parseBlockStatement()

    if (!consequence) {
      return null
    }

    let alternative: BlockStatement | null = null
    if (this.peekIs('ELSE')) {
      this.nextToken()
      alternative = this.parseBlockStatement()
    }

    return createIfExpression(
      ifExpressionToken,
      condition,
      consequence,
      alternative
    )
  }

  private parseBlockStatement(): BlockStatement | null {
    const blockStatementToken = this.currentToken
    const statements = []
    this.nextToken()
    while (!this.currentSomeOf(['BLOCK_END', 'END_OF_FILE', 'END_OF_LINE'])) {
      const statement = this.parseStatement()
      if (statement) {
        statements.push(statement)
      }
      this.nextToken()
    }
    return createBlockStatement(blockStatementToken, statements)
  }

  private parseFunctionLiteral(): FunctionLiteral | null {
    const functionLiteralToken = this.currentToken
    const parameters = this.parseFunctionParameters()
    if (!this.expectPeek('BLOCK_START')) {
      return null
    }
    const body = this.parseBlockStatement()
    return createFunctionLiteral(functionLiteralToken, parameters, body)
  }

  private parseFunctionParameters(): Identifier[] {
    const identifiers: Identifier[] = []

    if (this.peekIs('BLOCK_START')) {
      return identifiers
    }
    this.nextToken()
    identifiers.push(createIdentifier(this.currentToken))

    while (this.peekIs('ARGUMENT_SEPARATOR')) {
      this.nextToken()
      this.nextToken()
      identifiers.push(createIdentifier(this.currentToken))
    }

    return identifiers
  }

  private parseCallExpression(fn: Expression | null): CallExpression | null {
    const callExpressionToken = this.currentToken
    const args = this.parseCallArguments()
    if (!args || !fn) return null
    return createCallExpression(callExpressionToken, fn, args)
  }

  private parseCallArguments(): Expression[] | null {
    const args: Expression[] = []
    if (this.peekIs('CALL_END')) {
      this.nextToken()
      return args
    }
    this.nextToken()
    const expression = this.parseExpression(ExpressionPrecedence.LOWEST)
    if (expression) {
      args.push(expression)
    }

    while (this.peekIs('ARGUMENT_SEPARATOR')) {
      this.nextToken()
      this.nextToken()
      const expression = this.parseExpression(ExpressionPrecedence.LOWEST)
      if (expression) {
        args.push(expression)
      }
    }

    if (!this.expectPeek('CALL_END')) {
      return null
    }
    return args
  }
}
