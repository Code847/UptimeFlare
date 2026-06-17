import '@mantine/core/styles.css'
import type { AppProps } from 'next/app'
import { MantineProvider, createTheme } from '@mantine/core'
import NoSsr from '@/components/NoSsr'
import '@/util/i18n'
import '@/styles/global-tech.css'

const techTheme = createTheme({
  primaryColor: 'cyan',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  defaultRadius: 'md',
  colors: {
    cyan: {
      0: '#ecfeff',
      1: '#cffafe',
      2: '#a5f3fc',
      3: '#67e8f9',
      4: '#22d3ee',
      5: '#06b6d4',
      6: '#0891b2',
      7: '#0e7490',
      8: '#155e75',
      9: '#164e63',
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoSsr>
      <MantineProvider theme={techTheme} defaultColorScheme="dark">
        <Component {...pageProps} />
      </MantineProvider>
    </NoSsr>
  )
}
