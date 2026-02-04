import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import type { ChannelConfig, WsResponse } from './types'
import ConnectionPanel from './components/ConnectionPanel'
import AuthPanel from './components/AuthPanel'
import ParameterForm from './components/ParameterForm'
import MessageLog from './components/MessageLog'
import styles from './styles/WebSocketTester.module.css'
import { normalizeSubscriptionKey, useWebSocket } from './hooks/useWebSocket'
import { useMessageLog } from './hooks/useMessageLog'

export interface WebSocketTesterProps {
  channel: ChannelConfig
  defaultServerUrl?: string
  maxMessages?: number
}

function buildData(
  channel: ChannelConfig,
  values: Record<string, string>
): { data: Record<string, unknown>; errors: string[] } {
  const errors: string[] = []
  const data: Record<string, unknown> = {}

  channel.params.forEach((param) => {
    const value = (values[param.name] ?? param.defaultValue ?? '').trim()
    if (param.required && !value) {
      errors.push(`${param.label} is required`)
      return
    }
    if (!value) return
    data[param.name] = param.type === 'number' ? Number(value) : value
  })

  return { data, errors }
}

export default function WebSocketTester({
  channel,
  defaultServerUrl,
  maxMessages = 200
}: WebSocketTesterProps) {
  const { siteConfig } = useDocusaurusContext()
  const generatedServerUrl =
    (siteConfig.customFields && (siteConfig.customFields as Record<string, unknown>).gatewayServerUrl) || ''
  const initialServerUrl =
    defaultServerUrl || (typeof generatedServerUrl === 'string' ? generatedServerUrl : '119.8.50.236:8088')
  const [serverUrl, setServerUrl] = useState(initialServerUrl)
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [lastError, setLastError] = useState<string>('')
  const [pendingSubKey, setPendingSubKey] = useState<string | null>(null)
  const [subIdByKey, setSubIdByKey] = useState<Record<string, string>>({})

  const { messages, addMessage, clearMessages } = useMessageLog(maxMessages)

  const handleIncomingMessage = useCallback(
    (message: WsResponse) => {
      addMessage({ direction: 'in', kind: message.event, payload: message })

      if (message.channel === 'logon') {
        if (message.event === 'success') {
          setIsAuthenticated(true)
          setLastError('')
        } else if (message.event === 'error') {
          setIsAuthenticated(false)
          setLastError('Authentication failed')
        }
        return
      }

      if (message.event === 'error') {
        setLastError(`Server error on ${message.channel}`)
        return
      }

      if (message.event === 'sub' && pendingSubKey) {
        const data = message.data
        if (data && typeof data === 'object') {
          const ids = Object.keys(data as Record<string, unknown>)
          if (ids.length > 0) {
            setSubIdByKey((prev) => ({ ...prev, [pendingSubKey]: ids[0] }))
          }
        }
        setPendingSubKey(null)
      }

      if (message.event === 'unsub') {
        const unsubSubId = typeof message.data === 'string' ? message.data : ''
        if (unsubSubId) {
          setSubIdByKey((prev) => {
            const next = { ...prev }
            Object.entries(next).forEach(([key, value]) => {
              if (value === unsubSubId) {
                delete next[key]
              }
            })
            return next
          })
        }
      }
    },
    [addMessage, pendingSubKey]
  )

  const { status, wsUrl, connect, disconnect, send, isConnected } = useWebSocket({
    serverUrl,
    onMessage: handleIncomingMessage,
    onSystemMessage: (message) => addMessage({ direction: 'system', kind: 'system', payload: message })
  })

  useEffect(() => {
    setParamValues({})
    setSubIdByKey({})
    setPendingSubKey(null)
    setLastError('')
  }, [channel.id])

  useEffect(() => {
    if (status !== 'connected') {
      setIsAuthenticated(false)
      setSubIdByKey({})
      setPendingSubKey(null)
    }
  }, [status])

  const currentData = useMemo(() => buildData(channel, paramValues), [channel, paramValues])
  const subscriptionKey = useMemo(
    () => normalizeSubscriptionKey(channel.path, currentData.data),
    [channel.path, currentData.data]
  )

  const handleParamChange = (name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogon = () => {
    setLastError('')
    try {
      const payload = { channel: 'logon', event: 'sub' as const, data: { token } }
      send(payload)
      addMessage({ direction: 'out', kind: 'logon', payload })
    } catch (error) {
      setLastError((error as Error).message)
    }
  }

  const handleSubscribe = () => {
    setLastError('')

    if (currentData.errors.length > 0) {
      setLastError(currentData.errors.join(', '))
      return
    }

    if (channel.requiresAuth && !isAuthenticated) {
      setLastError('Authenticate with logon before subscribing to private channels')
      return
    }

    try {
      const payload = {
        channel: channel.path,
        event: 'sub' as const,
        data: currentData.data
      }
      send(payload)
      setPendingSubKey(subscriptionKey)
      addMessage({ direction: 'out', kind: 'sub', payload })
    } catch (error) {
      setLastError((error as Error).message)
    }
  }

  const handleUnsubscribe = () => {
    setLastError('')
    try {
      const payload = {
        channel: channel.path,
        event: 'unsub' as const,
        data: currentData.data
      }
      send(payload)
      addMessage({ direction: 'out', kind: 'unsub', payload })
    } catch (error) {
      setLastError((error as Error).message)
    }
  }

  return (
    <div className={styles.wrapper}>
      <ConnectionPanel
        serverUrl={serverUrl}
        onServerUrlChange={setServerUrl}
        status={status}
        resolvedUrl={wsUrl}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <div className={styles.panel}>
        <h3>{channel.path}</h3>
        <p className={styles.helperText}>{channel.description}</p>
        <div className={styles.row}>
          <button className={styles.buttonPrimary} onClick={handleSubscribe} disabled={!isConnected}>
            Subscribe
          </button>
          <button className={styles.button} onClick={handleUnsubscribe} disabled={!isConnected}>
            Unsubscribe
          </button>
          <span className={styles.helperText}>SubId: {subIdByKey[subscriptionKey] ?? 'not assigned'}</span>
        </div>
      </div>

      {channel.requiresAuth ? (
        <AuthPanel
          token={token}
          onTokenChange={setToken}
          onLogon={handleLogon}
          isConnected={isConnected}
          isAuthenticated={isAuthenticated}
        />
      ) : null}

      <ParameterForm params={channel.params} values={paramValues} onChange={handleParamChange} />

      {lastError ? <div className={styles.error}>{lastError}</div> : null}

      <MessageLog messages={messages} onClear={clearMessages} />
    </div>
  )
}
