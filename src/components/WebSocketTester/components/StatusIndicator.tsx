import React from 'react'
import type { ConnectionStatus } from '../types'
import styles from '../styles/WebSocketTester.module.css'

export default function StatusIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <span className={`${styles.status} ${styles[`status_${status}`]}`}>
      {status.toUpperCase()}
    </span>
  )
}
