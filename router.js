const Web3 = require("web3");
const web3 = new Web3(process.env.INFURA_URL);

const Router = require("@koa/router");
const router = new Router();

const config = require("./config.json");

const cTokens = {
	cBat: new web3.eth.Contract(config.cTokenAbi, config.cBatAddress),
	cDai: new web3.eth.Contract(config.cTokenAbi, config.cDaiAddress),
};

// healthz
router.get("/", (ctx) => {
	ctx.body = "alive";
});

router.get("/tokenBalance/:cToken/:address", async (ctx) => {
	const cToken = cTokens[ctx.params.cToken];
	if (typeof cToken === "undefined") {
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} doesn't exist`,
		};
		return;
	}

	try {
		const tokenBalance = await cToken.methods.balanceOfUnderlying(ctx.params.address).call();
		ctx.body = {
			cToken: ctx.params.cToken,
			address: ctx.params.address,
			tokenBalance,
		};
	} catch (e) {
		console.log(e);
		ctx.status = 500;
		ctx.body = {
			error: "internal server error",
		};
	}
});

module.exports = router;
