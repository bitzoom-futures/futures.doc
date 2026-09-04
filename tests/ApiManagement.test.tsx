import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ApiManagementConsole from '../src/components/ApiManagement/ApiManagementConsole'

describe('API Management console', () => {
  it('gates key management behind the existing login flow', () => {
    const onLogin = vi.fn()

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken=""
        onLogin={onLogin}
        onSessionExpired={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'API keys' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Log in to manage API keys' }))
    expect(onLogin).toHaveBeenCalledOnce()
  })

  it('loads the signed-in user key list and shows the empty state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    expect(await screen.findByText('No API keys yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create API key' })).toBeEnabled()
    expect(fetch).toHaveBeenCalledWith(
      'https://gateway.example/api/v1/apikey/list',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('supports keyboard focus and Escape dismissal for reversible dialogs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ data: [] }), { status: 200 }))
    )
    const user = userEvent.setup()

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    await screen.findByText('No API keys yet')
    await user.click(screen.getByRole('button', { name: 'Create API key' }))
    expect(screen.getByLabelText('Key label')).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Create API key' })).not.toBeInTheDocument()
  })

  it('renders key status, permissions, and unrestricted IP scope without exposing a secret', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                api_key: 'bz_1234567890abcdef',
                label: 'Trading bot',
                api_permissions: 'READ,TRADE',
                api_key_ip_whitelist: '',
                api_key_status: 'ENABLED',
                api_key_creation_date: '2026-08-25T09:30:25Z',
                api_secret: 'must-not-render',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
    )

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    expect(await screen.findByText('Trading bot')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Label' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'API key' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Created' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Trading bot' })).toBeInTheDocument()
    expect(screen.getByText(/25 Aug 2026 · \d{2}:\d{2}/)).toBeInTheDocument()
    expect(screen.queryByText(/local/i)).not.toBeInTheDocument()
    expect(screen.getByText('READ')).toBeInTheDocument()
    expect(screen.getByText('TRADE')).toBeInTheDocument()
    expect(screen.getByText('Any IP')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.queryByText('must-not-render')).not.toBeInTheDocument()
  })

  it('renders revoked keys as terminal credentials without lifecycle actions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                api_key: 'bz_revoked_access_key',
                label: 'Archived bot',
                api_permissions: 'READ',
                api_key_ip_whitelist: '203.0.113.8',
                api_key_status: 'REVOKED',
                api_key_creation_date: '2026-08-25T09:30:25Z',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    expect(await screen.findByText('Revoked')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Enable Archived bot' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Disable Archived bot' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revoke Archived bot' })).not.toBeInTheDocument()
  })

  it('left-aligns compact lifecycle actions with one consistent control size', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                id: 2,
                userID: 841688153315845,
                api_key: 'bz_active_access_key',
                label: 'Trading bot',
                api_permissions: 'READ,TRADE',
                api_key_ip_whitelist: '',
                api_key_status: 'ENABLED',
                api_key_creation_date: '2026-08-25T09:30:25Z',
              },
              {
                id: 3,
                userID: 841688153315845,
                api_key: 'bz_revoked_access_key',
                label: 'Archived bot',
                api_permissions: 'READ',
                api_key_ip_whitelist: '',
                api_key_status: 'REVOKED',
                api_key_creation_date: '2026-08-25T09:30:25Z',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    const disableButton = await screen.findByRole('button', { name: 'Disable Trading bot' })
    const revokeButton = screen.getByRole('button', { name: 'Revoke Trading bot' })
    const locked = screen.getByText('Locked')
    const actionsHeader = screen.getByRole('columnheader', { name: 'Actions' })

    expect(getComputedStyle(actionsHeader).textAlign).toBe('left')
    expect(getComputedStyle(disableButton.closest('td')! as HTMLElement).textAlign).toBe('left')
    expect(getComputedStyle(locked.closest('td')! as HTMLElement).textAlign).toBe('left')
    expect(getComputedStyle(disableButton.parentElement!).justifyContent).toBe('flex-start')
    expect(getComputedStyle(disableButton).width).toBe('72px')
    expect(getComputedStyle(revokeButton).width).toBe('72px')
    expect(getComputedStyle(disableButton).height).toBe('32px')
    expect(getComputedStyle(revokeButton).height).toBe('32px')
    expect(getComputedStyle(locked).width).toBe('72px')
    expect(getComputedStyle(locked).height).toBe('32px')
  })

  it('uses the same compact control height throughout the page and dialogs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                id: 2,
                userID: 841688153315845,
                api_key: 'bz_active_access_key',
                label: 'Trading bot',
                api_permissions: 'READ,TRADE',
                api_key_ip_whitelist: '',
                api_key_status: 'ENABLED',
                api_key_creation_date: '2026-08-25T09:30:25Z',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )
    const user = userEvent.setup()

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    const createPageButton = await screen.findByRole('button', { name: 'Create API key' })
    const copyButton = screen.getByRole('button', { name: 'Copy access key for Trading bot' })
    const disableButton = screen.getByRole('button', { name: 'Disable Trading bot' })
    const revokeButton = screen.getByRole('button', { name: 'Revoke Trading bot' })

    await user.click(createPageButton)

    const createDialog = screen.getByRole('dialog', { name: 'Create API key' })
    const createDialogButtons = [
      screen.getByRole('button', { name: 'Close create key form' }),
      screen.getByRole('button', { name: 'Cancel' }),
      screen.getByRole('button', { name: 'Create key' }),
    ]
    const buttons = [createPageButton, copyButton, disableButton, revokeButton, ...createDialogButtons]

    for (const button of buttons) {
      expect(getComputedStyle(button).height).toBe('32px')
    }

    await user.click(screen.getByRole('button', { name: 'Close create key form' }))
    expect(createDialog).not.toBeInTheDocument()
    await user.click(revokeButton)

    expect(getComputedStyle(screen.getByRole('button', { name: 'Cancel' })).height).toBe('32px')
    expect(
      getComputedStyle(screen.getByRole('button', { name: 'Revoke key permanently' })).height
    ).toBe('32px')
  })

  it('keeps the key surface visible and reports request errors in a dismissible toast', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ success: false, message: 'Gateway unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Gateway unavailable')
    expect(screen.getByText('No API keys yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('creates a scoped key and discards the one-time secret after acknowledgment', async () => {
    const createdKey = {
      api_key: 'bz_created_access_key',
      api_secret: 'one-time-secret',
      label: 'Trading bot',
      api_permissions: 'READ,TRADE',
      api_key_ip_whitelist: '',
      api_key_status: 'ENABLED',
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: createdKey }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [createdKey] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    vi.stubGlobal('fetch', fetchImpl)
    const user = userEvent.setup()

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    await screen.findByText('No API keys yet')
    await user.click(screen.getByRole('button', { name: 'Create API key' }))
    expect(screen.getByRole('checkbox', { name: 'READ' })).toBeChecked()
    await user.type(screen.getByLabelText('Key label'), 'Trading bot')
    await user.click(screen.getByRole('checkbox', { name: 'TRADE' }))
    await user.click(screen.getByRole('button', { name: 'Create key' }))

    expect(await screen.findByRole('dialog', { name: 'Save your API secret now' })).toBeInTheDocument()
    expect(screen.getByText('one-time-secret')).toBeInTheDocument()
    expect(localStorage.getItem('api_secret')).toBeNull()
    const closeCredentialsButton = screen.getByRole('button', { name: 'Close credentials' })
    expect(closeCredentialsButton).toBeDisabled()
    expect(getComputedStyle(closeCredentialsButton).height).toBe('32px')
    expect(getComputedStyle(closeCredentialsButton).width).not.toBe('100%')

    await user.click(screen.getByRole('checkbox', { name: 'I have saved the API secret' }))
    await user.click(screen.getByRole('button', { name: 'Close credentials' }))

    expect(screen.queryByText('one-time-secret')).not.toBeInTheDocument()
    expect(await screen.findByText('Trading bot')).toBeInTheDocument()
  })

  it('removes a one-time secret from component state when the session ends', async () => {
    const createdKey = {
      api_key: 'bz_session_access_key',
      api_secret: 'session-bound-secret',
      label: '',
      api_permissions: 'READ',
      api_key_ip_whitelist: '',
      api_key_status: 'ENABLED',
    }
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: createdKey }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: [createdKey] }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: [createdKey] }), { status: 200 }))
    )
    const user = userEvent.setup()
    const commonProps = {
      managementGatewayUrl: 'https://gateway.example',
      onLogin: vi.fn(),
      onSessionExpired: vi.fn(),
    }
    const view = render(<ApiManagementConsole {...commonProps} rawToken="login-token" />)

    await screen.findByText('No API keys yet')
    await user.click(screen.getByRole('button', { name: 'Create API key' }))
    await user.click(screen.getByRole('button', { name: 'Create key' }))
    expect(await screen.findByText('session-bound-secret')).toBeInTheDocument()

    view.rerender(<ApiManagementConsole {...commonProps} rawToken="" />)
    expect(screen.queryByText('session-bound-secret')).not.toBeInTheDocument()
    view.rerender(<ApiManagementConsole {...commonProps} rawToken="new-login-token" />)

    expect(await screen.findByText('Untitled key')).toBeInTheDocument()
    expect(screen.queryByText('session-bound-secret')).not.toBeInTheDocument()
  })

  it('waits for a status mutation and then refreshes the key list', async () => {
    const enabledKey = {
      api_key: 'bz_status_key',
      label: 'Trading bot',
      api_permissions: 'READ,TRADE',
      api_key_ip_whitelist: '203.0.113.8',
      api_key_status: 'ENABLED',
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [enabledKey] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: [{ ...enabledKey, api_key_status: 'DISABLED' }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    vi.stubGlobal('fetch', fetchImpl)
    const user = userEvent.setup()

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    await screen.findByText('Enabled')
    await user.click(screen.getByRole('button', { name: 'Disable Trading bot' }))

    expect(await screen.findByText('Disabled')).toBeInTheDocument()
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://gateway.example/api/v1/apikey/status',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          api_key: 'bz_status_key',
          api_key_status: 'DISABLED',
        }),
      })
    )
  })

  it('requires explicit confirmation before permanently revoking a key', async () => {
    const key = {
      api_key: 'bz_revoke_key',
      label: 'Trading bot',
      api_permissions: 'READ',
      api_key_ip_whitelist: '203.0.113.8',
      api_key_status: 'ENABLED',
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [key] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    vi.stubGlobal('fetch', fetchImpl)
    const user = userEvent.setup()

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    await screen.findByText('Trading bot')
    await user.click(screen.getByRole('button', { name: 'Revoke Trading bot' }))
    expect(screen.getByRole('button', { name: 'Revoke key permanently' })).toBeDisabled()
    await user.type(screen.getByLabelText('Type REVOKE to confirm'), 'REVOKE')
    await user.click(screen.getByRole('button', { name: 'Revoke key permanently' }))

    expect(await screen.findByText('No API keys yet')).toBeInTheDocument()
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://gateway.example/api/v1/apikey/revoke',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ api_key: 'bz_revoke_key' }),
      })
    )
  })

  it('returns an expired management session to the shared login boundary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ success: false, errorMessage: 'Expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    const onSessionExpired = vi.fn()

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="expired-token"
        onLogin={vi.fn()}
        onSessionExpired={onSessionExpired}
      />
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Your session expired. Log in again.')
    expect(onSessionExpired).toHaveBeenCalledOnce()
  })

  it('stops creation at the 20-key account limit', async () => {
    const keys = Array.from({ length: 20 }, (_, index) => ({
      api_key: `bz_limit_key_${index}`,
      label: `Key ${index + 1}`,
      api_permissions: 'READ',
      api_key_ip_whitelist: '203.0.113.8',
      api_key_status: 'ENABLED',
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ data: keys }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    render(
      <ApiManagementConsole
        managementGatewayUrl="https://gateway.example"
        rawToken="login-token"
        onLogin={vi.fn()}
        onSessionExpired={vi.fn()}
      />
    )

    expect(await screen.findByText('20 of 20 keys')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create API key' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Key limit reached')
  })
})
