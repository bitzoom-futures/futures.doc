import { useCallback, useMemo, useRef, useState } from 'react'
import type { ConnectionStatus, WsRequest, WsResponse } from '../types'

interface UseWebSocketArgs {
  serverUrl: string
  onMessage: (message: WsResponse) => void
  onSystemMessage?: (message: string) => void
}

function isIpHost(hostname: string): boolean {
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/
  const ipv6 = /^\[[0-9a-fA-F:]+\]$/
  return ipv4.test(hostname) || ipv6.test(hostname)
}

export function buildWebSocketUrl(serverUrl: string): string {
  const trimmed = serverUrl.trim()
  if (!trimmed) {
    return 'ws://119.8.50.236:8088/ws'
  }

  try {
    const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed) ? trimmed : `placeholder://${trimmed}`
    const parsed = new URL(withProtocol)
    const explicitScheme = parsed.protocol === 'ws:' || parsed.protocol === 'wss:'
    const scheme = explicitScheme ? parsed.protocol : isIpHost(parsed.hostname) ? 'ws:' : 'wss:'
    const port = parsed.port ? `:${parsed.port}` : ''
    return `${scheme}//${parsed.hostname}${port}/ws`
  } catch {
    return 'ws://119.8.50.236:8088/ws'
  }
}

export function normalizeSubscriptionKey(channel: string, data: Record<string, unknown>): string {
  const normalized = Object.entries(data)
    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
  return `${channel}:${JSON.stringify(normalized)}`
}

export function useWebSocket({ serverUrl, onMessage, onSystemMessage }: UseWebSocketArgs) {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')

  const wsUrl = useMemo(() => buildWebSocketUrl(serverUrl), [serverUrl])

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return
    }

    setStatus('connecting')

    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      setStatus('connected')
      onSystemMessage?.(`Connected to ${wsUrl}`)
    }

    socket.onmessage = (event) => {
      const raw = typeof event.data === 'string' ? event.data : ''
      const lines = raw.split('\n').filter((line) => line.trim().length > 0)

      lines.forEach((line) => {
        try {
          const parsed = JSON.parse(line) as WsResponse
          onMessage(parsed)
        } catch {
          onSystemMessage?.(`Invalid JSON frame line: ${line}`)
        }
      })
    }

    socket.onerror = () => {
      setStatus('error')
      onSystemMessage?.('WebSocket error encountered')
    }

    socket.onclose = () => {
      setStatus('disconnected')
      onSystemMessage?.('Disconnected')
      wsRef.current = null
    }
  }, [onMessage, onSystemMessage, wsUrl])

  const disconnect = useCallback(() => {
    if (!wsRef.current) return
    wsRef.current.close()
  }, [])

  const send = useCallback((message: WsRequest) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }
    wsRef.current.send(JSON.stringify(message))
  }, [])

  return {
    status,
    wsUrl,
    connect,
    disconnect,
    send,
    isConnected: status === 'connected'
  }
}
