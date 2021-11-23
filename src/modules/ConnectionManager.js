const PermissionManager = require("./PermissionManager");
const UploadManager = require("./UploadManager");
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
		let clients = Object.create(this.clients);

		Object.keys(clients).map(ip => {
			delete clients[ip]["socket"];
			delete clients[ip]["uploadManager"];
			delete clients[ip]["permissionManager"];
			delete clients[ip]["color"];
		});

		return clients;
	}

	addClient(socket) {
		let address = socket.handshake.address;

		let color = utils.getColor(address, this.clients);
		
		let permissionManager = new PermissionManager(this);
		permissionManager.attach(socket);
		
		let uploadManager = new UploadManager(this, permissionManager);
		uploadManager.attach(socket);

		permissionManager.addEventListener("change", (state) => {
			this.clients[address]["permissionManager"] = state;
			uploadManager.updatePermissionManager(state);
		});

		this.clients[address] = { socket:socket, key:null, uploadManager:uploadManager, permissionManager:permissionManager, color:color.index };

		socket.on("disconnect", () => {
			this.removeClient(address);
		});

		socket.on("set-key", key => {
			this.clients[address]["key"] = key;
		});

		socket.emit("set-color", color.colors);

		this.broadcastList();
	}

	removeClient(address) {
		delete this.clients[address];
		this.broadcastList();
	}
}