module.exports = class PermissionManager {
	constructor(connectionManager) {
		this.connectionManager = connectionManager;
		this.whitelist = {};
		this.events = {};
	}

	hasEvent(event) {
		return Object.keys(this.events).includes(event);
	}

	on(event, callback) {
		this.events[event] = callback;
	}

	off(event) {
		delete this.events[event];
	}

	whitelistContains(client) {
		return Object.keys(this.whitelist).includes(client);
	}

	attach(socket) {
		socket.on("ask-permission", data => {
			if(!this.whitelistContains(data.from)) {
				this.connectionManager.io.to(data.to).emit("ask-permission", data.from);
			}
		});

		socket.on("update-permission", data => {
			let address = socket.handshake.address;

			this.whitelist = data.whitelist;
			
			this.connectionManager.io.to(data.to).emit("update-permission", { from:address, whitelist:this.whitelist });

			if(this.hasEvent("change")) {
				this.events["change"](this);
			}
		});
	}
}