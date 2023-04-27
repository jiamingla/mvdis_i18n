const supertest = require("supertest");
const chai = require("chai");
const { app } = require("./../server.js");

const expect = chai.expect;
const request = supertest(app.listen(3000));

// 測試套件 / 組
describe(" 開始測試", () => {
  const licenseTypeCode = "3";
  const secDateStr = "2023-05-17";
  const dmvNo = "41";
  const idNo = "A170522227";
  const birthdayStr = "0880916";
  const payload = {
    secId: "1",
    divId: "1",
    idNo: "A170522227",
    birthdayStr: "0880916",
    name: "test",
    contactTel: "0912345678",
    email: "zopq4565@gmail.com",
  };

  let reservationPK = "";
  // 測試用例
  it(" 測試 GET/sessions 請求", (done) => {
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
    console.log(expectExamDateStr);
    request
      .get(`/sessions?expectExamDateStr=${expectExamDateStr}&dmvNo=40`)
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
      .post(
        `/sessions?licenseTypeCode=${licenseTypeCode}&secDateStr=${secDateStr}&dmvNo=${dmvNo}`
      )
      .send(payload)
      .expect(200)
      .end((err, res) => {
        expect(res.text).to.equal("報名成功");
        return done();
      });
  });
  it(" 測試 GET /results 請求成功", (done) => {
    request
      .get(`/results?idNo=${idNo}&birthdayStr=${birthdayStr}`)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        expect(res.body["result"]).to.be.string;
        reservationPK = res.body["reservationPK"];
        return done();
      });
  });
  it(" 測試 DELETE /results 請求成功", (done) => {
    request
      .delete(`/results?reservationPK=${reservationPK}`)
      .expect(200)
      .end((err, res) => {
        expect(res.text).to.equal("取消報名成功");
        return done();
      });
  });
});
