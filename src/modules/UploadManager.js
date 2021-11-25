module.exports = class UploadManager {
	constructor(connectionManager, permissionManager) {
		this.connectionManager = connectionManager;
		this.permissionManager = permissionManager;
	}

	updatePermissionManager(permissionManager) {
		this.permissionManager = permissionManager;
	}

	getWhitelist(address) {
		let allowed = [];
		let whitelist = this.permissionManager.whitelist;
		if(address in whitelist) {
			Object.keys(whitelist[address]).map(client => {
				if(whitelist[address][client]["allowed"] === true) {
					allowed.push(client);
				}
			});
		}
		return allowed;
	}

	attach(socket) {
		socket.on("uploaded", data => {
			let whitelist = this.getWhitelist(data.to);
			let clients = this.connectionManager.clients;
			if(whitelist.includes(data.from)) {
				this.connectionManager.io.to(clients[data.to].socket.id).emit("uploaded", { from:data.from, encryption:data.encryption, filename:data.filename });
			}
		});

		socket.on("upload", async data => {
			let whitelist = this.getWhitelist(data.to);
			let clients = this.connectionManager.clients;
			if(whitelist.includes(data.from)) {
				this.connectionManager.io.to(clients[data.to].socket.id).emit("upload", data);
			}
		});
	}
}