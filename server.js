/**
 *這個檔案為後端框架，主要處理爬取資料後如何規規矩矩的傳回使用者手上
 TODO: 將route個別分開來，讓檔案不要太肥，這樣版本控制也比較容易看得出更動了什麼
 */
const Koa = require("koa");
const Router = require("koa-joi-router");
const date_format = require("@joi/date");
Joi = Router.Joi;
Joi = Joi.extend(date_format);
// https://community.magento.com/t5/Magento-1-x-Technical-Issues/Unknown-date-format-neither-date-nor-time-in-yyyy-MM-dd-HH-mm-ss/td-p/445733
const { koaBody } = require("koa-body");
const views = require("koa-views");
const path = require("path");

const mvdis = require("./mvdis_crawler.js");
const dmvNoList = require("./dmvNo.json");

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
    console.log(`${JSON.stringify(ctx.request.body)}`);
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
            message: ctx.message,
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

const schema_licenseTypeCode = Joi.number()
    .integer()
    .min(2)
    .max(3)
    .example("3")
    .description("licenseTypeCode")
    .required();
const schema_DateStr = Joi.date().format("YYYY-MM-DD").raw().required();
const schema_dmvNo = Joi.string()
    .pattern(
        new RegExp(
            "^.*21|25|26|30|31|33|40|41|43|44|45|46|50|51|52|53|54|60|61|62|63|64|65|70|71|72|73|74|75|76|80|81|82|83|84.*$"
        )
    )
    .length(2)
    .example("41")
    .description("dmvNo")
    .required();
const schema_id = Joi.number()
    .integer()
    .min(1)
    .max(5)
    .example("3")
    .description("secId,divId")
    .required();
const schema_idNo = Joi.string().length(10).required();

const schema_name = Joi.string().required();
const schema_contactTel = Joi.string().length(10).required();
const schema_email = Joi.string().email().required();
const schema_reservationPK = Joi.string().length(7).required();
router
    .get("/", async (ctx) => {
        let title = "台灣駕照預約考試多語友善版";
        return await ctx.render("index", {
            title,
            dmvNoList,
        });
    })
    .get("/sessions", {
        validate: {
            query: {
                licenseTypeCode: schema_licenseTypeCode,
                expectExamDateStr: schema_DateStr,
                dmvNo: schema_dmvNo,
            },
        },
        handler: async (ctx) => {
            // 把資料分別存在變數裡
            licenseTypeCode = parseInt(ctx.query.licenseTypeCode);
            expectExamDateStr = ctx.query.expectExamDateStr;
            dmvNo = parseInt(ctx.query.dmvNo);
            // 2023-05-16 -> 1120516
            expectExamDateStr = UTC_to_ROC(expectExamDateStr);
            console.log(expectExamDateStr);

            const result = await mvdis.locations_query(
                licenseTypeCode,
                expectExamDateStr,
                dmvNo
            );
            ctx.body = result;
        },
    })
    .post("/sessions", {
        validate: {
            type: "json",
            body: {
                licenseTypeCode: schema_licenseTypeCode,
                secDateStr: schema_DateStr,
                dmvNo: schema_dmvNo,
                secId: schema_id,
                divId: schema_id,
                idNo: schema_idNo,
                birthdayStr: schema_DateStr,
                name: schema_name,
                contactTel: schema_contactTel,
                email: schema_email,
            },
        },
        handler: async (ctx) => {
            // 把資料分別存在變數裡
            const {
                licenseTypeCode,
                secDateStr,
                dmvNo,
                secId,
                divId,
                idNo,
                birthdayStr,
                name,
                contactTel,
                email,
            } = ctx.request.body;
            const result = await mvdis.sign_up(
                licenseTypeCode,
                secDateStr,
                dmvNo,
                secId,
                divId,
                idNo,
                UTC_to_ROC(birthdayStr),
                name,
                contactTel,
                email
            );
            if (result === false) {
                console.log("報名失敗");
                ctx.body = "Failed";
                ctx.status = 400;
            } else {
                console.log("報名成功");
                ctx.body = "OK";
            }
        },
    })
    .get("/results", {
        validate: {
            query: {
                idNo: schema_idNo,
                birthdayStr: schema_DateStr,
            },
        },
        handler: async (ctx) => {
            // 把資料分別存在變數裡
            const idNo = ctx.query.idNo;
            const birthdayStr = UTC_to_ROC(ctx.query.birthdayStr);

            const result = await mvdis.query_query(idNo, birthdayStr);
            if (result === false) {
                ctx.body = "查詢失敗";
                ctx.status = 400;
            } else {
                // TODO: 處理這個查詢條件查不到紀錄時該回的訊息格式 -> 這段邏輯寫在哪裡比較好?
                ctx.body = result;
            }
        },
    })
    .delete("/results", {
        validate: {
            query: {
                reservationPK: schema_reservationPK,
            },
        },
        handler: async (ctx) => {
            // 把資料分別存在變數裡
            const reservationPK = ctx.query.reservationPK;
            const result = await mvdis.query_cancel(reservationPK);
            if (result === false) {
                ctx.body = "取消報名失敗";
                ctx.status = 400;
            } else {
                ctx.body = "取消報名成功";
            }
        },
    });

app.use(router.middleware());

// 2023-05-16 -> 1120516
// TODO: 傳進去的值一定要是西元年格式，或是多檢查判斷去檢查輸入的是西元還是民國格式
function UTC_to_ROC(DateStr) {
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
}

if (require.main === module) {
    const port = 3000;
    app.listen(port);
    console.log(`listening on port ${port}`);
}
module.exports = { app };
