document.addEventListener("DOMContentLoaded", async () => {
	// Checks whether or not the user has a public and private RSA key pair. If they are not found in the localStorage, then they are generated.
	if(empty(localStorage.getItem("privateKey")) || empty(localStorage.getItem("publicKey"))) {
		showLoading(60000, "Generating Keys...");

		CryptoFD.generateRSAKeys().then(keys => {
			localStorage.setItem("privateKey", keys.privateKey);
			localStorage.setItem("publicKey", keys.publicKey);

			hideLoading();
		}).catch(error => {
			console.log(error);
		});
	}

	// Used to prevent the client from registering with the server again if they're already logged in, but click on the server button to disconnect from it manually.
	let manualDisconnect = false;
	let requiresReconnect = false;

	let saver = new FileSaver();

	// Used to store the list of clients, and the ones that have been whitelisted.
	let clientList = {};
	let whitelist = {};

	let svgBackground = document.getElementById("background");

	window.addEventListener("resize", setBackgroundSize);

	setBackgroundSize();

	const Notify = new Notifier("TopLeft");

	let html = document.getElementsByTagName("html")[0];
	let body = document.getElementsByTagName("body")[0];

	if(detectMobile()) {
		body.id = "mobile";
	} else {
		body.id = "desktop";
	}

	// Uses the URL to get the IP address and port of the server.
	let ip = getIP();
	let port = getPort();
	let url = `${getProtocol()}//${ip}:${port}`;

	// The main page's background has 3 different gradients that can be changed.
	let gradientStops = {
		stop1: document.getElementById("stop-1"),
		stop2: document.getElementById("stop-2"),
		stop3: document.getElementById("stop-3")
	};

	// Connect to the server via web socket, and attach the appropriate event listeners/handlers.
	let socket = io.connect(url);
	attach(socket);

	// Get DOM elements.

	let divLoading = document.getElementById("loading-overlay");

	let divLogin = document.getElementById("login-wrapper");
	let divApp = document.getElementById("app-wrapper");

	let buttonSettings = document.getElementById("settings-button");

	let divSettings = document.getElementById("settings-wrapper");

	let buttonClearStorage = document.getElementById("clear-storage-button");
	let buttonSettingsLogout = document.getElementById("settings-logout-button");
	let toggleTheme = document.getElementById("theme-toggle");
	let toggleEncryption = document.getElementById("encryption-toggle");
	let toggleAutoLogin = document.getElementById("auto-login-toggle");
	let toggleRoundedUI = document.getElementById("rounded-ui-toggle");

	let buttonServer = document.getElementById("server-button");

	let inputUsername = document.getElementById("input-username");

	let buttonRandomUsername = document.getElementById("random-username-button");
	let buttonConfirmUsername = document.getElementById("confirm-username-button");

	let divClients = document.getElementById("clients-wrapper");
	let divUpload = document.getElementById("upload-wrapper");
	let divUploadArea = document.getElementById("upload-area");
	let divProgress = document.getElementById("progress-wrapper");
	let divProgressForeground = document.getElementById("progress-foreground");

	let inputFile = document.getElementById("upload-file");

	let buttonUploadCancel = document.getElementById("upload-cancel-button");
	let buttonUpload = document.getElementById("upload-button");

	let spanUpload = document.getElementById("upload-title");
	let spanUploadSubtitle = document.getElementById("upload-subtitle");

	let buttonLogout = document.getElementById("logout-button");

	// Set settings.

	savedAutoLogin = localStorage.getItem("autoLogin");
	let autoLogin = empty(savedAutoLogin) ? "true" : savedAutoLogin;
	if(autoLogin === "false") {
		toggleAutoLogin.classList.remove("active");
	}

	let savedUsername = localStorage.getItem("username");
	if(!empty(savedUsername)) {
		inputUsername.value = savedUsername;
	}

	let savedTheme = localStorage.getItem("theme");
	if(!empty(savedTheme)) {
		setTheme(savedTheme);
	}

	let savedRoundedUI = localStorage.getItem("roundedUI");
	if(!empty(savedRoundedUI)) {
		setRoundedUI(savedRoundedUI);
	}

	// Use the "keydown" and "keyup" events to enable or disable the rounded UI option found in the settings. In this case, "Shift+B" is a hidden setting that almost entirely gets rid of every element's border radius.

	let keysDown = [];

	document.addEventListener("keydown", (event) => {
		let key = event.key.toLowerCase();
		if(!keysDown.includes(key)) {
			keysDown.push(key);
		}

		if(!divSettings.classList.contains("hidden") && (keysDown.join("-") === "shift-b" || keysDown.join("-") === "b-shift")) {
			if(localStorage.getItem("roundedUI") === "none") {
				setRoundedUI("true");
			} else {
				setRoundedUI("none");
			}
		}
	});

	document.addEventListener("keyup", (event) => {
		let key = event.key.toLowerCase();
		if(keysDown.includes(key)) {
			let index = keysDown.indexOf(key);
			keysDown.splice(index, 1);
		}
	});

	// Used to hide the settings pane when the user clicks outside it while on the login page.
	divLogin.addEventListener("click", () => {
		if(!divSettings.classList.contains("hidden")) {
			hideSettings();
		}
	});

	// Used to hide the settings pane when the user clicks outside it while on the main page.
	divApp.addEventListener("click", () => {
		if(!divSettings.classList.contains("hidden")) {
			hideSettings();
		}
	});

	// A button the user can click to manually disconnect from the server.
	buttonServer.addEventListener("click", () => {
		if(buttonServer.classList.contains("active") || buttonServer.classList.contains("processing")) {
			manualDisconnect = true;
			socket.disconnect();
		} else {
			manualDisconnect = true;
			requiresReconnect = false;
			socket.connect();
		}
	});

	// Allows the user to press the "Enter" key to log in.
	inputUsername.addEventListener("keydown", (event) => {
		if(event.key.toLowerCase() === "enter") {
			buttonConfirmUsername.click();
		}
	});

	// Ask the server for a random username.
	buttonRandomUsername.addEventListener("click", () => {
		socket.emit("random-username");
	});

	// Try to log in using the desired username.
	buttonConfirmUsername.addEventListener("click", () => {
		if(validUsername(inputUsername.value)) {
			socket.emit("register", { 
				username: inputUsername.value, 
				key: localStorage.getItem("publicKey") 
			});
		} else {
			Notify.error({
				title: "Username Invalid",
				description: "Please only use letters and numbers (16 max)."
			});
		}
	});

	// Show or hide the settings pane based on its current visibility.
	buttonSettings.addEventListener("click", () => {
		if(divSettings.classList.contains("hidden")) {
			showSettings();
		} else {
			hideSettings();
		}
	});

	// A button that logs the user out, clears the localStorage, and refreshes the page when clicked on.
	buttonClearStorage.addEventListener("click", () => {
		logout();

		localStorage.clear();

		showLoading(5000);

		Notify.alert({
			title: "Storage Cleared",
			description: "Refreshing...",
			duration: 2000
		});

		setTimeout(() => window.location.reload(), 2500);
	});

	// For devices with smaller screens, the logout button is moved to the settings pane.
	buttonSettingsLogout.addEventListener("click", () => {
		buttonLogout.click();
	});

	// A toggle to change the color theme.
	toggleTheme.addEventListener("click", () => {
		if(toggleTheme.classList.contains("active")) {
			setTheme("dark");
		} else {
			setTheme("light");
		}
	});

	// A toggle to enable or disable encryption.
	toggleEncryption.addEventListener("click", () => {
		if(toggleEncryption.classList.contains("active")) {
			toggleEncryption.classList.remove("active");
		} else {
			toggleEncryption.classList.add("active");
		}
	});

	// A toggle to enable or disable automatic logins.
	toggleAutoLogin.addEventListener("click", () => {
		if(toggleAutoLogin.classList.contains("active")) {
			toggleAutoLogin.classList.remove("active");
			localStorage.setItem("autoLogin", "false");
		} else {
			toggleAutoLogin.classList.add("active");
			localStorage.setItem("autoLogin", "true");
		}
	});
	
	// A toggle to reduce the border radius of elements.
	toggleRoundedUI.addEventListener("click", () => {
		if(toggleRoundedUI.classList.contains("active")) {
			setRoundedUI("false");
		} else {
			setRoundedUI("true");
		}
	});

	// A button to ask the server to log the user out.
	buttonLogout.addEventListener("click", () => {
		socket.emit("logout");
	});

	// A button to cancel an upload in progress.
	buttonUploadCancel.addEventListener("click", () => {
		hideUpload();
	});

	// Users might prefer to click on the upload area to choose a file instead of dragging and dropping.
	divUploadArea.addEventListener("click", () => {
		if(!divUploadArea.classList.contains("disabled")) {
			inputFile.click();
		}
	});

	// Prevents the default "dragover"/"dragenter" events of the browser.
	divUploadArea.ondragover = divUploadArea.ondragenter = (event) => {
		event.preventDefault();
	};

	// Event handler for when the user drops a file onto the upload area.
	divUploadArea.ondrop = (event) => {
		if(!divUploadArea.classList.contains("disabled")) {
			inputFile.files = event.dataTransfer.files;
			inputFile.dispatchEvent(new Event("change"));
			event.preventDefault();
		}
	};

	// When the file input field is changed, it's checked to see if it contains more than 0 files. If so, the file's name is displayed. Otherwise, the upload page is hidden.
	inputFile.addEventListener("change", () => {
		if(inputFile.files.length !== 0) {
			spanUploadSubtitle.textContent = inputFile.files[0].name;
		} else {
			hideUpload();
		}
	});

	// A button to start the upload after a file has been chosen. If a file hasn't been chosen, the file picker is opened.
	buttonUpload.addEventListener("click", async () => {
		if(!divUploadArea.classList.contains("disabled")) {
			try {
				// The client sending the file.
				let from = localStorage.getItem("ip");

				// The client receiving the file.
				let to = divUpload.getAttribute("data-client");

				// The public RSA key of the recipient.
				let publicKey = divUpload.getAttribute("data-key");
				if(empty(publicKey)) {
					console.log(clientList);
					publicKey = clientList[to]["key"];
				}

				if(empty(inputFile.value) || inputFile.files.length === 0) {
					divUploadArea.click();
					return;
				}

				// The upload cannot proceed without knowing the recipient's public key, who is sending the file, and who is receiving it.
				if(empty(publicKey) || empty(from) || empty(to)) {
					return;
				}

				// If the client isn't connected to the server, the upload cannot proceed.
				if(!serverConnected()) {
					Notify.error({ 
						title: "Not Connected", 
						description: "You aren't connected to the server.", 
						duration: 4000
					});

					hideUpload();
					
					return;
				}

				let file = inputFile.files[0];

				let uploader = new Uploader(socket, from, to, file, encryptionEnabled());

				// Reading chunks as ArrayBuffer objects is slower on mobile devices, especially with smaller chunk sizes. This speeds it up a little.
				let chunkSize = detectMobile() ? 1024 * 100 : 256 * 100;

				let reader = new ChunkReader(file, chunkSize, 0, 0);
				reader.createReader();

				// Use the recipient's public key to encrypt the file chunks.
				if(encryptionEnabled()) {
					await reader.encryptChunks(publicKey);
				}

				divProgress.classList.remove("hidden");

				divUploadArea.classList.add("disabled");

				// The "chunkData" event is dispatched when a chunk has been read from the file. This chunk data, combined with other data defined in the "ChunkReader" class are then sent to the server, which relays it to the other client.
				reader.on("chunkData", data => {
					uploader.upload(data);
				});

				// When a chunk is read, the "nextChunk" event offers a way to track the upload progress.
				reader.on("nextChunk", (percentage, currentChunk, offset) => {
					spanUploadSubtitle.textContent = percentage + "%";

					divProgressForeground.style.width = percentage + "%";

					if(divUpload.classList.contains("hidden")) {
						uploader.finish(true);

						uploader.destroy();
						reader.destroy();

						Notify.success({ 
							title: "Upload Cancelled", 
							description: "The upload has been cancelled.", 
							duration: 4000,
							color: "var(--accent-contrast)",
							background: "var(--accent-third)"
						});
					}
				});

				// Once every chunk has been read, the "done" event is dispatched, which resets the uploader and hides it.
				reader.on("done", (encryption, filename) => {
					uploader.finish(false);

					let notificationDescription = filename + " has been uploaded without encryption.";
					if(encryption) {
						notificationDescription = filename + " has been uploaded with encryption.";
					}

					Notify.success({ 
						title: "File Uploaded", 
						description: notificationDescription, 
						duration: 4000,
						color: "var(--accent-contrast)",
						background: "var(--accent-second)"
					});

					hideUpload();
				});

				// The "nextChunk" method needs to be called once at the start to start recursively reading data from the file.
				reader.nextChunk();
			} catch(error) {
				Notify.error({
					title: "Error",
					description: error,
					duration: 6000
				});

				hideUpload();
			}
		}
	});

	/**
	 * Adds event listeners to a Socket.
	 * @param {Socket} socket - The socket to add event listeners to.
	 * @returns {void}
	 */
	function attach(socket) {
		// When the client connects to the server and they already have a username saved in localStorage, and they've enabled automatic logins, they are registered as a user without having to manually log in.
		socket.on("connect", () => {
			if(autoLogin === "true" && !empty(savedUsername) && !divLogin.classList.contains("hidden") && !empty(inputUsername.value)) {
				setTimeout(() => buttonConfirmUsername.click(), 625);
			} else {
				setTimeout(() => divLoading.classList.add("hidden"), 750);
			}

			setStatus("Connected");
		});

		// When the client is disconnected from the server and they didn't manually do so, the application tries to reconnect them.
		socket.on("disconnect", () => {
			if(!manualDisconnect) {
				requiresReconnect = true;
			}

			setStatus("Disconnected");
		});

		// To inform the user that they are being reconnected.
		socket.on("reconnection_attempt", () => {
			setStatus("Reconnecting");
		});

		// To inform the user that they're connected.
		socket.on("reconnect", () => {
			setStatus("Connected");
		});

		// If enabled on the server-side, the client and server ping each other regularly to keep the connection alive. This is useful for browsers that automatically put tabs that have been inactive for a certain amount of time to sleep.
		socket.on("ping", () => {
			socket.emit("pong");
		});

		// Sets the IP address of the client. This is used to determine who is sending a file.
		socket.on("set-ip", ip => {
			localStorage.setItem("ip", ip);
		});

		// Used to log the user in, and send their public RSA key to the server so it can be broadcasted to other clients.
		socket.on("login", username => {
			socket.emit("set-key", localStorage.getItem("publicKey"));

			login(username);
		});

		// Used to log the user out.
		socket.on("logout", () => {
			logout();
		});

		// If the server receives invalid data, it kicks the user to protect itself from potential XSS attacks and such.
		socket.on("kick", () => {
			showLoading(6000, "Refreshing...");

			localStorage.removeItem("key");
			localStorage.removeItem("username");

			Notify.error({
				title: "Kicked By Server",
				description: "The server has kicked you to protect itself.",
				duration: 4000
			});

			setTimeout(() => window.location.reload(), 5000);
		});

		// Used to send a notification from the server to the client.
		socket.on("notify", notification => {
			Notify.info(notification);
		});

		// Used to send the client a random username.
		socket.on("random-username", username => {
			inputUsername.value = username;
		});

		// Used to inform the client that the username they chose is invalid.
		socket.on("username-invalid", () => {
			divLoading.classList.add("hidden");

			Notify.error({
				title: "Username Invalid",
				description: "Please only use letters and numbers (16 max)."
			});
		});

		// Used to inform the client that the username they chose has been taken.
		socket.on("username-taken", () => {
			divLoading.classList.add("hidden");

			Notify.error({
				title: "Username Taken",
				description: "That username isn't available."
			});
		});

		// Used to update the user's client list.
		socket.on("client-list", clients => {
			console.log(clients);

			try {
				// Remove the client's own information from the client list.
				delete clients[localStorage.getItem("ip")];

				// Used to prevent the client from having to whitelist/block other users each time the client list is changed.
				Object.keys(clientList).map(existing => {
					if(existing in clients) {
						clients[existing]["allowed"] = clientList[existing]["allowed"];
					}
				});

				clientList = clients;

				divClients.innerHTML = "";

				// Loop over the client list and add them to the DOM.
				let ips = Object.keys(clients);
				ips.map(ip => {
					let client = clients[ip];

					let div = document.createElement("div");
					div.id = ip;
					div.classList.add("client");
					div.classList.add("noselect");
					div.innerHTML = `<span class="username">${client.username}</span>`;
					
					let button = document.createElement("button");
					button.classList.add("client-action");

					let info = document.createElement("button");
					info.classList.add("client-info");
					info.innerHTML = `<svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1216 1344v128q0 26-19 45t-45 19h-512q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h64v-384h-64q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h384q26 0 45 19t19 45v576h64q26 0 45 19t19 45zm-128-1152v192q0 26-19 45t-45 19h-256q-26 0-45-19t-19-45v-192q0-26 19-45t45-19h256q26 0 45 19t19 45z"/></svg>`;

					// If the client being looped over has the current user in their whitelist, the "Send File" button is shown. Otherwise, the "Ask Permission" one is displayed.
					if(clientList[ip]["allowed"] === true) {
						button.textContent = "Send File";

						button.addEventListener("click", () => {
							showUpload(ip, client.key, client.username);
						});
					} else {
						button.textContent = "Ask Permission";

						button.addEventListener("click", () => {
							Notify.alert({ 
								title: "Awaiting Response", 
								description: "The other client needs to accept your upload request first.", 
								duration: 6000,
								color: "var(--main-contrast)",
								background: "var(--main-third-transparent)"
							});

							console.log("Asked");

							socket.emit("ask-permission", { from:localStorage.getItem("ip"), to:ip });
						});
					}

					let whitelisted = (clientList[ip]["allowed"] === true) ? "Yes" : "No";

					// A special notification that allows the user to whitelist or block another client.
					info.addEventListener("click", () => {
						Notify.info({
							title: "Client Info", 
							description: `IP: ${ip}<br>Username: ${client.username}<br>Whitelisted: ${whitelisted}`, 
							duration: 10000,
							color: "var(--main-contrast)",
							background: "var(--main-third-transparent)",
							html: `<div class="buttons"><button id="${ip}-block" class="decline">Block</button><button id="${ip}-whitelist" class="accept">Whitelist</button></div>`
						});

						let buttonBlock = document.getElementById(ip + "-block");
						let buttonWhitelist = document.getElementById(ip + "-whitelist");

						buttonBlock.addEventListener("click", () => {
							Notify.hideNotification(buttonBlock.parentElement.parentElement.parentElement);

							whitelist[ip] = { allowed:false };

							socket.emit("update-permission", { whitelist:whitelist, response:false, to:ip });
						});

						buttonWhitelist.addEventListener("click", () => {
							Notify.hideNotification(buttonWhitelist.parentElement.parentElement.parentElement);

							whitelist[ip] = { allowed:true };

							socket.emit("update-permission", { whitelist:whitelist, response:true, to:ip });
						});
					});

					div.appendChild(info);
					div.appendChild(button);

					divClients.appendChild(div);
				});
			} catch(error) {
				console.log(error);
			}
		});

		// Used so other clients can ask the user for permission to send them a file.
		socket.on("ask-permission", from => {
			// The notification isn't shown if the user has blocked the other client or already whitelisted them.
			if(!(from in whitelist) && from in clientList) {
				let username = clientList[from].username;

				Notify.alert({
					title: "File Request", 
					description: `${username} (${from}) would like to send you a file.`, 
					duration: 30000,
					color: "var(--main-contrast-light)",
					background: "var(--main-third-transparent)",
					html: `<div class="buttons"><button id="${from}-decline" class="decline">Decline</button><button id="${from}-accept" class="accept">Accept</button></div>`
				});

				let buttonDecline = document.getElementById(from + "-decline");
				let buttonAccept = document.getElementById(from + "-accept");

				buttonDecline.addEventListener("click", () => {
					Notify.hideNotification(buttonDecline.parentElement.parentElement.parentElement);

					whitelist[from] = { allowed:false };

					socket.emit("update-permission", { whitelist:whitelist, response:false, to:from });
				});

				buttonAccept.addEventListener("click", () => {
					Notify.hideNotification(buttonAccept.parentElement.parentElement.parentElement);

					whitelist[from] = { allowed:true };

					socket.emit("update-permission", { whitelist:whitelist, response:true, to:from });
				});
			} else {
				if(from in whitelist && whitelist[from]["allowed"] === true) {
					socket.emit("update-permission", { whitelist:whitelist, response:true, to:from });
				}
			}
		});

		// Used to receive a file chunk.
		socket.on("upload", data => {
			// If it's the first chunk, the FileSaver class is instantiated, and the user is notified that they are receiving a file.
			if(data.chunk === 1) {
				Notify.alert({
					title: "Receiving File",
					description: "You are receiving a file... ",
					color: "var(--accent-contrast)",
					background: "var(--accent-first-transparent-low)",
					duration: 999999,
					html: `<span class="live-span" id="receiving-percentage-${btoa(data.filename)}">0%</span>`
				});

				saver = new FileSaver(localStorage.getItem("privateKey"), data.filename, data.filesize);
			}

			let percentage = Math.floor((data.offset / saver.fileSize * 100));
			if(percentage > 100) {
				percentage = 100;
			}

			// Used to update the download progress.
			let id = "receiving-percentage-" + btoa(saver.fileName);
			if(document.getElementById(id)) {
				document.getElementById(id).textContent = percentage + "%";

				if(percentage === 100) {
					Notify.hideNotification(document.getElementById(id).parentElement.parentElement);
				}
			}

			// Each file chunk is appended to the "fileData" array in the FileSaver object.
			saver.append(data);
		});

		// Used to inform the user that another user has finished sending them a file.
		socket.on("uploaded", data => {
			if(data.cancelled !== true) {
				saver.save();
			} else {
				Notify.success({ 
					title: "Upload Cancelled", 
					description: "The upload has been cancelled by the other client.", 
					duration: 4000,
					color: "var(--accent-contrast)",
					background: "var(--accent-third)"
				});

				let id = "receiving-percentage-" + btoa(saver.fileName);
				if(document.getElementById(id)) {
					Notify.hideNotification(document.getElementById(id).parentElement.parentElement);
				}
			}
		});

		// Used to inform the user whether their request to send a file was accepted or denied.
		socket.on("update-permission", data => {
			if(data.from in clientList) {
				clientList[data.from]["allowed"] = data.response;
			}

			if(data.response === true) {
				Notify.success({
					title: "Request Accepted", 
					description: "You can now send files to " + clientList[data.from]["username"], 
					duration: 4000,
					background: "var(--accent-second)",
					color: "var(--accent-contrast)"
				});
			} else {
				Notify.error({
					title: "Request Denied", 
					description: "You cannot send files to " + clientList[data.from]["username"], 
					duration: 4000,
				});
			}
			
			socket.emit("get-clients");
		});

		// Used to set the color of the SVG background of the main page.
		socket.on("set-color", colors => {
			let gradientStopKeys = Object.keys(gradientStops);
		
			for(let i = 0; i < gradientStopKeys.length; i++) {
				gradientStops[gradientStopKeys[i]].setAttribute("stop-color", colors[i]);
			}

			svgBackground.style.background = colors[2];
		});
	}

	/**
	 * Checks whether or not the user is connected to the server.
	 * @returns {Boolean}
	 */
	function serverConnected() {
		return buttonServer.classList.contains("active");
	}

	/**
	 * Checks whether or not encryption is enabled.
	 * @returns {Boolean}
	 */
	function encryptionEnabled() {
		return toggleEncryption.classList.contains("active");
	}

	/**
	 * Sets the color theme of the application.
	 * @param {string} theme - The name of the theme (either "light" or "dark").
	 * @returns {void}
	 */
	function setTheme(theme) {
		switch(theme) {
			case "light":
				html.classList.add("light");
				html.classList.remove("dark");
				toggleTheme.classList.add("active");
				localStorage.setItem("theme", "light");
				break;
			case "dark":
				html.classList.remove("light");
				html.classList.add("dark");
				toggleTheme.classList.remove("active");
				localStorage.setItem("theme", "dark");
				break;
		}
	}

	/**
	 * Reduces the border radius of DOM elements.
	 * @param {string} roundedUI - The value for the rounded UI setting.
	 * @returns {void}
	 */
	function setRoundedUI(roundedUI) {
		localStorage.setItem("roundedUI", roundedUI);

		if(roundedUI === "none") {
			toggleRoundedUI.classList.remove("active");
			html.classList.add("no-border-radius");
			return;
		}
		
		html.classList.remove("no-border-radius");

		if(roundedUI === "false") {
			toggleRoundedUI.classList.remove("active");
			html.classList.add("reduce-border-radius");
		} else {
			toggleRoundedUI.classList.add("active");
			html.classList.remove("reduce-border-radius");
		}
	}

	/**
	 * Shows the settings pane.
	 * @returns {void}
	 */
	function showSettings() {
		buttonSettings.classList.add("hidden");
		divSettings.classList.remove("hidden");
		setTimeout(() => {
			divSettings.style.right = "20px";
		}, 10);
	}

	/**
	 * Hides the settings pane.
	 * @returns {void}
	 */
	function hideSettings() {
		divSettings.removeAttribute("style");
		setTimeout(() => {
			buttonSettings.classList.remove("hidden");
			divSettings.classList.add("hidden");
		}, 350);
	}

	/**
	 * Shows the loading screen.
	 * @param {Number} limit - How long to show the loading screen for in milliseconds.
	 * @param {string} text - Text to show on the loading screen.
	 * @returns {void}
	 */
	function showLoading(limit, text = "") {
		hideLoading();

		let element = document.createElement("div");
		element.classList.add("loading-screen");
		element.innerHTML = '<div class="loading-icon"><div></div><div></div></div><span id="loading-text">' + text + '</span>';
		document.body.appendChild(element);

		setTimeout(() => {
			element.remove();
		}, limit);
	}

	/**
	 * Hides the loading screen.
	 * @returns {void}
	 */
	function hideLoading() {
		for(let i = 0; i < document.getElementsByClassName("loading-screen").length; i++) {
			document.getElementsByClassName("loading-screen")[i].remove();
		}
	}

	/**
	 * Resets the uploader UI.
	 * @returns {void}
	 */
	function resetUpload() {
		inputFile.value = null;
		inputFile.type = "text";
		inputFile.type = "file";

		divUpload.removeAttribute("data-client");
		divUpload.removeAttribute("data-key");

		divUploadArea.classList.remove("disabled");

		spanUpload.textContent = `Sending File › User (127.0.0.1)`;
		spanUploadSubtitle.innerHTML = "Drag &amp; Drop or Click";

		divProgressForeground.style.width = 0;
		divProgress.classList.add("hidden");
	}

	/**
	 * Shows the uploader UI.
	 * @param {string} ip - The IP address of the recipient.
	 * @param {string} key - The public RSA key of the recipient.
	 * @param {string} username - The username of the recipient.
	 * @returns {void}
	 */
	function showUpload(ip, key, username) {
		resetUpload();

		divUpload.classList.remove("hidden");
		divUpload.setAttribute("data-client", ip);
		divUpload.setAttribute("data-key", key);

		spanUpload.textContent = `Sending File › ${username} (${ip})`;
	}

	/**
	 * Hides the uploader UI.
	 * @returns {void}
	 */
	function hideUpload() {
		divUpload.classList.add("hidden");
		resetUpload();
	}

	/**
	 * Logs the user in (client-side interaction only).
	 * @param {string} username - The username of the client.
	 * @returns {void}
	 */
	function login(username) {
		buttonServer.classList.add("logged-in");

		localStorage.setItem("username", username);

		divApp.classList.remove("hidden");

		divLogin.style.opacity = 0;
		
		setStatus("Connected");

		setTimeout(() => {
			divLogin.removeAttribute("style");
			divLogin.classList.add("hidden");
			
			divLoading.classList.add("hidden");
			
			inputUsername.value = "";
		}, 250);
	}

	/**
	 * Logs the user out (client-side interaction only), destroys the old Socket, creates a new one, and adds the appropriate event handlers to it.
	 * @returns {void}
	 */
	function logout() {
		socket = io.connect(url);
		attach(socket);
		
		buttonServer.classList.remove("logged-in");

		localStorage.removeItem("username");

		inputUsername.value = "";

		divApp.style.opacity = 0;

		divLogin.style.zIndex = 1;
		divLogin.classList.remove("hidden");

		setTimeout(() => {
			divApp.removeAttribute("style");
			divApp.classList.add("hidden");

			divLogin.removeAttribute("style");
		}, 250);
	}

	/**
	 * Checks if a username is valid (server-side checks are also performed).
	 * @param {string} username - A desired username.
	 * @returns {Boolean}
	 */
	function validUsername(username) {
		try {
			if(username.length > 16) {
				return false;
			}
			
			return (/^[A-Za-z0-9]+$/.test(username));
		} catch(error) {
			console.log(error);
			return false;
		}
	}

	/**
	 * Sets the client's connection status.
	 * @param {string} status - The connection status of the client to the server.
	 * @returns {void}
	 */
	function setStatus(status) {
		let html = `<span>${ip}:${port}</span><span class="separator"> ‹ </span><span class="status">${status}</span>`;
		if(!divApp.classList.contains("hidden") && !empty(localStorage.getItem("username"))) {
			html = `<span>${ip}:${port}</span><span class="separator"> ‹ </span><span class="status">${status}</span><span class="separator-required"> ‹ </span><span>${localStorage.getItem("username")}</span>`;
		}

		buttonServer.innerHTML = html;

		switch(status) {
			case "Connected":
				// If the login page isn't visible, and the client already has a saved username and didn't manually disconnect and needs to be reconnected, or if they did manually disconnect, then they need to register with the server again.
				if(divLogin.classList.contains("hidden") && ((!empty(localStorage.getItem("username")) && !manualDisconnect && requiresReconnect) || manualDisconnect)) {
					manualDisconnect = false;
					requiresReconnect = false;

					socket.emit("register", { 
						username: localStorage.getItem("username"), 
						key: localStorage.getItem("publicKey") 
					});

					socket.emit("get-clients");
				}

				buttonServer.classList.add("active");
				buttonServer.classList.remove("processing");
				break;
			case "Reconnecting":
				divClients.innerHTML = "";

				buttonServer.classList.remove("active");
				buttonServer.classList.add("processing");
				break;
			case "Disconnected":
				divClients.innerHTML = "";

				buttonServer.classList.remove("active");
				buttonServer.classList.remove("processing");
				break;
		}
	}

	/**
	 * Sets the width and height of the main page's SVG background.
	 * @returns {void}
	 */
	function setBackgroundSize() {
		if(window.innerWidth + 300 > window.innerHeight) {
			svgBackground.setAttribute("viewBox", `0 0 2000 ${window.innerHeight}`);
		} else {
			svgBackground.setAttribute("viewBox", `0 0 ${window.innerWidth} 1500`);
		}
	}
});

/**
 * Checks the user agent to determine whether or not the user is on a mobile device.
 * @returns {Boolean}
 */
function detectMobile() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}