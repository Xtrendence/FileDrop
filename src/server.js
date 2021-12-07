const utils = require("./modules/Utils");

const args = process.argv.slice(2);
let mode = utils.testingMode(args) ? "Test" : "";

const DBManager = require("./modules/DBManager");
const ConnectionManager = require("./modules/ConnectionManager");

const ip = utils.getIP();
const port = 3180;

let portable = utils.portableMode(args);

let app, db;
if(portable) {
	app = require("./portableApp");
	db = utils.getUserDirectory();
} else {
	app = require("./app");
	db = "db";
}

const server = app.listen(port);

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"]
	},
	maxHttpBufferSize: 8192 * 1024
});

const dbManager = new DBManager(db);
dbManager.clear();

const connectionManager = new ConnectionManager(io, dbManager, 64, 5000);

io.on("connection", socket => {
	socket.handshake.address = utils.IPv4(socket.handshake.address);

	if(utils.testingMode(args)) {
		socket.handshake.address = utils.randomIP(connectionManager.clients);
	}

	if(utils.hasDockerEnvironment() || utils.hasDockerGroup()) {
		socket.handshake.address = utils.getClientIP(connectionManager.clients, socket);
	}

	let address = socket.handshake.address;

	if(utils.xssValid(address)) {
		socket.emit("set-ip", address);
		
		socket.on("random-username", () => {
			socket.emit("random-username", utils.getUsername(connectionManager.clients));
		});

		socket.on("register", data => {
			if(!utils.validUsername(data.username)) {
				socket.emit("username-invalid");
				return;
			}

			if(connectionManager.usernameTaken(data.username)) {
				socket.emit("username-taken");
				return;
			}

			connectionManager.addClient(socket, data.username, data.key);
		});

		socket.on("logout", () => {
			socket.emit("logout");
			connectionManager.removeClient(address);
		});
	} else {
		socket.emit("notify", { 
			title: "Invalid IP", 
			description: "The provided IP contains invalid characters.", 
			duration: 4000, 
			background: "rgb(230,20,20)",
			color: "rgb(255,255,255)"
		});

		socket.emit("kick");
	}
});

console.log("\x1b[35m", `Started ${mode} Server: `, "\x1b[4m", "http://" + ip + ":" + port, "\x1b[0m");