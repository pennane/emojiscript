import { DataObject } from './object'

export class Environment {
  private store: Map<string, DataObject>
  private outer: Environment | null
  constructor(outer?: Environment) {
    this.store = new Map()
    this.outer = outer || null
  }
  get(key: string): DataObject | undefined {
    const value = this.store.get(key)
    if (value !== undefined) {
      return value
    }
    if (!this.outer) {
      return undefined
    }
    return this.outer.get(key)
  }
  set(key: string, value: DataObject) {
    this.store.set(key, value)
    return value
  }
  entries() {
    return [...this.store.entries()]
  }
}
