const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const CONTAINER_NAME = 'docker-futures-gateway'
const GATEWAY_PORT = 8081
const TARGET_SPEC = path.join(process.cwd(), 'examples', 'bitzoom.gateway.json')

function getContainerIP() {
  const ip = execSync(
    `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_NAME}`,
    { encoding: 'utf8' }
  ).trim()
  if (!ip) {
    throw new Error(`Could not get IP for container ${CONTAINER_NAME}`)
  }
  return ip
}

async function main() {
  const gatewayIP = getContainerIP()
  const url = `http://${gatewayIP}:${GATEWAY_PORT}/api/servermanage/openapi`
  console.log(`Fetching OpenAPI spec from ${url} ...`)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  const spec = await res.json()
  const output = `${JSON.stringify(spec, null, 2)}\n`
  fs.writeFileSync(TARGET_SPEC, output, 'utf8')
  console.log(`Wrote ${TARGET_SPEC}`)
  console.log('servers:', JSON.stringify(spec.servers, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
