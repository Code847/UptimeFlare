// This is a simplified example config file for quickstart
// Some not frequently used features are omitted/commented out here
// For a full-featured example, please refer to `uptime.config.full.ts`

// Don't edit this line
import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

const pageConfig: PageConfig = {
  // Title for your status page
  title: "灵昱-代号847",
  // Links shown at the header of your status page, could set `highlight` to `true`
  links: [
    { link: 'https://github.com/Code847/', label: 'GitHub' },
    { link: 'https://www.btmo.cn/', label: 'Blog' },
    { link: 'mailto:316128933@qq.com', label: 'Email Me', highlight: true },
  ],
}

const workerConfig: WorkerConfig = {
  // Define all your monitors here
  monitors: [
    // Example HTTP Monitor
    {
      // `id` should be unique, history will be kept if the `id` remains constant
      id: 'foo_monitor',
      // `name` is used at status page and callback message
      name: 'My API Monitor',
      // `method` should be a valid HTTP Method
      method: 'GET',
      // `target` is a valid URL
      target: 'https://www.btmo.cn',
      // [OPTIONAL] `tooltip` is ONLY used at status page to show a tooltip
      tooltip: 'This is a tooltip for this monitor',
      // [OPTIONAL] `statusPageLink` is ONLY used for clickable link at status page
      statusPageLink: 'https://www.btmo.cn',
      // [OPTIONAL] `expectedCodes` is an array of acceptable HTTP response codes, if not specified, default to 2xx
      expectedCodes: [200],
      // [OPTIONAL] `timeout` in millisecond, if not specified, default to 10000
      timeout: 10000,
      // [OPTIONAL] headers to be sent
      headers: {
        'User-Agent': 'Uptimeflare',
        Authorization: 'Bearer YOUR_TOKEN_HERE',
      },
      // [OPTIONAL] body to be sent (require POST/PUT/PATCH method)
      // body: 'Hello, world!',
      // [OPTIONAL] if specified, the response must contains the keyword to be considered as operational.
      // responseKeyword: 'success',
      // [OPTIONAL] if specified, the response must NOT contains the keyword to be considered as operational.
      // responseForbiddenKeyword: 'bad gateway',
      // [OPTIONAL] if specified, will call the check proxy to check the monitor, mainly for geo-specific checks
      // refer to docs https://github.com/lyc8503/UptimeFlare/wiki/Check-proxy-setup before setting this value
      // currently supports `worker://`, `globalping://` and `http(s)://` proxies
      // checkProxy: 'worker://weur',
      // [OPTIONAL] if true, the check will fallback to local if the specified proxy is down
      // checkProxyFallback: true,
    },
    // Example TCP Monitor
    {
      id: 'test_tcp_monitor',
      name: 'TcpPING',
      // `method` should be `TCP_PING` for tcp monitors
      method: 'TCP_PING',
      // `target` should be `host:port` for tcp monitors
      target: '104.234.37.243:22',
      tooltip: 'My production server SSH',
      statusPageLink: 'https://example.com',
      timeout: 5000,
    },
  ],
  // [Optional] Notification settings
  

// You can define multiple maintenances here
// During maintenance, an alert will be shown at status page
// Also, related downtime notifications will be skipped (if any)
// Of course, you can leave it empty if you don't need this feature

// const maintenances: MaintenanceConfig[] = []

const maintenances: MaintenanceConfig[] = [
  {
    // [Optional] Monitor IDs to be affected by this maintenance
    monitors: ['foo_monitor', 'bar_monitor'],
    // [Optional] default to "Scheduled Maintenance" if not specified
    title: 'Test Maintenance',
    // Description of the maintenance, will be shown at status page
    body: 'This is a test maintenance, server software upgrade',
    // Start time of the maintenance, in UNIX timestamp or ISO 8601 format
    start: '2026-01-01T00:00:00+08:00',
    // [Optional] end time of the maintenance, in UNIX timestamp or ISO 8601 format
    // if not specified, the maintenance will be considered as on-going
    end: '2056-01-01T00:00:00+08:00',
    // [Optional] color of the maintenance alert at status page, default to "yellow"
    color: 'blue',
  },
]

// Don't edit this line
export { maintenances, pageConfig, workerConfig }
