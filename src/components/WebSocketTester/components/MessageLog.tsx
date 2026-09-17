import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LogEntry } from '../types'
import styles from '../styles/WebSocketTester.module.css'

interface MessageLogProps {
  messages: LogEntry[]
  onClear: () => void
}

export default function MessageLog({ messages, onClear }: MessageLogProps) {
  const logRef = useRef<HTMLDivElement | null>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const shouldStickToBottomRef = useRef(true)

  useEffect(() => {
    const container = logRef.current
    if (!container) return
    if (!shouldStickToBottomRef.current) return
    container.scrollTop = container.scrollHeight
  }, [messages])

  useEffect(() => {
    if (messages.length === 0) {
      setSelectedMessageId(null)
      return
    }

    setSelectedMessageId((current) => {
      if (current === null) {
        return messages[messages.length - 1].id
      }

      const stillExists = messages.some((message) => message.id === current)
      return stillExists ? current : messages[messages.length - 1].id
    })
  }, [messages])

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) ?? null,
    [messages, selectedMessageId]
  )

  const handleLogScroll = () => {
    const container = logRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    shouldStickToBottomRef.current = distanceFromBottom <= 16
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Message Log</h3>
        <button className={styles.button} onClick={onClear}>
          Clear
        </button>
      </div>
      <div className={styles.log} ref={logRef} onScroll={handleLogScroll}>
        {messages.length === 0 ? (
          <p className={styles.helperText}>No messages yet.</p>
        ) : (
          <>
            <div className={styles.logHeader}>
              <span>Message</span>
              <span>Time</span>
            </div>
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                className={`${styles.logRow} ${selectedMessageId === message.id ? styles.logRowSelected : ''}`}
                onClick={() => setSelectedMessageId(message.id)}
              >
                <span className={styles.logSummary}>
                  <span className={`${styles.logBadge} ${styles[`logBadge_${message.direction}`]}`}>
                    {message.direction}
                  </span>
                  {/* <span className={styles.logKind}>{message.kind}</span> */}
                  <span className={styles.logSnippet}>{formatLogSummary(message)}</span>
                </span>
                <span className={styles.logTime}>{formatTime(message.timestamp)}</span>
              </button>
            ))}
          </>
        )}
      </div>
      <div className={styles.logDetail}>
        <div className={styles.logDetailHeader}>Details</div>
        {selectedMessage ? (
          <pre className={styles.logDetailBody}>{JSON.stringify(selectedMessage.payload, null, 2)}</pre>
        ) : (
          <p className={styles.helperText}>Select a message to inspect its payload.</p>
        )}
      </div>
    </div>
  )
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime())
    ? timestamp
    : new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      hour12: false
    }).format(date)
}

function formatLogSummary(message: LogEntry): string {
  const payload = safeStringify(message.payload)
  return payload ? `${payload}` : ''
}

function safeStringify(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload
  }

  try {
    return JSON.stringify(payload)
  } catch {
    return String(payload)
  }
}
