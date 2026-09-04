import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Callback from '../src/pages/callback'

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: { customFields: { managementGatewayUrl: 'https://management.example' } },
  }),
}))

const jwt =
  'eyJhbGciOiJub25lIn0.eyJhdXRoX2F1dGhvcml0eV9zZXJ2aWNlIjoiZ2F0ZXdheSIsImF1dGhfZ2VuZXJhdGlvbiI6MCwiYXV0aF9wcm92aWRlciI6ImNhc2Rvb3IiLCJhdXRoX3R5cGUiOiJhdXRoIiwiZXhwIjoyMDAwMDAwMDAwLCJpYXQiOjE5OTk5OTI4MDAsInBsYXRmb3JtX3VpZCI6IjEyMzQ1Njc4OSIsInByb3ZpZGVyX3N1YmplY3QiOiJ0cmFkZXJAZXhhbXBsZS5jb20iLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJ1aWQiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDAiLCJ1bmFtZSI6InRyYWRlckBleGFtcGxlLmNvbSJ9.signature'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function casdoorConfigPayload() {
  return {
    traceid: 'config-trace',
    errorCode: 200,
    errorMessage: '',
    success: true,
    data: {
      Endpoint: 'https://identity.example',
      ClientID: 'client-id',
      Organization: 'bitzoom',
      Application: 'futures',
      BackgroundCallbackURL: '/api/casdoor/callback?service=gateway',
    },
    host: 'gateway',
    showType: 0,
    code: 200,
    message: '',
    request_id: '',
  }
}

async function flushLogin() {
  await act(async () => {
    for (let index = 0; index < 8; index += 1) await Promise.resolve()
  })
}

describe('Casdoor callback', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(
      {},
      '',
      '/docs/callback?code=authorization-code&state=oauth-state'
    )
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: { postMessage: vi.fn() },
    })
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(() => 0 as ReturnType<typeof setTimeout>)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('exchanges the code through the callback URL advertised by the gateway', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === 'https://management.example/api/casdoor') {
        return jsonResponse(casdoorConfigPayload())
      }
      if (
        url ===
        'https://management.example/api/casdoor/callback?service=gateway&code=authorization-code&state=oauth-state'
      ) {
        return jsonResponse({
          traceid: 'token-trace',
          errorCode: 200,
          errorMessage: '',
          success: true,
          duration: 348985623,
          data: {
            access_token: jwt,
            refresh_token: 'refresh-token-must-not-be-stored',
            token_type: 'Bearer',
            access_expires_in: 7200,
            refresh_expires_in: 2592000,
          },
          host: 'gateway',
          showType: 0,
          code: 200,
          message: '',
          request_id: '',
        })
      }
      return new Response('404 page not found', { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<Callback />)
    await flushLogin()

    expect(screen.getByText('Login successful! This window will close...')).toBeInTheDocument()
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      'https://management.example/api/casdoor',
      'https://management.example/api/casdoor/callback?service=gateway&code=authorization-code&state=oauth-state',
    ])
    expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual({
      email: 'trader@example.com',
      token: `Bearer ${jwt}`,
      avatar: '',
    })
  })

  it('does not store a session when the advertised token exchange fails', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === 'https://management.example/api/casdoor') {
        return jsonResponse(casdoorConfigPayload())
      }
      return new Response('404 page not found', { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<Callback />)
    await flushLogin()

    expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    expect(localStorage.getItem('user')).toBeNull()
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      'https://management.example/api/casdoor',
      'https://management.example/api/casdoor/callback?service=gateway&code=authorization-code&state=oauth-state',
    ])
  })
})
