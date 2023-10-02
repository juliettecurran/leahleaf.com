const http = require('http');

http.createServer(function (req, res) {
res.write("Learning how to do stuff!");
	res.end();
}
).listen(3000);

console.log("Server started on PORT 3000")
