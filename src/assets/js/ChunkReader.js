class ChunkReader {
	constructor(file, chunkSize = 256 * 100, currentChunk = 0, offset = 0) {
		this.encryption = false;
		this.file = file;
		this.chunkSize = chunkSize;
		this.currentChunk = currentChunk;
		this.offset = offset;
		this.events = {};
	}

	createReader() {
		this.reader = new FileReader();

		this.reader.onload = async (event) => {
			let content = event.target.result;

			let data = { chunkData:content, chunk:this.currentChunk, offset:this.offset };

			if(this.encryption) {
				let encoded = CryptoFD.encode(content);
				let encrypted = CryptoFD.encryptAES(encoded, this.key);

				data = { chunkData:encrypted, key:this.encryptedKey, chunk:this.currentChunk, offset:this.offset };
			}

			if(this.offset < this.file.size) {
				if(this.hasEvent("chunkData")) {
					this.events["chunkData"](data);
				}

				this.nextChunk();
			} else {
				if(this.hasEvent("done")) {
					this.events["done"](this.encryption, this.file.name);
				}
			}
		}

		this.reader.onerror = (error) => {
			if(this.hasEvent("error")) {
				this.events["error"](error);
			}
		};
	}

	hasEvent(event) {
		return Object.keys(this.events).includes(event);
	}

	on(event, callback) {
		this.events[event] = callback;
	}

	off(event) {
		delete this.events[event];
	}

	nextChunk() {
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

	async encryptChunks(publicKey) {
		this.encryption = true;
		this.key = CryptoFD.generateAESKey();
		this.encryptedKey = await CryptoFD.encryptRSA(this.key, publicKey);
	}
}