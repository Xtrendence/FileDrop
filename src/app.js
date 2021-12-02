const utils = require("./modules/Utils");
const ip = utils.getIP();
const port = 3180;

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(cors());

app.get("/", (request, response) => {
	response.render("index");
});

app.get("/forge/prime.worker.js", (request, response) => {
	response.sendFile(path.join(__dirname, "./assets/js/prime.worker.min.js"));
});

module.exports = app;