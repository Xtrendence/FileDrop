// Imports.
const utils = require("./modules/Utils");
const DBManager = require("./modules/DBManager");
const ConnectionManager = require("./modules/ConnectionManager");

// Check if the app is in testing mode (this causes random IPs to be assigned to clients so that unit and integration testing can be done with multiple clients on the same device).
const args = process.argv.slice(2);
let mode = utils.testingMode(args) ? "Test" : "";

// Get the local server IP and set the port number.
const ip = utils.getIP();
const port = 3180;

// Check if the server is being run as part of the Electron application.
let portable = utils.portableMode(args);

// If the server is running as part of the Electron application, the database content is stored in the user data directory.
let app, db;
if(portable) {
	app = require("./portableApp");
	db = utils.getUserDirectory();
} else {
	app = require("./app");
	db = "db";
}

// Start the server.
const server = app.listen(port);

// Add Socket.IO functionality to the server.
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"]
	},
	maxHttpBufferSize: 8192 * 1024
});

// Create a new database and clear previous clients in case the DB already exists.
const dbManager = new DBManager(db);
dbManager.clear();

// Instantiate the "ConnectionManager" class that's used to manage all client connections.
const connectionManager = new ConnectionManager(io, dbManager, 64, 5000);

io.on("connection", socket => {
	// Attempt to convert the IP address to IPv4 format.
	socket.handshake.address = utils.IPv4(socket.handshake.address);

	// If testing mode is enabled, assign a random IP to the client.
	if(utils.testingMode(args)) {
		socket.handshake.address = utils.randomIP(connectionManager.clients);
	}

	// If FileDrop is being run in a Docker container, try to use the X-Forwarded-For header to get the client's IP address. As a fallback, a random IP is assigned (this doesn't affect the functionality of the application).
	if(utils.hasDockerEnvironment() || utils.hasDockerGroup()) {
		socket.handshake.address = utils.getClientIP(connectionManager.clients, socket);
	}

	let address = socket.handshake.address;

	// Ensure the IP address provided by the client is valid and doesn't contain any script tags that could be used as part of an XSS attack since client IP addresses are sometimes shown on the DOM.
	if(utils.xssValid(address)) {
		// Send the client their IP address as it's stored on the server.
		socket.emit("set-ip", address);
		
		// Generate a random username and send it to the client.
		socket.on("random-username", () => {
			socket.emit("random-username", utils.getUsername(connectionManager.clients));
		});

		// Check the validity and availability of the client's username, and register them as a user.
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

		// Remove the client as a user, and inform them that they've been logged out.
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