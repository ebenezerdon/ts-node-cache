# TS-Node-Cache

TS-Node-Cache is a simple, lightweight caching solution implemented in TypeScript, providing a flexible way to cache data with optional expiration times and custom timeout callbacks. This cache implementation allows storing any type of data.

## Features

- **Generic Caching**: Store any type of data with ease.
- **Expiration Support**: Set a time-to-live (TTL) for each cache entry.
- **Timeout Callbacks**: Execute custom logic when a cache entry expires.
- **Debug Mode**: Enable logging to track cache hits and misses.
- **Serialization**: Export and import your cache to and from JSON format.
- **Scalability**: Lightweight and straightforward, suitable for small to medium-sized projects.

## Installation

To install TS-Node-Cache, use the following npm command:

```bash
npm install @ebenezerdon/ts-node-cache
```

## Usage

Here's how you can use TS-Node-Cache in your project:

### Importing the Cache

```typescript
import { Cache } from '@ebenezerdon/ts-node-cache'
```

### Creating a Cache Instance

```typescript
const cache = new Cache<string>()
```

### Storing Data

```typescript
cache.put('myKey', 'myValue', 5000, (key, value) => {
  console.log(`${key} with ${value} has expired.`)
})
```

This stores `'myValue'` under the key `'myKey'` with a TTL of 5000 milliseconds. After expiration, it logs a message to the console.

### Retrieving Data

```typescript
const value = cache.get('myKey')
```

This retrieves the value stored under `'myKey'`.

### Deleting Data

```typescript
cache.del('myKey')
```

This deletes the data associated with `'myKey'`.

### Clearing the Cache

```typescript
cache.clear()
```

This clears all data stored in the cache.

### Debugging

Enable debugging to track cache hits and misses:

```typescript
cache.debug(true)
```

## Methods

- `put(key: string, value: T, time?: number, timeoutCallback?: (key: string, value: T) => void): T`
- `get(key: string): T | null`
- `del(key: string): boolean`
- `clear(): void`
- `size(): number`
- `debug(bool: boolean): void`
- `hits(): number`
- `misses(): number`
- `keys(): string[]`
- `exportJson(): string`
- `importJson(jsonToImport: string, options?: { skipDuplicates?: boolean }): number`

## Contributing

Contributions are welcome! Feel free to open a pull request or an issue if you have suggestions or encounter any problems.

## License

This project is licensed under the ISC License - see the LICENSE file for details.
