module.exports = class DBAdapter {
	static adapt(clients) {
		let adapted = {};

		Object.keys(clients).map(ip => {
			adapted[ip] = {
				username: clients[ip]["username"],
				key: clients[ip]["key"]
			}
		});

		return adapted;
	}
}