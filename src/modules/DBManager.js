const PouchDB = require("pouchdb");

/**
 * A class with methods that provide CRUD functionality.
 */
module.exports = class DBManager {
	/**
	 * @param {string} db - The name of the database.
	 * @returns {void}
	 * @constructor
	 */
	constructor(db) {
		this.db = new PouchDB(db);
	}

	/**
	 * Remove all clients from the database.
	 * @returns {void}
	 */
	async clear() {
		this.remove("clients").then(() => {
			console.log("\x1b[34m", "Cleared Previous Clients", "\x1b[0m");
		}).catch(error => {
			console.log(error);
		});
	}

	/**
	 * Saves a key and value pair to the database.
	 * @param {string} key - The key associated with the value being stored.
	 * @param {string} value - The data being stored.
	 * @param {string} force - In the event of a conflict, whether or not to forcefully write to the database.
	 * @returns {Promise}
	 */
	async save(key, value, force) {
		return new Promise(async (resolve, reject) => {
			this.exists(key).then(() => {
				this.db.get(key).then(document => {
					document.data = value;

					this.db.put(document, { force:force }).then(response => {
						resolve(response);
					}).catch(error => {
						if(error.status !== 409) {
							console.log("Exists - Save Error", error);
						}
						reject(error);
					});
				}).catch(error => {
					console.log("Fetch Error", error);
					reject(error);
				});
			}).catch(() => {
				this.db.put({
					_id: key,
					data: value
				}).then(response => {
					resolve(response);
				}).catch(error => {
					if(error.status !== 409) {
						console.log("Create - Save Error", error);
					}
					reject(error);
				});
			});
		});
	}

	/**
	 * Removes data from the database based on a given key.
	 * @param {string} key - The key to remove from the database.
	 * @returns {Promise}
	 */
	remove(key) {
		return new Promise((resolve, reject) => {
			this.exists(key).then(() => {
				this.db.get(key).then(document => {
					this.db.remove(document).then(response => {
						resolve(response);
					}).catch(error => {
						console.log("Remove Error", error);
						reject(error);
					});
				}).catch(error => {
					console.log("Fetch Error", error);
					reject(error);
				});
			}).catch(() => {
				resolve();
			});
		});
	}

	/**
	 * Check if a key exists in the database.
	 * @param {string} key - The key to check the database for.
	 * @returns {Promise}
	 */
	exists(key) {
		return new Promise((resolve, reject) => {
			this.db.get(key).then(() => {
				resolve(true);
			}).catch(() => {
				reject(false);
			});
		});
	}

	/**
	 * Fetch the value of a key.
	 * @param {string} key - The key to fetch the value of.
	 * @returns {Promise}
	 */
	fetch(key) {
		return new Promise((resolve, reject) => {
			this.db.get(key).then(response => {
				resolve(response);
			}).catch(error => {
				if(error.status !== 404) {
					console.log(error);
				}
				reject(error);
			});
		});
	}
}