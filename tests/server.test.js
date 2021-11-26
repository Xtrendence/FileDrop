const supertest = require("supertest");

const validKeys = require("./validKeys");

const utils = require("../src/modules/Utils");
const DBManager = require("../src/modules/DBManager");
const ConnectionManager = require("../src/modules/ConnectionManager");

const Client = require("socket.io-client");

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
	let dbManager, connectionManager, client1, client2, client3, client4;
	let testClients = [];

	beforeAll((done) => {
		dbManager = new DBManager("testDB");
		connectionManager = new ConnectionManager(io, dbManager, 3, false);

		client1 = new Client(`http://${ip}:${port}`);
		client2 = new Client(`http://${ip}:${port}`);
		client3 = new Client(`http://${ip}:${port}`);
		client4 = new Client(`http://${ip}:${port}`);

		io.on("connection", socket => {
			if(testClients.length === 0) {
				socket.handshake.address = "0";
			}

			if(testClients.length === 1) {
				socket.handshake.address = "1";
			}

			if(testClients.length === 2) {
				socket.handshake.address = "2";
			}

			if(testClients.length === 3) {
				socket.handshake.address = "3";
			}

			testClients.push(socket);
			
			if(testClients.length === 4) {
				done();
			}
		});
	});

	afterAll(async () => {
		client1.close();
		client2.close();
		client3.close();
		client4.close();
		io.close();
		server.close();
		await dbManager.db.destroy();
	});

	describe("ConnectionManager Tests", () => {
		describe("Check if client list is empty", () => {
			test("Should return 0", async () => {
				expect(Object.keys(connectionManager.clients).length).toEqual(0);
			});
		});

		describe("Check that 4 clients are connected", () => {
			test("Should return 4", async () => {
				expect(testClients.length).toEqual(4);
			});
		});

		describe("Test the attach() method", () => {
			test("Should work", async () => {
				expect(connectionManager.attach(testClients[0])).toEqual(undefined);
				expect(connectionManager.attach(testClients[1])).toEqual(undefined);
				expect(connectionManager.attach(testClients[2])).toEqual(undefined);
			});
		});
		
		describe("Test the addClient() method with a wrong key", () => {
			test("Should not add any clients", done => {
				connectionManager.addClient(testClients[0], "TestUsername1", "<>");
				expect(Object.keys(connectionManager.clients).length).toEqual(0);
				done();
			});
		});

		describe("Test the addClient() method with a valid key", () => {
			test("Should add both clients", done => {
				connectionManager.addClient(testClients[0], "TestUsername1", validKeys["1"].publickey);
				connectionManager.addClient(testClients[1], "TestUsername2", validKeys["2"].publickey);
				connectionManager.addClient(testClients[2], "TestUsername3", validKeys["3"].publickey);
				expect(Object.keys(connectionManager.clients).length).toEqual(3);
				done();
			});
		});

		describe("Test the clientLimitReached() method by tryng to add another client", () => {
			test("Should still have 3 clients", done => {
				connectionManager.addClient(testClients[3], "TestUsername4", validKeys["1"].publickey);
				expect(Object.keys(connectionManager.clients).length).toEqual(3);
				done();
			});
		});

		describe("Test the removeClient() method", () => {
			test("Should leave 2 clients", done => {
				connectionManager.removeClient(testClients[2].handshake.address);
				expect(Object.keys(connectionManager.clients).length).toEqual(2);
				done();
			});
		});

		describe("Test the usernameTaken() method", () => {
			test("Should return true", async () => {
				expect(connectionManager.usernameTaken("TestUsername1")).toEqual(true);
			});
		});

		describe("Test the clientExists() method", () => {
			test("Should return true, then false", async () => {
				expect(connectionManager.clientExists(testClients[1].handshake.address)).toEqual(true);
				expect(connectionManager.clientExists(testClients[3].handshake.address)).toEqual(false);
			});
		});
	});

	describe("PermissionManager Tests", () => {
		describe("Test if client 1 can send client 2 a request to send files", () => {
			test("Should work", done => {
				client2.on("ask-permission", data => {
					expect(data).not.toBeNull();
					done();
				});

				client1.emit("ask-permission", { from:testClients[0].handshake.address, to:testClients[1].handshake.address });
			});
		});

		describe("Test if client 1 can whitelist client 2", () => {
			test("Should work", done => {
				client1.on("update-permission", data => {
					expect(data).not.toBeNull();
					done();
				});

				client2.emit("update-permission", { to:"0", whitelist:{ ["1"]: { allowed:true }, response:true }});
			});
		});
	});
});