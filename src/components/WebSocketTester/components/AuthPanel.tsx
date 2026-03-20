import React, { useCallback, useEffect, useRef, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Sdk from 'casdoor-js-sdk'
import { useUser } from '../../../context/UserContext'
import styles from '../styles/WebSocketTester.module.css'

interface AuthPanelProps {
  token: string
  onTokenChange: (value: string) => void
  onLogon: (token?: string) => void
  isConnected: boolean
  isAuthenticated: boolean
}

export default function AuthPanel({ token, onTokenChange, onLogon, isConnected, isAuthenticated }: AuthPanelProps) {
  const { siteConfig } = useDocusaurusContext()
  const gatewayServerUrl = (siteConfig.customFields?.gatewayServerUrl as string) || ''
  const { rawToken } = useUser()
  const [loading, setLoading] = useState(false)
  const pendingLogonRef = useRef(false)

  // Auto-fill token from global user state
  useEffect(() => {
    if (rawToken && rawToken !== token) {
      onTokenChange(rawToken)
      if (pendingLogonRef.current) {
        pendingLogonRef.current = false
        onLogon(rawToken)
      }
    }
    if (!rawToken && token) {
      onTokenChange('')
    }
  }, [rawToken])

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
          {isAuthenticated ? 'Websocket Authenticated' : 'Websocket Not authenticated'}
        </span>
      </div>
      <label className={styles.fieldLabel}>JWT Token</label>
      <input
        type="text"
        className={styles.input}
        value={token}
        onChange={(e) => onTokenChange(e.target.value)}
        placeholder="Paste JWT token or Press Logon to automatically get a token"
      />
      <button
        className={styles.buttonPrimary}
        onClick={handleLogon}
        disabled={!isConnected || loading}
        style={{ marginTop: '8px' }}
      >
        {loading ? 'Opening login...' : 'Logon'}
      </button>
    </div>
  )
}
