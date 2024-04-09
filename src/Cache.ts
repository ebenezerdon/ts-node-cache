type CacheRecord<T> = {
  value: T
  expire: number
  timeout?: NodeJS.Timeout
}

class Cache<T> {
  private _cache: Record<string, CacheRecord<T>> = Object.create(null)
  private _hitCount = 0
  private _missCount = 0
  private _size = 0
  private _debug = false

  put(key: string, value: T, time?: number, timeoutCallback?: (key: string, value: T) => void): T {
    if (this._debug) {
      console.log(`Caching: ${key} = ${JSON.stringify(value)} (@${time})`)
    }

    if (time !== undefined) {
      if (typeof time !== 'number' || isNaN(time) || time <= 0) {
        throw new Error('Cache timeout must be a positive number')
      }
    }

    if (timeoutCallback !== undefined && typeof timeoutCallback !== 'function') {
      throw new Error('Cache timeout callback must be a function')
    }

    const oldRecord = this._cache[key]
    if (oldRecord) {
      clearTimeout(oldRecord.timeout)
    } else {
      this._size++
    }

    const expire = time !== undefined ? time + Date.now() : Infinity
    const timeout =
      time !== undefined
        ? setTimeout(() => {
            this._del(key)
            timeoutCallback?.(key, value)
          }, time)
        : undefined

    this._cache[key] = { value, expire, timeout }

    return value
  }

  del(key: string): boolean {
    const record = this._cache[key]
    if (!record) return false

    clearTimeout(record.timeout)
    this._del(key)
    return true
  }

  private _del(key: string): void {
    delete this._cache[key]
    this._size--
  }

  clear(): void {
    Object.values(this._cache).forEach((record) => clearTimeout(record.timeout))
    this._cache = Object.create(null)
    this._size = 0
    if (this._debug) {
      this._hitCount = 0
      this._missCount = 0
    }
  }

  get(key: string): T | null {
    const record = this._cache[key]
    if (!record || record.expire < Date.now()) {
      if (this._debug) this._missCount++
      return null
    }

    if (this._debug) this._hitCount++
    return record.value
  }

  size(): number {
    return this._size
  }

  debug(bool: boolean): void {
    this._debug = bool
  }

  hits(): number {
    return this._hitCount
  }

  misses(): number {
    return this._missCount
  }

  keys(): string[] {
    return Object.keys(this._cache)
  }

  exportJson(): string {
    const plainJsCache: Record<string, { value: T; expire: number | 'NaN' }> = {}
    for (const key in this._cache) {
      const { value, expire } = this._cache[key]
      plainJsCache[key] = { value, expire: isFinite(expire) ? expire : 'NaN' }
    }

    return JSON.stringify(plainJsCache)
  }

  importJson(jsonToImport: string, options?: { skipDuplicates?: boolean }): number {
    const cacheToImport: Record<string, { value: T; expire: number | 'NaN' }> = JSON.parse(jsonToImport)
    const currTime = Date.now()

    for (const key in cacheToImport) {
      if (!cacheToImport.hasOwnProperty(key)) continue

      const { value, expire } = cacheToImport[key]
      const remainingTime = typeof expire === 'number' ? expire - currTime : Infinity

      if (remainingTime <= 0 || (options?.skipDuplicates && this._cache[key])) continue

      this.put(key, value, remainingTime > 0 ? remainingTime : undefined)
    }

    return this.size()
  }
}

const cacheInstance = new Cache<any>()
export default cacheInstance
export { Cache }
