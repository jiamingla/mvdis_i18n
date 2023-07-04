// 在本地透過打自己寫的API存下所有監理站的資訊欄位的中文字
// TODO: 串Google Sheet API使其能將一部份資料(資訊欄位)上傳自動化
// TODO: 自動化更新考照預約人數

const supertest = require("supertest");
const { app } = require("./server.js");
const { get_roc_today, UTC_to_ROC } = require("./utils/helper.js");

const request = supertest(app.listen(3000));

const motorVehiclesOfficeIdList = [
    21, 25, 26, 30, 31, 33, 40, 41, 43, 44, 45, 46, 50, 51, 52, 53, 54, 60, 61,
    62, 63, 64, 65, 70, 71, 72, 73, 74, 75, 76, 80, 81, 82, 83, 84,
];
const licenseTypeCodeList = [2, 3];
const licenseTypeCode = licenseTypeCodeList[1];
const expectExamDateStr = "2023-07-01";

for (const id of motorVehiclesOfficeIdList) {
    send_request(expectExamDateStr, id);
    console.log(id);
}

async function send_request(expectExamDateStr, id) {
    await request.get(
        `/sessions?licenseTypeCode=${licenseTypeCode}&expectExamDateStr=${expectExamDateStr}&dmvNo=${id}`
    );
    await sleep(300);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
