#### 20230619

-   用 koa-joi-router 開始改寫

#### 20230519

-   選生日日期可以直接選年份(目前是 75-18 歲的區間)
-   前端增加 loading mask

#### 20230517

-   查詢取消報名終於寫出來了~
-   今天運氣不錯還遇到 502，以後再補個錯誤處理
-   前端真的要想想怎麼弄比較好看

#### 20230507:

-   可以透過前端正常報名了，把畫面上的值以 Ajax 包在 body 送出
-   更新測試資料

#### 20230503:

-   更新文件
-   前端增加報名頁面但還沒成功
-   新增 UTC 轉換 ROC 日期格式的 function
-   回頭寫好後端、更新測試要驗證的值、測試資料讓測試能過

#### 20230426:

-   $("form").serialize() -> 回傳 string 格式的 form 表單值
-   $("form").serializeArray() -> 回傳 array 格式的 form 表單值