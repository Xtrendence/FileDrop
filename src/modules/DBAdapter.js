module.exports = class DBAdapter {
	static adapt(clients) {
		let adapted = {};

		Object.keys(clients).map(ip => {
			adapted[ip] = {
				key: clients[ip]["key"]
			}
		});

		return adapted;
	}
}