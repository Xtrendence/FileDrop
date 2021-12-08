/**
 * A class that simplifies the process of turning data into a Blob and saving it.
 */
class FileSaver {
	/**
	 * @param {string} privateKey - The private RSA key of the user receiving the file.
	 * @param {string} fileName - The name of the file.
	 * @param {string} fileSize - The size of the file.
	 * @returns {void}
	 * @constructor
	 */
	constructor(privateKey, fileName, fileSize) {
		this.privateKey = privateKey;
		this.fileName = fileName;
		this.fileSize = fileSize;
		this.fileData = [];
		this.key = "";
	}

	/**
	 * Appends each file chunk to an array. If the chunk data is encrypted, then the AES key is decrypted using the recipient's private RSA key. The decrypted AES key is then used to decrypt the chunk data before appending it to the array.
	 * @param {Object} data - An object containing the chunk data from a file, the chunk number, and (optionally) the decryption key.
	 * @returns {void}
	 */
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

	/**
	 * Decrypts and turns the encoded chunk data into an ArrayBuffer.
	 * @param {string} chunkData - The encoded chunk data.
	 * @param {string} key - The AES decryption key.
	 * @returns {ArrayBuffer} - An ArrayBuffer containing the chunk data.
	 */
	decryptChunk(chunkData, key) {
		let decrypted = CryptoFD.decryptAES(chunkData, key);

		let buffer = new ArrayBuffer(decrypted.length);
		let bufferView = new Uint8Array(buffer);
		for(let i = 0, length = decrypted.length; i < length; i++) {
			bufferView[i] = decrypted.charCodeAt(i);
		}

		return buffer;
	}

	/**
	 * Creates an HTML anchor element with the file data as its "href" attribute value.
	 * @param {string} url - The URL to be used as the "href" attribute of the anchor element. In this case, the file data as a DOMString.
	 * @param {string} filename - The name of the file.
	 * @returns {HTMLAnchorElement} - The anchor element.
	 */
	createLink(url, filename) {
		let link = document.createElement("a");

		link.style = "display:none";
		link.href = url;
		link.download = filename;

		return link;
	}

	/**
	 * Turns the file data into a Blob, which is then turned into a DOMString and set as the "href" attribute value of an HTML anchor element. The link is then appended to the body before being clicked on and removed. This causes the file to be downloaded.
	 * @returns {void}
	 */
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