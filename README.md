# mvdis_i18n

## (Non-Official)Taiwan(ROC) Motor Vehicle Driver Information Service (MVDIS)'s Registration Service for Ordinary Motorcycle License Test

## (非官方)中華民國機車駕照預約考試多語友善版(名字超長可否幫我簡短)

-   動機： 我曾經幫一位菲律賓朋友考到台灣的普通重型機車駕照，才發現原來預約考試的網站不太在意外國人的 UIUX，就寫出來這個專案了，雖然原本的考照預約對本國人也是很莫名其妙就是了 XD
-   之前已經有幾個簡單網站爬蟲的經驗，一直都覺得有些網頁真的太舊，但又沒有經費翻新，這樣子爬蟲加上簡單的前後端其實也滿好的
-   最近剛好去桃園搭一次火車遇到這些需要搭火車往返的移工朋友，多少有點補充動力了，尤其看到鶯歌火車站停車場有台爆改電單車，回顧在我找到工作後的這兩個月，遇到的移工真的不多。
-   其實我還是有些擔心這個專案或許到最後能幫助的移工朋友不多或是真的被開吉了，但現在有認識自己出來執業的律師，這個擔心開始是多餘的了 XD
-   我的猜想是：只要拿到機車駕照的外國人夠多，國際就會更重視台灣機車路權的問題，而且台灣的普通重型機車駕照取得也不算太難，除了對方很可能需要適應台灣獨有的特產：二段式左轉待轉區

### 檔案架構

-   test/server.test.js: 測試腳本
-   view/index.ejs: 使用了模板引擎的前端頁面
-   public/: 前端所需要的 JS,CSS 靜態文件
-   mvdis_crawler.js: 爬蟲，打監理站 API，解析 html
-   server.js: koa 框架的後端
-   routes/ 負責路由功能
-   utils/helper.js 負責各種雜事，例如時間格式處理
-   session_category.js: 把處理過監理站給的結果再簡化處理的函式

### 如何參與開發和本地執行

-   安裝 Node, nvm
-   `git clone https://github.com/jiamingla/mvdis_i18n.git`
-   `cd mvdis_i18n`
-   `npm i`
-   `npm run dev` or `npm run run`

### 如何部署

-   TBD

#### 開發注意事項:

-   [Git commit message 要照這個規範寫](https://wadehuanglearning.blogspot.com/2019/05/commit-commit-commit-why-what-commit.html)
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

#### 翻譯注意事項

-   可以使用英文版的 Google Map 蒐集所有監理站的名稱、地址、Google Map 網址
-   [公路總局 - 雙語詞彙](https://www.thb.gov.tw/News.aspx?n=5877&sms=13420&page=1&PageSize=200)
    -   雖然只有兩種駕照可以在這預約，但還是要分清楚
        -   普通輕型機器腳踏車(51-125cc)： Ordinary Light Motorcycle
        -   普通重型機器腳踏車(低於 50cc)： Ordinary Heavy Motorcycle
-   [臺北市區監理所 - 英文網站 - 地區](https://tpcmv.thb.gov.tw/en/cp.aspx?n=10225)
    -   我也很氣為什麼明明臺北市底下有好幾個監理站，這上面只有三個
    -   士林監理站 Shilin Station
    -   基隆監理站 Keelung Staion
    -   臺北市區監理所 Taipei City Motor Vehicles Office

#### 如何使用 Google Sheet

-   [使用 Node.js 操作 Google Sheets API 讀寫試算表資料庫](https://www.wfublog.com/2023/04/nodejs-google-sheets-api-read-write.html)
-   申請一個 Oauth 權證放到資料夾命名為 credentials.json
-   `node .\utils\google_sheet.js`

### Todo

-   [x] 可以查詢、取消報名
-   [x] 把取消報名的一包結果分成四個資料
-   [ ] 補足 Test case，雖然後端開發好中文版了，之後還有 i18n，在完成後端 i18n 之前，我要先補測試，並開始實踐 TDD
-   [x] 使用 Ajv or JOI 驗證後端的資料，阻擋不該進來的格式
-   [ ] 對身分證字號這個欄位要加上對本國人和外籍人士的複合驗證 -> 可用開源專案
-   [x] 使用某個函式庫讓我回傳 response 有固定的格式(後來使用中間鍵處理)
-   [ ] 新增 Swagger API 文檔，就可以把 mvdis_crawler.js 開發用的 log 拿掉
-   [ ] 前端改變排列邏輯或新增 filter，或是也改變後端回傳邏輯，讓後端不用傳這麼多一部分重複的資料(例如說回傳的 50 筆有 25 筆都是早上初試場，其實可以改回傳早上初試場的每一天還有多少名額)
-   [ ] 前端畫面做好 RWD
-   [ ] -測試前自動化更新測試資料
-   [ ] CICD
-   [ ] 部署上去 Azure 的免費額度機器
-   [ ] i18n -> 白白建議先從一個監理站的搜尋結果能改成中文，再慢慢把所有的監理站的翻譯給補上
    -   [x] 蒐集字串
    -   [x] 將這些字串上傳到 Google Sheet
    -   [ ] 翻譯
    -   [ ] 從 Google Sheet 讀取
    -   [ ] 後端 i18n -> 多回傳字串的代號讓前端可以照著去找 json 檔案翻譯?
    -   [ ] 前端 i18n -> 拿著後端給的字串代號去照著 json 檔案翻譯

#### 用了什麼

後端使用 koa，並使用 axios 打 API，使用 cheerio 解析 html 取得監理站的資料，以 REST 的格式代替原本監理站不 REST 的 API，讓開發者可以以 REST 的方式開發，前端則使用 JQuery 和 Bootstrap，填寫表單送資料給後端去 call 監理站的服務

#### 具體做了什麼

-   不透過模擬瀏覽器控制元素或操控 JS，而是解析交通監理網的 API 回傳的 html response
    -   [https://www.mvdis.gov.tw/m3-emv-trn/exm/](https://www.mvdis.gov.tw/m3-emv-trn/exm/)
    -   所以這個專案沒有資料庫，是靜態網站，不打算用 MVC 寫的很抽象，如果之後測試需要會再改寫
    -   原本的前端其實用 google 翻譯整個網頁還算能用，不算太有必要再刻一個前端，所以前端打算只用 JQuery 寫
-   用中間鍵讓 response 回傳的 json 有一個固定的格式
-   照著中華民國交通部公路總局 MOTC 給的雙語對照詞彙進行簡單的中翻英，如果有其他語言，會再邀請人一起參與(希望你可以幫我們翻得更好)

#### 過程當中有幫助的網路資源

-   如何用 JQuery 做除了...以外的選取[Hide all but $(this) via :not in jQuery selector](https://stackoverflow.com/questions/1328314/hide-all-but-this-via-not-in-jquery-selector)
-   koa ctx.message 不能為中文[koa 踩坑日记（一）](https://juejin.cn/post/7052712021573402631)
-   [Web 開發學習筆記 20 — Express、EJS](https://teagan-hsu.coderbridge.io/2021/01/13/express-ejs/)
-   [koa2 中使用 ejs 读取外部 js 文件问题](https://blog.51cto.com/u_15155081/2720719)
-   [RythmRune/i18n_sample](https://github.com/RythmRune/i18n_sample)
-   [使用 Node.js 操作 Google Sheets API 讀寫試算表資料庫](https://www.wfublog.com/2023/04/nodejs-google-sheets-api-read-write.html)
-   [使用 Azure Functions 開發 Node.js 無伺服器解決方案](https://learn.microsoft.com/zh-tw/azure/developer/javascript/how-to/develop-serverless-apps?tabs=v4-ts)
