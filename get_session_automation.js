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
}
