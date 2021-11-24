const fs = require("fs");
const utils = require("./modules/Utils");
const DBManager = require("./modules/DBManager");
const ConnectionManager = require("./modules/ConnectionManager");

const ip = utils.getIP();
const port = 2180;

const app = require("./app");
const server = app.listen(port);

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"]
	},
	maxHttpBufferSize: 8192 * 1024
});

const dbManager = new DBManager("db");

const connectionManager = new ConnectionManager(io, dbManager, 64);

io.on("connection", socket => {
	connectionManager.addClient(socket);
});

console.log("\x1b[35m", "Started Server: ", "\x1b[4m", "http://" + ip + ":" + server.address().port, "\x1b[0m");