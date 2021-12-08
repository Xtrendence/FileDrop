// Imports.
const utils = require("./modules/Utils");
const port = 3180;

const electron = require("electron");
const localShortcut = require("electron-localshortcut");
const { app, BrowserWindow, shell, ipcMain } = electron;

const express = require("express");
const cors = require("cors");
const path = require("path");
const portableApp = express();

// Use EJS.
portableApp.set("views", path.join(__dirname, "views"));
portableApp.set("view engine", "ejs");
portableApp.use("/assets", express.static(path.join(__dirname, "assets")));

// Use CORS.
portableApp.use(cors());

// Since a port cannot be used by two instances of FileDrop, the application is limited to one instance.
app.requestSingleInstanceLock();

// Hardware acceleration is disabled as it's not required. This also improves compatibility on some platforms.
app.disableHardwareAcceleration();

// Set the name of the Electron application.
app.name = "FileDrop Server";

app.on("ready", () => {
	// Used to automatically show the developer console.
	const debugMode = false;

	// The window width and height.
	let windowWidth = 240;
	let windowHeight = 210;

	if(debugMode) {
		windowWidth += 220;
	}

	// The Electron browser window.
	const window = new BrowserWindow({
		width: windowWidth,
		height: windowHeight,
		minWidth: windowWidth,
		minHeight: windowHeight,
		maxWidth: windowWidth,
		maxHeight: windowHeight,
		resizable: false,
		frame: false,
		transparent: true,
		x: 80,
		y: 80,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	// Closing applications is handled differently in macOS (apps are kept open and are only hidden unless explicitly quit).
	if(process.platform === "darwin") {
		let quit = true;

		localShortcut.register(window, "Command+Q", () => {
			quit = true;
			app.quit();
		});
	
		localShortcut.register(window, "Command+W", () => {
			quit = false;
			app.hide();
		});

		window.on("close", (e) => {
			if(!quit) {
				e.preventDefault();
				quit = true;
			}
		});
	}

	window.loadURL(`http://127.0.0.1:${port}/portable`);

	if(debugMode) {
		window.webContents.openDevTools();
	}

	portableApp.get("/", (request, response) => {
		response.render("index");
	});

	portableApp.get("/portable", (request, response) => {
		let ip = utils.IPv4(request.socket.remoteAddress);
		if(ip === "127.0.0.1" || ip === "localhost") {
			response.render("portable", { ip:utils.getIP(), port:port });
		} else {
			response.end("Access Not Authorized");
		}
	});

	portableApp.get("/forge/prime.worker.js", (request, response) => {
		response.sendFile(path.join(__dirname, "./assets/js/prime.worker.min.js"));
	});

	// Allows the user to open the application in their browser by clicking a button on the front-end.
	ipcMain.on("open-link", (error, request) => {
		try {
			shell.openExternal("http://" + request.toString());
		} catch(error) {
			console.log(error);
		}
	});

	ipcMain.on("quit", () => {
		app.quit();
	});

	// Used for the functionality of the custom frame/title bar.
	ipcMain.on("set-window-state", (error, request) => {
		let state = request.toString();

		switch(state) {
			case "closed":
				(process.platform === "darwin") ? app.hide() : app.quit();
				break;
			case "minimized":
				window.minimize();
				break;	
		}
	});
});

module.exports = portableApp;