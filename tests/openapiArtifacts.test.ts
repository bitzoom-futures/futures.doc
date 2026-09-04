import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSpec(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

describe('generated OpenAPI artifacts', () => {
  it('keeps public current operations unsigned and makes private operations HMAC-only', () => {
    const spec = readSpec('examples/bitzoom.gateway.json')
    const publicOperation = spec.paths['/api/gateway/ping'].get
    const privateOperation = spec.paths['/api/v1/balance'].get

    expect(spec.servers).toEqual([{ url: 'https://api1.riverwa.com' }])
    expect(publicOperation.security).toBeUndefined()
    expect(publicOperation['x-bitzoom-hmac']).toBeUndefined()
    expect(privateOperation.security).toEqual([{ HmacApiKey: [] }])
    expect(privateOperation['x-bitzoom-hmac']).toBe(true)
    expect(privateOperation.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ in: 'header', name: 'X-BZ-TIMESTAMP' }),
        expect.objectContaining({ in: 'header', name: 'X-BZ-NONCE' }),
        expect.objectContaining({ in: 'header', name: 'X-BZ-SIGNATURE' }),
      ])
    )
  })

  it('pins version 1.0 to its original Bearer contract', () => {
    const legacy = readSpec('examples/bitzoom.gateway.v1.json')
    const privateOperation = legacy.paths['/api/v1/balance'].get

    expect(legacy.servers).toEqual([{ url: 'https://test.riverwa.com' }])
    expect(legacy.components.securitySchemes).toHaveProperty('Bearer')
    expect(legacy.components.securitySchemes).not.toHaveProperty('HmacApiKey')
    expect(privateOperation.security).toEqual([{ Bearer: [] }])
    expect(privateOperation['x-bitzoom-hmac']).toBeUndefined()
  })
})
