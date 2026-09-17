import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import WebSocketTester from '../src/components/WebSocketTester/WebSocketTester'
import type { ChannelConfig } from '../src/components/WebSocketTester/types'

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({ siteConfig: { customFields: { hmacApiUrl: 'https://api.example' } } }),
}))

vi.mock('@docusaurus/Link', () => ({
  default: ({ children, to, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}))

const publicChannel: ChannelConfig = {
  id: 'ticker',
  label: 'Ticker',
  path: '/api/v1/ticker',
  requiresAuth: false,
  description: 'Public ticker updates',
  params: [],
}

const privateChannel: ChannelConfig = {
  ...publicChannel,
  id: 'balance',
  label: 'Balance',
  path: '/api/v1/balance',
  requiresAuth: true,
  description: 'Private balance updates',
}

describe('WebSocket browser controls', () => {
  it('keeps public channels interactive', () => {
    render(<WebSocketTester channel={publicChannel} />)

    expect(screen.getByRole('heading', { name: 'Connection' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Connect' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeDisabled()
    expect(screen.getByDisplayValue('https://api.example')).toBeInTheDocument()
  })

  it('replaces all private authentication and subscription controls with the signing guide', () => {
    render(<WebSocketTester channel={privateChannel} />)

    expect(screen.getByText('Private channel')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open the HMAC signing guide/ })).toHaveAttribute(
      'href',
      '/guides/api-key-authentication'
    )
    expect(screen.queryByRole('button', { name: 'Connect' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Bearer/i)).not.toBeInTheDocument()
  })
})
