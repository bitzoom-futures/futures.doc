import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_MANAGEMENT_GATEWAY_URL } from '../../config/managementGateway'
import { useUser } from '../../context/UserContext'
import { useCasdoorLogin } from '../../hooks/useCasdoorLogin'
import styles from './styles.module.css'

export default function NavbarLogin() {
  const { siteConfig } = useDocusaurusContext()
  const managementGatewayUrl =
    (siteConfig.customFields?.managementGatewayUrl as string) || DEFAULT_MANAGEMENT_GATEWAY_URL
  const redirectPath = useBaseUrl('/callback')
  const { user, logout } = useUser()
  const { login, loading, error } = useCasdoorLogin({ managementGatewayUrl, redirectPath })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setDropdownOpen(false)
  }, [logout])

  if (!user) {
    return (
      <button
        type="button"
        className={`navbar__item navbar__link ${styles.loginButton}`}
        onClick={login}
        disabled={loading}
        title={error || 'Log in to manage API keys'}
      >
        {loading ? 'Opening login…' : 'Login'}
      </button>
    )
  }

  return (
    <div className={styles.userContainer} ref={dropdownRef}>
      <button
        type="button"
        className={styles.userBtn}
        onClick={() => setDropdownOpen((open) => !open)}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={dropdownOpen}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className={styles.avatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={styles.avatarPlaceholder} aria-hidden="true">
            {user.email?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </button>

      {dropdownOpen ? (
        <div className={styles.dropdown} role="menu">
          <div className={styles.accountRow}>
            <span className={styles.accountLabel}>Signed in as</span>
            <span className={styles.accountEmail}>{user.email}</span>
          </div>
          <Link
            className={styles.dropdownItem}
            to="/api-management"
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
          >
            API Management
          </Link>
          <button
            type="button"
            className={`${styles.dropdownItem} ${styles.logoutItem}`}
            onClick={handleLogout}
            role="menuitem"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}
