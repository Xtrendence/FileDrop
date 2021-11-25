class Uploader {
	constructor(socket, from, to, file, encryption) {
		this.part = 0;
		this.socket = socket;
		this.from = from;
		this.to = to;
		this.file = file;
		this.encryption = encryption;
	}

	upload(data) {
		this.part++;

		if(this.part === 1) {
			data["filesize"] = this.file.size;
			data["filename"] = this.file.name;
		}

		data["from"] = this.from;
		data["to"] = this.to;

		this.socket.emit("upload", data);
	}

	finish() {
		this.socket.emit("uploaded", { from:this.from, to:this.to, encryption:this.encryption, filename:this.file.name });
	}
}