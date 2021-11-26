document.addEventListener("DOMContentLoaded", () => {
	const electron = require("electron");
	const { ipcRenderer } = electron;

	let buttonClose = document.getElementsByClassName("close-button")[0];
	let buttonMinimize = document.getElementsByClassName("minimize-button")[0];

	let spanAddress = document.getElementById("server-address");
	let buttonOpen = document.getElementById("open-button");
	let buttonStop = document.getElementById("stop-button");

	buttonOpen.addEventListener("click", () => {
		ipcRenderer.send("open-link", spanAddress.textContent);
	});

	buttonStop.addEventListener("click", () => {
		ipcRenderer.send("quit");
	});

	buttonClose.addEventListener("click", () => {
		setWindowState("closed");
	});

	buttonMinimize.addEventListener("click", () => {
		setWindowState("minimized");
	});

	function setWindowState(state) {
		ipcRenderer.send("set-window-state", state);
	}
});