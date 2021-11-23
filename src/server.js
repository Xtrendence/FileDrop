const utils = require("./modules/Utils");
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

io.on("connection", socket => {
	const manager = new ConnectionManager(io);
	manager.addClient(socket);
});

console.log("Started Server... http://" + ip + ":" + server.address().port);