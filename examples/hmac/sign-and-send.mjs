#!/usr/bin/env node
/** Sign and send a private Bitzoom REST request using Node.js built-ins. */

import crypto from 'node:crypto'
import fs from 'node:fs'

function formEncode(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    )
    .replace(/%20/g, '+')
}

export function canonicalQuery(rawQuery) {
  const pairs = Array.from(new URLSearchParams(rawQuery).entries())
  const compare = (left, right) => (left < right ? -1 : left > right ? 1 : 0)
  pairs.sort(([leftKey, leftValue], [rightKey, rightValue]) =>
    compare(leftKey, rightKey) || compare(leftValue, rightValue)
  )
  return pairs
    .map(([key, value]) => `${formEncode(key)}=${formEncode(value)}`)
    .join('&')
}

export function sign({
  secret,
  timestamp,
  nonce,
  recvWindow,
  method,
  path,
  rawQuery,
  body,
}) {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
  const payload = [
    timestamp,
    nonce,
    recvWindow,
    method.toUpperCase(),
    path,
    canonicalQuery(rawQuery),
    bodyHash,
  ].join('\n')
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

async function runVectors(vectorPath) {
  const vectors = JSON.parse(fs.readFileSync(vectorPath, 'utf8'))
  const signatures = Object.fromEntries(
    vectors.map((vector) => [
      vector.name,
      sign({ ...vector, body: Buffer.from(vector.body) }),
    ])
  )
  process.stdout.write(JSON.stringify(signatures))
}

async function main() {
  if (process.argv[2] === '--vectors' && process.argv[3]) {
    await runVectors(process.argv[3])
    return
  }

  const apiUrl = (process.env.BITZOOM_HMAC_API_URL || 'https://api1.riverwa.com').replace(/\/+$/, '')
  const apiKey = process.env.BITZOOM_API_KEY
  const apiSecret = process.env.BITZOOM_API_SECRET
  if (!apiKey || !apiSecret) {
    throw new Error('Set BITZOOM_API_KEY and BITZOOM_API_SECRET before running this example.')
  }

  const path = '/api/v1/order'
  const rawQuery = ''
  const body = Buffer.from(
    JSON.stringify({
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'LIMIT',
      quantity: '0.001',
      price: '70000',
      clientOrderId: 'bot-1234567890123',
    })
  )
  const timestamp = Date.now().toString()
  const nonce = crypto.randomBytes(16).toString('hex')
  const recvWindow = '5000'
  const signature = sign({
    secret: apiSecret,
    timestamp,
    nonce,
    recvWindow,
    method: 'POST',
    path,
    rawQuery,
    body,
  })
  const response = await fetch(apiUrl + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-BZ-APIKEY': apiKey,
      'X-BZ-TIMESTAMP': timestamp,
      'X-BZ-NONCE': nonce,
      'X-BZ-RECVWINDOW': recvWindow,
      'X-BZ-SIGNATURE': signature,
    },
    body,
  })
  const payload = await response.json()
  if (!response.ok || payload.success === false || Number(payload.code || 0) !== 0) {
    throw new Error(payload.errorMessage || `Bitzoom rejected the request: HTTP ${response.status}`)
  }
  console.log(`Request succeeded: HTTP ${response.status}`)
}

await main()
