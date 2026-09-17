import { describe, expect, it, vi } from 'vitest'

import { ApiKeyRequestError, createApiKeyClient } from '../src/api/apiKeys'

describe('API key management client', () => {
  it('lists keys through the management gateway with the login Bearer token', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example/',
      token: 'Bearer login-token',
      fetchImpl,
    })

    await expect(client.list()).resolves.toEqual([])
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://gateway.example/api/v1/apikey/list',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer login-token' }),
      })
    )
  })

  it('unwraps the list endpoint items collection', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example',
      token: 'login-token',
      fetchImpl,
    })

    await expect(client.list()).resolves.toEqual([])
  })

  it('accepts the gateway business code 200 as success', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          traceid: 'list-trace',
          errorCode: 200,
          errorMessage: '',
          success: true,
          data: { items: [] },
          host: 'gateway',
          showType: 0,
          code: 200,
          message: '',
          request_id: '',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example',
      token: 'login-token',
      fetchImpl,
    })

    await expect(client.list()).resolves.toEqual([])
  })

  it('creates a key with the documented snake_case payload', async () => {
    const createdKey = {
      api_key: 'access-key',
      api_secret: 'one-time-secret',
      label: 'Trading bot',
      api_permissions: 'READ,TRADE',
      api_key_ip_whitelist: '203.0.113.8',
      api_key_status: 'ENABLED' as const,
    }
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, data: createdKey }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example',
      token: 'login-token',
      fetchImpl,
    })

    await expect(
      client.create({
        label: 'Trading bot',
        api_permissions: 'READ,TRADE',
        api_key_ip_whitelist: '203.0.113.8',
      })
    ).resolves.toEqual(createdKey)
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://gateway.example/api/v1/apikey',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer login-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          label: 'Trading bot',
          api_permissions: 'READ,TRADE',
          api_key_ip_whitelist: '203.0.113.8',
        }),
      })
    )
  })

  it('changes a key status with the exact status contract', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, data: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example',
      token: 'login-token',
      fetchImpl,
    })

    await expect(client.setStatus('access-key', 'DISABLED')).resolves.toBeUndefined()
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://gateway.example/api/v1/apikey/status',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          api_key: 'access-key',
          api_key_status: 'DISABLED',
        }),
      })
    )
  })

  it('revokes a key through the permanent DELETE endpoint', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example',
      token: 'login-token',
      fetchImpl,
    })

    await expect(client.revoke('access-key')).resolves.toBeUndefined()
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://gateway.example/api/v1/apikey/revoke',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ api_key: 'access-key' }),
      })
    )
  })

  it('rejects HTTP failures without exposing the response body', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: false,
          errorMessage: 'Permission denied',
          api_secret: 'must-never-appear',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example',
      token: 'login-token',
      fetchImpl,
    })

    const error = await client.list().catch((caught) => caught)

    expect(error).toBeInstanceOf(ApiKeyRequestError)
    expect(error).toMatchObject({ message: 'Permission denied', status: 403 })
    expect(String(error)).not.toContain('must-never-appear')
  })

  it('rejects a nonzero business code even when HTTP succeeds', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ code: -1002, msg: 'Session expired' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const client = createApiKeyClient({
      baseUrl: 'https://gateway.example',
      token: 'login-token',
      fetchImpl,
    })

    await expect(client.list()).rejects.toMatchObject({
      message: 'Session expired',
      status: 200,
      code: -1002,
    })
  })
})
