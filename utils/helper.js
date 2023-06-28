/*
helper.js 是一個常見的工具函式檔案，其中通常包含一些輔助函式，用於處理常見的任務或提供通用的功能。
格式化日期和時間
加密和解密函式
字串處理函式，如擷取、替換等
資料驗證和校驗函式
錯誤處理函式
檔案操作函式，如讀取、寫入、刪除等
陣列和物件處理函式，如排序、過濾、對映等
URL 處理函式，如引數解析、構建等
日誌記錄函式
傳送電子郵件函式
圖片處理函式
請求傳送和響應處理函式
快取管理函式
*/
module.exports = {
    // 2023-05-16 -> 1120516
    // TODO: 傳進去的值一定要是西元年格式，或是多檢查判斷去檢查輸入的是西元還是民國格式
    UTC_to_ROC: (DateStr) => {
        // 可以正則[0-9]{4}-[0-9]{2}-[0-9]{2}或是連帶檢查日期格式是不是正確的?例如不該有2023-05-35
        if (DateStr.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
            result = DateStr.split("-");
            result = `${parseInt(result[0]) - 1911}${result[1]}${result[2]}`;
        } else if (DateStr.match(/[0-9]{7}/)) {
            result = DateStr;
        } else {
            throw new Error("Parameter is not UTC!");
        }
        return result;
    },
    get_roc_today: () => {
        const date = new Date();
        const roc_year = date.getFullYear() - 1911;
        let month = date.getMonth() + 1;
        let day = date.getDate();

        // 若三個月後時間大於 12，年就 +1
        if (month > 12) {
            roc_year++;
            month -= 12;
        }

        // 若月份是 1~9 就補 0
        if (month < 10) {
            month = `0${month}`;
        }
        //若日期是 1 ~ 9 那就補 0
        if (day < 10) {
            day = `0${day}`;
        }

        const expectExamDateStr = `${roc_year}${month}${day}`;
        return expectExamDateStr;
    },
};
