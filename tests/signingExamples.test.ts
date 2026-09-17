import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

interface SigningVector {
  name: string
  expectedSignature: string
}

const root = process.cwd()
const vectorPath = path.join(root, 'examples/hmac/known-answer-vectors.json')
const vectors = JSON.parse(fs.readFileSync(vectorPath, 'utf8')) as SigningVector[]
const expected = Object.fromEntries(
  vectors.map((vector) => [vector.name, vector.expectedSignature])
)

describe('HMAC signing examples', () => {
  it.each([
    ['Python', 'python3', path.join(root, 'examples/hmac/sign_and_send.py')],
    ['Node.js', 'node', path.join(root, 'examples/hmac/sign-and-send.mjs')],
  ])('%s matches every shared known-answer vector', (_runtime, executable, script) => {
    const output = execFileSync(executable, [script, '--vectors', vectorPath], {
      encoding: 'utf8',
    })

    expect(JSON.parse(output)).toEqual(expected)
  })
})
