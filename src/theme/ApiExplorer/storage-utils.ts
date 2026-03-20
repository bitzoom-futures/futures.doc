import CryptoJS from 'crypto-js'

export function hashArray(arr: string[]): string {
  function hash(message: string): string {
    return CryptoJS.SHA1(message).toString()
  }
  const hashed = arr.map((item) => hash(item))
  hashed.sort()
  const res = hashed.join()
  return hash(res)
}

export function createStorage(
  persistance: 'localStorage' | 'sessionStorage' | false
): Storage {
  if (persistance === false) {
    return {
      getItem: () => null,
      setItem: () => {},
      clear: () => {},
      key: () => null,
      removeItem: () => {},
      length: 0,
    } as unknown as Storage
  }
  // Always use localStorage regardless of what the plugin passes
  return localStorage
}
