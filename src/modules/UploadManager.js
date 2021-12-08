/**
 * A class to manage client uploads.
 */
module.exports = class UploadManager {
	/**
	 * @param {ConnectionManager} connectionManager - The "ConnectionManager" instance.
	 * @param {PermissionManager} permissionManager - The client's "PermissionManager" instance.
	 * @returns {void}
	 * @constructor
	 */
	constructor(connectionManager, permissionManager) {
		this.connectionManager = connectionManager;
		this.permissionManager = permissionManager;
	}

	/**
	 * Update the "PermissionManager" instance, which contains the client's whitelist.
	 * @param {PermissionManager} permissionManager - The updated "PermissionManager" instance.
	 * @returns {void}
	 */
	updatePermissionManager(permissionManager) {
		this.permissionManager = permissionManager;
	}

	/**
	 * Get a client's whitelist.
	 * @param {string} address - The IP address of the client.
	 * @returns {Array} - An array of IP addresses whitelisted by the client.
	 */
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

	/**
	 * Adds event listeners to a Socket.
	 * @param {Socket} socket - The socket to add event listeners to.
	 * @returns {void}
	 */
	attach(socket) {
		// Used to inform a client that an upload was finished.
		socket.on("uploaded", data => {
			let whitelist = this.getWhitelist(data.to);
			let clients = this.connectionManager.clients;

			if(whitelist.includes(data.from)) {
				this.connectionManager.io.to(clients[data.to].socket.id).emit("uploaded", { from:data.from, encryption:data.encryption, filename:data.filename, cancelled:data.cancelled });
			}
		});

		// Used to relay chunk data to the recipient of a file.
		socket.on("upload", async data => {
			let whitelist = this.getWhitelist(data.to);
			let clients = this.connectionManager.clients;

			if(whitelist.includes(data.from)) {
				this.connectionManager.io.to(clients[data.to].socket.id).emit("upload", data);
			}
		});
	}
}