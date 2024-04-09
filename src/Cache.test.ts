import { Cache } from './Cache'

describe('Cache Class Tests', () => {
  let cache: Cache<string>

  beforeEach(() => {
    cache = new Cache()
  })

  test('should store and retrieve an item', () => {
    cache.put('key', 'value')
    expect(cache.get('key')).toBe('value')
  })

  test('should override an existing item with the same key', () => {
    cache.put('key', 'value1')
    cache.put('key', 'value2')
    expect(cache.get('key')).toBe('value2')
  })

  test('should not retrieve expired items', (done) => {
    cache.put('key', 'value', 1) // expires in 1ms
    setTimeout(() => {
      expect(cache.get('key')).toBeNull()
      done()
    }, 10) // check after 10ms to ensure the item has expired
  })

  test('should invoke timeout callback when an item expires', (done) => {
    const callback = jest.fn()
    cache.put('key', 'value', 1, callback) // expires in 1ms

    setTimeout(() => {
      expect(callback).toHaveBeenCalledWith('key', 'value')
      done()
    }, 10) // check after 10ms to ensure the callback has been invoked
  })

  test('should return null for missing items', () => {
    expect(cache.get('missing')).toBeNull()
  })

  test('should remove an item explicitly', () => {
    cache.put('key', 'value')
    cache.del('key')
    expect(cache.get('key')).toBeNull()
  })

  test('should clear all items', () => {
    cache.put('key1', 'value1')
    cache.put('key2', 'value2')
    cache.clear()
    expect(cache.size()).toBe(0)
  })

  test('should not decrease size when deleting non-existing key', () => {
    cache.put('key', 'value')
    cache.del('nonExistingKey')
    expect(cache.size()).toBe(1)
  })

  test('should correctly report the cache size', () => {
    cache.put('key1', 'value1')
    cache.put('key2', 'value2')
    expect(cache.size()).toBe(2)
  })

  test('should export and import cache correctly', () => {
    cache.put('key1', 'value1')
    cache.put('key2', 'value2', 1000) // this entry will have an expire time
    const exportedCache = cache.exportJson()

    const newCache = new Cache()
    newCache.importJson(exportedCache)

    expect(newCache.get('key1')).toBe('value1')
    expect(newCache.size()).toBe(2)
  })

  test('imported cache should not contain expired items', (done) => {
    cache.put('key', 'value', 1) // expires in 1ms
    setTimeout(() => {
      const exportedCache = cache.exportJson()
      const newCache = new Cache()
      newCache.importJson(exportedCache)
      expect(newCache.size()).toBe(0)
      done()
    }, 10) // check after 10ms to ensure the item has expired
  })

  test('should throw an error if the time is not a positive number', () => {
    expect(() => cache.put('key', 'value', -1)).toThrow('Cache timeout must be a positive number')
  })

  test('should throw an error if the timeoutCallback is not a function', () => {
    expect(() =>
      cache.put('key', 'value', 1000, 'notAFunction' as unknown as (key: string, value: any) => void),
    ).toThrow('Cache timeout callback must be a function')
  })

  test('debug mode should log hits and misses', () => {
    cache.debug(true)
    cache.put('key1', 'value1')
    cache.get('key1') // hit
    cache.get('key2') // miss
    expect(cache.hits()).toBe(1)
    expect(cache.misses()).toBe(1)
  })

  test('keys method should return all current cache keys', () => {
    cache.put('key1', 'value1')
    cache.put('key2', 'value2')
    expect(cache.keys()).toEqual(['key1', 'key2'])
  })

  test('size should not increase when adding a key that already exists', () => {
    cache.put('key', 'value1')
    cache.put('key', 'value2') // override the existing key
    expect(cache.size()).toBe(1)
  })

  // Test for importJson and exportJson
  test('should accurately export and import cache, maintaining data integrity', () => {
    cache.put('key1', 'value1', 5000)
    cache.put('key2', 'value2')

    const exportedJson = cache.exportJson()
    const newCache = new Cache()
    newCache.importJson(exportedJson)

    expect(newCache.get('key1')).toBe('value1')
    expect(newCache.get('key2')).toBe('value2')
    expect(newCache.size()).toBe(2)
  })

  test('importJson should skip duplicate keys when skipDuplicates is true', () => {
    cache.put('key1', 'value1')
    const exportedJson = cache.exportJson()

    const newCache = new Cache()
    newCache.put('key1', 'newValue1') // Existing key with different value
    newCache.importJson(exportedJson, { skipDuplicates: true })

    // The value should remain unchanged as the duplicate was skipped
    expect(newCache.get('key1')).toBe('newValue1')
  })
})
