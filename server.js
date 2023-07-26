/**
 *這個檔案為後端框架，主要處理爬取資料後如何規規矩矩的傳回使用者手上
 TODO: 將route個別分開來，讓檔案不要太肥，這樣版本控制也比較容易看得出更動了什麼
 */
const Koa = require("koa");
const { koaBody } = require("koa-body");
const views = require("koa-views");
const static = require("koa-static");
const path = require("path");
const gracefulShutdown = require("http-graceful-shutdown");

const router = require("./routes/routes");

const app = new Koa();

app.use(koaBody());
app.use(static(path.resolve(__dirname, "./public")));

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

app.use(router.middleware());

if (require.main === module) {
    const port = 3000;
    server = app.listen(port);
    console.log(`listening on port ${port}`);
    // this enables the graceful shutdown
    gracefulShutdown(server);
}
module.exports = { app };
