const PouchDB = require("pouchdb");

module.exports = class DBManager {
	constructor(db) {
		this.db = new PouchDB(db);

		this.remove("clients").then(() => {
			console.log("\x1b[34m", "Cleared Previous Clients", "\x1b[0m");
		}).catch(error => {
			console.log(error);
		});
	}

	async save(key, value, force) {
		return new Promise(async (resolve, reject) => {
			this.exists(key).then(() => {
				this.db.get(key).then(document => {
					document.data = value;

					this.db.put(document, { force:force }).then(response => {
						resolve(response);
					}).catch(error => {
						console.log("Exists - Save Error", error);
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
					console.log("Create - Save Error", error);
					reject(error);
				});
			});
		});
	}

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

	exists(key) {
		return new Promise((resolve, reject) => {
			this.db.get(key).then(() => {
				resolve();
			}).catch(() => {
				reject();
			});
		});
	}

	fetch(key) {
		return new Promise((resolve, reject) => {
			this.db.get(key).then(response => {
				resolve(response);
			}).catch(error => {
				console.log(error);
				reject(error);
			});
		});
	}
}