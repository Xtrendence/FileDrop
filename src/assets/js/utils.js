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
	let url = window.location.href;
	let port = getPort();
	let ip = url.replace(`:${port}/`, "");
	return ip.replace(`${getProtocol()}//`, "");
}

function getPort() {
	let url = window.location.href;
	let port = url.split(":")[2].replace("/", "");
	return port;
}

function getProtocol() {
	let url = window.location.href;
	return url.split("//")[0];
}