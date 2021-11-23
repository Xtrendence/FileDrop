document.addEventListener("DOMContentLoaded", () => {
	let body = document.getElementsByTagName("body")[0];

	let ip = document.getElementById("span-ip").textContent;
	let port = document.getElementById("span-port").textContent;

	let gradientStops = {
		stop1: document.getElementById("stop-1"),
		stop2: document.getElementById("stop-2"),
		stop3: document.getElementById("stop-3")
	};

	let socket = io.connect(`http://${ip}:${port}`);

	socket.on("set-color", colors => {
		let gradientStopKeys = Object.keys(gradientStops);
		for(let i = 0; i < gradientStopKeys.length; i++) {
			gradientStops[gradientStopKeys[i]].setAttribute("stop-color", colors[i]);
		}
	});
});