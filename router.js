const Web3 = require("web3");
const Router = require("@koa/router");
const config = require("./config.json");

const web3 = new Web3(process.env.INFURA_URL);
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
const adminAddress = web3.eth.accounts.wallet[0];

const router = new Router();

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

// What is cToken in Compound? https://defipulse.com/blog/what-is-cdai
router.get("/cTokenBalance/:cToken/:address", async (ctx) => {
	const cToken = cTokens[ctx.params.cToken];
	if (typeof cToken === "undefined") {
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} doesn't exist`,
		};
		return;
	}

	try {
		const cTokenBalance = await cToken.methods.balanceOf(ctx.params.address).call();
		ctx.body = {
			cToken: ctx.params.cToken,
			address: ctx.params.address,
			cTokenBalance,
		};
	} catch (e) {
		console.log(e);
		ctx.status = 500;
		ctx.body = {
			error: "internal server error",
		};
	}
});

// mint cToken to token
router.post("/mint/:cToken/:amount", async (ctx) => {
	const cToken = cTokens[ctx.params.cToken];
	const amount = ctx.params.amount;
	if (typeof cToken === "undefined") {
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} doesn't exist`,
		};
		return;
	}

	if (typeof amount === "undefined" || amount <= 0) {
		ctx.status = 400;
		ctx.body = {
			error: `invalid amount`,
		};
		return;
	}

	// methods.myMethod.call vs methods.myMethod.send
	// https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#methods-mymethod-send
	const tokenAddress = await cToken.methods.underlying().call();
	const contract = new web3.eth.Contract(config.ERC20Abi, tokenAddress);
	// https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#options-address
	await contract.methods.approve(cToken.options.address, amount).send({ from: adminAddress });

	try {
		await contract.methods.mint(amount).send({ from: adminAddress });
		ctx.body = {
			cToken: ctx.params.cToken,
			address: adminAddress,
			amount,
		};
	} catch (e) {
		console.log(e);
		ctx.status = 500;
		ctx.body = {
			error: "internal server error",
		};
	}
});

router.post("/redeem/:cToken/:amount", async (ctx) => {
	const cToken = cTokens[ctx.params.cToken];
	const amount = ctx.params.amount;
	if (typeof cToken === "undefined") {
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} doesn't exist`,
		};
		return;
	}

	if (typeof amount === "undefined" || amount <= 0) {
		ctx.status = 400;
		ctx.body = {
			error: `invalid amount`,
		};
		return;
	}

	try {
		await contract.methods.redeem(amount).send({ from: adminAddress });
		ctx.body = {
			cToken: ctx.params.cToken,
			address: adminAddress,
			amount,
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
