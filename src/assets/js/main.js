document.addEventListener("DOMContentLoaded", () => {
	let svgBackground = document.getElementById("background");

	window.addEventListener("resize", setBackgroundSize);

	setBackgroundSize();

	const Notify = new Notifier("TopLeft");

	let body = document.getElementsByTagName("body")[0];

	let ip = document.getElementById("span-ip").textContent;
	let port = document.getElementById("span-port").textContent;

	let gradientStops = {
		stop1: document.getElementById("stop-1"),
		stop2: document.getElementById("stop-2"),
		stop3: document.getElementById("stop-3")
	};

	let socket = io.connect(`http://${ip}:${port}`);

	socket.on("notify", notification => {
		Notify.info(notification);
	});

	socket.on("set-color", colors => {
		let gradientStopKeys = Object.keys(gradientStops);
		
		for(let i = 0; i < gradientStopKeys.length; i++) {
			gradientStops[gradientStopKeys[i]].setAttribute("stop-color", colors[i]);
		}

		svgBackground.style.background = colors[2];
	});

	function setBackgroundSize() {
		if(window.innerWidth + 300 > window.innerHeight) {
			svgBackground.setAttribute("viewBox", `0 0 2000 ${window.innerHeight}`);
		} else {
			svgBackground.setAttribute("viewBox", `0 0 ${window.innerWidth} 1500`);
		}
	}
});