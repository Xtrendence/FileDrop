const puppeteer = require("puppeteer");

const utils = require("../src/modules/Utils");

const validKeys = require("./validKeys");

describe("Client Testing", () => {
	let storage1 = {}, storage2 = {};
	let browser1, browser2, page1, page2;

	beforeAll(async () => {
		browser1 = await puppeteer.launch();
		browser2 = await puppeteer.launch();

		page1 = await browser1.newPage();
		page2 = await browser2.newPage();

		await page1.goto(`http://${utils.getIP()}:2180`);
		await page2.goto(`http://${utils.getIP()}:2180`);
	});

	afterAll(async () => {
		await browser1.close();
		await browser2.close();
	});

	describe("Check page title", () => {
		test("Should return FileDrop", async () => {
			expect(await page1.title()).toEqual("FileDrop");
			expect(await page2.title()).toEqual("FileDrop");
		});
	});

	describe("Check RSA keys have been generated", () => {
		test("Should take a while but work", async () => {
			let publicKey1 = validKeys["0"].publicKey;
			let privateKey1 = validKeys["0"].privateKey;

			let publicKey2 = validKeys["1"].publicKey;
			let privateKey2 = validKeys["1"].privateKey;

			storage1 = await page1.evaluate((publicKey, privateKey) => {
				localStorage.setItem("publicKey", publicKey);
				localStorage.setItem("privateKey", privateKey);

				let storage = {};
				storage["publicKey"] = localStorage.getItem("publicKey");
				storage["privateKey"] = localStorage.getItem("privateKey");

				return storage;
			}, publicKey1, privateKey1);

			storage2 = await page2.evaluate((publicKey, privateKey) => {
				localStorage.setItem("publicKey", publicKey);
				localStorage.setItem("privateKey", privateKey);

				let storage = {};
				storage["publicKey"] = localStorage.getItem("publicKey");
				storage["privateKey"] = localStorage.getItem("privateKey");

				return storage;
			}, publicKey2, privateKey2);

			expect(storage1["publicKey"]).toEqual(publicKey1);
			expect(storage1["privateKey"]).toEqual(privateKey1);

			expect(storage2["publicKey"]).toEqual(publicKey2);
			expect(storage2["privateKey"]).toEqual(privateKey2);
		});
	});
});