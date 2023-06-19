# mvdis_i18n

## 台灣駕照預約考試多語友善版

-   動機： 我曾經幫一位菲律賓朋友考到台灣的普通重型機車駕照，才發現原來預約考試的網站不太在意外國人的 UIUX，就寫出來這個專案了，雖然原本的考照預約對本國人也是很莫名其妙就是了 XD

### 檔案架構

-   test/server.test.js: 測試腳本
-   view/index.ejs: 前端頁面(可能之後會再看能用 ejs 做什麼事情，目前就當 html 塞了很多 js 的檔案看待即可)
-   mvdis_crawler.js: 爬蟲，打監理站 API，解析 html
-   server.js: koa 框架的後端

### 如何本地執行

-   `npm i`
-   `npm run run`

### 如何部署

-   TBD

#### 開發注意事項:

-   測試前都要更新測試資料，因為開發和測試都是在別人家的正式環境上(無奈)
-   可以使用身分證產生器來生成，目前測下來看起來是只會檢查這個身分證字號有沒有考過駕照，不會背後去抓身分證字號對應的生日(國家機器在這裡沒有動起來)
-   如果對方服務壞掉，打 request 過去超過十幾秒沒回來，回 502 可能會回這個，之後加個錯誤處理看看 -> 錯誤處理如果多了，其實也可以寫成一個 func 去固定檢查
    ```
    <table width="10%" border="0" align="center" cellpadding="0" cellspacing="0" summary="排版表格:Header" class="header_tb">
        <tr>
            <td><img src="/m3/images/space.gif" width="1000" height="1" alt="排版用圖" name="imgSpace" /></td>
        </tr>
        <tr>
            <td class="err_bk">
                <div class="err_box">
                    <div class="err_msg">
                        <span>抱歉!!</span><br />
                        您前往的網頁出現異常,我們已盡速處理中,造成您的不便,懇請見諒。
                    </div>
                </div>
            </td>
        </tr>
    </table>
    ```
-   開發時記得關 VPN，監理站會 Ban 掉 VPN

### Todo

-   [x] 可以查詢、取消報名
-   [x] 把取消報名的一包結果分成四個資料
-   [ ] 使用 Ajv or JOI 驗證後端的資料，尤其身分證字號要加上對本國人和外籍人士的複合驗證 -> 可用開源專案
-   [x] 使用某個函式庫讓我回傳 response 有固定的格式(後來使用中間鍵處理)
-   [ ] 新增 Swagger API 文檔，就可以把 mvdis_crawler.js 開發用的 log 拿掉
-   [ ] 前端改變排列邏輯或新增 filter，或是也改變後端回傳邏輯，讓後端不用傳這麼多一部分重複的資料(例如說回傳的 50 筆有 25 筆都是早上初試場，其實可以改回傳早上初試場的每一天還有多少名額)
-   [ ] 前端畫面做好 RWD
-   [ ] 測試前自動化更新測試資料
-   [ ] CICD
-   [ ] 部署上去 GitHub Page
-   [ ] i18n -> 白白建議先從一個監理站的搜尋結果能改成中文，再慢慢把所有的監理站的翻譯給補上

#### 用了什麼

後端使用 koa，並使用 axios 打 API，使用 cheerio 解析 html 取得監理站的資料，以 REST 的格式代替原本監理站不 REST 的 API，讓開發者可以以 REST 的方式開發，前端則使用 JQuery 和 Bootstrap，填寫表單送資料給後端去 call 監理站的服務

#### 具體做了什麼

-   不透過模擬瀏覽器控制元素或操控 JS，而是打交通監理網的 API 進行動作
    -   [https://www.mvdis.gov.tw/m3-emv-trn/exm/](https://www.mvdis.gov.tw/m3-emv-trn/exm/)
    -   所以這個專案沒有資料庫，是靜態網站
    -   原本的前端其實用 google 翻譯整個網頁還算能用，不算太有必要再刻一個前端，所以前端打算只用 JQuery 寫
-   用中間鍵讓 response 回傳的 json 有一個固定的格式

#### 過程當中有幫助的網路資源

-   如何用 JQuery 做除了...以外的選取[Hide all but $(this) via :not in jQuery selector](https://stackoverflow.com/questions/1328314/hide-all-but-this-via-not-in-jquery-selector)
-   koa ctx.message 不能為中文[koa 踩坑日记（一）](https://juejin.cn/post/7052712021573402631)
