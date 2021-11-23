module.exports = class UploadManager {
	constructor(connectionManager, permissionManager) {
		this.connectionManager = connectionManager;
		this.permissionManager = permissionManager;
	}

	updatePermissionManager(permissionManager) {
		this.permissionManager = permissionManager;
	}

	getWhitelist() {
		let allowed = [];
		let whitelist = this.permissionManager.whitelist;
		Object.keys(whitelist).map(client => {
			if(whitelist[client]["allowed"] === true) {
				allowed.push(client);
			}
		});
		return allowed;
	}

	attach(socket) {
		socket.on("uploaded", data => {
			let whitelist = this.getWhitelist();
			if(data.from in whitelist[data.to] && whitelist[data.to][data.from] === true) {
				this.connectionManager.io.to(data.to).emit("uploaded", { from:data.from, encryption:data.encryption, filename:data.filename });
			}
		});

		socket.on("upload", async uploadData => {
			let whitelist = this.getWhitelist();
			if(uploadData.from in whitelist[uploadData.to] && whitelist[uploadData.to][uploadData.from] === true) {
				this.connectionManager.io.to(uploadData.to).emit("upload", uploadData);
			}
		});
	}
}