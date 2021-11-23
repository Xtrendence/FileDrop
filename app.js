const express = require("express");
const app = express();

app.get("/", (req, res) => {
	res.send(200);
});

module.exports = app;