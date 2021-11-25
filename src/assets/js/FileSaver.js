class FileSaver {
	constructor(privateKey, fileName, fileSize) {
		this.privateKey = privateKey;
		this.fileName = fileName;
		this.fileSize = fileSize;
		this.fileData = [];
		this.key = "";
	}

	async append(data) {
		if("key" in data) {
			if(empty(this.key) || data.chunk === 1) {
				this.key = await CryptoFD.decryptRSA(data.key, this.privateKey);
			}

			let buffer = this.decryptChunk(data.chunkData, this.key);

			this.fileData.push(buffer);
		} else {
			this.fileData.push(data.chunkData);
		}
	}

	decryptChunk(chunkData, key) {
		let decrypted = CryptoFD.decryptAES(chunkData, key);

		let buffer = new ArrayBuffer(decrypted.length);
		let bufferView = new Uint8Array(buffer);
		for(let i = 0, length = decrypted.length; i < length; i++) {
			bufferView[i] = decrypted.charCodeAt(i);
		}

		return buffer;
	}

	createLink(url, filename) {
		let link = document.createElement("a");

		link.style = "display:none";
		link.href = url;
		link.download = filename;

		return link;
	}

	save() {
		let blob = new Blob(this.fileData);

		let url = window.URL.createObjectURL(blob);
		let link = this.createLink(url, this.fileName);

		document.body.appendChild(link);
		
		link.click();

		document.body.removeChild(link);

		setTimeout(function() {
			window.URL.revokeObjectURL(url);
		}, 1000);
	}
}