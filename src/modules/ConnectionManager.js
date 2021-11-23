const utils = require("./Utils");

module.exports = class ConnectionManager {
	constructor(io) {
		this.io = io;
		this.clients = {};
	}

	broadcastList() {
		this.io.to("network").emit("client-list", this.getClients());
	}

	getClients() {
		let clients = this.clients;

		Object.keys(clients).map(ip => {
			delete clients[ip]["socket"];
		});

		return clients;
	}

	addClient(socket) {
		let address = socket.handshake.address;

		this.clients[address] = { socket:socket, key:null };

		socket.on("disconnect", () => {
			this.removeClient(address);
		});

		socket.on("set-key", key => {
			this.clients[address]["key"] = key;
		});

		socket.emit("set-color", utils.getColor());

		this.broadcastList();
	}

	removeClient(address) {
		delete this.clients[address];
		this.broadcastList();
	}
}