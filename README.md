# 📈 ETF 資產管理家（ETF Manager App）

用 **Expo + React Native + TypeScript** 打造的 ETF 管理 App，整合市場上常見證券商 App 的核心功能。**目前先以 Android 建置為主，iOS 可等 Android 版跑通後再啟用。**

---

## ✨ 功能總覽

| 分類 | 功能 |
|---|---|
| 市場報價 | ETF 列表、搜尋、分類篩選（市值型／高股息／科技等）、台股與美股 |
| ETF 詳情 | 價格走勢圖、淨值(NAV)、溢／折價、內扣費用率、殖利率、規模、前五大成分股佔比、簡介 |
| 觀察清單 | 一鍵加入／移除自選 ETF |
| 投資組合 | 交易紀錄（買進／賣出／配息）、加權平均成本自動計算、未實現損益、資產配置圓餅圖 |
| 價格提醒 | 設定漲到／跌到目標價提醒 |
| **配息行事曆**（新） | 依持股與觀察清單，顯示即將除息／發放的 ETF，並預估可領股利金額 |
| 定期定額試算 | 依每月投入金額、年期、預期報酬率試算複利終值 |
| 市場新聞 | 整合相關 ETF 代碼的新聞摘要 |
| 設定 | 推播通知、深色模式、生物辨識登入開關（介面已備妥，之後可接原生模組） |
| 本機儲存 | 交易紀錄／觀察清單／提醒皆用 AsyncStorage 持久化，離線可用 |

> 報價與新聞目前為**模擬資料**（`src/data/mockETFs.ts`），方便直接預覽。正式上線請依 `src/services/etfApiService.ts` 內的說明串接真實資料源。

---

## 🐞 本次已修正的問題

1. **路徑別名（`@/...`）在真機打包時找不到模組** → 已於 `babel.config.js` 加入 `babel-plugin-module-resolver` 並在 `package.json` 加入相依套件，現在 `@/types`、`@/screens/...` 等寫法都能在建置時正確解析。
2. **iOS 建置失敗：`Failed to resolve plugin "expo-notifications"`** → 已從 `app.json` 移除尚未安裝的 `expo-notifications` 外掛設定，避免建置直接失敗。App 內「設定」頁的推播通知開關目前是純介面，之後要做真推播功能時再依 README 最下方步驟安裝套件即可。
3. 已完整檢查全部 12 個畫面的匯出、導航註冊、括號配對，確認沒有語法錯誤。

---

## 🗂 專案結構

```
etf-manager-app/
├── App.tsx
├── app.json                     # Expo設定（App名稱、圖示、bundle id）
├── eas.json                     # EAS雲端建置設定
├── package.json
├── babel.config.js
├── tsconfig.json
├── .github/workflows/           # GitHub Actions（可選，非必要）
└── src/
    ├── types/index.ts
    ├── data/mockETFs.ts
    ├── services/etfApiService.ts
    ├── context/PortfolioContext.tsx
    ├── navigation/AppNavigator.tsx
    ├── components/
    └── screens/                 # 12個功能畫面
```

---

## 🚀 從GitHub到手機上的App：完整步驟（不需要自己的電腦裝任何軟體）

### 第一步：用瀏覽器打開雲端終端機

1. 打開你的GitHub專案頁面
2. 點綠色 **「Code」** 按鈕 → 切到 **「Codespaces」** 分頁
3. 點 **「Create codespace on main」**，等待載入完成（畫面像VS Code，下方有終端機）

### 第二步：安裝工具並登入

在下方終端機依序打入（每行按Enter執行）：

```bash
npm install -g eas-cli
eas login
```
依提示輸入Expo帳號的Email與密碼。

### 第三步：安裝專案套件

```bash
npm install
```

### 第四步：連結你自己的EAS專案

```bash
eas init
```
選你的帳號即可，這會自動更新 `app.json` 裡的 `projectId`。

### 第五步：建置Android版（產出可直接安裝的APK）

```bash
eas build --platform android --profile preview
```
- 過程中如果詢問簽署金鑰，選 **「Generate new keystore」**（讓EAS自動產生）
- 建置約5–15分鐘，完成後終端機與 [expo.dev](https://expo.dev) 後台都會顯示下載連結

### 第六步：安裝到手機測試

把下載的 `.apk` 檔傳到Android手機（或用手機直接掃終端機顯示的QR Code下載），手機需允許「安裝未知來源App」。

---

## 📱 之後要做 iOS 版時

```bash
eas build --platform ios --profile preview
```
需要先有Apple Developer付費帳號（US$99/年），過程中EAS會引導你處理憑證。產出的 `.ipa` 需透過TestFlight安裝到實機。

---

## 🔌 接上真實ETF報價（正式上線前必做）

| 市場 | 資料源 |
|---|---|
| 台股 ETF | [台灣證券交易所 OpenAPI](https://openapi.twse.com.tw)（免費） |
| 美股 ETF | [Alpha Vantage](https://www.alphavantage.co)、[Finnhub](https://finnhub.io) |

實作位置：`src/services/etfApiService.ts`，把 `fetchAllETFs()` 等函式內的mock資料改為呼叫真實API即可，其餘畫面不需修改。API金鑰請勿寫死在前端或提交到GitHub，建議透過後端代理呼叫。

---

## 🔔 之後要啟用真的推播通知功能時

```bash
npx expo install expo-notifications
```
裝完後，打開 `app.json`，在 `"expo": { ... }` 內加入：
```json
"plugins": ["expo-notifications"],
```
存檔、commit、push，再重新執行 `eas build`。

---

## ⚠️ 免責聲明

本App僅供資產管理與試算之工具參考，所有試算結果（含定期定額試算、配息預估）皆為估算值，不構成任何投資建議，投資請自行審慎評估風險。
