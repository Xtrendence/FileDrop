const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const fs = require("fs");

const utils = require("../src/modules/Utils");

const validKeys = require("./validKeys");

let requireStart = true;

describe("Client Testing", () => {
	let storage1 = {}, storage2 = {};
	let browser1, browser2, page1, page2;

	beforeAll(async () => {
		if(requireStart) {
			exec("node src/server.js testing");
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}

		browser1 = await puppeteer.launch();
		browser2 = await puppeteer.launch();

		page1 = await browser1.newPage();
		page2 = await browser2.newPage();

		await page1.goto(`http://${utils.getIP()}:2180`);
		await page2.goto(`http://${utils.getIP()}:2180`);
	});

	afterAll(async () => {
		exec("kill $(lsof -t -i:2180)");

		await new Promise((resolve) => setTimeout(resolve, 4000));

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
		jest.setTimeout(120000);
		test("Should work", async () => {
			await page1.waitForSelector(".loading-screen", { hidden:true, timeout:90000 });
			expect(await page1.evaluate('localStorage.getItem("publicKey")')).not.toBeNull();
			await page1.focus("#input-username");
			await page1.keyboard.type("Username1");
			await page1.waitForTimeout(5000);
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
			await page2.waitForTimeout(5000);
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

	describe("Check client list", () => {
		test("Should return Username2", async () => {
			await page1.waitForSelector(".username", { timeout:5000 });
			let username = await page1.evaluate('document.getElementsByClassName("username")[0].textContent');
			let action = await page1.evaluate('document.getElementsByClassName("client-action")[0].textContent');
			expect(username).toEqual("Username2");
			expect(action).toEqual("Ask Permission");
		});
	});

	describe("Ask client 2 for permission to send a file", () => {
		test("Should work", async () => {
			await page1.evaluate('document.getElementsByClassName("client-action")[0].click()');
			await page2.waitForSelector(".accept", { timeout:5000 });
			await page2.evaluate('document.getElementsByClassName("accept")[0].click()');
			let html = await page1.evaluate('document.body.innerHTML');
			expect(html).toContain("You can now send files to");
		});
	});
});