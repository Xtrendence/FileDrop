const express = require("express");
const cors = require("cors");
const utils = require("./modules/Utils");
const ip = utils.getIP();
const port = 2180;
const fs = require("fs");
const path = require("path");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(cors());

app.get("/", (request, response) => {
	response.render("index", { ip:ip, port:port });
});

app.get("/forge/prime.worker.js", (request, response) => {
	response.sendFile(path.join(__dirname, "./src/assets/js/prime.worker.min.js"));
});

module.exports = app;