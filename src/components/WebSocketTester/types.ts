export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type ParameterType = 'string' | 'number' | 'select'

export interface ParameterDefinition {
  name: string
  label: string
  type: ParameterType
  required: boolean
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  defaultValue?: string
}

export interface ChannelConfig {
  id: string
  label: string
  path: string
  requiresAuth: boolean
  description: string
  params: ParameterDefinition[]
}

export interface WsRequest {
  channel: string
  event: 'sub' | 'unsub'
  data: Record<string, unknown>
}

export interface WsResponse {
  channel: string
  event: 'sub' | 'unsub' | 'error' | 'success' | string
  data: unknown
}

export interface LogEntry {
  id: number
  timestamp: string
  direction: 'in' | 'out' | 'system'
  kind: string
  payload: unknown
}
