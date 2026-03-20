import React, { useState, useEffect, useCallback, useRef } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Sdk from 'casdoor-js-sdk'
import styles from './styles.module.css'

interface UserInfo {
  email: string
  token: string
  avatar: string
}

interface CasdoorConfig {
  Endpoint: string
  ClientID: string
  Organization: string
  Application: string
  BackgroundCallbackURL: string
}

const STORAGE_KEY = 'user'
const BEARER_KEY = 'Bearer'

/** Only reload on API doc pages where the openapi plugin needs Bearer from localStorage */
function shouldReloadForAuth(): boolean {
  const path = window.location.pathname
  return /\/bitzoom\/api-/.test(path)
}

/** Sync our JWT into the 'Bearer' localStorage key used by the openapi plugin */
function syncBearerToken(token: string | null | undefined) {
  try {
    if (!token) {
      localStorage.removeItem(BEARER_KEY)
      return
    }
    const raw = token.replace(/^Bearer\s+/i, '')
    const newValue = JSON.stringify({ token: raw })
    if (localStorage.getItem(BEARER_KEY) !== newValue) {
      localStorage.setItem(BEARER_KEY, newValue)
    }
  } catch { /* ignore */ }
}

/** Decode a JWT payload without any library */
function decodeJwtPayload(token: string): any {
  try {
    const jwt = token.replace(/^Bearer\s+/i, '')
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function readUserFromStorage(): UserInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.token) return parsed
    }
  } catch { /* ignore */ }
  return null
}

export default function NavbarLogin() {
  const { siteConfig } = useDocusaurusContext()
  const gatewayServerUrl = (siteConfig.customFields?.gatewayServerUrl as string) || ''
  const [user, setUser] = useState<UserInfo | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Read user from localStorage on mount
  useEffect(() => {
    setUser(readUserFromStorage())
  }, [])

  // Listen for storage changes (e.g. login from popup) and reload to sync openapi plugin
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const parsed = JSON.parse(e.newValue)
        syncBearerToken(parsed?.token)
        setUser(parsed)
        setLoading(false)
        if (shouldReloadForAuth()) {
          window.location.reload()
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const handleGetToken = useCallback(async () => {
    try {
      setLoading(true)

      // Step 1: Fetch Casdoor config from gateway
      const apiBase = gatewayServerUrl || window.location.origin
      const res = await fetch(`${apiBase}/api/casdoor`)
      const json = await res.json()
      const config: CasdoorConfig = json.data || json

      if (!config.Endpoint || !config.ClientID) {
        console.error('Invalid Casdoor config:', config)
        return
      }

      // Step 2: Use Casdoor SDK to build OAuth URL
      const sdk = new Sdk({
        serverUrl: config.Endpoint,
        clientId: config.ClientID,
        organizationName: config.Organization,
        appName: config.Application,
        redirectPath: '/docs/callback',
      })
      const authUrl = sdk.getSigninUrl()

      // Step 3: Open popup
      const w = 500
      const h = 600
      const left = window.screenX + (window.outerWidth - w) / 2
      const top = window.screenY + (window.outerHeight - h) / 2
      const popup = window.open(
        authUrl,
        'casdoor-login',
        `width=${w},height=${h},left=${left},top=${top},popup=yes`
      )

      // Poll for popup close (user cancelled login)
      if (popup) {
        pollRef.current = setInterval(() => {
          try {
            if (popup.closed) {
              if (pollRef.current) clearInterval(pollRef.current)
              pollRef.current = null
              setLoading(false)
            }
          } catch { /* cross-origin, ignore */ }
        }, 500)
      }
    } catch (err) {
      console.error('Failed to start login:', err)
      setLoading(false)
    }
  }, [])

  const handleCopyToken = useCallback(async () => {
    if (!user?.token) return
    const rawToken = user.token.replace(/^Bearer\s+/i, '')
    try {
      await navigator.clipboard.writeText(rawToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = rawToken
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [user])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(BEARER_KEY)
    setUser(null)
    setDropdownOpen(false)
    if (shouldReloadForAuth()) {
      window.location.reload()
    }
  }, [])

  if (!user) {
    return (
      <a
        className="navbar__item navbar__link"
        onClick={handleGetToken}
        style={{ cursor: loading ? 'wait' : 'pointer' }}
        title="Login to get Bearer token for API/WS requests"
      >
        {loading ? 'Loading...' : 'Get Token'}
      </a>
    )
  }

  return (
    <div className={styles.userContainer} ref={dropdownRef}>
      <button
        className={styles.userBtn}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title={user.email}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
        ) : (
          <span className={styles.avatarPlaceholder}>
            {user.email?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.tokenRow}>
            <span className={styles.tokenLabel}>Bearer Token</span>
            <code className={styles.tokenValue}>
              {user.token?.slice(0, 20)}...
            </code>
          </div>
          <button className={styles.dropdownItem} onClick={handleCopyToken}>
            {copied ? (
              <><span className={styles.checkMark}>&#10003;</span> Copied!</>
            ) : (
              'Copy Token'
            )}
          </button>
          <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
