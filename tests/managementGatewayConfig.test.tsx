import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import NavbarLogin from '../src/components/NavbarLogin'
import { UserProvider } from '../src/context/UserContext'

const loginOptions = vi.hoisted(() => ({ managementGatewayUrl: '' }))

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({ siteConfig: { customFields: {} } }),
}))

vi.mock('@docusaurus/useBaseUrl', () => ({ default: (path: string) => `/docs${path}` }))

vi.mock('@docusaurus/Link', () => ({
  default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

vi.mock('../src/hooks/useCasdoorLogin', () => ({
  useCasdoorLogin: (options: { managementGatewayUrl: string }) => {
    loginOptions.managementGatewayUrl = options.managementGatewayUrl
    return { login: vi.fn(), loading: false, error: '' }
  },
}))

describe('management gateway configuration', () => {
  beforeEach(() => {
    localStorage.clear()
    loginOptions.managementGatewayUrl = ''
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the test1 management gateway when no build-time override is available', () => {
    render(
      <UserProvider>
        <NavbarLogin />
      </UserProvider>
    )

    expect(loginOptions.managementGatewayUrl).toBe('https://test1.riverwa.com')
  })

  it('publishes the build-time management gateway override without a trailing slash', async () => {
    vi.stubEnv('BITZOOM_MANAGEMENT_GATEWAY_URL', 'https://management.example/')
    vi.resetModules()

    const { default: createConfig } = await import('../docusaurus.config')
    const config = await createConfig()

    expect(config.customFields?.managementGatewayUrl).toBe('https://management.example')
  })

  it('routes browser management calls through the local development origin', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('BITZOOM_MANAGEMENT_GATEWAY_URL', 'https://management.example')
    vi.resetModules()

    const { default: createConfig } = await import('../docusaurus.config')
    const config = await createConfig()

    expect(config.customFields?.managementGatewayUrl).toBe('/__management')
  })

  it('forwards only the development management prefix to the configured gateway', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('BITZOOM_MANAGEMENT_GATEWAY_URL', 'https://management.example/')
    vi.resetModules()

    const { default: createConfig } = await import('../docusaurus.config')
    const config = await createConfig()
    const plugin = (config.plugins || [])
      .filter((entry): entry is (...args: unknown[]) => Record<string, unknown> =>
        typeof entry === 'function'
      )
      .map((factory) => factory())
      .find((entry) => entry.name === 'management-gateway-dev-proxy') as
        | {
            configureWebpack: () => {
              devServer: {
                proxy: Array<{
                  context: string[]
                  target: string
                  changeOrigin: boolean
                  secure: boolean
                  pathRewrite: (path: string) => string
                  onProxyReq: (request: { removeHeader: (name: string) => void }) => void
                }>
              }
            }
          }
        | undefined

    expect(plugin).toBeDefined()
    if (!plugin) return

    const [proxy] = plugin.configureWebpack().devServer.proxy
    expect(proxy.context).toEqual(['/__management'])
    expect(proxy.target).toBe('https://management.example')
    expect(proxy.changeOrigin).toBe(true)
    expect(proxy.secure).toBe(true)
    expect(proxy.pathRewrite('/__management/api/casdoor?source=docs')).toBe(
      '/api/casdoor?source=docs'
    )

    const headers = new Set(['origin', 'authorization'])
    proxy.onProxyReq({ removeHeader: (name) => headers.delete(name) })
    expect(headers).toEqual(new Set(['authorization']))
  })

  it('does not expose the local proxy route in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('BITZOOM_MANAGEMENT_GATEWAY_URL', 'https://management.example')
    vi.resetModules()

    const { default: createConfig } = await import('../docusaurus.config')
    const config = await createConfig()
    const pluginNames = (config.plugins || [])
      .filter((entry): entry is (...args: unknown[]) => Record<string, unknown> =>
        typeof entry === 'function'
      )
      .map((factory) => factory().name)

    expect(config.customFields?.managementGatewayUrl).toBe('https://management.example')
    expect(pluginNames).not.toContain('management-gateway-dev-proxy')
  })
})
