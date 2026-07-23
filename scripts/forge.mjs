// 鍛造:noahark-match3 → 十童女・預備油(太 25:1-13,只做「預備油」正面面,不做關門戲)。
// ⚠ replRange 的 newBlock 一律「不含」endAnchor 文字(A28 首鍛的三處重複錨教訓)。
import fs from 'fs'
import path from 'path'
const ROOT = path.resolve(import.meta.dirname, '..')
const P = (f) => path.join(ROOT, f)

function repl(src, from, to, tag) {
  if (!src.includes(from)) { console.error('🔴 缺錨:', tag); process.exit(1) }
  return src.replace(from, to)
}
function replRange(src, startAnchor, endAnchor, newBlock, tag) {
  const i = src.indexOf(startAnchor)
  const j = src.indexOf(endAnchor, i + 1)
  if (i < 0 || j < 0) { console.error('🔴 缺區段錨:', tag); process.exit(1) }
  return src.slice(0, i) + newBlock + src.slice(j)
}

let g = fs.readFileSync(P('game.js'), 'utf8')

g = replRange(g, '// 挪亞方舟・動物上船', '(function () {', `// 十童女・預備油(太 25:1-13)——「Candy 骨架 + tsum 皮」第三發(A29,fork noahark-match3)。
// ⚠ 神學邊界(牧者核可條件):只做「預備油」的正面面——收集油入燈、燈一盞盞亮、歡喜等新郎;
//   **不做關門拒絕戲**。儆醒(太 25:13)講成「歡歡喜喜等候」的盼望,不是恐嚇。
// 文案為 AI 依和合本草擬(引文均經 cuv MCP 逐字查證:太 25:4、25:7、25:13)。
//
// 玩法:夜已深,新郎快到了!點兩個相鄰的器皿交換;排成一排 3 個同款=「倒油入燈」
//   (燈檯上一盞盞亮起);新的器皿源源補上(聰明的預備有餘)。點亮目標盞數——迎接新郎!
//   瞌睡雲(太 25:5 都打盹睡著了)偶爾飄來擋路,一會兒自己散去;連 4+ 出「火光方塊」,
//   點一下整排整列一起入燈。
`, 'header')

g = repl(g, 'const PAIR = 2 // 每 2 隻=一對(一公一母,創 7:9)',
  'const PAIR = 3 // 每 3 滴油=點亮一盞燈', 'pair')

g = repl(g, "const ANIMALS = ['sheep', 'dove', 'lion', 'elephant', 'turtle', 'frog']",
  "const ANIMALS = ['amphora', 'jug', 'flask', 'skin', 'bowl', 'jar']", 'kinds')

g = repl(g, "young: { label: '🐣 幼', desc: '6×6・上船 20 對', size: 6, kinds: 4, goal: 20, crow: 0 },",
  "young: { label: '🐣 幼', desc: '6×6・點亮 15 盞', size: 6, kinds: 4, goal: 15, crow: 0 },", 'age-y')
g = repl(g, "kid: { label: '🙂 童', desc: '7×7・上船 32 對', size: 7, kinds: 5, goal: 32, crow: 2 },",
  "kid: { label: '🙂 童', desc: '7×7・點亮 22 盞', size: 7, kinds: 5, goal: 22, crow: 2 },", 'age-k')
g = repl(g, "teen: { label: '🔥 青', desc: '8×8・上船 45 對', size: 8, kinds: 6, goal: 45, crow: 3 },",
  "teen: { label: '🔥 青', desc: '8×8・點亮 30 盞', size: 8, kinds: 6, goal: 30, crow: 3 },", 'age-t')

g = replRange(g, '  const T = {', '\n\n  const VOICES', `  const T = {
    title: '🪔 十童女・預備油',
    ref: '馬太福音 25:1-13',
    intro1: '「聰明的拿著燈，又預備油在器皿裡。」(太 25:4)',
    how: '夜已深,新郎快到了!點一個器皿、再點旁邊的一個交換位置;排成一排 3 個同款就「倒油入燈」,燈檯上的燈會一盞盞亮起來。連出 4 個以上會出現火光方塊——點一下,整排整列一起入燈!點亮目標盞數,歡歡喜喜迎接新郎。放心慢慢預備——沒有步數限制。',
    pick: '星星都出來了,選一盞燈開始預備:',
    hud: (p, goal) => \`🪔 已點亮 \${p}/\${goal} 盞\`,
    gather: '倒油入燈!',
    cascade: '又預備了新的油…',
    shuffle: '把器皿排整齊了…',
    noswap: '這樣排不成一排——輕輕放回去',
    crowCome: '睡意飄來了…(太 25:5)',
    crowGo: '醒過來了,睡意散了',
    rainbowBorn: '火光!點它,整排整列一起入燈',
    rainbowGo: '一大批油一起入燈了!',
    closeLine: '那些童女就都起來收拾燈。(太 25:7)',
    winTitle: '🎉 燈都亮了,迎接新郎!',
    winVerse: '所以，你們要儆醒；因為那日子，那時辰，你們不知道。',
    winRef: '馬太福音 25:13',
    teachVerse: '聰明的拿著燈，又預備油在器皿裡。',
    teachRef: '馬太福音 25:4',
    teach: '儆醒不是提心吊膽,是歡歡喜喜地等——像知道爸爸快回家的孩子,早早把燈點好。預備油,就是天天親近主:讀祂的話、跟祂說話、愛身邊的人。這樣不管新郎哪一刻來,我們都笑著開門。',
    review: '文案待牧者審核・經文均經和合本逐句核對',
  }`, 'T')

g = repl(g, "window.__ping('noahark-match3' + suffix, t)", "window.__ping('oillamps-match3' + suffix, t)", 'ping')

// 夜半星空色調
g = repl(g, "sky.addColorStop(0, '#9db8d8'); sky.addColorStop(0.55, '#c6d6e4'); sky.addColorStop(0.72, '#9ec380'); sky.addColorStop(1, '#7fae62')",
  "sky.addColorStop(0, '#16213c'); sky.addColorStop(0.55, '#243654'); sky.addColorStop(0.72, '#2c3a34'); sky.addColorStop(1, '#26321e')", 'sky')
g = repl(g, "ctx.fillStyle = 'rgba(90,130,70,0.28)'", "ctx.fillStyle = 'rgba(120,140,180,0.2)'", 'board-bg')
g = repl(g, "ctx.strokeStyle = 'rgba(70,105,55,0.2)'", "ctx.strokeStyle = 'rgba(180,200,255,0.14)'", 'board-grid')

// 雲改星星(夜空)
g = replRange(g, '    _clouds() {', '    _fsBtn() {', `    _clouds() {
      const { ctx } = this
      for (let i = 0; i < 26; i++) {
        const x = (i * 97 + 40) % VW
        const y = (i * 53 + 20) % 150
        const tw = 0.35 + 0.55 * Math.abs(Math.sin(this._t * 1.6 + i * 1.7))
        ctx.fillStyle = \`rgba(255,244,200,\${tw})\`
        ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 2.2 : 1.4, 0, 7); ctx.fill()
      }
      // 月亮
      ctx.fillStyle = 'rgba(250,240,200,0.9)'
      ctx.beginPath(); ctx.arc(96, 60, 22, 0, 7); ctx.fill()
      ctx.fillStyle = 'rgba(22,33,60,0.85)'
      ctx.beginPath(); ctx.arc(104, 54, 19, 0, 7); ctx.fill()
    }

`, 'stars')

// 深夜看得清的字色
g = repl(g, `      if (this.state === 'close' || this.state === 'win') {
        ctx.fillStyle = '#2c3c1c'`, `      if (this.state === 'close' || this.state === 'win') {
        ctx.fillStyle = '#f4ecd0'`, 'closeline-color')

// 燈檯(沿用窗格進度邏輯)
g = replRange(g, '    // 方舟:右側大船,艙房窗=進度(每對亮一格)', '    _rainbowArc(alpha) {', `    // 燈檯:右側大燈架,一格=一盞燈(點亮=油夠了)
    _ark() {
      const { ctx } = this
      const goal = this.cfg.goal
      const done = this._pairs()
      const frac = (this.collected % PAIR) / PAIR
      const ax = 764, aw = 176
      // 木架
      ctx.fillStyle = '#6a4a26'
      rR(ctx, ax + 10, 88, aw - 20, 290, 10); ctx.fill()
      ctx.fillStyle = '#583c1e'
      rR(ctx, ax + 22, 100, aw - 44, 266, 8); ctx.fill()
      // 腳座
      ctx.fillStyle = '#4a3016'
      ctx.beginPath(); ctx.moveTo(ax + 30, 378); ctx.lineTo(ax + aw - 30, 378); ctx.lineTo(ax + aw - 14, 428); ctx.lineTo(ax + 14, 428); ctx.closePath(); ctx.fill()
      // 燈(=目標盞數;亮一格=點亮一盞)
      const houseY = 108, houseH = 250
      const cols = goal > 36 ? 5 : goal > 24 ? 4 : goal > 16 ? 3 : 2
      const rows = Math.ceil(goal / cols)
      const wx0 = ax + 30, wy0 = houseY + 6
      const ww = (aw - 60 - (cols - 1) * 6) / cols
      const wh = Math.min(26, (houseH - 20 - (rows - 1) * 5) / rows)
      for (let i = 0; i < goal; i++) {
        const col = i % cols, row = Math.floor(i / cols)
        const wx = wx0 + col * (ww + 6), wy = wy0 + row * (wh + 5)
        const full = i < done
        const filling = i === done ? frac : 0
        // 陶燈身
        ctx.fillStyle = full ? '#d8a05a' : 'rgba(150,110,60,0.4)'
        ctx.beginPath(); ctx.ellipse(wx + ww / 2, wy + wh * 0.68, ww * 0.42, wh * 0.3, 0, 0, 7); ctx.fill()
        if (!full && filling > 0) { // 正在倒油
          ctx.fillStyle = 'rgba(255,215,122,0.5)'
          ctx.beginPath(); ctx.ellipse(wx + ww / 2, wy + wh * 0.68, ww * 0.42 * filling, wh * 0.3 * filling, 0, 0, 7); ctx.fill()
        }
        if (full) { // 火焰+光暈
          const fx = wx + ww / 2, fy = wy + wh * 0.3
          ctx.fillStyle = 'rgba(255,200,90,0.22)'
          ctx.beginPath(); ctx.arc(fx, fy, wh * 0.55, 0, 7); ctx.fill()
          ctx.fillStyle = '#f0a030'
          ctx.beginPath(); ctx.moveTo(fx, fy - wh * 0.34); ctx.quadraticCurveTo(fx + wh * 0.2, fy, fx, fy + wh * 0.18); ctx.quadraticCurveTo(fx - wh * 0.2, fy, fx, fy - wh * 0.34); ctx.fill()
          ctx.fillStyle = '#ffe9a0'
          ctx.beginPath(); ctx.ellipse(fx, fy + wh * 0.02, wh * 0.08, wh * 0.14, 0, 0, 7); ctx.fill()
        }
      }
      ctx.fillStyle = '#f4ecd0'
      ctx.font = 'bold 14px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('燈檯', ax + aw / 2, 66)
      ctx.font = '11px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText('(太 25:4 預備油在器皿裡)', ax + aw / 2, 82)
    }

`, 'lampstand')

// 火光暖色(取代彩虹弧)
g = repl(g, `      const COLORS = ['#e8524a', '#f0a030', '#f5d90a', '#58b368', '#4a90d9', '#9068be']
      ctx.save()
      ctx.globalAlpha = 0.75 * alpha`, `      const COLORS = ['#fff2c0', '#ffe9a0', '#ffd77a', '#f0b850', '#e09838', '#c87820']
      ctx.save()
      ctx.globalAlpha = 0.75 * alpha`, 'arc-colors')
g = repl(g, `      const COLORS = ['#e8524a', '#f0a030', '#f5d90a', '#58b368', '#4a90d9', '#9068be']
      ctx.lineWidth = Math.max(3, H * 0.008)`, `      const COLORS = ['#fff2c0', '#ffe9a0', '#ffd77a', '#f0b850', '#e09838', '#c87820']
      ctx.lineWidth = Math.max(3, H * 0.008)`, 'wincard-arc')

// tsum 皮:六款器皿+瞌睡雲(crow)+火光方塊(rainbow)。newBlock 不含結尾錨。
g = replRange(g, "      if (kind === 'sheep') {", `      ctx.restore()
    }

    _drawIntro() {`, `      if (kind === 'amphora') { // 赤陶雙耳壺
        body('#d88a5a', '#b46a3e')
        ctx.strokeStyle = '#b46a3e'; ctx.lineWidth = Math.max(2, r * 0.12); ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(-r * 0.85, -r * 0.15, r * 0.3, Math.PI * 0.4, Math.PI * 1.4); ctx.stroke()
        ctx.beginPath(); ctx.arc(r * 0.85, -r * 0.15, r * 0.3, Math.PI * 1.6, Math.PI * 0.6); ctx.stroke()
        ctx.lineCap = 'butt'
        ctx.fillStyle = '#b46a3e'
        rR(ctx, -r * 0.28, -r * 1.15, r * 0.56, r * 0.3, r * 0.1); ctx.fill()
        face()
      } else if (kind === 'jug') { // 藍瓷罐:右耳把手+左嘴
        body('#7a9cd8', '#5a7cb8')
        ctx.strokeStyle = '#5a7cb8'; ctx.lineWidth = Math.max(2, r * 0.12); ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(r * 0.88, -r * 0.1, r * 0.3, Math.PI * 1.55, Math.PI * 0.5); ctx.stroke()
        ctx.lineCap = 'butt'
        ctx.fillStyle = '#5a7cb8'
        ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.85); ctx.lineTo(-r * 1.05, -r * 1.05); ctx.lineTo(-r * 0.75, -r * 0.6); ctx.closePath(); ctx.fill()
        face()
      } else if (kind === 'flask') { // 綠玻瓶:軟木塞
        body('#8abc8a', '#68a068')
        ctx.fillStyle = '#a8845a'
        rR(ctx, -r * 0.18, -r * 1.3, r * 0.36, r * 0.42, r * 0.08); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.16, r * 0.3, 0.6, 0, 7); ctx.fill()
        face()
      } else if (kind === 'skin') { // 皮囊:綁口繩結
        body('#b08a58', '#8f6c3e')
        ctx.strokeStyle = '#6a4c26'; ctx.lineWidth = Math.max(1.8, r * 0.09); ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(-r * 0.35, -r * 0.95); ctx.lineTo(r * 0.35, -r * 0.8); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.78); ctx.lineTo(r * 0.3, -r * 0.98); ctx.stroke()
        ctx.lineCap = 'butt'
        ctx.fillStyle = '#8f6c3e'
        ctx.beginPath(); ctx.arc(0, -r * 1.12, r * 0.16, 0, 7); ctx.fill()
        face()
      } else if (kind === 'bowl') { // 金油碗:寬口沿
        body('#e8c060', '#c49c3c')
        ctx.fillStyle = '#c49c3c'
        ctx.beginPath(); ctx.ellipse(0, -r * 0.82, r * 0.72, r * 0.22, 0, 0, 7); ctx.fill()
        ctx.fillStyle = '#f7df94'
        ctx.beginPath(); ctx.ellipse(0, -r * 0.85, r * 0.55, r * 0.14, 0, 0, 7); ctx.fill()
        face(r * 0.06)
      } else if (kind === 'jar') { // 紫罐:蓋子
        body('#a678b8', '#84589a')
        ctx.fillStyle = '#84589a'
        ctx.beginPath(); ctx.ellipse(0, -r * 0.95, r * 0.5, r * 0.18, 0, 0, 7); ctx.fill()
        ctx.fillStyle = '#6a4482'
        ctx.beginPath(); ctx.arc(0, -r * 1.1, r * 0.13, 0, 7); ctx.fill()
        face()
      } else if (kind === 'crow') { // 瞌睡雲(太25:5):閉眼打呵欠的小雲
        ctx.fillStyle = '#9aa8bc'
        ctx.beginPath()
        ctx.arc(-r * 0.45, r * 0.12, r * 0.5, 0, 7); ctx.arc(0, -r * 0.22, r * 0.62, 0, 7); ctx.arc(r * 0.5, r * 0.15, r * 0.46, 0, 7)
        ctx.fill()
        ctx.strokeStyle = '#7a8a9e'; ctx.lineWidth = Math.max(1.2, r * 0.05)
        ctx.beginPath(); ctx.arc(0, -r * 0.22, r * 0.62, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke()
        const er = r * 0.13
        ctx.strokeStyle = '#48586e'; ctx.lineWidth = Math.max(1.6, r * 0.07); ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.16, er, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke() // 閉眼
        ctx.beginPath(); ctx.arc(r * 0.28, -r * 0.16, er, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke()
        ctx.lineCap = 'butt'
        ctx.fillStyle = '#48586e'
        ctx.beginPath(); ctx.ellipse(0, r * 0.18, r * 0.12, r * 0.16, 0, 0, 7); ctx.fill() // 呵欠嘴
        ctx.font = \`bold \${Math.max(8, r * 0.34)}px sans-serif\`
        ctx.fillStyle = 'rgba(240,244,255,0.9)'
        ctx.textAlign = 'center'
        ctx.fillText('z', r * 0.62, -r * 0.62)
        ctx.fillText('z', r * 0.88, -r * 0.92)
      } else if (kind === 'rainbow') { // 火光方塊:白底+火焰+星光
        body('#fdf8e8', '#d8c896')
        ctx.fillStyle = '#f0a030'
        ctx.beginPath(); ctx.moveTo(0, -r * 0.55); ctx.quadraticCurveTo(r * 0.34, -r * 0.05, 0, r * 0.38); ctx.quadraticCurveTo(-r * 0.34, -r * 0.05, 0, -r * 0.55); ctx.fill()
        ctx.fillStyle = '#ffe9a0'
        ctx.beginPath(); ctx.ellipse(0, r * 0.02, r * 0.13, r * 0.22, 0, 0, 7); ctx.fill()
        const tw = 0.6 + 0.4 * Math.sin(this._t * 5)
        ctx.fillStyle = \`rgba(255,220,120,\${tw})\`
        ctx.beginPath()
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 - Math.PI / 2
          const rr = i % 2 === 0 ? r * 0.2 : r * 0.09
          const px = r * 0.62 + Math.cos(ang) * rr, py = -r * 0.62 + Math.sin(ang) * rr
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath(); ctx.fill()
      }
`, 'tsum-kinds')

g = repl(g, "this._tsum(ctx, VW * 0.32, VH * 0.63, 26, 'sheep', 0.25 * Math.abs(Math.sin(this._t * 2)))",
  "this._tsum(ctx, VW * 0.32, VH * 0.63, 26, 'amphora', 0.25 * Math.abs(Math.sin(this._t * 2)))", 'demo1')
g = repl(g, "this._tsum(ctx, VW * 0.5, VH * 0.63, 26, 'lion', 0.25 * Math.abs(Math.sin(this._t * 2 + 1)))",
  "this._tsum(ctx, VW * 0.5, VH * 0.63, 26, 'bowl', 0.25 * Math.abs(Math.sin(this._t * 2 + 1)))", 'demo2')
g = repl(g, "this._tsum(ctx, VW * 0.68, VH * 0.63, 26, 'frog', 0.25 * Math.abs(Math.sin(this._t * 2 + 2)))",
  "this._tsum(ctx, VW * 0.68, VH * 0.63, 26, 'flask', 0.25 * Math.abs(Math.sin(this._t * 2 + 2)))", 'demo3')
g = repl(g, "ctx.fillText(T.ref + ' ・ 保全生命', VW / 2, VH * 0.23)",
  "ctx.fillText(T.ref + ' ・ 儆醒預備', VW / 2, VH * 0.23)", 'intro-sub')
g = repl(g, "ctx.fillText(`上船 ${this.cfg.goal} 對——一對一對,一個不少`, W / 2, H * 0.235)",
  "ctx.fillText(`點亮 ${this.cfg.goal} 盞——油在器皿裡,歡喜等候`, W / 2, H * 0.235)", 'win-sub')

fs.writeFileSync(P('game.js'), g)

// ── index.html / sw / manifest / gen-tts ──
let h = fs.readFileSync(P('index.html'), 'utf8')
h = repl(h, '<title>挪亞方舟・動物上船</title>', '<title>十童女・預備油</title>', 'title')
h = repl(h, '<meta name="description" content="點兩隻相鄰的動物交換,排成一排 3 隻同款就一起上船!一對一對進方舟,保全生命(創世記 6-9,和合本)">',
  '<meta name="description" content="點兩個相鄰的器皿交換,排成一排 3 個同款就倒油入燈!預備油在器皿裡,儆醒等候新郎(馬太福音 25,和合本)">', 'desc')
h = repl(h, '<meta name="theme-color" content="#9db8d8">', '<meta name="theme-color" content="#16213c">', 'theme')
h = repl(h, 'background:#9db8d8', 'background:#16213c', 'bg')
h = repl(h, '📱 請把手機轉成橫向<br>方舟和動物們都在等你!', '📱 請把手機轉成橫向<br>燈檯和器皿們都在等你!', 'rotate')
h = repl(h, "var k = 'ping-noahark-match3'", "var k = 'ping-oillamps-match3'", 'ping-key')
h = repl(h, "window.__ping('noahark-match3')", "window.__ping('oillamps-match3')", 'ping-id')
fs.writeFileSync(P('index.html'), h)

let s = fs.readFileSync(P('sw.js'), 'utf8')
s = repl(s, "var CACHE_NAME = 'noahark-match3-v2';", "var CACHE_NAME = 'oillamps-match3-v1';", 'sw')
fs.writeFileSync(P('sw.js'), s)

let m = fs.readFileSync(P('manifest.webmanifest'), 'utf8')
m = m.replace('挪亞方舟・動物上船', '十童女・預備油').replace('"short_name": "方舟上船"', '"short_name": "預備油"')
m = m.replace('點兩隻相鄰的動物交換,排成一排 3 隻同款就一起上船!一對一對進方舟,保全生命(創世記 6-9,和合本)', '點兩個相鄰的器皿交換,排成一排 3 個同款就倒油入燈!預備油在器皿裡,儆醒等候新郎(馬太福音 25,和合本)')
m = m.replace('"background_color": "#9db8d8"', '"background_color": "#16213c"').replace('"theme_color": "#8a5a30"', '"theme_color": "#f0a030"')
fs.writeFileSync(P('manifest.webmanifest'), m)

let t = fs.readFileSync(P('scripts/gen-tts.mjs'), 'utf8')
t = replRange(t, "  ['intro',", '];', `  ['intro', '聰明的拿著燈,又預備油在器皿裡。'],
  ['bless', '那些童女就都起來收拾燈。'],
  ['win', '所以,你們要儆醒;因為那日子,那時辰,你們不知道。馬太福音二十五章十三節。']
`, 'tts-lines')
fs.writeFileSync(P('scripts/gen-tts.mjs'), t)

console.log('🟢 鍛造完成:十童女・預備油')
