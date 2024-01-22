enum DataObjectType {
  Number = 'number',
  Boolean = 'boolean',
  Null = 'null'
}

export type DataObject = {
  type: DataObjectType
  inspect: () => string
}

export interface Number extends DataObject {
  value: number
}

function numberInspect(this: Number): string {
  return String(this.value)
}

export const createNumber = (value: number): Number => {
  return {
    type: DataObjectType.Number,
    inspect: numberInspect,
    value
  }
}

export interface Boolean extends DataObject {
  value: boolean
}

function booleanInspect(this: Boolean): string {
  return this.value ? 'true' : 'false'
}

export const createBoolean = (value: boolean): Boolean => {
  return {
    type: DataObjectType.Boolean,
    inspect: booleanInspect,
    value
  }
}

export interface Null extends DataObject {}

function nullInspect(this: Null): string {
  return 'null'
}

export const createNull = (): Null => {
  return {
    type: DataObjectType.Null,
    inspect: nullInspect
  }
}
