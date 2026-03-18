const fs = require('fs')
const path = require('path')

const GATEWAY_URL = 'http://docker-futures-gateway:8081/api/servermanage/openapi'
const TARGET_SPEC = path.join(process.cwd(), 'examples', 'bitzoom.gateway.json')

async function main() {
  console.log(`Fetching OpenAPI spec from ${GATEWAY_URL} ...`)
  const res = await fetch(GATEWAY_URL)
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
