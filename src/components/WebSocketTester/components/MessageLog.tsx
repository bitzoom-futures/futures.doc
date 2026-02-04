import React from 'react'
import type { LogEntry } from '../types'
import styles from '../styles/WebSocketTester.module.css'

interface MessageLogProps {
  messages: LogEntry[]
  onClear: () => void
}

export default function MessageLog({ messages, onClear }: MessageLogProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Message Log</h3>
        <button className={styles.button} onClick={onClear}>Clear</button>
      </div>
      <div className={styles.log}>
        {messages.length === 0 ? (
          <p className={styles.helperText}>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={styles.logItem}>
              <div className={styles.logMeta}>
                <span>{msg.timestamp}</span>
                <span>{msg.direction}</span>
                <span>{msg.kind}</span>
              </div>
              <pre>{JSON.stringify(msg.payload, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
