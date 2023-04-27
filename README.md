# mvdis_i18n

## 考照預約 外文版

## 開發日誌

20230426:

-   $("form").serialize() -> 回傳 string 格式的 form 表單值
-   $("form").serializeArray() -> 回傳 array 格式的 form 表單值

20230428:

-   上去 GitHub，但發現應該早點上

### Todo

-   [ ] 使用 Ajv or JOI 驗證後端的資料
-   [ ] 使用某個函式庫讓我回傳 response 的格式是類似的
-   [ ] 新增 Swagger API 文檔，就可以把 mvdis_crawler.js 開發用的 log 拿掉

### 用了什麼

後端使用 koa，並使用 axios 打 API，使用 cheerio 解析 html 取得監理站的資料

### 具體做了什麼

用中間鍵讓 response 回傳的 json 有一個固定的格式
