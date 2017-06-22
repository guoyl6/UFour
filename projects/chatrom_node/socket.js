module.exports = function (server) {
	
	var io = require("socket.io")(server);

	io.start = function() {
		var allUser = {};

		io.on("connection", function (soc) {
			soc.on("login", function (data) {
				var username = data.username, id = data.id;
				if (username && !allUser.hasOwnProperty(username)) {
					allUser[username] = new user(soc, data);
					soc.emit("welcome", {allUser: Object.keys(allUser)});
					io.emit("login", {username: username});
					console.log(soc.name, "加入了");
				} else if (username) {
					soc.emit("exists", {username: username});
				}
			});

			soc.on("chat", function (data) {
				var username = data.username, text = data.text;
				if (allUser.hasOwnProperty(username)) {
					io.emit("chat", {username: username, text: text});
					console.log(username, "说了:", text);
				}
			})

			soc.on("disconnect", function () {
				if (allUser.hasOwnProperty(soc.name)) {
					delete allUser[soc.name];
					io.emit("logout", {username: soc.name});
					console.log(soc.name, "离开了");
				}
					
			});

			//turn ==> 服务器帮忙转发
			soc.on("p2p", function(data) {
				var from = data.from, to = data.to;
				var type = data.candidate ? "candidate" : "sdp";
				if (allUser.hasOwnProperty(from)
					&& allUser.hasOwnProperty(to)
					&& from != to) {
					allUser[to].socket.emit("p2p", data);
					console.log(from, "send", to, "a", type, "message");
				}
			})

		});

	}

	return io;
}

function user (soc, userdata) {
	soc.name = userdata.username;
	this.socket = soc;
	this.id = userdata.id;
}


