const express = require("express");
const port = 2180;
const app = express();

app.get("/", (req, res) => {
	res.send(200);
});

app.listen(port, () => { 
	console.log("Running Server...");
});

module.exports = app;