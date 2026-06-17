import { Divider } from '@mantine/core'
import { pageConfig } from '@/uptime.config'

export default function Footer() {
  const defaultFooter =
    `<div style="text-align: center; font-size: 12px; margin-top: 16px; padding: 16px 0; color: #64748b; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em;">
      <span style="color: rgba(0,240,255,0.4);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br/>
      <span style="color: #94a3b8;">
        Open-source monitoring & status page powered by
        <a href="https://github.com/Code847" target="_blank" style="color: #00f0ff; text-decoration: none; text-shadow: 0 0 8px rgba(0,240,255,0.3);"> UptimeFlare</a>
        · Made with <span style="color: #f43f5e;">♥</span> by
        <a href="https://www.btmo.cn" target="_blank" style="color: #00f0ff; text-decoration: none; text-shadow: 0 0 8px rgba(0,240,255,0.3);">Code847</a>
      </span><br/>
      <span style="color: rgba(0,240,255,0.4);">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
    </div>`

  return (
    <>
      <Divider mt="lg" />
      <div dangerouslySetInnerHTML={{ __html: pageConfig.customFooter ?? defaultFooter }} />
    </>
  )
}
