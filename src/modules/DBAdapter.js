/**
 * A class for converting the client list to one that can be stored by the database.
 */
module.exports = class DBAdapter {
	/**
	 * Converts the client list to one that can be serialized.
	 * @param {Object} clients - An object containing the clients connected to the server.
	 * @returns {Object} - A converted/adapted object that can be stored in the database.
	 */
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