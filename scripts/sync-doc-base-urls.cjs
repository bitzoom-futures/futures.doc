const fs = require('fs')
const path = require('path')

const SPEC_PATH = path.join(process.cwd(), 'examples', 'bitzoom.gateway.json')
const DOC_ROOTS = [
  path.join(process.cwd(), 'docs'),
  path.join(process.cwd(), 'versioned_docs'),
  path.join(process.cwd(), 'i18n', 'zh-Hans', 'docusaurus-plugin-content-docs')
]

function readGatewayUrl() {
  const spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'))
  const url = spec && spec.servers && spec.servers[0] && spec.servers[0].url
  if (!url || typeof url !== 'string') {
    throw new Error('Missing servers[0].url in examples/bitzoom.gateway.json')
  }
  return url.replace(/\/+$/, '')
}

function toWsBaseUrl(gatewayUrl) {
  const parsed = new URL(gatewayUrl)
  const isIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) || /^[0-9a-fA-F:]+$/.test(parsed.hostname)
  const protocol = isIp ? 'ws:' : 'wss:'
  return `${protocol}//${parsed.host}/ws`
}

function listDocFiles(rootDir) {
  const files = []
  if (!fs.existsSync(rootDir)) return files
  const stack = [rootDir]
  while (stack.length) {
    const current = stack.pop()
    const entries = fs.readdirSync(current, { withFileTypes: true })
    entries.forEach((entry) => {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile() && (fullPath.endsWith('.md') || fullPath.endsWith('.mdx'))) {
        files.push(fullPath)
      }
    })
  }
  return files
}

function replaceUrls(content, gatewayUrl, wsBaseUrl) {
  return content
    .replace(/https:\/\/beta-api\.bitzoom\.com/g, gatewayUrl)
    .replace(/https:\/\/api\.bitzoom\.com/g, gatewayUrl)
    .replace(/wss:\/\/stream-testnet\.bitzoom\.com\/ws/g, wsBaseUrl)
    .replace(/wss:\/\/stream\.bitzoom\.com\/ws/g, wsBaseUrl)
}

function main() {
  const gatewayUrl = readGatewayUrl()
  const wsBaseUrl = toWsBaseUrl(gatewayUrl)
  const files = DOC_ROOTS.flatMap(listDocFiles)
  let changedCount = 0

  files.forEach((filePath) => {
    const before = fs.readFileSync(filePath, 'utf8')
    const after = replaceUrls(before, gatewayUrl, wsBaseUrl)
    if (after !== before) {
      fs.writeFileSync(filePath, after, 'utf8')
      changedCount += 1
    }
  })

  console.log(`Updated ${changedCount} doc files using gateway URL ${gatewayUrl} and WS base ${wsBaseUrl}`)
}

main()
