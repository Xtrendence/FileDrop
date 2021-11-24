const PermissionManager = require("./PermissionManager");
const UploadManager = require("./UploadManager");
const DBAdapter = require("./DBAdapter");
const utils = require("./Utils");

module.exports = class ConnectionManager {
	constructor(io, db, clientLimit = 64) {
		this.io = io;
		this.db = db;
		this.clientLimit = clientLimit;
		this.clients = {};
	}

	async broadcastList() {
		this.io.to("network").emit("client-list", await this.getClients());
	}

	async getClients() {
		let clients = await this.db.fetch("clients");
		return clients.data;
	}

	clientExists(address) {
		return Object.keys(this.clients).includes(address);
	}

	clientLimitReached() {
		return (Object.keys(this.clients).length >= this.clientLimit);
	}

	async saveClients() {
		let clients = DBAdapter.adapt(this.clients);
		await this.db.save("clients", clients);
	}

	async addClient(socket) {
		if(!this.clientLimitReached()) {
			let address = socket.handshake.address;

			if(this.clientExists(address)) {
				await this.removeClient(address);
			}

			socket.join("network");

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

			socket.on("disconnect", async () => {
				socket.leave("network");
				permissionManager.off("change");
				await this.removeClient(address);
			});

			socket.on("set-key", key => {
				this.clients[address]["key"] = key;
			});

			socket.emit("set-color", color.colors);

			await this.saveClients();

			await this.broadcastList();
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

	async removeClient(address) {
		delete this.clients[address];
		await this.saveClients();
		await this.broadcastList();
	}
}