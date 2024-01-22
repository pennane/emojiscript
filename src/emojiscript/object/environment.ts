import { DataObject } from './object'

export class Environment {
  private store: Map<string, DataObject>
  constructor() {
    this.store = new Map()
  }
  get(key: string) {
    return this.store.get(key)
  }
  set(key: string, value: DataObject) {
    this.store.set(key, value)
    return value
  }
  entries() {
    return [...this.store.entries()]
  }
}
