import { Divider } from '@mantine/core'
import { pageConfig } from '@/uptime.config'

export default function Footer() {
  const defaultFooter =
    '<p style="text-align: center; font-size: 12px; margin-top: 10px;"> Open-source monitoring and status page powered by <a href="https://github.com/Code847" target="_blank">Uptimeflare</a>, made with ❤ by <a href="https://WWW.btmo.cn" target="_blank">Code847</a>. </p>'

  return (
    <>
      <Divider mt="lg" />
      <div dangerouslySetInnerHTML={{ __html: pageConfig.customFooter ?? defaultFooter }} />
    </>
  )
}
