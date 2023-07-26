/*
單元or整合測試會在這
這邊是真的需要先對監理站完成測試，再來才是自己的服務測試能過，不然這些整合測試都很崩
預計之後要先寫後端的i18n測試，再來才是撰寫i18n邏輯?
*/
const supertest = require("supertest");
const chai = require("chai");
const { app } = require("./../server.js");

const { get_roc_today } = require("../utils/helper.js");

const expect = chai.expect;
const request = supertest(app.listen(3000));

// 測試套件 / 組
describe("開始測試", () => {
    const licenseTypeCode = "3";
    const secDateStr = "2023-06-07";
    const dmvNo = "40";
    const idNo = "A170522227";
    const birthdayStr = "1999-09-16";
    const payload = {
        licenseTypeCode: licenseTypeCode,
        secDateStr: secDateStr,
        dmvNo: dmvNo,
        secId: "1",
        divId: "4",
        idNo: idNo,
        birthdayStr: birthdayStr,
        name: "test",
        contactTel: "0912345678",
        email: "zopq4565@gmail.com",
    };

    let reservationPK = "";
    // 測試用例
    it(" 測試 GET/sessions 請求", (done) => {
        const expectExamDateStr = get_roc_today();
        console.log(expectExamDateStr);
        request
            .get(
                `/sessions?expectExamDateStr=${expectExamDateStr}&dmvNo=${dmvNo}`
            )
            .expect(200)
            .end((err, res) => {
                // expect(res.text).to.equal("ss");
                expect(res.text).to.be.string;
                return done();
            });
    });
    it(" 測試 GET/sessions 請求失敗", (done) => {
        request
            .get("/sessions?expectExamDateStr=1120419&dmvNo=0")
            .expect(400)
            .end((err, res) => {
                //   expect(res.text).to.equal('ss')
                return done();
            });
    });
    it(" 測試 POST/sessions 請求", (done) => {
        request
            .post(`/sessions`)
            .send(payload)
            .expect(200)
            .end((err, res) => {
                expect(res.body["message"]).to.equal("OK");
                return done();
            });
    });
    it(" 測試 GET then DELETE /results 請求成功", async () => {
        const res_get = await request.get(
            `/results?idNo=${idNo}&birthdayStr=${birthdayStr}`
        );
        expect(res_get.body["reservationPK"]).to.not.equal("");
        reservationPK = res_get.body["data"]["reservationPK"];
        const res_delete = await request.delete(
            `/results?reservationPK=${reservationPK}`
        );
        expect(res_delete.body["data"]).to.equal("取消報名成功");
    });
});
