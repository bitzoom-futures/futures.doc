import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { transformGatewaySpec } = require('../scripts/hmac-openapi.cjs')

describe('HMAC OpenAPI transformation', () => {
  it('converts private Bearer operations while leaving public operations executable', () => {
    const source = {
      openapi: '3.0.3',
      info: { title: 'Fixture', version: 'next' },
      tags: [{ name: 'gateway', description: 'https://old-gateway.example' }],
      servers: [{ url: 'https://old-gateway.example' }],
      components: {
        securitySchemes: {
          Bearer: { type: 'http', scheme: 'bearer' },
        },
      },
      paths: {
        '/public': {
          get: {
            operationId: 'publicEndpoint',
            responses: { 200: { description: 'ok' } },
          },
        },
        '/private': {
          post: {
            operationId: 'privateEndpoint',
            security: [{ Bearer: [] }],
            parameters: [
              { name: 'X-Correlation-ID', in: 'header', required: false, schema: { type: 'string' } },
              { name: 'Timestamp', in: 'query', schema: { type: 'string' } },
              { name: 'Signature', in: 'query', schema: { type: 'string' } },
            ],
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    }

    const transformed = transformGatewaySpec(source, {
      hmacApiUrl: 'https://api.example/',
    })
    const publicOperation = transformed.paths['/public'].get
    const privateOperation = transformed.paths['/private'].post

    expect(transformed.servers).toEqual([{ url: 'https://api.example' }])
    expect(transformed.info).toEqual(
      expect.objectContaining({
        title: 'Bitzoom HMAC API',
        description: expect.stringContaining('/guides/api-key-authentication'),
      })
    )
    expect(transformed.tags).toEqual([{ name: 'gateway', description: 'https://api.example' }])
    expect(transformed.components.securitySchemes).toEqual({
      HmacApiKey: expect.objectContaining({
        type: 'apiKey',
        in: 'header',
        name: 'X-BZ-APIKEY',
      }),
    })
    expect(publicOperation).not.toHaveProperty('x-bitzoom-hmac')
    expect(publicOperation.security).toBeUndefined()
    expect(privateOperation.security).toEqual([{ HmacApiKey: [] }])
    expect(privateOperation['x-bitzoom-hmac']).toBe(true)
    expect(privateOperation.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'X-Correlation-ID' }),
        expect.objectContaining({ name: 'X-BZ-TIMESTAMP', required: true }),
        expect.objectContaining({ name: 'X-BZ-NONCE', required: true }),
        expect.objectContaining({ name: 'X-BZ-SIGNATURE', required: true }),
        expect.objectContaining({ name: 'X-BZ-RECVWINDOW', required: false }),
      ])
    )
    expect(privateOperation.parameters).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ in: 'query', name: 'Timestamp' }),
        expect.objectContaining({ in: 'query', name: 'Signature' }),
      ])
    )
  })
})
