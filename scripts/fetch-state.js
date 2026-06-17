/**
 * Build-time script to fetch state from D1 via Cloudflare API.
 * Outputs state.json for getStaticProps to consume.
 * Runs in CI after D1 is created, before `next-on-pages` build.
 */
const https = require('https')

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const D1_ID = process.env.D1_ID
const OUTPUT_PATH = './public/state.json'

async function queryD1(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ sql, params: [] })
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${ACCOUNT_ID}/d1/database/${D1_ID}/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (!json.success) {
            reject(new Error(`D1 query failed: ${JSON.stringify(json.errors)}`))
            return
          }
          resolve(json.result)
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  if (!ACCOUNT_ID || !API_TOKEN || !D1_ID) {
    // Fallback: write empty state for initial build
    const fs = require('fs')
    const empty = JSON.stringify({
      lastUpdate: 0,
      overallUp: 0,
      overallDown: 0,
      incident: {},
      latency: {},
    })
    fs.mkdirSync('./public', { recursive: true })
    fs.writeFileSync(OUTPUT_PATH, empty)
    console.log('[fetch-state] Missing env vars, wrote empty state.json')
    return
  }

  try {
    const results = await queryD1("SELECT value FROM uptimeflare WHERE key = 'state' LIMIT 1")
    const fs = require('fs')
    fs.mkdirSync('./public', { recursive: true })

    if (results[0]?.rows?.length > 0) {
      fs.writeFileSync(OUTPUT_PATH, results[0].rows[0].value)
      console.log('[fetch-state] State fetched from D1 successfully')
    } else {
      // Empty state
      const empty = JSON.stringify({
        lastUpdate: 0,
        overallUp: 0,
        overallDown: 0,
        incident: {},
        latency: {},
      })
      fs.writeFileSync(OUTPUT_PATH, empty)
      console.log('[fetch-state] No state in D1, wrote empty state.json')
    }
  } catch (err) {
    console.error('[fetch-state] Error:', err.message)
    // Non-fatal: write empty state so build doesn't fail
    const fs = require('fs')
    fs.mkdirSync('./public', { recursive: true })
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ lastUpdate: 0, overallUp: 0, overallDown: 0, incident: {}, latency: {} }))
  }
}

main()
