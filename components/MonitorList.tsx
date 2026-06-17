import { MonitorState, MonitorTarget } from '@/types/config'
import { Accordion, Center, Text } from '@mantine/core'
import MonitorCard from './MonitorCard'
import { pageConfig } from '@/uptime.config'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function countDownCount(state: MonitorState, ids: string[]) {
  let downCount = 0
  for (let id of ids) {
    if (state.incident[id] === undefined || state.incident[id].length === 0) continue
    if (state.incident[id].slice(-1)[0].end === null) downCount++
  }
  return downCount
}

function getStatusTextColor(state: MonitorState, ids: string[]) {
  const downCount = countDownCount(state, ids)
  if (downCount === 0) return '#00f0ff'
  if (downCount === ids.length) return '#f43f5e'
  return '#f59e0b'
}

export default function MonitorList({
  monitors,
  state,
}: {
  monitors: MonitorTarget[]
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const group = pageConfig.group
  const groupedMonitor = group && Object.keys(group).length > 0

  const savedExpandedGroups =
    typeof window !== 'undefined' ? localStorage.getItem('expandedGroups') : null
  const expandedInitial = savedExpandedGroups
    ? JSON.parse(savedExpandedGroups)
    : Object.keys(group || {})
  const [expandedGroups, setExpandedGroups] = useState<string[]>(expandedInitial)
  useEffect(() => {
    localStorage.setItem('expandedGroups', JSON.stringify(expandedGroups))
  }, [expandedGroups])

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '12px',
  }

  let content

  if (groupedMonitor) {
    content = (
      <Accordion
        multiple
        defaultValue={Object.keys(group)}
        variant="contained"
        value={expandedGroups}
        onChange={(values) => setExpandedGroups(values)}
      >
        {Object.keys(group).map((groupName) => (
          <Accordion.Item key={groupName} value={groupName}>
            <Accordion.Control>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 600 }}>{groupName}</div>
                <Text
                  fw={600}
                  style={{
                    display: 'inline',
                    paddingRight: '5px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.85rem',
                    color: getStatusTextColor(state, group[groupName]),
                    textShadow: `0 0 8px ${getStatusTextColor(state, group[groupName])}40`,
                  }}
                >
                  {group[groupName].length - countDownCount(state, group[groupName])}/
                  {group[groupName].length} {t('Operational')}
                </Text>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div style={gridStyle}>
                {monitors
                  .filter((monitor) => group[groupName].includes(monitor.id))
                  .sort(
                    (a, b) =>
                      group[groupName].indexOf(a.id) - group[groupName].indexOf(b.id)
                  )
                  .map((monitor, idx) => (
                    <MonitorCard key={monitor.id} monitor={monitor} state={state} index={idx} />
                  ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    )
  } else {
    content = (
      <div style={gridStyle}>
        {monitors.map((monitor, idx) => (
          <MonitorCard key={monitor.id} monitor={monitor} state={state} index={idx} />
        ))}
      </div>
    )
  }

  return (
    <Center>
      <div
        style={{
          width: 'min(1600px, 98vw)',
          margin: '8px auto 24px auto',
          padding: '0 12px',
        }}
      >
        {content}
      </div>
    </Center>
  )
}
