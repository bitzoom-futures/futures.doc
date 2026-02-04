import React from 'react'
import styles from '../styles/WebSocketTester.module.css'

interface AuthPanelProps {
  token: string
  onTokenChange: (value: string) => void
  onLogon: () => void
  isConnected: boolean
  isAuthenticated: boolean
}

export default function AuthPanel({ token, onTokenChange, onLogon, isConnected, isAuthenticated }: AuthPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Authentication</h3>
        <span className={isAuthenticated ? styles.status_success : styles.status_warn}>
          {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
        </span>
      </div>
      <label className={styles.fieldLabel}>JWT Token</label>
      <textarea
        className={styles.textarea}
        value={token}
        onChange={(e) => onTokenChange(e.target.value)}
        placeholder="Paste JWT token"
      />
      <p className={styles.helperText}>Token stays in-memory and is never persisted.</p>
      <button className={styles.buttonPrimary} onClick={onLogon} disabled={!isConnected || !token.trim()}>
        Logon
      </button>
    </div>
  )
}
