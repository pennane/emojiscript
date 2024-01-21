import { Token } from '../token/token'

const __statementNode__ = () => {}
const __expressionNode__ = () => {}

export interface Node {
  string: () => string
}

export interface Statement extends Node {
  __statementNode__: () => void
}

function statementString(this: Statement): string {
  return 'statement'
}

export const createStatement = (): Statement => {
  return { __statementNode__, string: statementString }
}

export interface Expression extends Node {
  __expressionNode__: () => void
}

function expressionString(this: Expression): string {
  return 'expression'
}

export const createExpression = (): Expression => {
  return { __expressionNode__, string: expressionString }
}

export interface Program extends Node {
  statements: Statement[]
}

function programString(this: Program): string {
  let out = ''
  for (const statement of this.statements) {
    out += statement.string()
  }
  return out
}

export const createProgramNode = (statements: Statement[]): Program => {
  return {
    string: programString,
    statements
  }
}

export interface LetStatement extends Statement {
  token: Token
  name: Identifier
  value: Expression | null
}

function letStatementString(this: LetStatement) {
  let out = ''

  out += this.token.type + ' '
  out += this.name.string()
  out += ' = '

  if (this.value !== null) {
    out += this.value.string()
  }

  out += ';'

  return out
}

export const createLetStatement = (
  token: Token,
  name: Identifier,
  value: Expression | null
): LetStatement => {
  return {
    __statementNode__,
    string: letStatementString,
    name,
    value,
    token
  }
}

export interface ReturnStatement extends Statement {
  token: Token
  returnValue: Expression | null
}

function returnStatementString(this: ReturnStatement): string {
  let out = ''
  out += this.token.literal + ' '
  out += this.returnValue?.string() || null
  out += ';'
  return out
}

export const createReturnStatement = (
  token: Token,
  expression: Expression | null
): ReturnStatement => {
  return {
    __statementNode__,
    string: returnStatementString,
    returnValue: expression,
    token
  }
}

export interface ExpressionStatement extends Statement {
  token: Token // the first token of the expression
  expression: Expression | null
}

function expressionStatementString(this: ExpressionStatement): string {
  return this.expression?.string() || 'null'
}

export const createExpressionStatement = (
  token: Token,
  expression: Expression | null
): ExpressionStatement => {
  return {
    __statementNode__,
    string: expressionStatementString,
    expression,
    token
  }
}

export interface BlockStatement extends Statement {
  token: Token
  statements: Statement[]
}

function blockStatementString(this: BlockStatement): string {
  let out = ''
  for (const statement of this.statements) {
    out += statement.string()
  }
  return out
}

export const createBlockStatement = (
  token: Token,
  statements: Statement[]
): BlockStatement => {
  return {
    __statementNode__,
    string: blockStatementString,
    token,
    statements
  }
}

export interface Identifier extends Expression {
  token: Token
  value: string
}

function identifierString(this: Identifier): string {
  return this.value
}

export const createIdentifier = (token: Token): Identifier => {
  return {
    __expressionNode__,
    string: identifierString,
    value: token.literal,
    token
  }
}

export interface Boolean extends Expression {
  token: Token
  value: boolean
}

function booleanString(this: Boolean): string {
  return this.value ? 'true' : 'false'
}

export const createBoolean = (token: Token, value: boolean): Boolean => {
  return { __expressionNode__, string: booleanString, token, value }
}

export interface NumberLiteral extends Expression {
  token: Token
  value: number
}

function numberLiteralString(this: NumberLiteral): string {
  return String(this.value)
}

export const createNumberLiteral = (
  token: Token,
  value: number
): NumberLiteral => {
  return {
    __expressionNode__,
    string: numberLiteralString,
    token,
    value
  }
}

export interface InfixExpression extends Expression {
  token: Token // The operator token, e.g. +
  left: Expression | null
  operator: string
  right: Expression | null
}

function infixExpressionString(this: InfixExpression) {
  let out = ''
  out += '('
  out += this.left?.string() || 'null'
  out += ' ' + this.operator + ' '
  out += this.right?.string() || 'null'
  out += ')'
  return out
}

export const createInfixExpression = (
  token: Token,
  left: Expression | null,
  right: Expression | null,
  operator: string
): InfixExpression => {
  return {
    __expressionNode__,
    string: infixExpressionString,
    operator,
    token,
    right,
    left
  }
}

export interface PrefixExpression extends Expression {
  token: Token // The prefix token, e.g. !
  operator: string
  right: Expression | null
}

function prefixExpressionString(this: PrefixExpression) {
  let out = ''
  out += '('
  out += this.operator
  out += this.right?.string() || 'null'
  out += ')'
  return out
}

export const createPrefixExpression = (
  token: Token,
  right: Expression | null
): PrefixExpression => {
  return {
    __expressionNode__,
    string: prefixExpressionString,
    operator: token.literal,
    token,
    right
  }
}

export interface IfExpression extends Expression {
  token: Token // The 'if' token
  condition: Expression
  consequence: BlockStatement
  alternative: BlockStatement | null
}

function ifExpressionString(this: IfExpression): string {
  let out = ''
  out += 'if '
  out += this.condition.string()
  out += ' then '
  out += this.consequence.string()
  if (this.alternative) {
    out += ' else '
    out += this.alternative.string()
  }

  return out
}

export const createIfExpression = (
  token: Token,
  condition: Expression,
  consequence: BlockStatement,
  alternative: BlockStatement | null
): IfExpression => {
  return {
    __expressionNode__,
    string: ifExpressionString,
    token,
    condition,
    consequence,
    alternative
  }
}

export interface FunctionLiteral extends Expression {
  token: Token // The 'fn' token
  parameters: Identifier[]
  body: BlockStatement | null
}

function functionLiteralString(this: FunctionLiteral): string {
  let out = ''
  const params = this.parameters.map((p) => p.string()).join(', ')
  out += this.token.literal
  out += '('
  out += params
  out += ') '
  out += this.body?.string() || 'null'
  return out
}

export const createFunctionLiteral = (
  token: Token,
  parameters: Identifier[],
  body: BlockStatement | null
): FunctionLiteral => {
  return {
    __expressionNode__,
    string: functionLiteralString,
    token,
    parameters,
    body
  }
}

export interface CallExpression extends Expression {
  token: Token // The '(' token
  function: Expression // Identifier or FunctionLiteral
  arguments: Expression[]
}

function callExpressionString(this: CallExpression) {
  let out = ''
  const args = this.arguments.map((a) => a.string()).join(', ')
  out += this.function.string()
  out += '('
  out += args
  out += ')'
  return out
}

export const createCallExpression = (
  token: Token,
  fn: Expression,
  args: Expression[]
): CallExpression => {
  return {
    __expressionNode__,
    string: callExpressionString,
    token,
    function: fn,
    arguments: args
  }
}
