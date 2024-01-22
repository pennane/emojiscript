export const segmentEmojiString = (string: string) =>
  [...new Intl.Segmenter().segment(string)].map((x) => x.segment)

export class LRUCache<K, V> {
  private capacity: number
  private cache: Map<K, V>
  private keys: K[]

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map<K, V>()
    this.keys = []
  }

  public get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value) {
      this.removeKey(key)
      this.keys.push(key)
    }
    return value
  }

  public put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.removeKey(key)
    } else if (this.cache.size >= this.capacity) {
      const leastRecentlyUsedKey = this.keys.shift()
      if (leastRecentlyUsedKey !== undefined) {
        this.cache.delete(leastRecentlyUsedKey)
      }
    }
    this.cache.set(key, value)
    this.keys.push(key)
  }

  private removeKey(key: K): void {
    const index = this.keys.indexOf(key)
    if (index > -1) {
      this.keys.splice(index, 1)
    }
  }
}
