# CLAUDE.md - Ultima Magic Circle 專案指南

## 專案概述

**Ultima Magic Circle** 是一個實時互動式 3D 粒子系統，透過攝像頭偵測手勢進行控制。使用者可以透過手勢操控粒子的張力、擴張和收縮效果。

### 核心功能

- **手勢控制**：MediaPipe Hands 進行雙手即時偵測
  - 握拳 → 增加張力/縮放
  - 張開手掌 → 減少張力
  - 雙手分開 → 擴張粒子
  - 雙手靠近 → 收縮粒子
- **粒子模板**：心形、花朵、土星、佛像、煙火
- **色彩自訂**：支援任意顏色或預設色盤

---

## 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| Three.js | ^0.160.0 | 3D 粒子渲染 |
| MediaPipe Hands | ^0.4.x | 手部追蹤 |
| TypeScript | ^5.3.3 | 型別系統 |
| Vite | ^5.0.10 | 建置工具 |
| Vitest | ^1.1.0 | 測試框架 |
| Node.js | >= 18 | 執行環境 |

---

## 專案結構

```
src/
├── core/                    # 核心業務邏輯
│   ├── AppController.ts     # 主控制器（協調 UI、手勢、粒子）
│   ├── GestureController.ts # 手勢檢測和識別
│   └── ParticleSystem.ts    # 粒子渲染和動畫引擎
├── templates/               # 粒子形狀模板
│   ├── index.ts            # 模板導出和工廠函數
│   ├── heart.ts / flower.ts / saturn.ts / buddha.ts / fireworks.ts
├── ui/                      # UI 元件
│   ├── TemplateSelector.ts / ColorPicker.ts / CameraPreview.ts / GestureIndicator.ts
├── types/index.ts           # 所有 TypeScript 型別定義
├── utils/math.ts            # 數學工具函數
├── styles/main.css          # 全局樣式
└── main.ts                  # 入口點

tests/                       # 測試檔案（結構對應 src/）
├── setup.ts                # 測試環境配置（WebGL/MediaPipe 模擬）
├── core/*.test.ts
├── templates/*.test.ts
└── utils/*.test.ts
```

---

## 開發指令

```bash
# 開發
npm run dev          # 啟動開發伺服器 (port 3000)

# 建置
npm run build        # TypeScript 編譯 + 生產建置

# 測試
npm run test         # 執行測試（監看模式）
npm run test:run     # 單次執行測試
npm run test:coverage # 測試覆蓋率分析

# 程式碼檢查
npm run lint         # ESLint 檢查

# 部署
npm run deploy       # 部署到 GitHub Pages
```

---

## 開發準則

### 語言與文字

- **所有介面文字和註解使用繁體中文**
- 變數名稱、函數名稱使用英文
- Git commit 訊息使用繁體中文

### 程式碼風格

- 嚴格遵循 TypeScript 型別安全
- 使用路徑別名 `@/*` 對應 `src/*`
- 所有型別定義集中在 `src/types/index.ts`
- 避免 `any` 型別，必要時使用 `unknown` 並進行型別守衛

### 架構原則

- **AppController**：唯一的協調者，連接手勢輸入到粒子輸出
- **GestureController**：純粹處理手勢邏輯，不涉及渲染
- **ParticleSystem**：純粹處理 Three.js 渲染，不涉及手勢

### 效能目標

| 指標 | 目標 |
|------|------|
| 幀率 | 60 FPS |
| 手勢延遲 | < 50ms |
| 粒子數量 | 5000-10000 |
| 記憶體使用 | < 200MB |

---

## 測試指南

### 測試環境

- 使用 **happy-dom** 作為 DOM 實現
- 完整的 **WebGL2 模擬** 在 `tests/setup.ts`
- **MediaPipe 模擬** 透過全局變數注入

### 撰寫測試

1. 測試檔案放在 `tests/` 目錄，結構對應 `src/`
2. 檔案命名：`*.test.ts`
3. 使用 `describe` / `it` 結構
4. Mock 外部依賴（WebGL、MediaPipe、Camera）

### 執行測試

```bash
# 在提交前務必執行
npm run test:run
```

---

## 新增功能流程

### 新增粒子模板

1. 在 `src/templates/` 建立新檔案（如 `star.ts`）
2. 實作 `TemplateFunction` 型別的生成函數
3. 在 `src/templates/index.ts` 註冊新模板
4. 在 `src/types/index.ts` 的 `TemplateType` 新增類型
5. 撰寫對應測試在 `tests/templates/`

### 新增手勢

1. 在 `src/core/GestureController.ts` 新增檢測邏輯
2. 在 `src/types/index.ts` 更新 `GestureState` 介面
3. 在 `src/core/AppController.ts` 處理新手勢的效果
4. 更新 `src/ui/GestureIndicator.ts` 顯示

---

## 重要注意事項

### MediaPipe 導入

MediaPipe 使用 IIFE/UMD 模組格式，已在 `index.html` 中以 script 標籤載入：

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
```

在程式碼中透過全局變數存取：`window.Hands`、`window.Camera`

### WebGL 相容性

- 確保所有 Three.js 操作在 WebGL context 可用時才執行
- 處理 context lost 事件
- 提供 WebGL 不支援時的降級方案

### 瀏覽器支援

- Chrome 80+ / Firefox 75+ / Safari 14+ / Edge 80+
- 需要 WebGL 和攝影機存取權限

---

## 相關文件

- `/README.md` - 使用者指南
- `/docs/SDD.md` - 軟體設計文件（詳細架構規格）
- `/LICENSE` - MIT 授權

---

## 常見任務

### 修改粒子視覺效果

查看 `src/core/ParticleSystem.ts` 中的 shader 程式碼

### 調整手勢靈敏度

修改 `src/core/GestureController.ts` 中的閾值參數

### 更新 UI 樣式

修改 `src/styles/main.css`（毛玻璃效果相關）

### 除錯手勢偵測

啟用 `CameraPreview` 元件查看即時手勢狀態
