import Head from 'next/head'
import fs from 'fs'
import path from 'path'

import { Inter } from 'next/font/google'
import { MonitorTarget } from '@/types/config'
import { maintenances, pageConfig, workerConfig } from '@/uptime.config'
import OverallStatus from '@/components/OverallStatus'
import Header from '@/components/Header'
import MonitorList from '@/components/MonitorList'
import { Center, Text } from '@mantine/core'
import MonitorDetail from '@/components/MonitorDetail'
import Footer from '@/components/Footer'
import { useTranslation } from 'react-i18next'
import { CompactedMonitorStateWrapper } from '@/worker/src/store'

const inter = Inter({ subsets: ['latin'] })

export default function Home({
  compactedStateStr,
  monitors,
}: {
  compactedStateStr: string
  monitors: MonitorTarget[]
  tooltip?: string
  statusPageLink?: string
}) {
  const { t } = useTranslation('common')
  let state = new CompactedMonitorStateWrapper(compactedStateStr).uncompact()

  // Specify monitorId in URL hash to view a specific monitor (can be used in iframe)
  const monitorId = typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
  if (monitorId) {
    const monitor = monitors.find((monitor) => monitor.id === monitorId)
    if (!monitor || !state) {
      return <Text fw={700}>{t('Monitor not found', { id: monitorId })}</Text>
    }
    return (
      <div style={{ maxWidth: '810px' }}>
        <MonitorDetail monitor={monitor} state={state} />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
      </Head>

      <main className={inter.className}>
        <Header />

        {state.lastUpdate === 0 ? (
          <Center>
            <Text fw={700}>{t('Monitor State not defined')}</Text>
          </Center>
        ) : (
          <div>
            <OverallStatus state={state} monitors={monitors} maintenances={maintenances} />
            <MonitorList monitors={monitors} state={state} />
          </div>
        )}

        <Footer />
      </main>
    </>
  )
}

// ISR: rebuild every 60 seconds on Cloudflare CDN edge
// Note: removed `runtime = 'experimental-edge'` to enable ISR caching
export async function getStaticProps() {
  // Strategy: try to fetch live state from worker API first (fast ISR rebuild)
  // Fall back to pre-generated public/state.json if worker is not reachable
  const workerUrl =
    process.env.CLOUDFLARE_PAGES_DEPLOYMENT_URL ||
    `https://${process.env.CLOUDFLARE_PROJECT_NAME || 'uptimeflare'}.pages.dev`

  let compactedStateStr = '{}'

  try {
    const res = await Promise.race([
      fetch(`${workerUrl}/api/data`),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ])
    if (res && res.ok) {
      const data = await res.json() as { lastUpdate: number; up: number; down: number }
      // Build compacted state from API response
      const { lastUpdate, up, down } = data
      compactedStateStr = JSON.stringify({
        lastUpdate,
        overallUp: up,
        overallDown: down,
        incident: {},
        latency: {},
      })
    }
  } catch {
    // Worker not reachable during build (e.g. first deploy), fall back to state file
    try {
      const filePath = path.join(process.cwd(), 'public', 'state.json')
      if (fs.existsSync(filePath)) {
        compactedStateStr = fs.readFileSync(filePath, 'utf-8')
      }
    } catch {
      // Use empty state
    }
  }

  const monitors = workerConfig.monitors.map((monitor) => {
    return {
      id: monitor.id,
      name: monitor.name,
      // @ts-ignore
      tooltip: monitor?.tooltip,
      // @ts-ignore
      statusPageLink: monitor?.statusPageLink,
      // @ts-ignore
      hideLatencyChart: monitor?.hideLatencyChart,
    }
  })

  return {
    props: { compactedStateStr, monitors },
    revalidate: 60,
  }
}
