import React, { useEffect, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { DEFAULT_MANAGEMENT_GATEWAY_URL } from '../config/managementGateway'

interface CasdoorConfig {
  BackgroundCallbackURL?: string
}

interface GatewayEnvelope {
  data?: unknown
  success?: boolean
}

interface TokenExchangeResponse {
  data?: { access_token?: string }
  success?: boolean
}

function buildCallbackRequestUrl(
  managementGatewayUrl: string,
  backgroundCallbackUrl: string,
  code: string,
  state: string
) {
  if (!backgroundCallbackUrl.startsWith('/') || backgroundCallbackUrl.startsWith('//')) {
    throw new Error('Casdoor callback URL must be a relative gateway path')
  }

  const advertisedUrl = new URL(backgroundCallbackUrl, 'https://management.invalid')
  advertisedUrl.searchParams.set('code', code)
  advertisedUrl.searchParams.set('state', state)

  return `${managementGatewayUrl.replace(/\/+$/, '')}${advertisedUrl.pathname}${advertisedUrl.search}`
}

function decodeUser(jwt: string) {
  const rawToken = jwt.replace(/^Bearer\s+/i, '')
  const parts = rawToken.split('.')
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error('Gateway returned an invalid JWT')
  }

  const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=')
  const payload = JSON.parse(atob(paddedPayload))

  return {
    email: payload?.email || payload?.name || payload?.uname || payload?.provider_subject || 'User',
    token: `Bearer ${rawToken}`,
    avatar: payload?.avatar || '',
  }
}

/**
 * OAuth callback page — opened in a popup by NavbarLogin.
 * Extracts `code` from URL, discovers the gateway's Casdoor callback endpoint,
 * exchanges the code for a JWT, saves the session, and closes the popup.
 */
export default function Callback() {
  const { siteConfig } = useDocusaurusContext()
  const managementGatewayUrl =
    (siteConfig.customFields?.managementGatewayUrl as string) || DEFAULT_MANAGEMENT_GATEWAY_URL
  const [status, setStatus] = useState('Processing login...')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')

      if (!code) {
        setStatus('No authorization code received.')
        return
      }

      try {
        const configResponse = await fetch(`${managementGatewayUrl}/api/casdoor`)
        if (!configResponse.ok) throw new Error('Casdoor configuration request failed')

        const configPayload = (await configResponse.json()) as GatewayEnvelope
        if (configPayload.success === false) throw new Error('Casdoor configuration request failed')
        const config = (configPayload.data || configPayload) as CasdoorConfig
        if (!config.BackgroundCallbackURL) throw new Error('Casdoor callback URL is missing')

        const callbackRequestUrl = buildCallbackRequestUrl(
          managementGatewayUrl,
          config.BackgroundCallbackURL,
          code,
          state || ''
        )
        const response = await fetch(callbackRequestUrl)
        if (!response.ok) throw new Error('Token exchange request failed')
        const { data, success } = (await response.json()) as TokenExchangeResponse
        if (success === false || !data?.access_token) throw new Error('Token exchange request failed')
        const user = decodeUser(data.access_token)

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user))

        setStatus('Login successful! This window will close...')

        // Notify parent and close popup
        if (window.opener) {
          window.opener.postMessage({ type: 'casdoor-callback-done' }, window.location.origin)
          setTimeout(() => window.close(), 1000)
        } else {
          setTimeout(() => { window.location.href = '/docs/' }, 1500)
        }
      } catch (err) {
        console.error('Token exchange failed:', err)
        setStatus('Login failed. Please try again.')
      }
    }
    run()
  }, [managementGatewayUrl])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '1.1rem',
        color: '#666',
      }}
    >
      {status}
    </div>
  )
}
