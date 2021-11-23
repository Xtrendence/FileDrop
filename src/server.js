const utils = require("./modules/Utils");
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
	socket.emit("set-color", utils.getColor());
});

console.log("Started Server... http://" + ip + ":" + server.address().port);