/** Start Server **/

const express = require("express");
const server = require("http").createServer();
const app = express();
const PORT = 3000;

/** basic route **/
app.get("/", function (req, res) {
	// respond with index.html, specify location
	res.sendFile("index.html", { root: __dirname });
});

// make app respond to requests
server.on("request", app);

server.listen(PORT, function () {
	console.log("Listening on " + PORT);
});

/** End Server **/

/** Start Websocket **/

// use ws package to create websocket server
const WebSocketServer = require("ws").Server;

// attach websocket server to http server
const wss = new WebSocketServer({ server: server });

// connection function is called when a client connects
wss.on("connection", function connection(ws) {
	const numClients = wss.clients.size;

	// log number of clients connected
	console.log("clients connected: ", numClients);
	// broadcast number of clients connected to all clients
	wss.broadcast(`Current visitors: ${numClients}`);
	// handle open state
	if (ws.readyState === ws.OPEN) {
		ws.send("Welcome!");
	}
	// handle close state
	ws.on("close", function close() {
		wss.broadcast(`Current visitors: ${wss.clients.size}`);
		console.log("A client has disconnected");
	});

	ws.on("error", function error() {
		//
	});
});

/**
 * Broadcast data to all connected clients
 * @param  {Object} data
 * @void
 */

// define broadcast function
wss.broadcast = function broadcast(data) {
	console.log("Broadcasting: ", data);
	// iterate over all clients
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};
/** End Websocket **/
