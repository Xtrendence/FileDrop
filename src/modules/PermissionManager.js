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

	remove(address) {
		delete this.whitelist[address];
	}

	whitelistContains(address, client) {		
		if(!(address in this.whitelist)) {
			return false;
		}

		if(!Object.keys(this.whitelist[address]).includes(client)) {
			return false;
		}

		return !(this.whitelist[address][client]["allowed"] === true);
	}

	attach(socket) {
		let address = socket.handshake.address;

		socket.on("ask-permission", data => {
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