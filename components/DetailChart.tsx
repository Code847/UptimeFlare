import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-moment'
import { MonitorState, MonitorTarget } from '@/types/config'
import { codeToCountry } from '@/util/iata'
import { useTranslation } from 'react-i18next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale
)

export default function DetailChart({
  monitor,
  state,
  compact,
}: {
  monitor: MonitorTarget
  state: MonitorState
  compact?: boolean
}) {
  const { t } = useTranslation('common')
  const latencyData = state.latency[monitor.id].map((point) => ({
    x: point.time * 1000,
    y: point.ping,
    loc: point.loc,
  }))

  // Create gradient-like effect via segment coloring
  const data = {
    datasets: [
      {
        data: latencyData,
        borderColor: 'rgba(0, 240, 255, 0.8)',
        borderWidth: compact ? 1.5 : 2,
        radius: 0,
        pointRadius: 0,
        pointHoverRadius: compact ? 2 : 4,
        pointHoverBackgroundColor: '#00f0ff',
        pointHoverBorderColor: '#00f0ff',
        cubicInterpolationMode: 'monotone' as const,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(0, 240, 255, 0.05)',
      },
    ],
  }

  let options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 0,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (item: any) => {
            if (item.parsed.y) {
              return `${item.parsed.y}ms (${codeToCountry(item.raw.loc)})`
            }
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: !compact,
        text: t('Response times'),
        align: 'start' as const,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        grid: {
          color: 'rgba(0, 240, 255, 0.06)',
          drawBorder: false,
        },
        ticks: {
          source: 'auto' as const,
          maxRotation: 0,
          autoSkip: true,
          color: '#64748b',
          font: {
            family: 'JetBrains Mono, monospace',
            size: compact ? 8 : 10,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 240, 255, 0.06)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'JetBrains Mono, monospace',
            size: compact ? 8 : 10,
          },
          callback: (value: string | number) => `${value}ms`,
        },
      },
    },
  }

  return (
    <div style={{ height: compact ? '70px' : '150px' }}>
      <Line options={options} data={data} />
    </div>
  )
}
