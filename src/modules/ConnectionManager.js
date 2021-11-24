const PermissionManager = require("./PermissionManager");
const UploadManager = require("./UploadManager");
const utils = require("./Utils");

module.exports = class ConnectionManager {
	constructor(io, clientLimit = 64) {
		this.io = io;
		this.clientLimit = clientLimit;
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

	clientLimitReached() {
		return (Object.keys(this.clients).length >= this.clientLimit);
	}

	addClient(socket) {
		if(!this.clientLimitReached()) {
			let address = socket.handshake.address;

			let color = utils.getColor(address, this.clients);
			
			let permissionManager = new PermissionManager(this);
			permissionManager.attach(socket);
			
			let uploadManager = new UploadManager(this, permissionManager);
			uploadManager.attach(socket);

			permissionManager.on("change", (state) => {
				this.clients[address]["permissionManager"] = state;
				uploadManager.updatePermissionManager(state);
			});

			this.clients[address] = { socket:socket, key:null, uploadManager:uploadManager, permissionManager:permissionManager, color:color.index };

			socket.on("disconnect", () => {
				permissionManager.off("change");
				this.removeClient(address);
			});

			socket.on("set-key", key => {
				this.clients[address]["key"] = key;
			});

			socket.emit("set-color", color.colors);

			this.broadcastList();
		} else {
			socket.emit("notify", { 
				title: "Limit Reached", 
				description: "Maximum number of devices are connected to the server.", 
				duration: 30000, 
				background: "rgb(230,20,20)",
				color: "rgb(255,255,255)"
			});
		}
	}

	removeClient(address) {
		delete this.clients[address];
		this.broadcastList();
	}
}