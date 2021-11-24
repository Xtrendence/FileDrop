function empty(value) {
	if(typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
	if(value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}
	return false;
}