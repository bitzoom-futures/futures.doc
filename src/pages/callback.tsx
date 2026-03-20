import React, { useEffect, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

/**
 * OAuth callback page — opened in a popup by NavbarLogin.
 * Extracts `code` from URL, exchanges it for a JWT via gateway's /api/callback,
 * saves to localStorage, and closes the popup.
 */
export default function Callback() {
  const { siteConfig } = useDocusaurusContext()
  const gatewayServerUrl = (siteConfig.customFields?.gatewayServerUrl as string) || ''
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
        // Exchange code for JWT token via gateway
        const apiBase = gatewayServerUrl || window.location.origin
        const res = await fetch(`${apiBase}/api/callback?code=${code}&state=${state}`)
        const text = await res.text()

        // Response may be JSON wrapper with `data` field containing the JWT
        let jwt = text
        try {
          const json = JSON.parse(text)
          if (json.data) jwt = json.data
        } catch { /* raw token string, use as-is */ }

        if (!jwt || jwt.length < 10) {
          setStatus('Failed to get token.')
          return
        }

        // Decode JWT to get user info
        const bearerToken = jwt.startsWith('Bearer ') ? jwt : `Bearer ${jwt}`
        const parts = bearerToken.replace(/^Bearer\s+/i, '').split('.')
        let email = 'User'
        let avatar = ''
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
            email = payload?.email || payload?.name || 'User'
            avatar = payload?.avatar || ''
          } catch { /* ignore */ }
        }

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify({ email, token: bearerToken, avatar }))

        setStatus('Login successful! This window will close...')

        // Notify parent and close popup
        if (window.opener) {
          window.opener.postMessage({ type: 'casdoor-callback-done' }, '*')
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
  }, [gatewayServerUrl])

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
