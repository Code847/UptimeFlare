import { Text, Tooltip } from '@mantine/core'
import { MonitorState, MonitorTarget } from '@/types/config'
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import DetailChart from './DetailChart'
import DetailBar from './DetailBar'
import { getColor } from '@/util/color'
import { maintenances } from '@/uptime.config'
import { useTranslation } from 'react-i18next'

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <Tooltip label={label} withArrow>
      <span
        style={{
          display: 'inline-block',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: color,
          marginRight: '6px',
          boxShadow: `0 0 8px ${color}, 0 0 20px ${color}40`,
          animation: 'pulse 2.5s ease-in-out infinite',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
      />
    </Tooltip>
  )
}

export default function MonitorDetail({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')

  if (!state.latency[monitor.id])
    return (
      <>
        <Text mt="sm" fw={700} style={{ color: '#94a3b8' }}>
          {monitor.name}
        </Text>
        <Text mt="sm" fw={500} style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
          {t('No data available')}
        </Text>
      </>
    )

  const isDown = state.incident[monitor.id].slice(-1)[0].end === null

  // Hide real status icon if monitor is in maintenance
  const now = new Date()
  const hasMaintenance = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .find((maintenance) => maintenance.monitors?.includes(monitor.id))

  let dotColor = '#00f0ff'
  let dotLabel = 'Operational'
  if (hasMaintenance) {
    dotColor = '#f59e0b'
    dotLabel = 'Maintenance'
  } else if (isDown) {
    dotColor = '#f43f5e'
    dotLabel = 'Down'
  }

  let totalTime = Date.now() / 1000 - state.incident[monitor.id][0].start[0]
  let downTime = 0
  for (let incident of state.incident[monitor.id]) {
    downTime += (incident.end ?? Date.now() / 1000) - incident.start[0]
  }

  const uptimePercent = (((totalTime - downTime) / totalTime) * 100).toPrecision(4)

  const monitorNameElement = (
    <Text mt="sm" fw={700} style={{ display: 'inline-flex', alignItems: 'center', color: '#e2e8f0' }}>
      {monitor.statusPageLink ? (
        <a
          href={monitor.statusPageLink}
          target="_blank"
          style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00f0ff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
        >
          <StatusDot color={dotColor} label={dotLabel} />
          {monitor.name}
        </a>
      ) : (
        <>
          <StatusDot color={dotColor} label={dotLabel} />
          {monitor.name}
        </>
      )}
    </Text>
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {monitor.tooltip ? (
          <Tooltip label={monitor.tooltip}>{monitorNameElement}</Tooltip>
        ) : (
          monitorNameElement
        )}

        <Text
          mt="sm"
          fw={700}
          style={{
            display: 'inline',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            color: getColor(uptimePercent, true),
            textShadow: `0 0 8px ${getColor(uptimePercent, false)}40`,
          }}
        >
          {t('Overall', { percent: uptimePercent })}
        </Text>
      </div>

      <DetailBar monitor={monitor} state={state} />
      {!monitor.hideLatencyChart && <DetailChart monitor={monitor} state={state} />}
    </>
  )
}
