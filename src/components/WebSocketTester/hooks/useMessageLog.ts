import { useCallback, useState } from 'react'
import type { LogEntry } from '../types'

export function useMessageLog(maxMessages = 200) {
  const [messages, setMessages] = useState<LogEntry[]>([])

  const addMessage = useCallback(
    (message: Omit<LogEntry, 'id' | 'timestamp'>) => {
      setMessages((prev) => {
        const entry: LogEntry = {
          id: prev.length ? prev[prev.length - 1].id + 1 : 1,
          timestamp: new Date().toISOString(),
          ...message
        }
        const next = [...prev, entry]
        return next.length > maxMessages ? next.slice(next.length - maxMessages) : next
      })
    },
    [maxMessages]
  )

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, addMessage, clearMessages }
}
