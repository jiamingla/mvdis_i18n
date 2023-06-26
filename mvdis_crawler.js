/**
 *這個檔案主要處理爬取網頁後擷取我要的結果，所以這整段看起來都很怪，也很需要持續的改善
 TODO: 以文件寫清楚目前監理站網頁的邏輯，在寫清楚我自己爬蟲的邏輯
 */
const axios = require("axios");
const cheerio = require("cheerio");

const mvdis_base_url = "https://www.mvdis.gov.tw/m3-emv-trn/exm/";

module.exports = {
    /* 爬出該地點該時間可以報考的名額 */
    locations_query: async (licenseTypeCode, expectExamDateStr, dmvNo) => {
        try {
            const response = await axios({
                method: "post",
                url: `${mvdis_base_url}locations`,
                data: {
                    method: "query",
                    licenseTypeCode: licenseTypeCode,
                    expectExamDateStr: expectExamDateStr,
                    // 註解是不需要的引數
                    // 目前我看大部分監理站也只有開平日，就算有週末，使用者也能擴大搜尋範圍找到周末場次
                    // '_onlyWeekend':'on',
                    // 'onlyWeekend':'true',
                    // 'dmvNoLv1':'40',
                    dmvNo: dmvNo,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const $ = cheerio.load(response["data"]);
            // 網站上的錯誤提示會顯示在這
            const headerMessage = $("#headerMessage");
            if (
                headerMessage.text() ===
                "該條件查詢不到符合的考試場次，敬請重新選擇"
            ) {
                console.log(headerMessage.text());
                console.log("出事了阿伯");
                return false;
            }
            const result = [];
            const search_table = $("#trnTable tbody td");
            for (let i = 0; i < search_table.length / 4; i++) {
                // 走訪
                const t = i * 4;
                const date = search_table
                    .eq(t)
                    .text()
                    .replace(/\t/g, "")
                    .trim();
                const description = search_table
                    .eq(t + 1)
                    .text()
                    .replace(/\t/g, "")
                    .trim();
                let number = search_table
                    .eq(t + 2)
                    .text()
                    .replace(/\t/g, "")
                    .trim();
                if (number === "額滿") {
                    number = 0;
                    // 沒有名額就不能且不用取得secId, divId, expectExamDateStr
                    result.push(Object.assign({ date, description, number }));
                } else {
                    // 剩餘名額應該要是數字類型
                    number = parseInt(number);
                    // 有名額才能取得secId, divId, expectExamDateStr，用正則表達式找出
                    const _temp = search_table
                        .eq(t + 3)
                        .html()
                        .replace(/[\t\n]/g, "")
                        .match(/preAdd\(.{22,23}\)/);
                    const _temp_list = _temp[0].split("'");
                    const expectExamDateStr = _temp_list[1];
                    const secId = _temp_list[3];
                    const divId = _temp_list[5];
                    result.push(
                        Object.assign({
                            date,
                            description,
                            number,
                            expectExamDateStr,
                            secId,
                            divId,
                        })
                    );
                }
            }
            console.log(result);
            return result;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    /* 拿個人資料報名該場次 */
    sign_up: async (
        licenseTypeCode,
        secDateStr,
        dmvNo,
        secId,
        divId,
        idNo,
        birthdayStr,
        name,
        contactTel,
        email
    ) => {
        try {
            const response = await axios({
                method: "post",
                url: `${mvdis_base_url}signUp`,
                data: {
                    method: "add",
                    licenseTypeCode: licenseTypeCode,
                    secDateStr: secDateStr,
                    dmvNo: dmvNo,
                    secId: secId,
                    divId: divId,
                    idNo: idNo,
                    birthdayStr: birthdayStr,
                    name: name,
                    contactTel: contactTel,
                    email: email,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const $ = cheerio.load(response["data"]);
            // 一些錯誤提示會在這邊顯示，但是像是身分證不符合格式就會顯示在網頁表單上，可能要額外檢查才能找出哪裡填錯
            const headerMessage = $("#headerMessage");
            console.log(headerMessage.text());
            // 在回傳的HTML的<script>裡直接尋找 報名成功 4個字就可以確認是否報名成功了
            if (/報名成功/.test($("script").text())) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    /* 拿reservationPK取消報名該場次 */
    query_query: async (idNo, birthdayStr) => {
        try {
            const response = await axios({
                method: "post",
                url: `${mvdis_base_url}query`,
                data: {
                    method: "query",
                    idNo: idNo,
                    birthdayStr: birthdayStr,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const $ = cheerio.load(response["data"]);
            // 一些錯誤提示會在這邊顯示
            const headerMessage = $("#headerMessage");
            if (headerMessage.text() === "已查無報名資料，可「新增報名」") {
                console.log(headerMessage.text());
                return {
                    result: {},
                    reservationPK: "",
                    message: headerMessage.text(),
                };
            } else {
                // 這裡只擷取第一筆報名結果，但如果這個人第一次沒考過，第二次再考會怎麼辦?
                // 會得到在網頁上查詢報名的結果
                // TODO: 找人討論這裡該拿第一筆還是每一筆，先拿第一筆並分成四個資料
                const table_elem = $(".tb_list_std tbody tr td");
                const place_of_test = table_elem.eq(0).text();
                const type_of_test = table_elem.eq(1).text();
                const date_of_test = table_elem
                    .eq(2)
                    .text()
                    .replace(/\t/g, "")
                    .trim();
                const desc = table_elem.eq(3).text().replace(/\t/g, "").trim();
                const reservationPK = $(".tb_list_std tbody tr")
                    .find("a")
                    .last()
                    .attr("onclick")
                    .split("'")[1];
                console.log(place_of_test);
                console.log(type_of_test);
                console.log(date_of_test);
                console.log(desc);
                console.log(reservationPK);
                return {
                    result: {
                        place_of_test: place_of_test,
                        type_of_test: type_of_test,
                        date_of_test: date_of_test,
                        desc: desc,
                    },
                    reservationPK: reservationPK,
                };
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    /* 拿reservationPK取消報名該場次 */
    query_cancel: async (reservationPK) => {
        try {
            const response = await axios({
                method: "post",
                url: `${mvdis_base_url}query`,
                data: {
                    method: "cancel",
                    reservationPK: reservationPK,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const $ = cheerio.load(response["data"]);
            // 網站上的錯誤提示會顯示在這
            const headerMessage = $("#headerMessage");
            const result = headerMessage.text();
            if (result === "請輸入查詢條件") {
                console.log("取消報名成功");
                return true;
            } else if (result === "「取消報名」失敗，請洽所報名之監理所站") {
                console.log(result);
                return false;
            } else if (/取消報名成功/.test($("script").text())) {
                // 在回傳的HTML的<script>裡直接尋找 取消報名成功 4個字就可以確認是否報名成功了
                return true;
            } else {
                throw new Error("出事了阿伯!");
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
};
