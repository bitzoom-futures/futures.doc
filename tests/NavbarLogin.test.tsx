import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import NavbarLogin from '../src/components/NavbarLogin'
import { UserProvider } from '../src/context/UserContext'

const login = vi.fn()

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: { customFields: { managementGatewayUrl: 'https://gateway.example' } },
  }),
}))

vi.mock('@docusaurus/useBaseUrl', () => ({ default: (path: string) => `/docs${path}` }))

vi.mock('@docusaurus/Link', () => ({
  default: ({
    children,
    to,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}))

vi.mock('../src/hooks/useCasdoorLogin', () => ({
  useCasdoorLogin: () => ({ login, loading: false, error: '' }),
}))

describe('NavbarLogin', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('offers API Management and logout without exposing the management token', async () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ email: 'trader@example.com', token: 'Bearer secret-session', avatar: '' })
    )
    const user = userEvent.setup()

    render(
      <UserProvider>
        <NavbarLogin />
      </UserProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Open account menu' }))

    expect(screen.getByRole('menuitem', { name: 'API Management' })).toHaveAttribute(
      'href',
      '/api-management'
    )
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument()
    expect(screen.queryByText(/Bearer Token/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/secret-session/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy token/i })).not.toBeInTheDocument()
  })
})
