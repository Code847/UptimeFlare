import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { Center, Container, Title, Collapse } from '@mantine/core'
import { IconCircleCheck, IconAlertCircle, IconCircle, IconBolt } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import { useTranslation } from 'react-i18next'

function useWindowVisibility() {
  const [isVisible, setIsVisible] = useState(true)
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  return isVisible
}

function StatusIcon({ type }: { type: 'ok' | 'down' | 'partial' | 'unknown' }) {
  const config = {
    ok:      { icon: <IconCircleCheck size={64} />, color: '#00f0ff', glow: '0 0 30px rgba(0,240,255,0.4), 0 0 80px rgba(0,240,255,0.15)' },
    down:    { icon: <IconAlertCircle size={64} />, color: '#f43f5e', glow: '0 0 30px rgba(244,63,94,0.4), 0 0 80px rgba(244,63,94,0.15)' },
    partial: { icon: <IconCircle size={64} />, color: '#f59e0b', glow: '0 0 30px rgba(245,158,11,0.4), 0 0 80px rgba(245,158,11,0.15)' },
    unknown: { icon: <IconBolt size={64} />, color: '#94a3b8', glow: '0 0 20px rgba(148,163,184,0.2)' },
  }
  const c = config[type]
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${c.color}15 0%, transparent 70%)`,
      border: `2px solid ${c.color}40`,
      boxShadow: c.glow,
      animation: 'pulse 3s ease-in-out infinite',
    }}>
      <span style={{ color: c.color }}>{c.icon}</span>
    </div>
  )
}

export default function OverallStatus({
  state,
  maintenances,
  monitors,
}: {
  state: { overallUp: number; overallDown: number; lastUpdate: number }
  maintenances: MaintenanceConfig[]
  monitors: MonitorTarget[]
}) {
  const { t } = useTranslation('common')

  let statusString = ''
  let iconType: 'ok' | 'down' | 'partial' | 'unknown' = 'ok'

  if (state.overallUp === 0 && state.overallDown === 0) {
    statusString = t('No data yet')
    iconType = 'unknown'
  } else if (state.overallUp === 0) {
    statusString = t('All systems not operational')
    iconType = 'down'
  } else if (state.overallDown === 0) {
    statusString = t('All systems operational')
    iconType = 'ok'
  } else {
    statusString = t('Some systems not operational', {
      down: state.overallDown,
      total: state.overallUp + state.overallDown,
    })
    iconType = 'partial'
  }

  const [openTime] = useState(Math.round(Date.now() / 1000))
  const [currentTime, setCurrentTime] = useState(Math.round(Date.now() / 1000))
  const isWindowVisible = useWindowVisibility()
  const [expandUpcoming, setExpandUpcoming] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWindowVisible) return
      if (currentTime - state.lastUpdate > 300 && currentTime - openTime > 30) {
        window.location.reload()
      }
      setCurrentTime(Math.round(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  })

  const now = new Date()

  const activeMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: MonitorTarget[]
  })[] = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const upcomingMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: (MonitorTarget | undefined)[]
  })[] = maintenances
    .filter((m) => now < new Date(m.start))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  return (
    <Container size="md" mt="xl">
      <Center>
        <StatusIcon type={iconType} />
      </Center>
      <Title
        mt="sm"
        style={{
          textAlign: 'center',
          background: iconType === 'ok'
            ? 'linear-gradient(135deg, #00f0ff, #22d3ee)'
            : iconType === 'down'
            ? 'linear-gradient(135deg, #f43f5e, #ec4899)'
            : iconType === 'partial'
            ? 'linear-gradient(135deg, #f59e0b, #f97316)'
            : 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
        order={1}
      >
        {statusString}
      </Title>
      <Title
        mt="sm"
        style={{
          textAlign: 'center',
          color: '#64748b',
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          fontSize: '0.8rem',
          fontWeight: 400,
          letterSpacing: '0.05em',
        }}
        order={5}
      >
        ⟨ {t('Last updated on', {
          date: new Date(state.lastUpdate * 1000).toLocaleString(),
          seconds: currentTime - state.lastUpdate,
        })} ⟩
      </Title>

      {/* Upcoming Maintenance */}
      {upcomingMaintenances.length > 0 && (
        <>
          <Title
            mt="4px"
            style={{
              textAlign: 'center',
              color: '#64748b',
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              fontSize: '0.8rem',
            }}
            order={5}
          >
            {t('upcoming maintenance', { count: upcomingMaintenances.length })}{' '}
            <span
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: '#00f0ff',
                textDecorationColor: 'rgba(0, 240, 255, 0.3)',
              }}
              onClick={() => setExpandUpcoming(!expandUpcoming)}
            >
              [{expandUpcoming ? t('Hide') : t('Show')}]
            </span>
          </Title>

          <Collapse in={expandUpcoming}>
            {upcomingMaintenances.map((maintenance, idx) => (
              <MaintenanceAlert
                key={`upcoming-${idx}`}
                maintenance={maintenance}
                style={{ width: 'min(1200px, 96vw)' }}
                upcoming
              />
            ))}
          </Collapse>
        </>
      )}

      {/* Active Maintenance */}
      {activeMaintenances.map((maintenance, idx) => (
        <MaintenanceAlert
          key={`active-${idx}`}
          maintenance={maintenance}
          style={{ width: 'min(1200px, 96vw)' }}
        />
      ))}
    </Container>
  )
}
