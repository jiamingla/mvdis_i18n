/*
routes.js 檔案是用於定義和管理路由的檔案，其中包含了應用程式的各個路由以及它們的處理函式。

透過將路由檔案單獨拆分出來，你可以更好地組織和管理應用程式的路由邏輯，並使程式碼結構更加清晰和易於擴充套件。
*/
const Router = require("koa-joi-router");
const date_format = require("@joi/date");
Joi = Router.Joi;
Joi = Joi.extend(date_format);
// https://community.magento.com/t5/Magento-1-x-Technical-Issues/Unknown-date-format-neither-date-nor-time-in-yyyy-MM-dd-HH-mm-ss/td-p/445733
const router = new Router();

const mvdis = require("../mvdis_crawler.js");
const dmvNoList = require("../dmvNo.json");
const { UTC_to_ROC } = require("../utils/helper.js");

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

module.exports = router;
