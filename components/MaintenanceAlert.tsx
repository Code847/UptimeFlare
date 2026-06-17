import { Alert, List, Text, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertTriangle } from '@tabler/icons-react'
import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { pageConfig } from '@/uptime.config'
import { useTranslation } from 'react-i18next'

export default function MaintenanceAlert({
  maintenance,
  style,
  upcoming = false,
}: {
  maintenance: Omit<MaintenanceConfig, 'monitors'> & { monitors?: (MonitorTarget | undefined)[] }
  style?: React.CSSProperties
  upcoming?: boolean
}) {
  const { t } = useTranslation('common')
  const theme = useMantineTheme()
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`)

  return (
    <Alert
      icon={<IconAlertTriangle color="#f59e0b" />}
      title={
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: upcoming ? '#94a3b8' : '#f59e0b',
          }}
        >
          {(upcoming ? t('Upcoming') : '') + (maintenance.title || t('Scheduled Maintenance'))}
        </span>
      }
      variant="transparent"
      withCloseButton={false}
      style={{
        margin: '16px auto 0 auto',
        background: upcoming ? 'rgba(148, 163, 184, 0.05)' : 'rgba(245, 158, 11, 0.05)',
        border: upcoming
          ? '1px solid rgba(148, 163, 184, 0.2)'
          : '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '12px',
        ...style,
      }}
    >
      {/* Date range in top right (desktop) or inline (mobile) */}
      <div
        style={{
          ...{
            top: 10,
            fontSize: '0.8rem',
            borderRadius: 6,
            color: '#94a3b8',
            fontFamily: 'JetBrains Mono, monospace',
          },
          ...(isDesktop
            ? {
                position: 'absolute',
                right: 10,
                padding: '2px 8px',
                textAlign: 'right',
              }
            : { marginBottom: 4 }),
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gridColumnGap: '3px',
          }}
        >
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#cbd5e1' }}>
            {upcoming ? t('Scheduled for') : t('From')}
          </div>
          <div>{new Date(maintenance.start).toLocaleString()}</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#cbd5e1' }}>
            {upcoming ? t('Expected end') : t('To')}
          </div>
          <div>
            {maintenance.end
              ? new Date(maintenance.end).toLocaleString()
              : t('Until further notice')}
          </div>
        </div>
      </div>

      <Text style={{ paddingTop: '3px', whiteSpace: 'pre-line', color: '#94a3b8' }}>{maintenance.body}</Text>
      {maintenance.monitors && maintenance.monitors.length > 0 && (
        <>
          <Text mt="xs">
            <b>{t('Affected components')}</b>
          </Text>
          <List size="sm" withPadding>
            {maintenance.monitors.map((comp, compIdx) => (
              <List.Item key={compIdx}>{comp?.name ?? t('MONITOR ID NOT FOUND')}</List.Item>
            ))}
          </List>
        </>
      )}
    </Alert>
  )
}
