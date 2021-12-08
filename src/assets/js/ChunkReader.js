/**
 * A class that acts similarly to the FileReader, but reads data in chunks of ArrayBuffers.
 */
class ChunkReader {
	/**
	 * @param {Object} file - The file to read.
	 * @param {Number} chunkSize - The size of each chunk.
	 * @param {Number} currentChunk - The number of the current chunk being read.
	 * @param {Number} offset - Where in the file to start reading chunks from.
	 * @returns {void}
	 * @constructor
	 */
	constructor(file, chunkSize = 256 * 100, currentChunk = 0, offset = 0) {
		this.encryption = false;
		this.file = file;
		this.chunkSize = chunkSize;
		this.currentChunk = currentChunk;
		this.offset = offset;
		this.events = {};
		this.stop = false;
	}

	/**
	 * Creates a new FileReader instance, and sets the "onload" property which listens to the FileReader's load event as each chunk is read. If encryption is enabled, then the data is encrypted. The "chunkData" and "done" event listeners are used to pass the data back.
	 * @returns {void}
	 */
	createReader() {
		this.reader = new FileReader();

		this.reader.onload = async (event) => {
			if(!this.stop) {
				let content = event.target.result;

				let data = { chunkData:content, chunk:this.currentChunk, offset:this.offset };

				if(this.encryption) {
					let encoded = CryptoFD.encode(content);
					let encrypted = CryptoFD.encryptAES(encoded, this.key);

					data = { chunkData:encrypted, key:this.encryptedKey, chunk:this.currentChunk, offset:this.offset };
				}

				if(this.hasEvent("chunkData")) {
					this.events["chunkData"](data);
				}

				if(this.offset < this.file.size) {
					this.nextChunk();
				} else {
					if(this.hasEvent("done")) {
						this.events["done"](this.encryption, this.file.name);
					}
				}
			}
		}

		this.reader.onerror = (error) => {
			if(this.hasEvent("error")) {
				this.events["error"](error);
			}
		};
	}

	/**
	 * Checks if an event exists.
	 * @param {string} event - The name of the event.
	 * @returns {Boolean}
	 */
	hasEvent(event) {
		return Object.keys(this.events).includes(event);
	}

	/**
	 * Adds an event listener.
	 * @param {string} event - The name of the event.
	 * @returns {void}
	 */
	on(event, callback) {
		this.events[event] = callback;
	}

	/**
	 * Removes an event listener.
	 * @param {string} event - The name of the event.
	 * @returns {void}
	 */
	off(event) {
		delete this.events[event];
	}

	/**
	 * Reads the next chunk from the specified file, and returns a progress update using the "nextChunk" event if it exists.
	 * @returns {void}
	 */
	nextChunk() {
		if(!this.stop) {
			this.currentChunk++;

			let chunk = this.file.slice(this.offset, Math.min(this.offset + this.chunkSize, this.file.size));

			this.reader.readAsArrayBuffer(chunk);

			this.offset += this.chunkSize;

			let percentage = Math.floor((this.offset / this.file.size * 100));
			if(percentage > 100) {
				percentage = 100;
			}
			
			if(this.hasEvent("nextChunk")) {
				this.events["nextChunk"](percentage, this.currentChunk, this.offset);
			}
		}
	}

	/**
	 * Generates a random AES key, and encrypts it with the recipient's public RSA key.
	 * @param {string} publicKey - The public key of the user that's going to receive the file.
	 * @returns {void}
	 */
	async encryptChunks(publicKey) {
		this.encryption = true;
		this.key = CryptoFD.generateAESKey();
		this.encryptedKey = await CryptoFD.encryptRSA(this.key, publicKey);
	}

	/**
	 * Stops reading from the file and cancels the operation.
	 * @returns {void}
	 */
	destroy() {
		this.stop = true;
		this.reader = null;
	}
}