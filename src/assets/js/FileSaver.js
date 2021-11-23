class FileSaver {
	createLink(url, filename) {
		let link = document.createElement("a");

		link.style = "display:none";
		link.href = url;
		link.download = filename;

		return link;
	}

	save(blob, filename) {
		let url = window.URL.createObjectURL(blob);
		let link = this.createLink(url, filename);

		document.body.appendChild(link);
		
		link.click();

		document.body.removeChild(link);

		setTimeout(function() {
			window.URL.revokeObjectURL(url);
		}, 1000);
	}
}