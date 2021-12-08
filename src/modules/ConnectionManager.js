// Imports.
const PermissionManager = require("./PermissionManager");
const UploadManager = require("./UploadManager");
const DBAdapter = require("./DBAdapter");
const utils = require("./Utils");

/**
 * A class to manage client connections.
 */
module.exports = class ConnectionManager {
	/**
	 * @param {Server} io - The Socket.IO server.
	 * @param {string} db - The name of the database.
	 * @param {Number} clientLimit - The maximum number of concurrent clients.
	 * @param {Number|Boolean} pingInterval - How often to ping clients and keep the connection alive.
	 * @returns {void}
	 * @constructor
	 */
	constructor(io, db, clientLimit = 64, pingInterval = 2500) {
		this.io = io;
		this.db = db;
		this.clientLimit = clientLimit;
		this.clients = {};

		this.permissionManager = new PermissionManager(this);

		if(pingInterval !== false) {
			this.ping = setInterval(() => {
				this.io.to("network").emit("ping");
			}, pingInterval);
		}
	}

	/**
	 * Adds event listeners to a Socket.
	 * @param {Socket} socket - The socket to add event listeners to.
	 * @returns {void}
	 */
	attach(socket) {
		let address = socket.handshake.address;

		// When a client is disconnected, they are removed from the server as a user.
		socket.on("disconnect", async () => {
			socket.leave("network");

			if(address in this.clients) {
				this.clients[address].permissionManager.off("change");
			}

			await this.removeClient(address);
		});

		// Fetch the list of clients from the database, and broadcast it to all clients.
		socket.on("get-clients", async () => {
			let clients = await this.getClients();
			socket.emit("client-list", clients);
		});

		// Set the public RSA key of a client.
		socket.on("set-key", async key => {
			// Ensure the public key cannot be used as part of an XSS attack.
			if(utils.xssValid(key)) {
				this.clients[address]["key"] = key;

				await this.saveClients();
				await this.broadcastList();
			} else {
				socket.emit("notify", { 
					title: "Invalid Key", 
					description: "The provided key contains invalid characters.", 
					duration: 4000, 
					background: "rgb(230,20,20)",
					color: "rgb(255,255,255)"
				});

				socket.emit("kick");

				this.removeClient(address);
			}
		});
	}

	/**
	 * Fetch the list of clients from the database and broadcast it to every registered client.
	 * @param {Boolean} changed - Whether or not clients have been added or removed.
	 * @returns {void}
	 */
	async broadcastList(changed = false) {
		let clients = await this.getClients();
		this.io.to("network").emit("client-list", clients);

		if(changed) {
			let list = [];
			Object.keys(clients).map(ip => {
				list.push(`${ip} => ${clients[ip]["username"]}`);
			});

			console.log(utils.epoch(), ": \x1b[33m", list, "\x1b[0m");
		}
	}

	/**
	 * Fetch the list of clients from the database.
	 * @returns {Object} - The list of clients.
	 */
	async getClients() {
		try {
			let clients = await this.db.fetch("clients");
			return clients.data;
		} catch(error) {
			if(error.status !== 404) {
				console.log(error);
			} else {
				return {};
			}
		}
	}

	/**
	 * Check if a client exists.
	 * @param {string} address - The IP address of the client.
	 * @returns {Boolean}
	 */
	clientExists(address) {
		return Object.keys(this.clients).includes(address);
	}

	/**
	 * Check if a username is taken.
	 * @param {string} username - The username to check.
	 * @returns {Boolean}
	 */
	usernameTaken(username) {
		let taken = false;

		Object.keys(this.clients).map(ip => {
			if(username.toLowerCase() === this.clients[ip]["username"].toLowerCase()) {
				taken = true;
			}
		});

		return taken;
	}

	/**
	 * Check if the maximum number of clients are connected.
	 * @returns {Boolean}
	 */
	clientLimitReached() {
		return (Object.keys(this.clients).length >= this.clientLimit);
	}

	/**
	 * Save the current list of clients to the database.
	 * @returns {void}
	 */
	async saveClients() {
		let clients = DBAdapter.adapt(this.clients);

		try {
			await this.db.save("clients", clients, false);
		} catch(error) {
			await this.db.save("clients", clients, true);

			if(error.status !== 409) {
				console.log("saveClients()", error);
			}
		}
	}

	/**
	 * Register a client as a user.
	 * @param {Socket} socket - The client's Socket.
	 * @param {string} username - The client's username.
	 * @param {string} key - The client's public RSA key.
	 * @returns {void}
	 */
	async addClient(socket, username, key) {
		let address = socket.handshake.address;

		// Ensure the client's public RSA key cannot be used as part of an XSS attack.
		if(utils.xssValid(key)) {
			// Ensure the maximum number of clients hasn't been reached.
			if(!this.clientLimitReached()) {
				// If the client already exists, remove them first.
				if(this.clientExists(address)) {
					await this.removeClient(address);
				}

				// Add the client to the "network" room.
				socket.join("network");

				// Assign a color to the client.
				let color = utils.getColor(address, this.clients);
			
				// Add the "PermissionManager" event listeners to the client's socket.
				this.permissionManager.attach(socket);
			
				// Create a new "UploadManager" instance for the client, and add the relevant event listeners to their socket.
				let uploadManager = new UploadManager(this, this.permissionManager);
				uploadManager.attach(socket);

				// If the client's whitelist is modified, their "UploadManager" instance needs to be updated.
				this.permissionManager.on("change", (state) => {
					if(this.clientExists(address)) {
						this.clients[address]["permissionManager"] = state;
						uploadManager.updatePermissionManager(state);
					}
				});

				// Add the client to the list of clients.
				this.clients[address] = { socket:socket, username:username, key:key, uploadManager:uploadManager, permissionManager:this.permissionManager, color:color.index };

				// Add the remaining event listeners to the client's socket.
				this.attach(socket);

				// Set the client's background color.
				socket.emit("set-color", color.colors);

				// Inform the client that they're logged in.
				socket.emit("login", username);

				// Save the client list to the database, and broadcast the updated list to other registered users.
				await this.saveClients();
				await this.broadcastList(true);
			} else {
				socket.emit("notify", { 
					title: "Limit Reached", 
					description: "Maximum number of devices are connected to the server.", 
					duration: 30000, 
					background: "rgb(230,20,20)",
					color: "rgb(255,255,255)"
				});
			}
		} else {
			socket.emit("notify", { 
				title: "Invalid Key", 
				description: "The provided key contains invalid characters.", 
				duration: 4000, 
				background: "rgb(230,20,20)",
				color: "rgb(255,255,255)"
			});

			socket.emit("kick");

			this.removeClient(address);
		}
	}

	/**
	 * Remove a client from the client list.
	 * @param {string} address - The IP address of the client to remove.
	 * @returns {void}
	 */
	async removeClient(address) {
		delete this.clients[address];

		this.permissionManager.remove(address);

		await this.saveClients();
		await this.broadcastList(true);
	}
}