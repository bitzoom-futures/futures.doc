interface Extension {
  key?: string
  value?: unknown
}

interface OperationWithExtensions {
  extensions?: Extension[] | object
}

export function isHmacOperation(operation: OperationWithExtensions): boolean {
  if (!Array.isArray(operation.extensions)) return false
  return operation.extensions.some(
    (extension) => extension?.key === 'x-bitzoom-hmac' && extension.value === true
  )
}
