import React from 'react'
import type { ConnectionStatus } from '../types'
import StatusIndicator from './StatusIndicator'
import styles from '../styles/WebSocketTester.module.css'

interface ConnectionPanelProps {
  serverUrl: string
  onServerUrlChange: (value: string) => void
  status: ConnectionStatus
  resolvedUrl: string
  onConnect: () => void
  onDisconnect: () => void
}

export default function ConnectionPanel({
  serverUrl,
  onServerUrlChange,
  status,
  resolvedUrl,
  onConnect,
  onDisconnect
}: ConnectionPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Connection</h3>
        <StatusIndicator status={status} />
      </div>
      <label className={styles.fieldLabel}>Server URL</label>
      <input
        className={styles.input}
        value={serverUrl}
        onChange={(e) => onServerUrlChange(e.target.value)}
        placeholder="119.8.50.236:8088"
      />
      <p className={styles.helperText}>Resolved WebSocket URL: <code>{resolvedUrl}</code></p>
      <div className={styles.row}>
        <button className={styles.buttonPrimary} onClick={onConnect} disabled={status === 'connected' || status === 'connecting'}>
          Connect
        </button>
        <button className={styles.button} onClick={onDisconnect} disabled={status === 'disconnected'}>
          Disconnect
        </button>
      </div>
    </div>
  )
}
