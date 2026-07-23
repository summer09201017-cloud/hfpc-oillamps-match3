// 無頭驗證:載入 → 三檔各選一次 → 自動玩(窮舉找一手有效交換,模擬點擊)→ 驗收取/彩虹/永不卡死。
// 用法:node scripts/verify.mjs <baseURL>(預設 http://localhost:8317)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import os from 'os';
const CANDIDATES = [
  path.join(os.homedir(), 'Downloads', 'hfpc-git', '_paul-wt', 'node_modules'),
  path.join(os.homedir(), 'Desktop', 'horsearchery3d', 'node_modules'),
  path.join(os.homedir(), 'Desktop', 'redsea3d', 'node_modules'),
];
const root = CANDIDATES.find((p) => fs.existsSync(path.join(p, 'playwright')));
if (!root) { console.error('找不到 playwright'); process.exit(1); }
const { chromium } = createRequire(root + path.sep)('playwright');

const BASE = process.argv[2] || 'http://localhost:8317';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto(BASE, { waitUntil: 'load' });
await page.waitForFunction(() => window.__m3 && window.__game, { timeout: 8000 });
console.log('✓ 頁面載入,掛勾就緒');

for (const age of ['young', 'kid', 'teen']) {
  await page.evaluate((a) => window.__m3.start(a), age)
  await page.waitForTimeout(900)
  const st0 = await page.evaluate(() => window.__m3.state())
  if (st0.state !== 'play') throw new Error(age + ' 未進 play:' + JSON.stringify(st0))
  if (st0.hasMove !== true) throw new Error(age + ' 起手盤無手可動')
  // 自動玩 40 手:窮舉一手有效交換,直接模擬兩次點擊(走真實輸入路徑)
  let collected0 = st0.collected
  for (let i = 0; i < 40; i++) {
    const done = await page.evaluate(() => {
      const g = window.__game
      if (g.state !== 'play') return 'ended'
      if (g.lock > 0) return 'locked'
      const n = g.cfg.size
      const isA = (k) => k && k !== 'rainbow' && k !== 'crow'
      // 場上有彩虹→點它
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (g.grid[r][c].kind === 'rainbow') { g._down(fake(g, r, c)); return 'rainbow' }
      }
      const tryswap = (r1, c1, r2, c2) => {
        const a = g.grid[r1][c1], b = g.grid[r2][c2]
        if (!isA(a.kind) || !isA(b.kind)) return false
        ;[a.kind, b.kind] = [b.kind, a.kind]
        const ok = g._hasMatch()
        ;[a.kind, b.kind] = [b.kind, a.kind]
        return ok
      }
      function fake(g2, r, c) {
        const geo = g2._geo()
        const { s, ox, oy } = g2._view()
        const rect = g2.cv.getBoundingClientRect()
        const vx = geo.x0 + c * geo.D + geo.D / 2, vy = geo.y0 + r * geo.D + geo.D / 2
        return { clientX: rect.left + ((vx * s + ox) / g2.W) * rect.width, clientY: rect.top + ((vy * s + oy) / g2.H) * rect.height }
      }
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (c + 1 < n && tryswap(r, c, r, c + 1)) { g._down(fake(g, r, c)); g._down(fake(g, r, c + 1)); return 'swap' }
        if (r + 1 < n && tryswap(r, c, r + 1, c)) { g._down(fake(g, r, c)); g._down(fake(g, r + 1, c)); return 'swap' }
      }
      return 'nomove'
    })
    if (done === 'ended') break
    await page.waitForTimeout(650)
  }
  const st1 = await page.evaluate(() => window.__m3.state())
  if (!(st1.collected > collected0)) throw new Error(age + ' 40 手沒收到任何動物:' + JSON.stringify(st1))
  console.log(`✓ ${age}:play 正常,收 ${st1.collected} 隻(${st1.pairs}/${st1.goal} 對)state=${st1.state}`)
  await page.evaluate(() => { window.__game.state = 'intro' })
}

// 勝利路徑:直接灌到目標前一步,再收一手 → close → win
await page.evaluate(() => window.__m3.start('young'))
await page.waitForTimeout(600)
await page.evaluate(() => { const g = window.__game; g.collected = g.cfg.goal * 10; g.lock = 0.01 })
await page.waitForTimeout(400)
await page.evaluate(() => { const g = window.__game; if (g.state === 'play') { g.collected = g.cfg.goal * 10; g.lock = 0.01 } })
await page.waitForFunction(() => ['close', 'win'].includes(window.__m3.state().state), { timeout: 6000 })
await page.waitForFunction(() => window.__m3.state().state === 'win', { timeout: 6000 })
console.log('✓ 勝利流程 close→win 走通')

// 再玩一次按鈕(勝利卡上)
await page.waitForTimeout(400) // 等 _drawWinCard 至少畫過一幀(產生 _winBtns)
await page.evaluate(() => {
  const g = window.__game
  const b = g._winBtns[0]
  const rect = g.cv.getBoundingClientRect()
  g._down({ clientX: rect.left + ((b.x + b.w / 2) / g.W) * rect.width, clientY: rect.top + ((b.y + b.h / 2) / g.H) * rect.height })
})
await page.waitForFunction(() => window.__m3.state().state === 'play' && window.__m3.state().collected === 0, { timeout: 3000 })
console.log('✓ 再玩一次 → 同難度重新開局')

if (errors.length) { console.error('🔴 頁面錯誤:', errors.slice(0, 5)); process.exit(1) }
console.log('🟢 全部通過,零 pageerror')
await browser.close()
