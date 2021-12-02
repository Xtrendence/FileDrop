function empty(value) {
	if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
	if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}
	return false;
}

function getIP() {
	return window.location.hostname;
}

function getPort() {
	let port = window.location.port;

	if(empty(port)) {
		port = getProtocol() === "https:" ? 443 : 80;
	}

	return port;
}

function getProtocol() {
	return window.location.protocol;
}