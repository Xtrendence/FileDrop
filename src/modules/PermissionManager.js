/**
 * A class to manage client permissions.
 */
module.exports = class PermissionManager {
	/**
	 * @param {ConnectionManager} connectionManager - The "ConnectionManager" instance.
	 * @returns {void}
	 * @constructor
	 */
	constructor(connectionManager) {
		this.connectionManager = connectionManager;
		this.whitelist = {};
		this.events = {};
	}

	/**
	 * Checks if an event exists.
	 * @param {string} event - The name of the event.
	 * @returns {Boolean}
	 */
	hasEvent(event) {
		return Object.keys(this.events).includes(event);
	}

	/**
	 * Adds an event listener.
	 * @param {string} event - The name of the event.
	 * @returns {void}
	 */
	on(event, callback) {
		this.events[event] = callback;
	}

	/**
	 * Removes an event listener.
	 * @param {string} event - The name of the event.
	 * @returns {void}
	 */
	off(event) {
		delete this.events[event];
	}

	/**
	 * Remove an IP address from a client's whitelist.
	 * @param {string} address - The IP address to remove.
	 * @returns {void}
	 */
	remove(address) {
		delete this.whitelist[address];
	}

	/**
	 * Check if a client's whitelist contains an IP address.
	 * @param {string} address - The client whose whitelist should be checked.
	 * @param {string} client - The IP address to check the whitelist for.
	 * @returns {Boolean}
	 */
	whitelistContains(address, client) {		
		if(!(address in this.whitelist)) {
			return false;
		}

		if(!Object.keys(this.whitelist[address]).includes(client)) {
			return false;
		}

		return !(this.whitelist[address][client]["allowed"] === true);
	}

	/**
	 * Adds event listeners to a Socket.
	 * @param {Socket} socket - The socket to add event listeners to.
	 * @returns {void}
	 */
	attach(socket) {
		let address = socket.handshake.address;

		// Used to relay a permission request from one client to another.
		socket.on("ask-permission", data => {
			// If the recipient has already whitelisted or blocked the client asking for permission, no data is sent to them.
			if(!this.whitelistContains(data.to, data.from)) {
				let clients = this.connectionManager.clients;

				if(data.to in clients) {
					try {
						if(this.whitelist[data.to][data.from]["allowed"] === true) {
							socket.emit("update-permission", { from:data.to, response:true });
						} else {
							this.connectionManager.io.to(clients[data.to].socket.id).emit("ask-permission", data.from);
						}
					} catch(error) {
						this.connectionManager.io.to(clients[data.to].socket.id).emit("ask-permission", data.from);
					}
				}
			} else {
				socket.emit("update-permission", { from:data.to, response:false });

				socket.emit("notify", { 
					title: "Requests Blocked", 
					description: "This client has blocked your requests.", 
					duration: 4000, 
					background: "rgb(230,20,20)",
					color: "rgb(255,255,255)"
				});
			}
		});

		// Used to whitelist or block a client.
		socket.on("update-permission", data => {
			this.whitelist[address] = data.whitelist;
			
			let clients = this.connectionManager.clients;
			if(data.to in clients) {
				this.connectionManager.io.to(clients[data.to].socket.id).emit("update-permission", { from:address, response:data.response });
			}

			if(this.hasEvent("change")) {
				this.events["change"](this);
			}
		});
	}
}