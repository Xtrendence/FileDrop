module.exports = {
	getIP() {
		const { networkInterfaces } = require("os");

		const interfaces = networkInterfaces();
		const ips = {};

		for(const networkInterface of Object.keys(interfaces)) {
			for(const net of interfaces[networkInterface]) {
				if(net.family === "IPv4" && !net.internal && !networkInterface.toLowerCase().match("(vethernet|vmware|vm|area)")) {
					if(!ips[networkInterface]) {
						ips[networkInterface] = [];
					}
					ips[networkInterface].push(net.address);
				}
			}
		}

		const ip = ips[Object.keys(ips)[0]][0];

		return ip;
	},

	getClientIP(clients, socket) {
		try {
			let ip;

			if("handshake" in socket && "headers" in socket.handshake && !this.empty(socket.handshake.headers["x-forwarded-for"])) {
				ip = socket.handshake.headers["x-forwarded-for"];
			}

			if("request" in socket && "headers" in socket.request && !this.empty(socket.request.headers["x-forwarded-for"])) {
				ip = socket.request.headers["x-forwarded-for"];
			}

			if("handshake" in socket && "headers" in socket.handshake && !this.empty(socket.handshake.headers["X-Forwarded-For"])) {
				ip = socket.handshake.headers["X-Forwarded-For"];
			}

			if("request" in socket && "headers" in socket.request && !this.empty(socket.request.headers["X-Forwarded-For"])) {
				ip = socket.request.headers["X-Forwarded-For"];
			}

			if(this.empty(ip) || (ip in clients)) {
				ip = this.randomIP(clients);
			}

			return ip;
		} catch(error) {
			console.log(error);
		}
	},

	IPv4(ip) {
		return ip.replace("::ffff:", "");
	},

	hasDockerEnvironment() {
		try {
			require("fs").statSync("/.dockerenv");
			return true;
		} catch {
			return false;
		}
	},

	hasDockerGroup() {
		try {
			return require("fs").readFileSync("/proc/self/cgroup", "utf8").includes("docker");
		} catch {
			return false;
		}
	},

	testingMode(args) {
		if(!this.empty(args) && args[0] === "testing") {
			return true;
		}
		return false;
	},

	portableMode(args) {
		const fs = require("fs");

		if((!this.empty(args) && args[0] === "portable")) {
			return true;
		}
		return false;
	},

	getUserDirectory() {
		const { app } = require("electron");
		return app.getPath("userData");
	},
	
	randomIP(clients) {
		let ips = Object.keys(clients);
		let ip = "192.168.1." + this.randomBetween(64, 256);
		
		while(ip in ips) {
			ip = "192.168.1." + this.randomBetween(64, 256);
		}

		return ip;
	},

	validUsername(username) {
		try {
			if(username.length > 16) {
				return false;
			}
			
			return (/^[A-Za-z0-9]+$/.test(username));
		} catch(error) {
			console.log(error);
			return false;
		}
	},

	xssValid(string) {
		try {
			if(string.includes("<") || string.includes(">")) {
				return false;
			}
			return true;
		} catch(error) {
			return false;
		}
	},

	getUsername(clients) {
		let words = require("./Words");
		let available = Object.keys(words);

		let ips = Object.keys(clients);
		ips.map(ip => {
			let index = available.indexOf([clients[ip]["username"]]);
			if(index > -1) {
				available.splice(index, 1);
			}
		});

		let max = available.length - 1;

		let random = this.randomBetween(0, max);

		return words[available[random]];
	},

	getColor(address, clients) {
		let colors = require("./Colors");
		let available = Object.keys(colors);

		delete clients[address];

		let ips = Object.keys(clients);
		ips.map(ip => {
			let index = available.indexOf([clients[ip]["color"]].toString());
			if(index > -1) {
				available.splice(index, 1);
			}
		});

		let max = available.length - 1;

		let random = this.randomBetween(0, max);

		return { colors:colors[available[random]], index:available[random] };
	},

	randomBetween(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	},

	removeKey(key, {[key]: _, ...rest}) {
		return rest;
	},

	epoch() {
		return Math.floor(new Date().getTime() / 1000);
	},

	empty(value) {
		if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}
		return false;
	}
}