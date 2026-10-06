// 小程序版 H5 运行时闭环：片头 → 星空 → 点亮 → 计时 → 结束 → 星亮
import { chromium } from 'playwright-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = 'http://localhost:5173/'
const browser = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

let failed = false
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.splash', { timeout: 8000 })
  console.log('[1] 片头出现 OK')
  await page.waitForSelector('.splash', { state: 'detached', timeout: 8000 })
  await page.waitForSelector('uni-button:has-text("点亮一颗星")', { timeout: 8000 })
  console.log('[2] 片头结束 → 星空 + 点亮按钮 OK')

  await page.click('uni-button:has-text("点亮一颗星")')
  await page.waitForSelector('.timer-chip', { timeout: 5000 })
  await page.waitForSelector('uni-button:has-text("结束在轨")', { timeout: 5000 })
  console.log('[3] 在轨开始：计时器 + 结束按钮 OK')

  await page.waitForTimeout(3200)
  await page.click('uni-button:has-text("结束在轨")')
  await page.waitForSelector('text=这次在轨，点亮了一颗自由的星', { timeout: 5000 })
  const starCount = await page.locator('.free-star').count()
  console.log(`[4] 结束结算 OK：自由星亮起（${starCount} 颗）`)
  if (starCount !== 1) failed = true

  // 关闭再打开 → 星还在（存储持久化）
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.splash', { state: 'detached', timeout: 8000 })
  const starCount2 = await page.locator('.free-star').count()
  console.log(`[5] 重开后星还在（${starCount2} 颗）OK`)
  if (starCount2 !== 1) failed = true

  // 共赴页跳转
  await page.click('uni-button:has-text("共赴")')
  await page.waitForSelector('text=共赴正在搬进小程序', { timeout: 8000 })
  console.log('[6] 共赴页跳转 OK')
  await page.screenshot({ path: 'C:/Users/L/AppData/Local/Temp/claude/wp-shots-miniapp/sky.png' })
} catch (e) {
  failed = true
  console.log('FAILED: ' + e.message)
  await page.screenshot({ path: 'C:/Users/L/AppData/Local/Temp/claude/wp-shots-miniapp/failure.png' }).catch(() => {})
} finally {
  await browser.close()
}

if (errors.length) {
  failed = true
  console.log('JS 错误：\n' + errors.join('\n'))
} else {
  console.log('无 JS 运行时错误')
}
process.exit(failed ? 1 : 0)
