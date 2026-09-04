export type ApiPermission = 'READ' | 'TRADE' | 'WALLET'

export type MutableApiKeyStatus = 'ENABLED' | 'DISABLED'

export type ApiKeyStatus = MutableApiKeyStatus | 'REVOKED'

export interface ApiKeyRecord {
  api_key: string
  label: string
  api_permissions: string
  api_key_ip_whitelist: string
  api_key_status: ApiKeyStatus
  api_key_creation_date?: string
}

export interface CreatedApiKey extends ApiKeyRecord {
  api_secret: string
}

export interface CreateApiKeyInput {
  label: string
  api_permissions: string
  api_key_ip_whitelist: string
}

interface ApiKeyClientOptions {
  baseUrl: string
  token: string
  fetchImpl?: typeof fetch
}

interface GatewayEnvelope<T> {
  data?: T
  success?: boolean
  code?: number | string
  errorMessage?: string
  msg?: string
  message?: string
}

export class ApiKeyRequestError extends Error {
  readonly status: number
  readonly code?: number | string

  constructor(message: string, status: number, code?: number | string) {
    super(message)
    this.name = 'ApiKeyRequestError'
    this.status = status
    this.code = code
  }
}

export function createApiKeyClient({
  baseUrl,
  token,
  fetchImpl = fetch,
}: ApiKeyClientOptions) {
  const gatewayBase = baseUrl.replace(/\/+$/, '')
  const rawToken = token.replace(/^Bearer\s+/i, '')

  async function request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetchImpl(`${gatewayBase}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${rawToken}`,
        ...init.headers,
      },
    })
    const text = await response.text()
    let payload: GatewayEnvelope<T> | T | undefined

    try {
      payload = text ? JSON.parse(text) : undefined
    } catch {
      payload = undefined
    }

    const envelope =
      payload && !Array.isArray(payload) && typeof payload === 'object'
        ? (payload as GatewayEnvelope<T>)
        : undefined
    const numericCode = envelope?.code === undefined ? 0 : Number(envelope.code)
    const businessFailed =
      envelope?.success === false ||
      (Number.isFinite(numericCode) && numericCode !== 0 && numericCode !== 200)

    if (!response.ok || businessFailed) {
      const message =
        envelope?.errorMessage ||
        envelope?.msg ||
        envelope?.message ||
        `API key request failed (${response.status})`
      throw new ApiKeyRequestError(message, response.status, envelope?.code)
    }

    if (envelope && Object.prototype.hasOwnProperty.call(envelope, 'data')) {
      return envelope.data as T
    }
    return payload as T
  }

  return {
    async list(): Promise<ApiKeyRecord[]> {
      const result = await request<ApiKeyRecord[] | { items: ApiKeyRecord[] }>('/api/v1/apikey/list', {
        method: 'GET',
      })
      return Array.isArray(result) ? result : result.items
    },
    async create(input: CreateApiKeyInput): Promise<CreatedApiKey> {
      return request<CreatedApiKey>('/api/v1/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })
    },
    async setStatus(apiKey: string, status: MutableApiKeyStatus): Promise<void> {
      await request<unknown>('/api/v1/apikey/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          api_key_status: status,
        }),
      })
    },
    async revoke(apiKey: string): Promise<void> {
      await request<unknown>('/api/v1/apikey/revoke', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: apiKey }),
      })
    },
  }
}
