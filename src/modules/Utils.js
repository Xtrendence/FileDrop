module.exports = {
	getIP() {
		const { networkInterfaces } = require("os");

		const interfaces = networkInterfaces();
		const ips = {};

		for(const networkInterface of Object.keys(interfaces)) {
			for(const net of interfaces[networkInterface]) {
				if(net.family === "IPv4" && !net.internal) {
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

	getColor() {
		const colors = require("./Colors");
		return colors[this.randomBetween(0, 63)];
	},

	randomBetween(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}
}