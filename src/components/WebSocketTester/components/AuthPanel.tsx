import React, { useCallback, useEffect, useRef, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Sdk from 'casdoor-js-sdk'
import styles from '../styles/WebSocketTester.module.css'

interface AuthPanelProps {
  token: string
  onTokenChange: (value: string) => void
  onLogon: (token?: string) => void
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
  // Track whether we should auto-logon after login completes
  const pendingLogonRef = useRef(false)

  // Auto-fill token from localStorage on mount
  useEffect(() => {
    if (!token) {
      const stored = getStoredToken()
      if (stored) onTokenChange(stored)
    }
  }, [])

  // Listen for login from other tabs/popups (storage event fires for cross-tab changes)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed?.token) {
            const newToken = parsed.token.replace(/^Bearer\s+/i, '')
            onTokenChange(newToken)
            if (pendingLogonRef.current) {
              pendingLogonRef.current = false
              onLogon(newToken)
            }
          }
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [onTokenChange, onLogon])

  const openLoginPopup = useCallback(async () => {
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
  }, [gatewayServerUrl])

  const handleLogon = useCallback(() => {
    // If no token, open login popup and auto-logon when done
    if (!token.trim()) {
      pendingLogonRef.current = true
      openLoginPopup()
      return
    }
    onLogon()
  }, [token, openLoginPopup, onLogon])

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Authentication</h3>
        <span className={isAuthenticated ? styles.status_success : styles.status_warn}>
          {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
        </span>
      </div>
      <label className={styles.fieldLabel}>JWT Token</label>
      <input
        type="text"
        className={styles.input}
        value={token}
        onChange={(e) => onTokenChange(e.target.value)}
        placeholder="Paste JWT token or press Logon to login"
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          className={styles.buttonPrimary}
          onClick={handleLogon}
          disabled={!isConnected || loading}
        >
          {loading ? 'Opening login...' : 'Logon'}
        </button>
        {token.trim() && (
          <button
            className={styles.buttonDanger}
            onClick={() => {
              onTokenChange('')
              localStorage.removeItem('user')
              localStorage.removeItem('Bearer')
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  )
}
