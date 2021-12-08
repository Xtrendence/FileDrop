document.addEventListener("DOMContentLoaded", () => {
	const electron = require("electron");
	const { ipcRenderer } = electron;

	let buttonClose = document.getElementsByClassName("close-button")[0];
	let buttonMinimize = document.getElementsByClassName("minimize-button")[0];

	let spanAddress = document.getElementById("server-address");
	let buttonOpen = document.getElementById("open-button");
	let buttonStop = document.getElementById("stop-button");

	// Open the application in the browser.
	buttonOpen.addEventListener("click", () => {
		ipcRenderer.send("open-link", spanAddress.textContent);
	});

	// Quit the application.
	buttonStop.addEventListener("click", () => {
		ipcRenderer.send("quit");
	});

	// If on macOS, hide the application. Otherwise, quit it.
	buttonClose.addEventListener("click", () => {
		setWindowState("closed");
	});

	// Minimize the application.
	buttonMinimize.addEventListener("click", () => {
		setWindowState("minimized");
	});

	/**
	 * Set the state of the application window.
	 * @param {string} state - The state of the application window.
	 * @returns {void}
	 */
	function setWindowState(state) {
		ipcRenderer.send("set-window-state", state);
	}
});