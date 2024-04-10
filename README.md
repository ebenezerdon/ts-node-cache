# TS-Node-Cache

TS-Node-Cache is a TypeScript-based caching solution that's simple and lightweight. It supports data caching with optional expiration and callbacks. Similar to memory-cache but with modern implementation and TypeScript support.

[![npm version](https://badge.fury.io/js/%40ebenezerdon%2Fts-node-cache.svg)](https://badge.fury.io/js/%40ebenezerdon%2Fts-node-cache)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- Stores any data type.
- Allows setting expiration time for entries.
- Supports custom callbacks on expiration.
- Debug mode for tracking cache activity.
- Serialize cache to/from JSON.

## Installation

```bash
npm install @ebenezerdon/ts-node-cache
```

## Usage

### Import and Create Cache

```typescript
import { Cache } from '@ebenezerdon/ts-node-cache'
const cache = new Cache()
```

### Store Data

```typescript
cache.put('myKey', 'myValue', 5000, () => console.log('Expired'))
```

### Retrieve Data

```typescript
let value = cache.get('myKey')
```

### Delete Data

```typescript
cache.del('myKey')
```

### Clear Cache

```typescript
cache.clear()
```

### Enable Debugging

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

To contribute:

1. **Fork & Clone**: Fork the repo and clone it locally.
2. **Make Changes**: Work on your changes.
3. **Build**: Run `npm run build` to build the project.
4. **Test**: Ensure your changes don't break anything.
5. **Submit a PR**: Push your changes and submit a pull request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.
