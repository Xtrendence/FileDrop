// Imports.
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Use EJS.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Use CORS.
app.use(cors());

// When the root route is requested, the index page is served.
app.get("/", (request, response) => {
	response.render("index");
});

// The Forge library looks for the Prime Worker in "/forge/prime.worker.js", so the server serves the file from the assets directory for better file organization.
app.get("/forge/prime.worker.js", (request, response) => {
	response.sendFile(path.join(__dirname, "./assets/js/prime.worker.min.js"));
});

module.exports = app;