/**
 * Checks to see if a value is empty.
 * @param {any} value - A value to check and see if it's empty.
 * @returns {Boolean}
 */
function empty(value) {
	if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
	if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}
	return false;
}

/**
 * Gets the IP/hostname of the server based on the URL.
 * @returns {string} - The server's IP/hostname.
 */
function getIP() {
	return window.location.hostname;
}

/**
 * Gets the port of the server.
 * @returns {Number} - The server's port.
 */
function getPort() {
	let port = window.location.port;

	if(empty(port)) {
		port = getProtocol() === "https:" ? 443 : 80;
	}

	return port;
}

/**
 * Gets the protocol being used to access the server (usually either HTTP or HTTPS).
 * @returns {string} - The protocol.
 */
function getProtocol() {
	return window.location.protocol;
}