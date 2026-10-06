// 探针6：抓取所有非 2xx 响应的完整报错体，定位 500 来源
import { chromium } from 'playwright-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = 'http://localhost:5173/'
const browser = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] })
const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 } })
const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 } })
const A = await ctxA.newPage()
const B = await ctxB.newPage()

function hook(page, tag) {
  page.on('response', async (r) => {
    if (r.status() >= 400) {
      const u = r.url()
      const short = u.includes('/rpc/') ? u.split('/rpc/')[1].split('?')[0] : u.includes('/rest/v1/') ? u.split('/rest/v1/')[1].split('?')[0] : u
      let body = ''
      try { body = await r.text() } catch {}
      console.log(`[${tag}] ${r.status()} ${short} → ${body.slice(0, 300)}`)
    }
  })
}
hook(A, 'A')
hook(B, 'B')

await A.goto(BASE, { waitUntil: 'domcontentloaded' })
await A.waitForSelector('.splash', { state: 'detached', timeout: 8000 })
await A.click('button:has-text("共赴")')
await A.click('button:has-text("点亮信标，邀请新朋友")')
await A.click('.beacon-form button:has-text("点亮信标")')
await A.waitForSelector('.invite-code', { timeout: 10000 })
const code = (await A.locator('.invite-code').textContent()).trim()
console.log('邀请码', code)

await B.goto(`${BASE}#join=${code}`, { waitUntil: 'domcontentloaded' })
await B.waitForSelector('.splash', { state: 'detached', timeout: 8000 })
await B.waitForSelector('text=远处有一束光', { timeout: 10000 })
await B.click('button:has-text("循光而来")')
await new Promise((r) => setTimeout(r, 6000))
const err = await B.locator('.error').allTextContents().catch(() => [])
console.log('B 界面错误：', err.join(' | ') || '（无）')
console.log('B 当前是否在共赴天空：', (await B.locator('.top-bar2 .c-label').count()) > 0)

await browser.close()
