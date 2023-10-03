/** Begin Server */

const express = require("express");
const server = require("http").createServer();
const app = express();

// basic route
app.get("/", function (req, res) {
	// respond with index.html, specify location
	res.sendFile("index.html", { root: __dirname });
});

// make app respond to requests
server.on("request", app);
server.listen(3000, function () {
	console.log("server started on port 3000");
});

/** Begin Websocket */

// use ws package to create websocket server
const WebSocketServer = require("ws").Server;
// attach websocket server to http server
const wss = new WebSocketServer({ server: server });

// on signal interrupt (ctrl-c) to shutdown server
process.on("SIGINT", () => {
	console.log("sigint");
	// iterate over all clients
	wss.clients.forEach(function each(client) {
		client.close();
	});
	server.close(() => {
		shutdownDB();
	});
});

// connection function is called when a client connects
wss.on("connection", function connection(ws) {
	const numClients = wss.clients.size;
	console.log("Clients connected", numClients);

	wss.broadcast(`Current visitors: ${numClients}`);

	if (ws.readyState === ws.OPEN) {
		ws.send("Welcome to my server");
	}

	// insert visitors data into visitors table
	db.run(`INSERT INTO visitors (count, time)
        VALUES (${numClients}, datetime('now'))
    `);

	ws.on("close", function close() {
		wss.broadcast(`Current visitors: ${numClients}`);
		console.log("A client has disconnected");
	});
});
wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

/** End Websocket */

/** Begin Database */
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

// ensures database is open before any queries are run
db.serialize(() => {
	db.run(`
        CREATE TABLE IF NOT EXISTS visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

function getCounts() {
	db.each("SELECT * FROM visitors", (err, row) => {
		console.log(row);
	});
}
// always close the database connection when finished
function shutdownDB() {
	console.log("Shutting down db");

	getCounts();
	db.close();
}
