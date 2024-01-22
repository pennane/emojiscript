import { BlockStatement, Identifier, Statement } from '../ast/ast'
import { Environment } from './environment'

export enum DataObjectType {
  Number = 'number',
  Boolean = 'boolean',
  Null = 'null',
  ReturnValue = 'return_value',
  Error = 'error',
  Function = 'function'
}

export type DataObject = {
  type: DataObjectType
  inspect: () => string
}

export interface NumberObject extends DataObject {
  value: number
}

function numberInspect(this: NumberObject): string {
  return String(this.value)
}

export const createNumber = (value: number): NumberObject => {
  return {
    type: DataObjectType.Number,
    inspect: numberInspect,
    value
  }
}

export const isNumber = (obj: DataObject): obj is NumberObject => {
  return obj.type === DataObjectType.Number
}

export interface BooleanObject extends DataObject {
  value: boolean
}

function booleanInspect(this: BooleanObject): string {
  return this.value ? 'true' : 'false'
}

const TRUE: BooleanObject = {
  type: DataObjectType.Boolean,
  inspect: booleanInspect,
  value: true
}

const FALSE: BooleanObject = {
  type: DataObjectType.Boolean,
  inspect: booleanInspect,
  value: false
}

export const createBoolean = (value: boolean): BooleanObject => {
  return value ? TRUE : FALSE
}

export const isBoolean = (obj: DataObject): obj is BooleanObject => {
  return obj.type === DataObjectType.Boolean
}

export interface NullObject extends DataObject {}

function nullInspect(this: NullObject): string {
  return 'null'
}

const NULL: NullObject = {
  type: DataObjectType.Null,
  inspect: nullInspect
}

export const createNull = (): NullObject => {
  return NULL
}

export const isNull = (obj: DataObject): obj is NullObject => {
  return obj.type === DataObjectType.Null
}

export interface ReturnValue extends DataObject {
  value: DataObject
}

function returnValueInspect(this: ReturnValue): string {
  return this.value.inspect()
}

export const createReturnValue = (value: DataObject): ReturnValue => {
  return {
    type: DataObjectType.ReturnValue,
    inspect: returnValueInspect,
    value
  }
}

export const isReturnValue = (obj: DataObject): obj is ReturnValue => {
  return obj.type === DataObjectType.ReturnValue
}

export interface ErrorObject extends DataObject {
  message: string
}
function errorInspect(this: ErrorObject) {
  return `ERROR: ${this.message}`
}

export const createError = (message: string): ErrorObject => {
  return {
    type: DataObjectType.Error,
    inspect: errorInspect,
    message
  }
}

export const isError = (obj: DataObject): obj is ErrorObject => {
  return obj.type === DataObjectType.Error
}

export interface FunctionObject extends DataObject {
  parameters: Identifier[]
  body: BlockStatement
  environment: Environment
}

function functionInspect(this: FunctionObject) {
  let out = ''
  const params = this.parameters.map((p) => p.string()).join(', ')

  out += 'fn'
  out += '('
  out += params
  out += ') { '
  out += this.body.string()
  out += ' }'

  return out
}

export const createFunction = (
  parameters: Identifier[],
  body: BlockStatement,
  environment: Environment
): FunctionObject => {
  return {
    type: DataObjectType.Function,
    inspect: functionInspect,
    parameters,
    body,
    environment
  }
}

export const isFunction = (obj: DataObject): obj is FunctionObject => {
  return obj.type === DataObjectType.Function
}
