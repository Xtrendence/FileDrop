const supertest = require("supertest");

const utils = require("../src/modules/Utils");
const DBManager = require("../src/modules/DBManager");
const ConnectionManager = require("../src/modules/ConnectionManager");

const fs = require("fs");

const ip = utils.getIP();
const port = 2180;

const app = require("../src/app");

const server = app.listen(port);

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"]
	},
	maxHttpBufferSize: 8192 * 1024
});

const dbManager = new DBManager("testDB");

const connectionManager = new ConnectionManager(io, dbManager, 64, false);

describe("app.js GET /", () => {
	test("Should return 200", async () => {
		let response = await supertest(app).get("/");
		expect(response.statusCode).toEqual(200);
	});
});

describe("DB Testing", () => {
	describe("Check if DB exists", () => {
		test("Should return true", async () => {
			expect(fs.existsSync("testDB")).toBeTruthy();
		});
	});

	describe("Test save() method", () => {
		test("Should return true", async () => {
			let response = await dbManager.save("testingKey", "testingValue", true);
			expect(response.ok).toEqual(true);
		});
	});

	describe("Test exists() method", () => {
		test("Should return true", async () => {
			let response = await dbManager.exists("testingKey");
			expect(response).toEqual(true);
		});
	});

	describe("Test fetch() method", () => {
		test("Should return testingValue", async () => {
			let response = await dbManager.fetch("testingKey");
			expect(response.data).toEqual("testingValue");
		});
	});

	describe("Test save() method for updating", () => {
		test("Should return true", async () => {
			let response = await dbManager.save("testingKey", "newValue", true);
			expect(response.ok).toEqual(true);
		});
	});

	describe("Test fetch() method for updated value", () => {
		test("Should return newValue", async () => {
			let response = await dbManager.fetch("testingKey");
			expect(response.data).toEqual("newValue");
		});
	});

	describe("Test remove() method", () => {
		test("Should return true", async () => {
			let response = await dbManager.remove("testingKey");
			expect(response.ok).toEqual(true);
		});
	});

	describe("Destroy the DB", () => {
		test("Should return false", async () => {
			await dbManager.db.destroy();
			expect(fs.existsSync("testDB")).toEqual(false);
		});
	});
});

describe("API Testing", () => {
	afterAll(() => {
		server.close();
	});

	describe("Check if client list is empty", () => {
		test("Should return 0", async () => {
			expect(Object.keys(connectionManager.clients).length).toEqual(0);
		});
	});
});