/*
* Website: https://www.xtrendence.com
* Portfolio: https://www.xtrendence.dev
* GitHub: https://www.github.com/Xtrendence
*/
class Notifier {
	constructor(position) {
		this.position = this.empty(position) ? "TopRight" : position;

		this.defaults = {
			width: "250px",
			borderRadius: "10px",
			duration: 5000,
			color: "rgb(255,255,255)",
			success: {
				title: "Success Notification",
				description: "Whatever you did, it worked.",
				background: "rgb(40,200,80)"
			},
			error: {
				title: "Error Notification",
				description: "That didn't work out, did it?",
				background: "rgb(230,50,50)"
			},
			alert: {
				title: "Alert Notification",
				description: "This is probably important...",
				background: "rgb(240,180,10)"
			},
			info: {
				title: "Info Notification",
				description: "Just so you know...",
				background: "rgb(170,80,220)"
			},
			html: ""
		};

		let head = document.getElementsByTagName("head")[0];

		let style = document.createElement("style");
		style.id = "x-notify-style";
		style.innerHTML = '::-webkit-scrollbar { display:none; }';

		head.appendChild(style);
	}

	setOptions(options, type) {
		this.width = this.empty(options.width) ? this.defaults.width : options.width;

		this.borderRadius = this.empty(options.borderRadius) ? this.defaults.borderRadius : options.borderRadius;

		this.title = this.empty(options.title) ? this.defaults[type].title : options.title;

		this.description = this.empty(options.description) ? this.defaults[type].description : options.description;

		this.duration = this.empty(options.duration) ? this.defaults.duration : options.duration;

		this.background = this.empty(options.background) ? this.defaults[type].background : options.background;

		this.color = this.empty(options.color) ? this.defaults.color : options.color;

		this.html = this.empty(options.html) ? this.defaults.html : options.html;
	}

	success(options) {
		this.setOptions(options, "success");
		let element = this.createElement();
		this.showNotification(element);
	}

	error(options) {
		this.setOptions(options, "error");
		let element = this.createElement();
		this.showNotification(element);
	}

	alert(options) {
		this.setOptions(options, "alert");
		let element = this.createElement();
		this.showNotification(element);
	}

	info(options) {
		this.setOptions(options, "info");
		let element = this.createElement();
		this.showNotification(element);
	}

	createElement() {
		if(!document.getElementById("x-notify-container")) {
			let body = document.getElementsByTagName("body")[0];

			let height = "calc(100% - 20px)";
			let paddingRight = "20px";
			let paddingLeft = "0";
			let top = "0";
			let right = "0";
			let bottom = "auto";
			let left = "auto";

			switch(this.position) {
				case "BottomRight":
					height = "auto";
					top = "auto";
					bottom = "0";
					break;
				case "BottomLeft":
					height = "auto";
					paddingRight = "0";
					paddingLeft = "20px";
					top = "auto";
					right = "auto";
					bottom = "0";
					left = "0";
					break;
				case "TopLeft":
					paddingRight = "0";
					paddingLeft = "20px";
					right = "auto";
					left = "0";
					break;
			}

			let container = document.createElement("div");
			container.id = "x-notify-container";
			container.style = 'position:fixed; z-index:1000; width:calc(' + this.width + ' + 70px); height:' + height + '; pointer-events:none; overflow-x:hidden; overflow-y:auto; -webkit-overflow-scrolling:touch; scroll-behavior:smooth; scrollbar-width:none; padding-top:20px; padding-right:' + paddingRight + '; padding-left:' + paddingLeft + '; top:' + top + '; right:' + right + '; bottom:' + bottom + '; left:' + left + ';';
			
			body.appendChild(container);
		}

		let align = (this.position === "TopRight" || this.position === "BottomRight") ? "right" : "left";
		
		let row = document.createElement("div");
		row.id = this.generateID();
		row.style = 'display:block; padding:0 0 20px 0; text-align:' + align + '; width:100%;';

		let notification = document.createElement("div");
		notification.classList.add("x-notification");
		notification.style = 'background:' + this.background + '; color:' + this.color + '; width:' + this.width + '; border-radius:' + this.borderRadius + '; padding:10px 12px 12px 12px; font-family:"Helvetica Neue", "Lucida Grande", "Arial", "Verdana", "Tahoma", sans-serif; display:inline-block; text-align:left; opacity:0; pointer-events:auto; -webkit-user-select:none; -khtml-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; outline:none;';

		notification.innerHTML = '<span style="font-size:18px; font-weight:bold; color:' + this.color + '; display:block; line-height:25px;">' + this.title + '</span><span style="font-size:16px; color:' + this.color + '; display:block; margin-top:5px; line-height:25px;">' + this.description + '</span>' + this.html;

		row.append(notification);

		return row;
	}

	showNotification(element) {
		let container = document.getElementById("x-notify-container");

		let notification = element.getElementsByClassName("x-notification")[0];

		if(this.position === "BottomRight" || this.position === "BottomLeft") {
			container.append(element);
			if(container.scrollHeight > window.innerHeight) {
				container.style.height = "calc(100% - 20px)";
			}
			container.scrollTo(0, container.scrollHeight);
		} else {
			container.prepend(element);
		}

		let opacity = 0.05;
		let animation = setInterval(() => {
			opacity += 0.05;
			notification.style.opacity = opacity;
			if(opacity >= 1) {
				notification.style.opacity = 1;
				clearInterval(animation);
			}
		}, 10);

		setTimeout(() => {
			this.hideNotification(element);
		}, this.duration);
	}

	hideNotification(element) {
		let container = document.getElementById("x-notify-container");

		let notification = element.getElementsByClassName("x-notification")[0];

		let opacity = 1;
		let animation = setInterval(() => {
			opacity -= 0.05;
			notification.style.opacity = opacity;
			if(opacity <= 0) {
				element.remove();

				if(this.empty(container.innerHTML)) {
					container.remove();
				}
				
				clearInterval(animation);
			}
		}, 10);

		if(container.scrollHeight <= window.innerHeight) {
			container.style.height = "auto";
		}
	}

	clear() {
		let container = document.getElementById("x-notify-container");
		let notifications = container.getElementsByClassName("x-notification");

		for(let i = 0; i < notifications.length; i++) {
			this.hideNotification(notifications[i]);
		}
	}

	generateID() {
		let id = this.epoch() + "-" + this.shuffle(this.epoch());

		if(this.empty(document.getElementById("x-notify-container").innerHTML)) {
			return id;
		}

		let invalid = true;

		while(invalid) {
			if(document.getElementById(id)) {
				id = this.epoch() + "-" + this.shuffle(this.epoch());
			} else {
				invalid = false;
				break;
			}
		}

		return id;
	}

	shuffle(string) {
		let parts = string.toString().split("");
		for(let i = parts.length; i > 0;) {
			let random = parseInt(Math.random() * i);
			let temp = parts[--i];
			parts[i] = parts[random];
			parts[random] = temp;
		}
		return parts.join("");
	}

	epoch() {
		var date = new Date();
		var time = Math.round(date.getTime() / 1000);
		return time;
	}

	empty(value) {
		if (value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}
		return false;
	}
}