const puppeteer = require("puppeteer");
const fs = require("fs");

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
		jest.setTimeout(60000);
		test("Should take a while but work", async () => {
			await page1.waitForSelector(".loading-screen", { hidden:true, timeout:90000 });
			storage1 = await page1.evaluate(() => {
				let storage = {};
				storage["publicKey"] = localStorage.getItem("publicKey");
				storage["privateKey"] = localStorage.getItem("privateKey");
				return storage;
			});

			await page2.waitForSelector(".loading-screen", { hidden:true, timeout:90000 });
			storage2 = await page2.evaluate(() => {
				let storage = {};
				storage["publicKey"] = localStorage.getItem("publicKey");
				storage["privateKey"] = localStorage.getItem("privateKey");
				return storage;
			});

			expect(storage1["publicKey"]).toContain("PUBLIC");
			expect(storage1["privateKey"]).toContain("PRIVATE");

			expect(storage2["publicKey"]).toContain("PUBLIC");
			expect(storage2["privateKey"]).toContain("PRIVATE");
		});
	});

	describe("Login", () => {
		jest.setTimeout(60000);
		test("Should work", async () => {
			await page1.waitForSelector(".loading-screen", { hidden:true, timeout:90000 });
			expect(await page1.evaluate('localStorage.getItem("publicKey")')).not.toBeNull();
			await page1.focus("#input-username");
			await page1.keyboard.type("Username1");
			expect(await page1.evaluate('document.querySelector("#server-button").textContent')).toContain("Connected");
			await page1.waitForTimeout(500);
			expect(await page1.evaluate('document.querySelector("#input-username").value')).not.toEqual("");
			await page1.click("#confirm-username-button");
			await page1.waitForTimeout(2000);
			let class1 = await page1.evaluate('document.querySelector("#login-wrapper").getAttribute("class")');
			expect(class1).toContain("hidden");

			await page2.waitForSelector(".loading-screen", { hidden:true, timeout:90000 });
			expect(await page2.evaluate('localStorage.getItem("publicKey")')).not.toBeNull();
			await page2.focus("#input-username");
			await page2.keyboard.type("Username2");
			expect(await page2.evaluate('document.querySelector("#server-button").textContent')).toContain("Connected");
			await page2.waitForTimeout(500);
			expect(await page2.evaluate('document.querySelector("#input-username").value')).not.toEqual("");
			await page2.click("#confirm-username-button");
			await page2.waitForTimeout(2000);
			let class2 = await page2.evaluate('document.querySelector("#login-wrapper").getAttribute("class")');
			expect(class2).toContain("hidden");

			jest.setTimeout(5000);
		});
	});
});