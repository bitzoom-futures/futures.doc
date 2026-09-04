import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserProvider, useUser } from '../src/context/UserContext'
import { useCasdoorLogin } from '../src/hooks/useCasdoorLogin'

const getSigninUrl = vi.fn(() => 'https://identity.example/login')
const sdkConstructor = vi.fn()

vi.mock('casdoor-js-sdk', () => ({
  default: class MockCasdoorSdk {
    constructor(config: unknown) {
      sdkConstructor(config)
    }

    getSigninUrl() {
      return getSigninUrl()
    }
  },
}))

function Harness() {
  const { user } = useUser()
  const { login, loading, error } = useCasdoorLogin({
    managementGatewayUrl: 'https://gateway.example',
    redirectPath: '/docs/callback',
  })

  return (
    <>
      <button type="button" onClick={login}>Log in</button>
      <output>{loading ? 'loading' : 'idle'}</output>
      <p>{error}</p>
      <p>{user?.email || 'signed out'}</p>
    </>
  )
}

describe('useCasdoorLogin', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('opens Casdoor and refreshes the shared session after the popup callback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: {
              Endpoint: 'https://identity.example',
              ClientID: 'client-id',
              Organization: 'bitzoom',
              Application: 'docs',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )
    const popup = { closed: false }
    const openWindow = vi.spyOn(window, 'open').mockReturnValue(popup as Window)
    const user = userEvent.setup()

    render(
      <UserProvider>
        <Harness />
      </UserProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(fetch).toHaveBeenCalledWith('https://gateway.example/api/casdoor')
    expect(sdkConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        serverUrl: 'https://identity.example',
        clientId: 'client-id',
        redirectPath: '/docs/callback',
      })
    )
    expect(openWindow).toHaveBeenCalledWith(
      'https://identity.example/login',
      'casdoor-login',
      expect.stringContaining('popup=yes')
    )
    expect(screen.getByText('loading')).toBeInTheDocument()

    localStorage.setItem(
      'user',
      JSON.stringify({ email: 'trader@example.com', token: 'Bearer session-token', avatar: '' })
    )
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: 'casdoor-callback-done' },
        })
      )
    })

    expect(await screen.findByText('trader@example.com')).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('surfaces configuration failures without opening a popup', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ data: {} }), { status: 200 }))
    )
    const openWindow = vi.spyOn(window, 'open')
    const user = userEvent.setup()

    render(
      <UserProvider>
        <Harness />
      </UserProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Login is temporarily unavailable. Try again.')).toBeInTheDocument()
    expect(openWindow).not.toHaveBeenCalled()
  })
})
