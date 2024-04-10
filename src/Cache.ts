/** Defines the structure for each cache record. */
type CacheRecord<T> = {
  value: T
  expire: number
  timeout?: NodeJS.Timeout
}

/** Implements a generic cache system with optional expiration for each key-value pair. */
class Cache<T> {
  /** Object to store cache data. */
  private _cache: Record<string, CacheRecord<T>> = Object.create(null)
  /** Counter for cache hits. */
  private _hitCount = 0
  /** Counter for cache misses. */
  private _missCount = 0
  /** Current size of the cache. */
  private _size = 0
  /** Debug flag to enable logging. */
  private _debug = false

  /**
   * Adds or updates a cache record with a key, value, optional expiration time, and an optional expiration callback.
   * @param key The key under which to store the value.
   * @param value The value to store.
   * @param time Optional time in milliseconds until the record expires.
   * @param timeoutCallback Optional callback to execute upon expiration of the cache record.
   * @returns The stored value.
   */
  put(key: string, value: T, time?: number, timeoutCallback?: (key: string, value: T) => void): T {
    if (this._debug) {
      console.log(`Caching: ${key} = ${JSON.stringify(value)} (@${time})`)
    }

    // Validates expiration time and timeout callback function.
    if (time !== undefined) {
      if (typeof time !== 'number' || isNaN(time) || time <= 0) {
        throw new Error('Cache timeout must be a positive number')
      }
    }
    if (timeoutCallback !== undefined && typeof timeoutCallback !== 'function') {
      throw new Error('Cache timeout callback must be a function')
    }

    // Clears existing timeout if updating an existing record.
    const oldRecord = this._cache[key]
    if (oldRecord) {
      clearTimeout(oldRecord.timeout)
    } else {
      this._size++
    }

    // Sets expiration time and schedules timeout callback if provided.
    const expire = time !== undefined ? time + Date.now() : Infinity
    const timeout =
      time !== undefined
        ? setTimeout(() => {
            this._del(key)
            timeoutCallback?.(key, value)
          }, time)
        : undefined

    // Updates the cache record.
    this._cache[key] = { value, expire, timeout }

    return value
  }

  /**
   * Deletes a cache record by key.
   * @param key The key of the cache record to delete.
   * @returns True if the record was found and deleted, false otherwise.
   */
  del(key: string): boolean {
    const record = this._cache[key]
    if (!record) return false

    clearTimeout(record.timeout)
    this._del(key)
    return true
  }

  /**
   * Deletes a cache record by key. Used internally.
   * @param key The key of the cache record to delete.
   */
  private _del(key: string): void {
    delete this._cache[key]
    this._size--
  }

  /** Clears all cache records. */
  clear(): void {
    Object.values(this._cache).forEach((record) => clearTimeout(record.timeout))
    this._cache = Object.create(null)
    this._size = 0
    if (this._debug) {
      this._hitCount = 0
      this._missCount = 0
    }
  }

  /**
   * Retrieves the value of a cache record by key.
   * @param key The key of the cache record to retrieve.
   * @returns The value of the cache record, or null if not found or expired.
   */
  get(key: string): T | null {
    const record = this._cache[key]
    if (!record || record.expire < Date.now()) {
      if (this._debug) this._missCount++
      return null
    }

    if (this._debug) this._hitCount++
    return record.value
  }

  /** @returns The current size of the cache. */
  size(): number {
    return this._size
  }

  /**
   * Enables or disables debug mode.
   * @param bool True to enable debug mode, false to disable.
   */
  debug(bool: boolean): void {
    this._debug = bool
  }

  /** @returns The number of cache hits since the last clear. */
  hits(): number {
    return this._hitCount
  }

  /** @returns The number of cache misses since the last clear. */
  misses(): number {
    return this._missCount
  }

  /** @returns An array of all current cache keys. */
  keys(): string[] {
    return Object.keys(this._cache)
  }

  /**
   * Exports the current cache to a JSON string.
   * @returns A JSON string representing the cache.
   */
  exportJson(): string {
    const plainJsCache: Record<string, { value: T; expire: number | 'NaN' }> = {}
    for (const key in this._cache) {
      const { value, expire } = this._cache[key]
      plainJsCache[key] = { value, expire: isFinite(expire) ? expire : 'NaN' }
    }

    return JSON.stringify(plainJsCache)
  }

  /**
   * Imports cache records from a JSON string.
   * @param jsonToImport A JSON string representing the cache to import.
   * @param options Optional settings for the import, such as whether to skip duplicate keys.
   * @returns The new size of the cache.
   */
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

/** Exports an instance of the Cache class. */
const cacheInstance = new Cache<any>()
export default cacheInstance
export { Cache }
