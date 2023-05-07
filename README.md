# mvdis_i18n

## 台灣駕照預約考試多語友善版

## 開發日誌

### 開發注意事項:

-   測試前要更新測試資料

#### 20230426:

-   $("form").serialize() -> 回傳 string 格式的 form 表單值
-   $("form").serializeArray() -> 回傳 array 格式的 form 表單值

#### 20230428:

-   上去 GitHub，但發現應該早點上

#### 20230503:

-   更新文件
-   前端增加報名頁面但還沒成功
-   新增 UTC 轉換 ROC 日期格式的 function
-   回頭寫好後端、更新測試要驗證的值、測試資料讓測試能過

#### 20230507:

-   可以透過前端正常報名，把畫面上的值以 Ajax 包在 body 送出
-   更新測試資料

### Todo

-   [ ] 使用 Ajv or JOI 驗證後端的資料
-   [x] 使用某個函式庫讓我回傳 response 有固定的格式(後來使用中間鍵處理)
-   [ ] 新增 Swagger API 文檔，就可以把 mvdis_crawler.js 開發用的 log 拿掉
-   [ ] 前端改變排列邏輯或新增 filter，或是也改變後端回傳邏輯，讓後端不用傳這麼多一部分重複的資料(例如說回傳的 50 筆有 25 筆都是早上初試場，其實可以改回傳早上初試場的每一天還有多少名額)
-   [ ] 能報名且可以查詢、取消報名
-   [ ] 前端畫面做好 RWD
-   [ ] 測試前自動化更新測試資料

### 用了什麼

後端使用 koa，並使用 axios 打 API，使用 cheerio 解析 html 取得監理站的資料

### 具體做了什麼

-   不透過模擬瀏覽器控制元素或操控 JS，而是打交通監理網的 API 進行動作
    -   [https://www.mvdis.gov.tw/m3-emv-trn/exm/](https://www.mvdis.gov.tw/m3-emv-trn/exm/)
    -   所以這個專案沒有資料庫，是靜態網站
    -   原本的前端其實用 google 翻譯整個網頁還算能用，不算太有必要再刻一個前端，所以前端打算只用 JQuery 寫
-   用中間鍵讓 response 回傳的 json 有一個固定的格式

### 過程當中有幫助的網路資源

-   如何用 JQuery 做除了...以外的選取[Hide all but $(this) via :not in jQuery selector](https://stackoverflow.com/questions/1328314/hide-all-but-this-via-not-in-jquery-selector)
-   koa ctx.message 不能為中文[koa 踩坑日记（一）](https://juejin.cn/post/7052712021573402631)
