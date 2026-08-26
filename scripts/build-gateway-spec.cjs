const fs = require('fs')
const { transformGatewaySpec } = require('./hmac-openapi.cjs')

const SOURCE_SPEC = 'examples/bitzoom.json'
const TARGET_SPEC = 'examples/bitzoom.gateway.json'
const GATEWAY_TAG = 'gateway'
const HMAC_API_URL = process.env.BITZOOM_HMAC_API_URL || 'https://api1.riverwa.com'

const source = JSON.parse(fs.readFileSync(SOURCE_SPEC, 'utf8'))

function trimTrailingSlash(value) {
  return typeof value === 'string' ? value.replace(/\/+$/, '') : value
}

function replaceUrlOrigin(text, nextOrigin) {
  if (typeof text !== 'string' || !nextOrigin) return text
  return text.replace(/https?:\/\/[^\s)]+/g, (match) => {
    try {
      const parsed = new URL(match)
      return `${nextOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`
    } catch (_error) {
      return match
    }
  })
}

const gatewayTag = Array.isArray(source.tags)
  ? source.tags.find((tag) => tag && tag.name === GATEWAY_TAG)
  : null

const gatewayServerUrl = trimTrailingSlash(gatewayTag && gatewayTag.description)

const filteredPaths = {}
let gatewayOperationCount = 0

Object.entries(source.paths || {}).forEach(([path, pathItem]) => {
  const nextPathItem = {}

  Object.entries(pathItem || {}).forEach(([method, operation]) => {
    if (!operation || typeof operation !== 'object' || !Array.isArray(operation.tags)) {
      return
    }
    if (!operation.tags.includes(GATEWAY_TAG)) {
      return
    }

    gatewayOperationCount += 1
    nextPathItem[method] = Object.assign({}, operation, {
      tags: [GATEWAY_TAG]
    })
  })

  if (Object.keys(nextPathItem).length > 0) {
    filteredPaths[path] = nextPathItem
  }
})

const filtered = Object.assign({}, source, {
  paths: filteredPaths,
  tags: Array.isArray(source.tags)
    ? source.tags
        .filter((tag) => tag && tag.name === GATEWAY_TAG)
        .map((tag) =>
          Object.assign({}, tag, {
            description: gatewayServerUrl || tag.description
          })
        )
    : source.tags,
  servers: gatewayServerUrl ? [{ url: gatewayServerUrl }] : []
})

if (
  gatewayServerUrl &&
  filtered.components &&
  filtered.components.securitySchemes &&
  filtered.components.securitySchemes.Bearer &&
  typeof filtered.components.securitySchemes.Bearer.description === 'string'
) {
  filtered.components.securitySchemes.Bearer.description =
    replaceUrlOrigin(filtered.components.securitySchemes.Bearer.description, gatewayServerUrl)
}

const hmacSpec = transformGatewaySpec(filtered, { hmacApiUrl: HMAC_API_URL })
const output = JSON.stringify(hmacSpec, null, 2)
  .replace(/http:\/\/[^/\s"]+/g, HMAC_API_URL)
fs.writeFileSync(TARGET_SPEC, `${output}\n`, 'utf8')

console.log(
  `Wrote ${TARGET_SPEC} with ${Object.keys(filteredPaths).length} path(s) and ${gatewayOperationCount} gateway-tagged operation(s) from ${SOURCE_SPEC}`
)
console.log(`Using HMAC API server: ${HMAC_API_URL}`)
