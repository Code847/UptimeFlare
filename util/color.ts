import { MonitorState, MonitorTarget } from '@/types/config'
import { getColor } from '@/util/color'

function getColor(percent: number | string, darker: boolean): string {
  percent = Number(percent)
  // Sci-Tech cyan theme color mapping
  if (percent >= 99.9) {
    return darker ? '#00f0ff' : '#22d3ee'
  } else if (percent >= 99) {
    return darker ? '#22d3ee' : '#67e8f9'
  } else if (percent >= 95) {
    return '#f59e0b'
  } else if (Number.isNaN(percent)) {
    return '#334155'
  } else {
    return '#f43f5e'
  }
}

export { getColor }
