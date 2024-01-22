export enum DataObjectType {
  Number = 'number',
  Boolean = 'boolean',
  Null = 'null'
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
