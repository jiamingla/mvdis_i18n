const Koa = require("koa");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const views = require("koa-views");
const path = require("path");

const mvdis = require("./mvdis_crawler.js");

const app = new Koa();
const router = new Router();

app.use(koaBody());

// 加载模板引擎
app.use(
  views(path.join(__dirname, "./view"), {
    extension: "ejs",
  })
);

// 在開發時可以檢查每個request花了多少時間
app.use(async (ctx, next) => {
  const start_time = Date.now();
  await next();
  const ms = Date.now() - start_time;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 用 Koa 的中間件(middleware)來實現固定的回傳格式
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      message: err.message,
      data: null,
      success: false,
    };
  }
  if (ctx.body !== undefined && ctx.path !== "/") {
    ctx.body = {
      message: "success",
      data: ctx.body,
      success: true,
    };
  }
});

/*
GET /sessions 取得場次
POST /sessions 報名場次
GET /results 取得場次報名結果
DELETE /results 取消報名
*/

router
  .get("/", async (ctx) => {
    let title = "台灣駕照預約考試多語友善版";
    return await ctx.render("index", {
      title,
    });
  })
  .get("/sessions", async (ctx) => {
    let licenseTypeCode = 0;
    let expectExamDateStr = "";
    let dmvNo = 0;
    try {
      // 把資料分別存在變數裡
      licenseTypeCode = parseInt(ctx.query.licenseTypeCode);
      expectExamDateStr = ctx.query.expectExamDateStr;
      dmvNo = parseInt(ctx.query.dmvNo);
    } catch (error) {
      console.error(error);
      ctx.body = "參數錯誤";
      ctx.status = 400;
    }
    expectExamDateStr = expectExamDateStr.split("-");
    expectExamDateStr = `${expectExamDateStr[0] - 1911}${expectExamDateStr[1]}${
      expectExamDateStr[2]
    }`;
    console.log(expectExamDateStr);
    // TODO: 其實可以使用JOI來寫輸入值檢查，不至於這麼搞剛
    const motorVehiclesOfficeIdList = [
      21, 25, 26, 30, 31, 33, 40, 41, 43, 44, 45, 46, 50, 51, 52, 53, 54, 60,
      61, 62, 63, 64, 65, 70, 71, 72, 73, 74, 75, 76, 80, 81, 82, 83, 84,
    ];
    const licenseTypeCodeList = [2, 3];
    if (
      expectExamDateStr.length === 7 &&
      licenseTypeCodeList.includes(licenseTypeCode) &&
      motorVehiclesOfficeIdList.includes(dmvNo) === true
    ) {
      const result = await mvdis.locations_query(
        licenseTypeCode,
        expectExamDateStr,
        dmvNo
      );
      ctx.body = result;
    } else {
      // 如果有欄位沒有填，就依照文件回傳 400
      ctx.body = "出事了阿伯";
      ctx.status = 400;
    }
  })
  .post("/sessions", async (ctx) => {
    // 把資料分別存在變數裡
    const licenseTypeCode = ctx.query.licenseTypeCode;
    const secDateStr = ctx.query.secDateStr;
    const dmvNo = ctx.query.dmvNo;
    const { secId, divId, idNo, birthdayStr, name, contactTel, email } =
      ctx.request.body;
    const result = await mvdis.sign_up(
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
    );
    if (result === false) {
      ctx.body = "報名失敗";
      ctx.status = 400;
    } else {
      ctx.body = "報名成功";
    }
  })
  .get("/results", async (ctx) => {
    // 把資料分別存在變數裡
    const idNo = ctx.query.idNo;
    const birthdayStr = ctx.query.birthdayStr;

    const result = await mvdis.query_query(idNo, birthdayStr);
    if (result === false) {
      ctx.body = "查詢失敗";
      ctx.status = 400;
    } else {
      ctx.body = result;
    }
  })
  .delete("/results", async (ctx) => {
    // 把資料分別存在變數裡
    const reservationPK = ctx.query.reservationPK;
    const result = await mvdis.query_cancel(reservationPK);
    if (result === false) {
      ctx.body = "取消報名失敗";
      ctx.status = 400;
    } else {
      ctx.body = "取消報名成功";
    }
  });

app.use(router.routes());

if (require.main === module) {
  const port = 3000;
  app.listen(port);
  console.log(`listening on port ${port}`);
}
module.exports = { app };
