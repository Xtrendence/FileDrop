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

		this.reader.onload = async function(event) {
			let content = event.target.result;

			let data = { chunkData:content, chunk:this.currentChunk, offset:this.offset };

			if(this.encryption) {
				let encoded = Crypto.encode(content);
				let encrypted = Crypto.encryptAES(encoded, this.key);

				data = { chunkData:encrypted, key:this.encryptedKey, chunk:this.currentChunk, offset:this.offset };
			}

			if(this.hasEvent("chunkData")) {
				this.events["chunkData"](data);
			}
		}

		this.reader.onerror = function(error) {
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
		this.key = Crypto.generateAESKey();
		this.encryptedKey = await Crypto.encryptRSA(this.key, publicKey);
	}
}