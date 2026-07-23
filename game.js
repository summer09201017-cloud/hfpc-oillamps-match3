// 十童女・預備油(太 25:1-13)——「Candy 骨架 + tsum 皮」第三發(A29,fork noahark-match3)。
// ⚠ 神學邊界(牧者核可條件):只做「預備油」的正面面——收集油入燈、燈一盞盞亮、歡喜等新郎;
//   **不做關門拒絕戲**。儆醒(太 25:13)講成「歡歡喜喜等候」的盼望,不是恐嚇。
// 文案為 AI 依和合本草擬(引文均經 cuv MCP 逐字查證:太 25:4、25:7、25:13)。
//
// 玩法:夜已深,新郎快到了!點兩個相鄰的器皿交換;排成一排 3 個同款=「倒油入燈」
//   (燈檯上一盞盞亮起);新的器皿源源補上(聰明的預備有餘)。點亮目標盞數——迎接新郎!
//   瞌睡雲(太 25:5 都打盹睡著了)偶爾飄來擋路,一會兒自己散去;連 4+ 出「火光方塊」,
//   點一下整排整列＋旁邊一圈一起入燈。
(function () {
  'use strict'

  const VW = 960
  const VH = 540
  const PAIR = 3 // 每 3 滴油=點亮一盞燈

  const AGES = {
    young: { label: '🐣 幼', desc: '6×6・第1關 23 盞', size: 6, kinds: 4, goal: 23, crow: 0 },
    kid: { label: '🙂 童', desc: '7×7・第1關 33 盞', size: 7, kinds: 5, goal: 33, crow: 2 },
    teen: { label: '🔥 青', desc: '8×8・第1關 45 盞', size: 8, kinds: 6, goal: 45, crow: 3 },
  }

  // 六款動物(tsum 圓萌臉;顏色+特徵雙重分辨,紅綠不對抗)
  const ANIMALS = ['amphora', 'jug', 'flask', 'skin', 'bowl', 'jar']

  // 關卡制(tsum 家族 07-22 三包同款):進度與星星依年齡檔存本機
  const SPRINT_EVERY = 3
  const SPRINT_SECS = { young: 150, kid: 130, teen: 110 }
  const LS = 'oillamps-match3'
  const isSprint = (lv) => lv % SPRINT_EVERY === 0
  const maxLevel = (age) => { try { return Math.max(1, parseInt(localStorage.getItem(`${LS}-lvl-${age}`)) || 1) } catch { return 1 } }
  const bumpLevel = (age, lv) => { try { localStorage.setItem(`${LS}-lvl-${age}`, String(Math.max(maxLevel(age), lv))) } catch {} }
  const loadStars = (age) => { try { return JSON.parse(localStorage.getItem(`${LS}-stars-${age}`) || '{}') || {} } catch { return {} } }
  const saveStars = (age, st) => { try { localStorage.setItem(`${LS}-stars-${age}`, JSON.stringify(st)) } catch {} }
  const levelGoal = (base, lv) => Math.round(base * (1 + (lv - 1) * 0.5))

  const T = {
    title: '🪔 十童女・預備油',
    ref: '馬太福音 25:1-13',
    intro1: '「聰明的拿著燈，又預備油在器皿裡。」(太 25:4)',
    how: '夜已深,新郎快到了!點一個器皿、再點旁邊的一個交換位置;排成一排 3 個同款就「倒油入燈」,燈檯上的燈會一盞盞亮起來。連出 4 個以上會出現火光方塊——點一下,整排整列＋旁邊一圈一起入燈!點亮目標盞數,歡歡喜喜迎接新郎。放心慢慢預備——沒有步數限制。',
    pick: '星星都出來了,選一盞燈開始預備:',
    hud: (p, goal) => `🪔 已點亮 ${p}/${goal} 盞`,
    gather: '倒油入燈!',
    cascade: '又預備了新的油…',
    shuffle: '把器皿排整齊了…',
    noswap: '這樣排不成一排——輕輕放回去',
    crowCome: '睡意飄來了…(太 25:5)',
    crowGo: '醒過來了,睡意散了',
    rainbowBorn: '火光!點它,整排整列＋旁邊一圈一起入燈',
    rainbowGo: '一大批油一起入燈了!',
    closeLine: '那些童女就都起來收拾燈。(太 25:7)',
    winTitle: '🎉 燈都亮了,迎接新郎!',
    winVerse: '所以，你們要儆醒；因為那日子，那時辰，你們不知道。',
    winRef: '馬太福音 25:13',
    teachVerse: '聰明的拿著燈，又預備油在器皿裡。',
    teachRef: '馬太福音 25:4',
    teach: '儆醒不是提心吊膽,是歡歡喜喜地等——像知道爸爸快回家的孩子,早早把燈點好。預備油,就是天天親近主:讀祂的話、跟祂說話、愛身邊的人。這樣不管新郎哪一刻來,我們都笑著開門。',
    bind: '金繩捆一捆…',
    mapTitle: '🗺 關卡地圖',
    mapHint: '點亮過的關可重玩拿星星・⏱=限時衝刺關',
    sprintGo: (sec) => `⏱ 限時衝刺!${sec} 秒內收越多越好!`,
    sprintHud: (sec, p) => `⏱ ${sec} 秒・已收 ${p}`,
    review: '經文均經和合本逐句核對・牧者已審核',
  }

  const VOICES = { intro: 'voice/intro.mp3', bless: 'voice/bless.mp3', win: 'voice/win.mp3' }
  const ARK = { doorX: 812, doorY: 398 } // 飛行動物的落點(方舟門口)

  class Game {
    constructor(canvas) {
      this.cv = canvas
      this.ctx = canvas.getContext('2d')
      this.state = 'intro' // intro → play → close → win
      this.stopped = false
      this._raf = 0
      this._t = 0
      this._btns = []
      this._onDown = (e) => this._down(e)
      this._onKey = (e) => this._key(e)
      this._onResize = () => this._resize()
      this.grid = []
      this.sel = null
      this.lock = 0
      this.collected = 0
      this.flyers = [] // 上船中的動物
      this.birds = [] // 飛走中的烏鴉
      this.pops = [] // 收取瞬間的 Q 彈圈
      this.pending = null // 兩拍收取:第一拍=金繩捆好亮 0.7s
      this.shocks = [] // 💥 爆收衝擊波光環
      this.sparks = [] // 💥 爆收煙火
      this.confetti = []
      this.shakeBack = null
      this.toasts = []
      this.closeT = 0
      this.crowT = 14
      this.rainbowFxT = 0
      this.blessPlayed = false
      this.startT = 0
      this.level = 1
      this.goal = 0
      this.stars = {}
      this.sprint = false
      this.sprintT = 0
      this.lastStars = 1
      this._mapBtns = []
      this._audio = null
      this._voiceEl = null
      this.canFS = !!document.documentElement.requestFullscreen
      this.reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    boot() {
      this.cv.addEventListener('pointerdown', this._onDown)
      addEventListener('keydown', this._onKey)
      addEventListener('resize', this._onResize)
      document.addEventListener('fullscreenchange', this._onResize)
      this._resize()
      let last = performance.now()
      const loop = (now) => {
        if (this.stopped) return
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        this._t += dt
        this._update(dt)
        this._draw()
        this._raf = requestAnimationFrame(loop)
      }
      this._raf = requestAnimationFrame(loop)
    }

    destroy() {
      this.stopped = true
      cancelAnimationFrame(this._raf)
      this.cv.removeEventListener('pointerdown', this._onDown)
      removeEventListener('keydown', this._onKey)
      removeEventListener('resize', this._onResize)
      document.removeEventListener('fullscreenchange', this._onResize)
      try { this._voiceEl && this._voiceEl.pause() } catch {}
      try { this._audio && this._audio.close() } catch {}
    }

    _voice(key) {
      try {
        if (this._voiceEl) this._voiceEl.pause()
        this._voiceEl = new Audio(VOICES[key])
        this._voiceEl.volume = 1
        this._voiceEl.play().catch(() => {})
      } catch {}
    }

    _ping(suffix, t) {
      try { if (typeof window.__ping === 'function') window.__ping('oillamps-match3' + suffix, t) } catch {}
    }

    _pool() { return ANIMALS.slice(0, this.cfg.kinds) }
    _rand() { const p = this._pool(); return p[Math.floor(Math.random() * p.length)] }
    _pairs() { return Math.floor(this.collected / PAIR) }
    _isAnimal(k) { return !!k && k !== 'rainbow' && k !== 'crow' }

    _start(age, forceLv) {
      this.age = age
      this.cfg = AGES[age]
      this.level = forceLv || maxLevel(age)
      this.stars = loadStars(age)
      this.goal = levelGoal(this.cfg.goal, this.level)
      this.sprint = isSprint(this.level)
      this.sprintT = this.sprint ? (SPRINT_SECS[age] || 120) : 0
      const n = this.cfg.size
      this.grid = []
      for (let r = 0; r < n; r++) {
        this.grid.push([])
        for (let c = 0; c < n; c++) {
          let k
          do { k = this._rand() } while (
            (c >= 2 && this.grid[r][c - 1].kind === k && this.grid[r][c - 2].kind === k) ||
            (r >= 2 && this.grid[r - 1][c].kind === k && this.grid[r - 2][c].kind === k)
          )
          this.grid[r].push({ kind: k, dy: -(n - r) * 40 - 60, sq: 0, crowLife: 0 })
        }
      }
      this.sel = null
      this.lock = 0.5
      this.collected = 0
      this.flyers = []; this.birds = []; this.pops = []; this.toasts = []; this.confetti = []; this.shocks = []; this.sparks = []; this.pending = null
      this.crowT = 14
      this.blessPlayed = false
      this.state = 'play'
      this.startT = performance.now()
      if (this.sprint) this.toasts.push({ text: T.sprintGo(SPRINT_SECS[age] || 120), t: this._t })
      if (!this._hasMove()) this._shuffle(false)
      this._voice('intro')
      this._ping('-start')
    }

    // 盤面幾何(棋盤置中偏左,右側留給方舟)
    _geo() {
      const n = this.cfg.size
      const D = Math.min(430 / n, 60)
      const bw = D * n
      return { n, D, x0: VW * 0.37 - bw / 2, y0: (VH - bw) / 2 + 12 }
    }
    _cellXY(r, c, g) { return { x: g.x0 + c * g.D + g.D / 2, y: g.y0 + r * g.D + g.D / 2 } }

    // —— 配對邏輯(掃 run 線段:同款動物 3+ 連;烏鴉/彩虹不參與)——
    _scanRuns() {
      const n = this.cfg.size
      const runs = []
      for (let r = 0; r < n; r++) {
        let c = 0
        while (c < n) {
          const k = this.grid[r][c].kind
          if (!this._isAnimal(k)) { c++; continue }
          let len = 1
          while (c + len < n && this.grid[r][c + len].kind === k) len++
          if (len >= 3) { const cells = []; for (let i = 0; i < len; i++) cells.push({ r, c: c + i }); runs.push(cells) }
          c += len
        }
      }
      for (let c = 0; c < n; c++) {
        let r = 0
        while (r < n) {
          const k = this.grid[r][c].kind
          if (!this._isAnimal(k)) { r++; continue }
          let len = 1
          while (r + len < n && this.grid[r + len][c].kind === k) len++
          if (len >= 3) { const cells = []; for (let i = 0; i < len; i++) cells.push({ r: r + i, c }); runs.push(cells) }
          r += len
        }
      }
      return runs
    }

    _hasMatch() { return this._scanRuns().length > 0 }

    _hasMove() {
      const n = this.cfg.size
      const g = this.grid
      // 場上有彩虹=永遠有一手(點它就整排整列＋旁邊一圈上船)
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (g[r][c].kind === 'rainbow') return true
      const trySwap = (r1, c1, r2, c2) => {
        const a = g[r1][c1].kind, b = g[r2][c2].kind
        if (!this._isAnimal(a) || !this._isAnimal(b)) return false
        g[r1][c1].kind = b; g[r2][c2].kind = a
        const ok = this._hasMatch()
        g[r1][c1].kind = a; g[r2][c2].kind = b
        return ok
      }
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (c + 1 < n && trySwap(r, c, r, c + 1)) return true
        if (r + 1 < n && trySwap(r, c, r + 1, c)) return true
      }
      return false
    }

    _shuffle(toast = true) {
      const n = this.cfg.size
      const flat = []
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) flat.push(this.grid[r][c].kind)
      let tries = 0
      do {
        for (let i = flat.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [flat[i], flat[j]] = [flat[j], flat[i]] }
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { this.grid[r][c].kind = flat[r * n + c]; this.grid[r][c].dy = -40 }
      } while ((this._hasMatch() || !this._hasMove()) && ++tries < 60)
      this.lock = 0.4
      if (toast) { this.toasts.push({ text: T.shuffle, t: this._t }); this._tone(320, 0.15, 0, 'sine', 0.07) }
    }

    // 重力補位:非空往下沉,頂上生新動物(從遠方走來=神招聚,創 6:20)
    _gravity() {
      const g = this._geo()
      const n = this.cfg.size
      for (let c = 0; c < n; c++) {
        let write = n - 1
        for (let r = n - 1; r >= 0; r--) {
          if (this.grid[r][c].kind) {
            if (write !== r) {
              const src = this.grid[r][c]
              const dst = this.grid[write][c]
              dst.kind = src.kind; dst.crowLife = src.crowLife
              dst.dy = -(write - r) * g.D
              src.kind = null; src.crowLife = 0
            }
            write--
          }
        }
        for (let r = write; r >= 0; r--) {
          this.grid[r][c].kind = this._rand()
          this.grid[r][c].crowLife = 0
          this.grid[r][c].dy = -(write + 1) * g.D - 60
        }
      }
    }

    // 收取所有現成 3+ 連 → 4+ 連的中位格變彩虹方塊 → 重力補位;回傳收了幾隻
    _resolve() {
      const geo = this._geo()
      if (this.pending) {
        const { hit, rainbowAt } = this.pending
        this.pending = null
        let count = 0
        for (const key of hit) {
          const [r, c] = key.split(',').map(Number)
          const p = this._cellXY(r, c, geo)
          this.flyers.push({ sx: p.x, sy: p.y, x: p.x, y: p.y, kind: this.grid[r][c].kind, t: 0 })
          this.pops.push({ x: p.x, y: p.y, t: 0 })
          this.grid[r][c].kind = null
          count++
        }
        for (const rb of rainbowAt) {
          const cell = this.grid[rb.r][rb.c]
          cell.kind = 'rainbow'; cell.sq = 0.3
          this.toasts.push({ text: T.rainbowBorn, t: this._t })
          this._tone(659, 0.12, 0, 'triangle', 0.1); this._tone(784, 0.14, 0.1, 'triangle', 0.1); this._tone(988, 0.2, 0.2, 'triangle', 0.1)
        }
        this._gravity()
        this._tone(523, 0.1, 0, 'triangle', 0.1); this._tone(659, 0.14, 0.08, 'triangle', 0.1)
        return count
      }
      const runs = this._scanRuns()
      if (!runs.length) return 0
      const hit = new Set()
      const rainbowAt = []
      for (const run of runs) {
        if (run.length >= 4) rainbowAt.push(run[Math.floor(run.length / 2)])
        for (const p of run) hit.add(p.r + ',' + p.c)
      }
      for (const rb of rainbowAt) hit.delete(rb.r + ',' + rb.c)
      this.pending = { runs, hit, rainbowAt, t: this._t }
      this.toasts.push({ text: T.bind, t: this._t })
      this._tone(392, 0.1, 0, 'sine', 0.07)
      return -1
    }

    // 點彩虹:整排整列＋旁邊一圈一起上船(恩典多給;烏鴉被嚇飛,不算數也不扣分)
    _rainbowClear(r, c) {
      const g = this._geo()
      const n = this.cfg.size
      let count = 0
      const take = (rr, cc) => {
        const cell = this.grid[rr][cc]
        if (!cell.kind) return
        const p = this._cellXY(rr, cc, g)
        if (cell.kind === 'crow') { this.birds.push({ x: p.x, y: p.y, t: 0 }); cell.kind = null; cell.crowLife = 0; return }
        if (cell.kind === 'rainbow') { this.pops.push({ x: p.x, y: p.y, t: 0 }) }
        else { this.flyers.push({ sx: p.x, sy: p.y, x: p.x, y: p.y, kind: cell.kind, t: 0 }); this.pops.push({ x: p.x, y: p.y, t: 0 }); count++ }
        cell.kind = null
      }
      for (let cc = 0; cc < n; cc++) take(r, cc)
      for (let rr = 0; rr < n; rr++) if (rr !== r) take(rr, c)
      // 💥 爆收範圍加大(07-24,連鏈家族同款精神):整排整列＋旁邊一圈之外,周圍一圈也一起收
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const rr = r + dr, cc = c + dc
        if (rr >= 0 && cc >= 0 && rr < n && cc < n) take(rr, cc)
      }
      // 💥 擴散衝擊波光環(範圍看得見)+煙火 40 顆
      const pc0 = this._cellXY(r, c, g)
      this.shocks.push({ x: pc0.x, y: pc0.y, t: 0 })
      if (!this.reduced) {
        const FW = ['#ffd54a', '#ff8a5a', '#8ae08a', '#7ab8ff', '#e08ae0']
        for (let i = 0; i < 40; i++) {
          const a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 220
          this.sparks.push({ x: pc0.x, y: pc0.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0, color: FW[i % 5] })
        }
      }
      this.collected += count
      this.rainbowFxT = 1.6
      this.toasts.push({ text: T.rainbowGo, t: this._t })
      this._tone(523, 0.1, 0, 'triangle', 0.11); this._tone(659, 0.1, 0.09, 'triangle', 0.11); this._tone(784, 0.1, 0.18, 'triangle', 0.11); this._tone(1047, 0.22, 0.27, 'triangle', 0.1)
      if (!this.blessPlayed) { this.blessPlayed = true; this._voice('bless') }
      this._gravity()
      this.lock = 0.55
    }

    _update(dt) {
      if (this.state === 'close') {
        this.closeT -= dt
        if (this.closeT <= 0) this._win()
      }
      if (this.grid.length) {
        for (const row of this.grid) for (const cell of row) {
          if (cell.dy) {
            const before = cell.dy
            cell.dy += (0 - cell.dy) * Math.min(1, dt * 9)
            if (Math.abs(cell.dy) < 1) { cell.dy = 0; if (Math.abs(before) > 6) cell.sq = 0.22 } // 落地 Q 彈
          }
          if (cell.sq > 0) cell.sq = Math.max(0, cell.sq - dt)
        }
      }
      if (this.lock > 0) {
        this.lock -= dt
        if (this.lock <= 0 && this.state === 'play') {
          const got = this._resolve()
          if (got === -1) {
            this.lock = 0.7 // 第一拍:金繩捆好,亮著看清楚
          } else if (got) {
            this.collected += got
            this.toasts.push({ text: this.collected % (PAIR * 3) < 3 ? T.gather : T.cascade, t: this._t })
            this.lock = 0.8 // 連鎖放慢,享受觀察
          } else if (this._pairs() >= this.goal) {
            this.state = 'close'
            this.closeT = 2.4
            this._tone(392, 0.2, 0, 'triangle', 0.1); this._tone(523, 0.3, 0.18, 'triangle', 0.1)
          } else if (!this._hasMove()) this._shuffle()
        }
      }
      // ⏱ 衝刺關倒數:時間到=直接結算(收越多越好,不算輸)
      if (this.sprint && this.state === 'play') {
        this.sprintT -= dt
        if (this.sprintT <= 0) {
          this.sprintT = 0
          this.state = 'close'
          this.closeT = 1.6
          this._tone(392, 0.2, 0, 'triangle', 0.1); this._tone(523, 0.3, 0.18, 'triangle', 0.1)
        }
      }
      // 烏鴉:童/青檔不定時飛來,一陣子後自己飛走(創 8:7)
      if (this.state === 'play' && this.cfg && this.cfg.crow > 0) {
        this.crowT -= dt
        let crows = 0
        const n = this.cfg.size
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (this.grid[r][c].kind === 'crow') crows++
        if (this.crowT <= 0) {
          this.crowT = 10 + Math.random() * 5
          if (crows < this.cfg.crow && this.lock <= 0) {
            const r = Math.floor(Math.random() * n), c = Math.floor(Math.random() * n)
            const cell = this.grid[r][c]
            if (this._isAnimal(cell.kind)) {
              cell.kind = 'crow'; cell.crowLife = 12; cell.sq = 0.25
              this.toasts.push({ text: T.crowCome, t: this._t })
              this._tone(190, 0.1, 0, 'sawtooth', 0.06); this._tone(160, 0.12, 0.12, 'sawtooth', 0.06)
            }
          }
        }
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
          const cell = this.grid[r][c]
          if (cell.kind === 'crow') {
            cell.crowLife -= dt
            if (cell.crowLife <= 0) {
              const p = this._cellXY(r, c, this._geo())
              this.birds.push({ x: p.x, y: p.y, t: 0 })
              cell.kind = null
              this.toasts.push({ text: T.crowGo, t: this._t })
              this._gravity()
              if (this.lock <= 0) this.lock = 0.35
            }
          }
        }
      }
      if (this.shakeBack) { this.shakeBack.t -= dt; if (this.shakeBack.t <= 0) this.shakeBack = null }
      for (const f of this.flyers) {
        f.t += dt * 1.4
        const k = Math.min(1, f.t)
        const ease = k * k * (3 - 2 * k)
        f.x = f.sx + (ARK.doorX - f.sx) * ease
        f.y = f.sy + (ARK.doorY - f.sy) * ease - Math.sin(k * Math.PI) * 70
      }
      this.flyers = this.flyers.filter((f) => f.t < 1)
      for (const b of this.birds) { b.t += dt; b.x += dt * 260; b.y -= dt * 150 }
      this.birds = this.birds.filter((b) => b.t < 1.6)
      for (const p of this.pops) p.t += dt * 3
      this.pops = this.pops.filter((p) => p.t < 1)
      for (const sfx of this.shocks) sfx.t += dt * 1.8
      this.shocks = this.shocks.filter((sfx) => sfx.t < 1)
      for (const sp of this.sparks) { sp.t += dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 260 * dt }
      this.sparks = this.sparks.filter((sp) => sp.t < 0.9)
      if (this.rainbowFxT > 0) this.rainbowFxT -= dt
      for (const c of this.confetti) { c.y += c.vy * dt; c.x += c.vx * dt; c.rot += c.vr * dt }
      this.confetti = this.confetti.filter((c) => c.y < VH + 20)
      this.toasts = this.toasts.filter((t) => this._t - t.t < 1.8)
    }

    _win() {
      this.state = 'win'
      // ★ 星星:衝刺關看收取量;一般關看用時
      const secsSt = Math.max(1, (performance.now() - this.startT) / 1000)
      this.lastStars = this.sprint
        ? (this._pairs() >= this.goal ? 3 : this._pairs() >= this.goal * 0.6 ? 2 : 1)
        : (secsSt <= this.goal * 4.5 ? 3 : secsSt <= this.goal * 7 ? 2 : 1)
      if ((this.stars[this.level] | 0) < this.lastStars) {
        this.stars[this.level] = this.lastStars
        saveStars(this.age, this.stars)
      }
      bumpLevel(this.age, this.level + 1)
      this._tone(523, 0.15); this._tone(659, 0.15, 0.14); this._tone(784, 0.3, 0.28)
      this._voice('win')
      this._ping('-done', Math.max(1, Math.round((performance.now() - this.startT) / 1000)))
      if (!this.reduced) {
        const COLORS = ['#e8524a', '#f0a030', '#f5d90a', '#58b368', '#4a90d9', '#9068be']
        for (let i = 0; i < 70; i++) {
          this.confetti.push({
            x: Math.random() * VW, y: -20 - Math.random() * 160,
            vx: (Math.random() - 0.5) * 60, vy: 90 + Math.random() * 120,
            rot: Math.random() * 7, vr: (Math.random() - 0.5) * 8,
            w: 7 + Math.random() * 6, h: 5 + Math.random() * 4,
            color: COLORS[i % COLORS.length],
          })
        }
      }
    }

    _key(e) {
      if (this.state === 'intro') {
        if (e.key === '1') { this.age = 'young'; this.state = 'map'; return }
        if (e.key === '2' || e.key === 'Enter') { this.age = 'kid'; this.state = 'map'; return }
        if (e.key === '3') { this.age = 'teen'; this.state = 'map'; return }
      } else if (this.state === 'map' && e.key === 'Enter') {
        return this._start(this.age, maxLevel(this.age))
      }
    }

    _pt(e) {
      const r = this.cv.getBoundingClientRect()
      const px = ((e.clientX - r.left) / r.width) * this.W
      const py = ((e.clientY - r.top) / r.height) * this.H
      const { s, ox, oy } = this._view()
      return { x: (px - ox) / s, y: (py - oy) / s }
    }

    _down(e) {
      const { x, y } = this._pt(e)
      // 全螢幕鈕(所有狀態都吃)
      if (this.canFS && x >= VW - 46 && x <= VW - 10 && y >= 8 && y <= 44) {
        try {
          if (document.fullscreenElement) document.exitFullscreen()
          else document.documentElement.requestFullscreen()
        } catch {}
        return
      }
      if (this.state === 'intro') {
        for (const b of this._btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { this.age = b.key; this.state = 'map'; return }
        return
      }
      if (this.state === 'map') {
        for (const b of this._mapBtns) {
          if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            if (b.lv === 0) { this.state = 'intro'; return }
            return this._start(this.age, b.lv)
          }
        }
        return
      }
      if (this.state === 'win') {
        // 勝利卡按鈕用原始畫布座標(卡片不吃 960×540 轉換)
        const r0 = this.cv.getBoundingClientRect()
        const rx = ((e.clientX - r0.left) / r0.width) * this.W
        const ry = ((e.clientY - r0.top) / r0.height) * this.H
        for (const b of this._winBtns || []) {
          if (rx >= b.x && rx <= b.x + b.w && ry >= b.y && ry <= b.y + b.h) {
            if (b.action === 'next') return this._start(this.age, this.level + 1)
            if (b.action === 'replay') return this._start(this.age, this.level)
            if (b.action === 'lobby') { try { location.href = 'https://hfpc-bible-games.summer09201017.workers.dev/' } catch {} return }
            this.state = 'map'; this.confetti = [] // 🗺 關卡地圖
            return
          }
        }
        return
      }
      if (this.state !== 'play' || this.lock > 0) return
      const g = this._geo()
      const c = Math.floor((x - g.x0) / g.D)
      const r = Math.floor((y - g.y0) / g.D)
      if (r < 0 || c < 0 || r >= g.n || c >= g.n) { this.sel = null; return }
      const cell = this.grid[r][c]
      if (cell.kind === 'rainbow') { this.sel = null; return this._rainbowClear(r, c) }
      if (cell.kind === 'crow') {
        this.shakeBack = { a: { r, c }, b: { r, c }, t: 0.3 }
        this.toasts.push({ text: T.crowCome, t: this._t })
        this._tone(190, 0.08, 0, 'sawtooth', 0.05)
        this.sel = null
        return
      }
      if (!this.sel) { this.sel = { r, c }; cell.sq = 0.2; this._tone(500, 0.05, 0, 'sine', 0.05); return }
      const { r: r0, c: c0 } = this.sel
      if (r0 === r && c0 === c) { this.sel = null; return }
      const adjacent = Math.abs(r0 - r) + Math.abs(c0 - c) === 1
      if (!adjacent) { this.sel = { r, c }; cell.sq = 0.2; this._tone(500, 0.05, 0, 'sine', 0.05); return }
      const a = this.grid[r0][c0], b = this.grid[r][c]
      ;[a.kind, b.kind] = [b.kind, a.kind]
      if (this._hasMatch()) {
        this.sel = null
        a.sq = 0.22; b.sq = 0.22
        this.lock = 0.05
        this._tone(440, 0.06, 0, 'sine', 0.07)
      } else {
        ;[a.kind, b.kind] = [b.kind, a.kind]
        this.shakeBack = { a: { r: r0, c: c0 }, b: { r, c }, t: 0.35 }
        this.toasts.push({ text: T.noswap, t: this._t })
        this.sel = null
        this._tone(220, 0.1, 0, 'sine', 0.06)
      }
    }

    _tone(freq, dur, delay = 0, type = 'triangle', vol = 0.14) {
      try {
        if (!this._audio) this._audio = new (window.AudioContext || window.webkitAudioContext)()
        const ctx = this._audio
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = type; o.frequency.value = freq
        g.gain.setValueAtTime(0.0001, ctx.currentTime + delay)
        g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + delay + 0.015)
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur)
        o.connect(g).connect(ctx.destination)
        o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + dur + 0.03)
      } catch {}
    }

    _resize() {
      const s = Math.min(devicePixelRatio || 1, 2)
      this.cv.width = Math.round(innerWidth * s)
      this.cv.height = Math.round(innerHeight * s)
      this.cv.style.width = innerWidth + 'px'
      this.cv.style.height = innerHeight + 'px'
      this.W = this.cv.width; this.H = this.cv.height
    }

    _view() {
      const s = Math.min(this.W / VW, this.H / VH)
      return { s, ox: (this.W - VW * s) / 2, oy: (this.H - VH * s) / 2 }
    }

    // ══════════════════ 繪圖 ══════════════════

    _draw() {
      const { ctx, W, H } = this
      if (!W) return
      // 雨前的天空+青草地
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#16213c'); sky.addColorStop(0.55, '#243654'); sky.addColorStop(0.72, '#2c3a34'); sky.addColorStop(1, '#26321e')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
      const { s, ox, oy } = this._view()
      ctx.save()
      ctx.setTransform(s, 0, 0, s, ox, oy)
      this._clouds()
      if (this.state === 'intro') { this._drawIntro(); this._fsBtn(); ctx.restore(); return }
      if (this.state === 'map') { this._drawMap(); this._fsBtn(); ctx.restore(); return }
      const g = this._geo()
      // 草地盤面底
      ctx.fillStyle = 'rgba(120,140,180,0.2)'
      rR(ctx, g.x0 - 10, g.y0 - 10, g.D * g.n + 20, g.D * g.n + 20, 16); ctx.fill()
      ctx.strokeStyle = 'rgba(180,200,255,0.14)'; ctx.lineWidth = 1
      for (let i = 1; i < g.n; i++) {
        ctx.beginPath(); ctx.moveTo(g.x0 + i * g.D, g.y0); ctx.lineTo(g.x0 + i * g.D, g.y0 + g.n * g.D); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(g.x0, g.y0 + i * g.D); ctx.lineTo(g.x0 + g.n * g.D, g.y0 + i * g.D); ctx.stroke()
      }
      // 方舟(先畫,動物飛過去落在它前面)
      this._ark()
      // 動物們
      for (let r = 0; r < g.n; r++) for (let c = 0; c < g.n; c++) {
        const cell = this.grid[r][c]
        if (!cell.kind) continue
        const p = this._cellXY(r, c, g)
        let dx = 0
        if (this.shakeBack) {
          const sb = this.shakeBack
          if ((sb.a.r === r && sb.a.c === c) || (sb.b.r === r && sb.b.c === c)) dx = Math.sin(this._t * 40) * 3
        }
        const selHere = this.sel && this.sel.r === r && this.sel.c === c
        if (selHere) {
          ctx.strokeStyle = '#f0b030'; ctx.lineWidth = 3
          rR(ctx, g.x0 + c * g.D + 3, g.y0 + r * g.D + 3, g.D - 6, g.D - 6, 12); ctx.stroke()
        }
        this._tsum(ctx, p.x + dx, p.y + cell.dy, g.D * 0.4, cell.kind, cell.sq, selHere)
      }
      // 🪢 金繩捆帶:pending 的每條排,金繩把頭尾綁起來+中點繩結+格子亮(先看清楚是一排,再收)
      if (this.pending) {
        const blink = 0.55 + 0.45 * Math.sin((this._t - this.pending.t) * 10)
        for (const run of this.pending.runs) {
          const a = this._cellXY(run[0].r, run[0].c, g)
          const b = this._cellXY(run[run.length - 1].r, run[run.length - 1].c, g)
          ctx.globalAlpha = blink
          for (const p0 of run) {
            const p = this._cellXY(p0.r, p0.c, g)
            ctx.fillStyle = 'rgba(255,225,130,0.35)'
            ctx.beginPath(); ctx.arc(p.x, p.y + this.grid[p0.r][p0.c].dy, g.D * 0.46, 0, 7); ctx.fill()
          }
          ctx.strokeStyle = '#d8a840'; ctx.lineWidth = 5; ctx.lineCap = 'round'
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          ctx.lineCap = 'butt'
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
          ctx.fillStyle = '#b07828'
          ctx.beginPath(); ctx.arc(mx, my, 7, 0, 7); ctx.fill()
          ctx.strokeStyle = '#b07828'; ctx.lineWidth = 3
          ctx.beginPath(); ctx.moveTo(mx - 8, my + 8); ctx.lineTo(mx + 8, my - 8); ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
      // Q 彈圈(收取瞬間)
      for (const p of this.pops) {
        ctx.globalAlpha = 1 - p.t
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.arc(p.x, p.y, 10 + p.t * 26, 0, 7); ctx.stroke()
        ctx.globalAlpha = 1
      }
      // 💥 爆收衝擊波光環(雙圈擴散)+煙火
      for (const sfx of this.shocks) {
        const k = sfx.t
        ctx.globalAlpha = (1 - k) * 0.9
        ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 6 * (1 - k) + 2
        ctx.beginPath(); ctx.arc(sfx.x, sfx.y, 24 + k * 300, 0, 7); ctx.stroke()
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.arc(sfx.x, sfx.y, 12 + k * 210, 0, 7); ctx.stroke()
        ctx.globalAlpha = 1
      }
      for (const sp of this.sparks) {
        ctx.globalAlpha = Math.max(0, 1 - sp.t / 0.9)
        ctx.fillStyle = sp.color
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 3.2, 0, 7); ctx.fill()
        ctx.globalAlpha = 1
      }
      // 上船中的動物(飛行途中縮小一點)
      for (const f of this.flyers) this._tsum(ctx, f.x, f.y, 17 * (1 - f.t * 0.25), f.kind, 0.1)
      // 飛走的烏鴉
      for (const b of this.birds) {
        ctx.globalAlpha = Math.max(0, 1 - b.t / 1.6)
        this._tsum(ctx, b.x, b.y, 15, 'crow', 0)
        ctx.globalAlpha = 1
      }
      // 彩虹特效(用彩虹方塊時,方舟上空掛一道虹)
      if (this.rainbowFxT > 0) this._rainbowArc(Math.min(1, this.rainbowFxT / 0.4))
      // 漂浮字
      for (const t of this.toasts) {
        const k = (this._t - t.t) / 1.8
        ctx.globalAlpha = 1 - k
        ctx.fillStyle = '#2c3c1c'; ctx.strokeStyle = 'rgba(255,255,250,0.92)'; ctx.lineWidth = 4
        ctx.font = 'bold 19px "Noto Sans TC","Microsoft JhengHei",sans-serif'
        ctx.textAlign = 'center'
        ctx.strokeText(t.text, VW * 0.37, 40 - k * 14)
        ctx.fillText(t.text, VW * 0.37, 40 - k * 14)
        ctx.globalAlpha = 1
      }
      // 關門句
      if (this.state === 'close' || this.state === 'win') {
        ctx.fillStyle = '#f4ecd0'
        ctx.font = 'bold 20px "Noto Sans TC","Microsoft JhengHei",sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(T.closeLine, VW / 2, VH - 26)
      }
      // HUD
      ctx.fillStyle = 'rgba(44,60,28,0.62)'
      rR(ctx, VW * 0.16, VH - 44, VW * 0.44, 30, 12); ctx.fill()
      ctx.fillStyle = '#f4f8e8'
      ctx.font = 'bold 15px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        this.sprint
          ? `第 ${this.level} 關 ${T.sprintHud(Math.ceil(this.sprintT), this._pairs())} ・ 點兩隻相鄰的交換`
          : `第 ${this.level} 關 ${T.hud(this._pairs(), this.goal)} ・ 點兩隻相鄰的交換`,
        VW * 0.38, VH - 24)
      this._fsBtn()
      // 彩帶
      for (const c of this.confetti) {
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot)
        ctx.fillStyle = c.color; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h)
        ctx.restore()
      }
      ctx.restore()
      if (this.state === 'win') this._drawWinCard()
    }

    _clouds() {
      const { ctx } = this
      for (let i = 0; i < 26; i++) {
        const x = (i * 97 + 40) % VW
        const y = (i * 53 + 20) % 150
        const tw = 0.35 + 0.55 * Math.abs(Math.sin(this._t * 1.6 + i * 1.7))
        ctx.fillStyle = `rgba(255,244,200,${tw})`
        ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 2.2 : 1.4, 0, 7); ctx.fill()
      }
      // 月亮
      ctx.fillStyle = 'rgba(250,240,200,0.9)'
      ctx.beginPath(); ctx.arc(96, 60, 22, 0, 7); ctx.fill()
      ctx.fillStyle = 'rgba(22,33,60,0.85)'
      ctx.beginPath(); ctx.arc(104, 54, 19, 0, 7); ctx.fill()
    }

    _fsBtn() {
      if (!this.canFS) return
      const { ctx } = this
      ctx.fillStyle = 'rgba(44,60,28,0.5)'
      rR(ctx, VW - 44, 10, 32, 32, 8); ctx.fill()
      ctx.strokeStyle = '#f4f8e8'; ctx.lineWidth = 2.5
      const x = VW - 44, y = 10
      for (const [mx, my, lx, ly] of [[8, 13, 8, 8], [13, 8, 8, 8], [24, 8, 24, 8], [24, 8, 24, 13], [8, 19, 8, 24], [8, 24, 13, 24], [19, 24, 24, 24], [24, 24, 24, 19]]) {
        ctx.beginPath(); ctx.moveTo(x + mx, y + my); ctx.lineTo(x + lx, y + ly); ctx.stroke()
      }
    }

    // 燈檯:右側大燈架,一格=一盞燈(點亮=油夠了)
    _ark() {
      const { ctx } = this
      const goal = this.goal
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
      const cols = goal > 120 ? 9 : goal > 90 ? 8 : goal > 64 ? 7 : goal > 48 ? 6 : goal > 36 ? 5 : goal > 24 ? 4 : goal > 16 ? 3 : 2
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

    _rainbowArc(alpha) {
      const { ctx } = this
      const COLORS = ['#fff2c0', '#ffe9a0', '#ffd77a', '#f0b850', '#e09838', '#c87820']
      ctx.save()
      ctx.globalAlpha = 0.75 * alpha
      ctx.lineWidth = 7
      COLORS.forEach((col, i) => {
        ctx.strokeStyle = col
        ctx.beginPath()
        ctx.arc(852, 330, 210 - i * 8, Math.PI * 1.05, Math.PI * 1.72)
        ctx.stroke()
      })
      ctx.restore()
    }

    // ══════ tsum 圓萌動物(可愛的 80% 在動畫:squash & stretch)══════
    _tsum(ctx, x, y, r, kind, sq = 0, glow = false) {
      const k = Math.max(0, sq)
      const wob = Math.sin((k / 0.25) * Math.PI)
      const sx = 1 + wob * 0.22, sy = 1 - wob * 0.22
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(sx, sy)
      if (glow) {
        ctx.fillStyle = 'rgba(255,240,180,0.4)'
        ctx.beginPath(); ctx.arc(0, 0, r * 1.35, 0, 7); ctx.fill()
      }
      // ★ 07-24 立體化:地面軟影+徑向漸層球體+頂光弧(家族美術範式 v2)
      const body = (color, line) => {
        ctx.fillStyle = 'rgba(40,50,25,0.18)'
        ctx.beginPath(); ctx.ellipse(0, r * 0.92, r * 0.78, r * 0.22, 0, 0, 7); ctx.fill()
        const grd = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.12)
        grd.addColorStop(0, tint(color, 0.45))
        grd.addColorStop(0.55, color)
        grd.addColorStop(1, shadeHex(color, 0.22))
        ctx.fillStyle = grd
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill()
        ctx.strokeStyle = line; ctx.lineWidth = Math.max(1.5, r * 0.07)
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke()
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'
        ctx.lineWidth = Math.max(1.5, r * 0.09); ctx.lineCap = 'round'
        ctx.beginPath(); ctx.arc(0, 0, r * 0.78, Math.PI * 1.12, Math.PI * 1.48); ctx.stroke()
        ctx.lineCap = 'butt'
      }
      const face = (fy = 0) => {
        const er = r * 0.14
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(-r * 0.32, fy - r * 0.1, er * 1.55, 0, 7); ctx.fill()
        ctx.beginPath(); ctx.arc(r * 0.32, fy - r * 0.1, er * 1.55, 0, 7); ctx.fill()
        ctx.fillStyle = '#2c2416'
        ctx.beginPath(); ctx.arc(-r * 0.3, fy - r * 0.08, er, 0, 7); ctx.fill()
        ctx.beginPath(); ctx.arc(r * 0.34, fy - r * 0.08, er, 0, 7); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(-r * 0.34, fy - r * 0.14, er * 0.42, 0, 7); ctx.fill()
        ctx.beginPath(); ctx.arc(r * 0.3, fy - r * 0.14, er * 0.42, 0, 7); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.beginPath(); ctx.arc(-r * 0.26, fy - r * 0.03, er * 0.2, 0, 7); ctx.fill()
        ctx.beginPath(); ctx.arc(r * 0.38, fy - r * 0.03, er * 0.2, 0, 7); ctx.fill()
        ctx.fillStyle = 'rgba(240,120,120,0.4)' // 腮紅
        ctx.beginPath(); ctx.arc(-r * 0.52, fy + r * 0.18, er * 1.2, 0, 7); ctx.fill()
        ctx.beginPath(); ctx.arc(r * 0.52, fy + r * 0.18, er * 1.2, 0, 7); ctx.fill()
        ctx.strokeStyle = '#4a3420'; ctx.lineWidth = Math.max(1.2, r * 0.05) // 微笑
        ctx.beginPath(); ctx.arc(0, fy + r * 0.12, r * 0.18, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke()
      }
      if (kind === 'amphora') { // 赤陶雙耳壺
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
        ctx.font = `bold ${Math.max(8, r * 0.34)}px sans-serif`
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
        ctx.fillStyle = `rgba(255,220,120,${tw})`
        ctx.beginPath()
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 - Math.PI / 2
          const rr = i % 2 === 0 ? r * 0.2 : r * 0.09
          const px = r * 0.62 + Math.cos(ang) * rr, py = -r * 0.62 + Math.sin(ang) * rr
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath(); ctx.fill()
      }
      ctx.restore()
    }

    _drawIntro() {
      const { ctx } = this
      ctx.fillStyle = 'rgba(252,250,240,0.95)'
      ctx.strokeStyle = '#9a8450'; ctx.lineWidth = 3
      rR(ctx, VW * 0.08, VH * 0.05, VW * 0.84, VH * 0.9, 18); ctx.fill(); ctx.stroke()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#4a3c16'
      ctx.font = 'bold 34px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText(T.title, VW / 2, VH * 0.16)
      ctx.fillStyle = '#8a7a4a'
      ctx.font = '16px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText(T.ref + ' ・ 儆醒預備', VW / 2, VH * 0.23)
      ctx.fillStyle = '#3e3418'
      wrap(ctx, T.intro1, VW / 2, VH * 0.3, VW * 0.7, 23)
      wrap(ctx, T.how, VW / 2, VH * 0.42, VW * 0.7, 22)
      // 三隻示範動物(tsum 皮開門見山)
      this._tsum(ctx, VW * 0.32, VH * 0.63, 26, 'amphora', 0.25 * Math.abs(Math.sin(this._t * 2)))
      this._tsum(ctx, VW * 0.5, VH * 0.63, 26, 'bowl', 0.25 * Math.abs(Math.sin(this._t * 2 + 1)))
      this._tsum(ctx, VW * 0.68, VH * 0.63, 26, 'flask', 0.25 * Math.abs(Math.sin(this._t * 2 + 2)))
      ctx.fillStyle = '#8a7a4a'
      ctx.font = '16px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText(T.pick, VW / 2, VH * 0.72)
      this._btns = []
      const bw = VW * 0.2, bh = VH * 0.12, gap = VW * 0.04
      const x0 = VW / 2 - bw * 1.5 - gap
      Object.entries(AGES).forEach(([key, a], i) => {
        const x = x0 + i * (bw + gap), y = VH * 0.76
        ctx.fillStyle = '#bcd88a'
        rR(ctx, x, y, bw, bh, 14); ctx.fill()
        ctx.fillStyle = '#2c3608'
        ctx.font = 'bold 20px "Noto Sans TC","Microsoft JhengHei",sans-serif'
        ctx.fillText(a.label, x + bw / 2, y + bh * 0.42)
        ctx.font = '12px "Noto Sans TC","Microsoft JhengHei",sans-serif'
        ctx.fillText(a.desc, x + bw / 2, y + bh * 0.78)
        this._btns.push({ x, y, w: bw, h: bh, key })
      })
      ctx.fillStyle = '#a89868'
      ctx.font = '11px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText(T.review, VW / 2, VH * 0.95)
    }

    // 🗺 關卡地圖(tsum 三包移植,橫版蛇行 12 節點+星星+🔒+⏱;點過的關可重玩拿星)
    _drawMap() {
      const { ctx } = this
      const a = AGES[this.age] || AGES.kid
      const maxLv = maxLevel(this.age)
      this.stars = loadStars(this.age)
      ctx.fillStyle = 'rgba(252,250,240,0.95)'
      ctx.strokeStyle = '#9a8450'; ctx.lineWidth = 3
      rR(ctx, VW * 0.06, VH * 0.04, VW * 0.88, VH * 0.92, 18); ctx.fill(); ctx.stroke()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#4a3c16'
      ctx.font = 'bold 26px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText(T.mapTitle, VW / 2, VH * 0.13)
      ctx.fillStyle = '#8a7a4a'
      ctx.font = '15px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText(`${a.label}・已走到第 ${maxLv} 關 ・ ${T.mapHint}`, VW / 2, VH * 0.2)
      this._mapBtns = []
      const start = Math.max(1, maxLv - 7)
      const COLS = 4
      for (let i = 0; i < 12; i++) {
        const lv = start + i, row = Math.floor(i / COLS)
        let col = i % COLS
        if (row % 2 === 1) col = COLS - 1 - col
        const nx = VW * 0.2 + col * VW * 0.2, ny = VH * 0.33 + row * VH * 0.19
        if (i > 0) {
          const pr = Math.floor((i - 1) / COLS)
          let pc = (i - 1) % COLS
          if (pr % 2 === 1) pc = COLS - 1 - pc
          ctx.strokeStyle = 'rgba(154,132,80,0.3)'; ctx.lineWidth = 8; ctx.lineCap = 'round'
          ctx.beginPath(); ctx.moveTo(VW * 0.2 + pc * VW * 0.2, VH * 0.33 + pr * VH * 0.19); ctx.lineTo(nx, ny); ctx.stroke()
          ctx.lineCap = 'butt'
        }
        const unlocked = lv <= maxLv, cur = lv === maxLv, sp = isSprint(lv), st = this.stars[lv] | 0
        ctx.fillStyle = !unlocked ? 'rgba(90,80,50,0.16)' : sp ? '#c9662a' : '#6a9440'
        ctx.beginPath(); ctx.arc(nx, ny, 30, 0, 7); ctx.fill()
        if (cur) {
          ctx.strokeStyle = '#e8a020'; ctx.lineWidth = 4 + 1.5 * Math.sin(this._t * 5)
          ctx.beginPath(); ctx.arc(nx, ny, 36, 0, 7); ctx.stroke()
        }
        ctx.fillStyle = unlocked ? '#fff' : 'rgba(90,80,50,0.55)'
        ctx.font = 'bold 20px "Noto Sans TC","Microsoft JhengHei",sans-serif'
        ctx.fillText(unlocked ? String(lv) : '🔒', nx, ny + 7)
        if (sp) { ctx.font = '13px sans-serif'; ctx.fillText('⏱', nx, ny - 12) }
        if (unlocked) {
          ctx.fillStyle = '#e8a020'; ctx.font = '14px sans-serif'
          ctx.fillText(st ? '★★★'.slice(0, st) : (cur ? '▶' : ''), nx, ny + 48)
          this._mapBtns.push({ x: nx - 34, y: ny - 34, w: 68, h: 68, lv })
        }
      }
      const bw = VW * 0.26, bh = VH * 0.09, by = VH * 0.86
      ctx.fillStyle = '#f0d080'; ctx.strokeStyle = '#7a9450'; ctx.lineWidth = 2
      rR(ctx, VW / 2 - bw - 12, by, bw, bh, 12); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#4a3608'
      ctx.font = 'bold 18px "Noto Sans TC","Microsoft JhengHei",sans-serif'
      ctx.fillText(`▶ 繼續:第 ${maxLv} 關${isSprint(maxLv) ? '(⏱限時)' : ''}`, VW / 2 - bw / 2 - 12, by + bh * 0.64)
      this._mapBtns.push({ x: VW / 2 - bw - 12, y: by, w: bw, h: bh, lv: maxLv })
      ctx.fillStyle = '#bcd88a'
      rR(ctx, VW / 2 + 12, by, bw, bh, 12); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#2c3608'
      ctx.fillText('← 換年齡檔', VW / 2 + 12 + bw / 2, by + bh * 0.64)
      this._mapBtns.push({ x: VW / 2 + 12, y: by, w: bw, h: bh, lv: 0 })
    }

    _drawWinCard() {
      const { ctx, W, H } = this
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      const x = W * 0.1, y = H * 0.07, w = W * 0.8, h = H * 0.86
      ctx.fillStyle = '#fcf9ee'
      ctx.strokeStyle = '#9a8450'; ctx.lineWidth = 3
      rR(ctx, x, y, w, h, 18); ctx.fill(); ctx.stroke()
      // 卡上小虹
      const COLORS = ['#fff2c0', '#ffe9a0', '#ffd77a', '#f0b850', '#e09838', '#c87820']
      ctx.lineWidth = Math.max(3, H * 0.008)
      COLORS.forEach((col, i) => {
        ctx.strokeStyle = col
        ctx.beginPath(); ctx.arc(W / 2, H * 0.3, H * (0.17 - i * 0.014), Math.PI * 1.1, Math.PI * 1.9); ctx.stroke()
      })
      ctx.textAlign = 'center'
      ctx.fillStyle = '#4a3c16'
      ctx.font = `bold ${Math.max(20, H * 0.055)}px "Noto Sans TC","Microsoft JhengHei",sans-serif`
      ctx.fillText(T.winTitle, W / 2, H * 0.16)
      ctx.fillStyle = '#e8a020'
      ctx.font = `${Math.max(18, H * 0.05)}px "Noto Sans TC","Microsoft JhengHei",sans-serif`
      ctx.fillText('★★★'.slice(0, this.lastStars) + '☆☆☆'.slice(0, 3 - this.lastStars), W / 2, H * 0.295)
      ctx.fillStyle = '#8a7a4a'
      ctx.font = `${Math.max(12, H * 0.03)}px "Noto Sans TC","Microsoft JhengHei",sans-serif`
      ctx.fillText(`點亮 ${this.goal} 盞——油在器皿裡,歡喜等候`, W / 2, H * 0.235)
      ctx.fillStyle = '#3e3418'
      wrap(ctx, `「${T.winVerse}」(${T.winRef})`, W / 2, H * 0.36, W * 0.68, H * 0.045)
      ctx.fillStyle = '#5a4a90'
      wrap(ctx, `「${T.teachVerse}」(${T.teachRef})`, W / 2, H * 0.5, W * 0.68, H * 0.041)
      ctx.fillStyle = '#3e3418'
      wrap(ctx, T.teach, W / 2, H * 0.59, W * 0.68, H * 0.04)
      // 再玩一次 / 選難度
      this._winBtns = []
      const nextGoal = levelGoal(this.cfg.goal, this.level + 1)
      const nextLabel = isSprint(this.level + 1) ? '⏱ 下一關(限時)' : `⭐ 下一關(目標 ${nextGoal})`
      const bw = W * 0.185, bh = H * 0.085, by = y + h - bh - H * 0.03, gap = W * 0.012
      const defs = [
        { label: nextLabel, action: 'next' },
        { label: '🗺 關卡地圖', action: 'map' },
        { label: '🔁 再玩一次', action: 'replay' },
        { label: '← 回大廳', action: 'lobby' },
      ]
      const x0 = W / 2 - (bw * 2 + gap * 1.5)
      defs.forEach((d, i) => {
        const bx = x0 + i * (bw + gap)
        ctx.fillStyle = i === 0 ? '#f0d080' : '#bcd88a'
        ctx.strokeStyle = '#7a9450'; ctx.lineWidth = 2
        rR(ctx, bx, by, bw, bh, 12); ctx.fill(); ctx.stroke()
        ctx.fillStyle = '#2c3608'
        ctx.font = `bold ${Math.max(12, H * 0.028)}px "Noto Sans TC","Microsoft JhengHei",sans-serif`
        ctx.fillText(d.label, bx + bw / 2, by + bh * 0.62)
        this._winBtns.push({ x: bx, y: by, w: bw, h: bh, action: d.action })
      })
      ctx.restore()
    }
  }

  function rR(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h) }
  function hexRGB(hex) {
    const h = hex.replace('#', '')
    const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
  }
  function tint(hex, k) { try { const [r2, g2, b2] = hexRGB(hex); return `rgb(${Math.round(r2 + (255 - r2) * k)},${Math.round(g2 + (255 - g2) * k)},${Math.round(b2 + (255 - b2) * k)})` } catch { return hex } }
  function shadeHex(hex, k) { try { const [r2, g2, b2] = hexRGB(hex); return `rgb(${Math.round(r2 * (1 - k))},${Math.round(g2 * (1 - k))},${Math.round(b2 * (1 - k))})` } catch { return hex } }
  function wrap(ctx, text, cx, y, maxW, lineH) {
    ctx.font = `${lineH * 0.72}px "Noto Sans TC","Microsoft JhengHei",sans-serif`
    let line = '', yy = y
    for (const ch of String(text)) {
      if (ctx.measureText(line + ch).width > maxW) { ctx.fillText(line, cx, yy); line = ch; yy += lineH }
      else line += ch
    }
    if (line) ctx.fillText(line, cx, yy)
  }

  const game = new Game(document.getElementById('cv'))
  game.boot()
  // Playwright / 無頭驗證掛勾
  window.__game = game
  window.__m3 = {
    start: (age, lv) => game._start(age || 'kid', lv || 1),
    gotoLevel: (lv) => game._start(game.age || 'kid', lv),
    state: () => ({
      state: game.state,
      collected: game.collected,
      pairs: game._pairs(),
      goal: game.goal,
      level: game.level,
      sprint: game.sprint,
      sprintT: Math.round(game.sprintT),
      stars: game.lastStars,
      hasMove: game.state === 'play' ? game._hasMove() : null,
    }),
  }
})()
