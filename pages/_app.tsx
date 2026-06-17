import '@mantine/core/styles.css'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import NoSsr from '@/components/NoSsr'
import '@/util/i18n'
import '@/styles/global-tech.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoSsr>
      <MantineProvider 
        defaultColorScheme="dark"
        theme={{
          primaryColor: 'cyan',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
          fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
          defaultRadius: 'md',
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </NoSsr>
  )
}
