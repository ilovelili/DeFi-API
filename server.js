require("dotenv").config();
const Koa = require("koa");
const app = new Koa();
const router = require("./router");

// healthz
router.get("/", (ctx) => {
	ctx.body = "alive";
});

app.use(router.routes());
app.listen(3000);
