import React, { useEffect, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Sdk from 'casdoor-js-sdk'
import styles from '../styles/WebSocketTester.module.css'

interface AuthPanelProps {
  token: string
  onTokenChange: (value: string) => void
  onLogon: () => void
  isConnected: boolean
  isAuthenticated: boolean
}

function getStoredToken(): string {
  try {
    const stored = localStorage.getItem('user')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.token) return parsed.token.replace(/^Bearer\s+/i, '')
    }
  } catch { /* ignore */ }
  return ''
}

export default function AuthPanel({ token, onTokenChange, onLogon, isConnected, isAuthenticated }: AuthPanelProps) {
  const { siteConfig } = useDocusaurusContext()
  const gatewayServerUrl = (siteConfig.customFields?.gatewayServerUrl as string) || ''
  const [loading, setLoading] = useState(false)

  // Auto-fill token from localStorage on mount
  useEffect(() => {
    if (!token) {
      const stored = getStoredToken()
      if (stored) onTokenChange(stored)
    }
  }, [])

  // Listen for login from other tabs/popups
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed?.token) {
            onTokenChange(parsed.token.replace(/^Bearer\s+/i, ''))
          }
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [onTokenChange])

  const handleLogin = async () => {
    try {
      setLoading(true)
      const apiBase = gatewayServerUrl || window.location.origin
      const res = await fetch(`${apiBase}/api/casdoor`)
      const json = await res.json()
      const config = json.data || json

      if (!config.Endpoint || !config.ClientID) return

      const sdk = new Sdk({
        serverUrl: config.Endpoint,
        clientId: config.ClientID,
        organizationName: config.Organization,
        appName: config.Application,
        redirectPath: '/docs/callback',
      })

      const w = 500, h = 600
      const left = window.screenX + (window.outerWidth - w) / 2
      const top = window.screenY + (window.outerHeight - h) / 2
      window.open(sdk.getSigninUrl(), 'casdoor-login', `width=${w},height=${h},left=${left},top=${top},popup=yes`)
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const hasStoredUser = !!getStoredToken()

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Authentication</h3>
        <span className={isAuthenticated ? styles.status_success : styles.status_warn}>
          {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
        </span>
      </div>
      <label className={styles.fieldLabel}>JWT Token</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          className={styles.input}
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="Paste JWT token or login"
          style={{ flex: 1 }}
        />
        {!hasStoredUser && (
          <button
            className={styles.buttonSmall}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '...' : 'Login'}
          </button>
        )}
      </div>
      <button className={styles.buttonPrimary} onClick={onLogon} disabled={!isConnected || !token.trim()} style={{ marginTop: '8px' }}>
        Logon
      </button>
    </div>
  )
}
