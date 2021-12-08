module.exports = {
	/**
	 * Gets the local IP address of the server.
	 * @returns {string} - The server's IP address.
	 */
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

	/**
	 * Gets the IP address of a client based on the X-Forwarded-For header value. If the header is not found or is empty, a random IP is assigned to the client.
	 * @param {Object} clients - The list of clients connected to the server.
	 * @param {Socket} socket - The socket to get the IP address from.
	 * @returns {string} - The IP address of the client.
	 */
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

	/**
	 * If an IPv4 address is in the format of an IPv6 one, it's converted to the standard IPv4 format.
	 * @param {string} ip - The IP address to convert.
	 * @returns {string} - The converted IPv4 address.
	 */
	IPv4(ip) {
		return ip.replace("::ffff:", "");
	},

	/**
	 * Check if a Docker environment file exists.
	 * @returns {Boolean}
	 */
	hasDockerEnvironment() {
		try {
			require("fs").statSync("/.dockerenv");
			return true;
		} catch {
			return false;
		}
	},

	/**
	 * Check if the control group file contains the word "docker".
	 * @returns {Boolean}
	 */
	hasDockerGroup() {
		try {
			return require("fs").readFileSync("/proc/self/cgroup", "utf8").includes("docker");
		} catch {
			return false;
		}
	},

	/**
	 * Check if the arguments passed to the script contain "testing" as an argument.
	 * @param {Array} args - An array of arguments.
	 * @returns {Boolean}
	 */
	testingMode(args) {
		if(!this.empty(args) && args[0] === "testing") {
			return true;
		}
		return false;
	},

	/**
	 * Check if a file called "portable" exists in the root directory of the application, or if "portable" is an argument passed to the script.
	 * @param {Array} args - An array of arguments.
	 * @returns {Boolean}
	 */
	portableMode(args) {
		const path = require("path");
		const fs = require("fs");

		let portableFile = path.join(__dirname, "../portable");

		if((!this.empty(args) && args[0] === "portable") || fs.existsSync(portableFile)) {
			return true;
		}

		return false;
	},

	/**
	 * Get the path to the user data directory.
	 * @returns {string} - The path to the user data directory.
	 */
	getUserDirectory() {
		const { app } = require("electron");
		return app.getPath("userData");
	},
	
	/**
	 * Generates and returns a random and available IPv4 address.
	 * @param {Object} clients - The list of connected clients.
	 * @returns {string} - The randomly generated IP address.
	 */
	randomIP(clients) {
		let ips = Object.keys(clients);
		let ip = "192.168.1." + this.randomBetween(64, 256);
		
		while(ip in ips) {
			ip = "192.168.1." + this.randomBetween(64, 256);
		}

		return ip;
	},

	/**
	 * Checks if a username is valid.
	 * @param {string} username - The username to check.
	 * @returns {Boolean}
	 */
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

	/**
	 * Ensures a string cannot be used as part of an XSS attack.
	 * @param {string} string - Check if a string contains opening or closing HTML tags.
	 * @returns {Boolean}
	 */
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

	/**
	 * Generate a random and available username from a list of 64 words.
	 * @param {Object} clients - A list of clients.
	 * @returns {string} - The randomly generated username.
	 */
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

	/**
	 * Generate a random and available array of colors from a list of 64 arrays.
	 * @param {string} address - The IP address of the client.
	 * @param {Object} clients - A list of clients.
	 * @returns {Object} - An object containing the array of colors and its index.
	 */
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

	/**
	 * Generates a random number within a given range.
	 * @param {Number} min - The smallest possible number.
	 * @param {Number} max - The largest possible number.
	 * @returns {Number} - The random number within the given range.
	 */
	randomBetween(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	},

	/**
	 * Remove a key from an object without modifying the original object.
	 * @param {string} key - The key to remove.
	 * @param {Object} {} - The object to remove the key from.
	 * @returns {Object} - The object with the key removed.
	 */
	removeKey(key, {[key]: _, ...rest}) {
		return rest;
	},

	/**
	 * Get the current UNIX timestamp (in seconds).
	 * @returns {Number} - Current UNIX timestamp.
	 */
	epoch() {
		return Math.floor(new Date().getTime() / 1000);
	},

	/**
	 * Checks to see if a value is empty.
	 * @param {any} value - A value to check and see if it's empty.
	 * @returns {Boolean}
	 */
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