/**
 * A class to simplify the upload procedure.
 */
class Uploader {
	/**
	 * @param {Socket} socket - The client's socket.
	 * @param {string} from - The client sending the file.
	 * @param {string} to - The client receiving the file.
	 * @param {Object} file - The file being sent.
	 * @param {Boolean} encryption - Whether or not the data is encrypted.
	 * @returns {void}
	 * @constructor
	 */
	constructor(socket, from, to, file, encryption) {
		this.part = 0;
		this.socket = socket;
		this.from = from;
		this.to = to;
		this.file = file;
		this.encryption = encryption;
		this.stop = false;
	}

	/**
	 * Sends an object containing the chunk data and other required details to the server, which then relays it to the recipient of the file.
	 * @param {Object} data - The data to send to the recipient.
	 * @returns {void}
	 */
	upload(data) {
		if(!this.stop) {
			this.part++;

			if(this.part === 1) {
				data["filesize"] = this.file.size;
				data["filename"] = this.file.name;
			}

			data["from"] = this.from;
			data["to"] = this.to;

			this.socket.emit("upload", data);
		}
	}

	/**
	 * Used to inform the other client that the upload has been completed, and whether or not it was cancelled.
	 * @param {Boolean} cancelled - Whether or not the upload was cancelled.
	 * @returns {void}
	 */
	finish(cancelled) {
		this.socket.emit("uploaded", { from:this.from, to:this.to, encryption:this.encryption, filename:this.file.name, cancelled:cancelled });
	}

	/**
	 * Stop and cancel the upload.
	 * @returns {void}
	 */
	destroy() {
		this.socket = null;
		this.stop = true;
	}
}