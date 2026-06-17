import Head from 'next/head'

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
import { CompactedMonitorStateWrapper, getFromStore } from '@/worker/src/store'

export const runtime = 'experimental-edge'

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

export async function getServerSideProps({ res }: { res: any }) {
  // Read state as string from storage, to avoid hitting server-side cpu time limit
  const compactedStateStr = await getFromStore(process.env as any, 'state')

  // Cache on Cloudflare CDN for 60 seconds — stale-while-revalidate
  // This is the key optimization: SSR but with CDN caching
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

  // Only present these values to client
  const monitors = workerConfig.monitors.map((monitor) => {
    return {
      id: monitor.id,
      name: monitor.name,
      tooltip: monitor?.tooltip ?? null,
      statusPageLink: monitor?.statusPageLink ?? null,
      hideLatencyChart: monitor?.hideLatencyChart ?? null,
    }
  })

  return { props: { compactedStateStr: compactedStateStr || '{}', monitors } }
}
