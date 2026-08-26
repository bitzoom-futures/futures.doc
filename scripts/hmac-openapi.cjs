const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])

const HMAC_HEADERS = [
  {
    name: 'X-BZ-TIMESTAMP',
    in: 'header',
    required: true,
    description: 'Unix timestamp in milliseconds used in the HMAC payload.',
    schema: { type: 'string' },
  },
  {
    name: 'X-BZ-NONCE',
    in: 'header',
    required: true,
    description: 'A unique random value for this request. Never reuse a nonce.',
    schema: { type: 'string' },
  },
  {
    name: 'X-BZ-SIGNATURE',
    in: 'header',
    required: true,
    description: 'Lowercase hexadecimal HMAC-SHA256 signature.',
    schema: { type: 'string' },
  },
  {
    name: 'X-BZ-RECVWINDOW',
    in: 'header',
    required: false,
    description: 'Optional receive window in milliseconds. Maximum: 60000.',
    schema: { type: 'string', default: '5000' },
  },
]

function usesBearer(security) {
  return Array.isArray(security) && security.some((requirement) =>
    requirement && Object.prototype.hasOwnProperty.call(requirement, 'Bearer')
  )
}

function addHmacHeaders(parameters = []) {
  const sanitizedParameters = parameters.filter((parameter) => {
    if (!parameter || parameter.in !== 'query') return true
    const name = String(parameter.name).toLowerCase()
    return name !== 'timestamp' && name !== 'signature'
  })
  const names = new Set(
    sanitizedParameters
      .filter((parameter) => parameter && parameter.in === 'header')
      .map((parameter) => String(parameter.name).toLowerCase())
  )
  return [
    ...sanitizedParameters,
    ...HMAC_HEADERS.filter((parameter) => !names.has(parameter.name.toLowerCase())),
  ]
}

function transformGatewaySpec(source, { hmacApiUrl }) {
  const transformed = JSON.parse(JSON.stringify(source))
  const inheritedBearer = usesBearer(transformed.security)
  const normalizedHmacApiUrl = hmacApiUrl.replace(/\/+$/, '')

  transformed.info = {
    ...(transformed.info || {}),
    title: 'Bitzoom HMAC API',
    description:
      'Current public and private REST operations. Private operations require HMAC-SHA256 headers; see the [API Key Authentication guide](/guides/api-key-authentication).',
  }
  transformed.servers = [{ url: normalizedHmacApiUrl }]
  transformed.tags = (transformed.tags || []).map((tag) => ({
    ...tag,
    description: normalizedHmacApiUrl,
  }))
  transformed.components = transformed.components || {}
  const existingSchemes = transformed.components.securitySchemes || {}
  const { Bearer: _legacyBearer, ...preservedSchemes } = existingSchemes
  transformed.components.securitySchemes = {
    ...preservedSchemes,
    HmacApiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'X-BZ-APIKEY',
      description:
        'Access key for HMAC-authenticated requests. Timestamp, nonce, signature, and optional receive-window headers are documented per private operation.',
    },
  }

  if (inheritedBearer) {
    transformed.security = [{ HmacApiKey: [] }]
  }

  for (const pathItem of Object.values(transformed.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (!HTTP_METHODS.has(method) || !operation || typeof operation !== 'object') continue
      const operationSecurity = operation.security
      const isPrivate = usesBearer(operationSecurity) ||
        (operationSecurity === undefined && inheritedBearer)
      if (!isPrivate) continue

      operation.security = [{ HmacApiKey: [] }]
      operation.parameters = addHmacHeaders(operation.parameters)
      operation['x-bitzoom-hmac'] = true
    }
  }

  return transformed
}

module.exports = {
  HMAC_HEADERS,
  transformGatewaySpec,
}
