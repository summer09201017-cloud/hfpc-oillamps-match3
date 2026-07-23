# 🪔 十童女・預備油(hfpc-oillamps-match3)

「Candy 骨架 + tsum 皮」系列第三發(大表 A29),fork 自 hfpc-noahark-match3。
swap 三消反向化:三連=**倒油入燈**(燈檯一盞盞亮)、每 3 滴油點亮一盞(PAIR=3)、永不會輸。

- 經文:太 25:4、25:7、25:13——**均經 cuv MCP 逐字查證(和合本)**
- ⚠ **神學邊界(牧者核可條件)**:只做「預備油」的正面面;**不做關門拒絕戲**;
  儆醒(25:13)講成「歡歡喜喜等候新郎」的盼望,不是恐嚇
- 六款器皿 tsum 臉(陶壺/瓷罐/玻瓶/皮囊/油碗/紫罐)+瞌睡雲搗蛋鬼(25:5)+火光方塊(4 連,整排整列入燈)
- 夜半星空+月亮場景;年齡三檔:幼 15 盞/童 22 盞(瞌睡雲2)/青 30 盞(瞌睡雲3);勝利卡「再玩一次/選難度」
- 牧者已核可題材(2026-07-23);文案細節仍請過目

## 開發/部署

鍛造來源:`scripts/forge.mjs`(noahark → 本題;newBlock 不含 endAnchor 的修正版寫法)。
語音重烤 `node scripts/gen-tts.mjs`;驗證 `node scripts/verify.mjs <URL>`(勝利捷徑用 goal×10,PAIR 無關)。

```bash
npx wrangler deploy --name hfpc-oillamps-match3 --compatibility-date 2026-07-01 --assets .
```

改版時 `sw.js` 的 `CACHE_NAME` +1;`.assetsignore` 已擋 `.git`/`.wrangler`。
