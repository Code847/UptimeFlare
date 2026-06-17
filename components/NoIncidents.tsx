import { Alert, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

export default function NoIncidentsAlert({ style }: { style?: React.CSSProperties }) {
  const { t } = useTranslation('common')
  return (
    <Alert
      icon={<IconInfoCircle color="#00f0ff" />}
      title={
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#00f0ff',
          }}
        >
          {t('No incidents in this month')}
        </span>
      }
      color="cyan"
      variant="transparent"
      withCloseButton={false}
      style={{
        position: 'relative',
        margin: '16px auto 0 auto',
        background: 'rgba(0, 240, 255, 0.05)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '12px',
        ...style,
      }}
    >
      <Text style={{ color: '#94a3b8' }}>{t('There are no incidents for this month')}</Text>
    </Alert>
  )
}
