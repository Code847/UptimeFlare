import { MonitorState, MonitorTarget } from '@/types/config'
import { Card, Modal, Text, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { getColor } from '@/util/color'
import { maintenances } from '@/uptime.config'
import MonitorDetail from './MonitorDetail'
import { useTranslation } from 'react-i18next'

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <Tooltip label={label} withArrow>
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 20px ${color}40`,
          animation: 'pulse 2.5s ease-in-out infinite',
        }}
      />
    </Tooltip>
  )
}

export default function MonitorCard({
  monitor,
  state,
  index = 0,
}: {
  monitor: MonitorTarget
  state: MonitorState
  index?: number
}) {
  const { t } = useTranslation('common')
  const [opened, { open, close }] = useDisclosure(false)

  const isDown = state.incident[monitor.id]?.slice(-1)[0]?.end === null
  const now = new Date()
  const hasMaintenance = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .find((m) => m.monitors?.includes(monitor.id))

  let dotColor = '#00f0ff'
  let dotLabel = t('Operational')
  let statusText = t('Operational')
  if (hasMaintenance) {
    dotColor = '#f59e0b'
    dotLabel = t('Maintenance')
    statusText = t('Maintenance')
  } else if (isDown) {
    dotColor = '#f43f5e'
    dotLabel = t('Down')
    statusText = t('Down')
  }

  // Compute uptime % for color
  let uptimePercent = 100
  let hasData = true
  if (state.latency[monitor.id] && state.incident[monitor.id]?.length > 0) {
    const totalTime = Date.now() / 1000 - state.incident[monitor.id][0].start[0]
    let down = 0
    for (const incident of state.incident[monitor.id]) {
      down += (incident.end ?? Date.now() / 1000) - incident.start[0]
    }
    uptimePercent = Number((((totalTime - down) / totalTime) * 100).toPrecision(4))
  } else {
    hasData = false
  }

  const glowColor = hasData ? getColor(uptimePercent, true) : '#334155'

  return (
    <>
      <Card
        shadow="sm"
        padding="sm"
        radius="md"
        withBorder
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: `1px solid rgba(0, 240, 255, 0.1)`,
          borderRadius: '10px',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          userSelect: 'none',
          animation: `cardFadeIn 0.4s ease-out ${index * 0.04}s both`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.15), 0 0 50px rgba(0, 240, 255, 0.05)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.1)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
        onClick={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <StatusDot color={dotColor} label={dotLabel} />
          <Text
            fw={600}
            lineClamp={1}
            style={{
              flex: 1,
              fontSize: '0.9rem',
              color: '#e2e8f0',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {monitor.statusPageLink ? (
              <a
                href={monitor.statusPageLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#00f0ff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                {monitor.name}
              </a>
            ) : (
              monitor.name
            )}
          </Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            size="xs"
            style={{
              color: '#64748b',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {statusText}
          </Text>
          <Text
            fw={700}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85rem',
              color: glowColor,
              textShadow: `0 0 8px ${glowColor}40`,
            }}
          >
            {hasData ? `${uptimePercent}%` : '—'}
          </Text>
        </div>
      </Card>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <span style={{ color: '#00f0ff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            ⟨ {monitor.name} ⟩
          </span>
        }
        size="xl"
        styles={{
          content: {
            background: '#111827',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.15)',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
          },
          close: {
            color: '#64748b',
            '&:hover': { color: '#00f0ff' },
          },
        }}
      >
        <MonitorDetail monitor={monitor} state={state} />
      </Modal>
    </>
  )
}
