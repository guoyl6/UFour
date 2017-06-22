$(document).ready(function() {
	var p2p;
	var isLogin = false;
	var soc = io.connect("ws://" + window.location.host);
	var requieLogin = function(callback) {
		return function(data) {
			if (isLogin) {
				callback && callback(data);
			}
		}
	}
	var myname = null;

	var chatRoomMessage = $(".message").eq(0);

	var users = null;

	var messages = {};

	var chatting = null;

	var choose = function(username) {
		if (!messages[username]) {
			addMessgeRoom(username);
		}
		messages[username].bind.fadeIn(function() {
			if (chatting) {
				messages[chatting].bind.fadeOut();
			}
			chatting = username;
		});
		
	}

	var chooseChatRoom = function() {
		chatting && messages[chatting] && messages[chatting].bind.fadeOut();
		//console.log(chatting, messages[chatting]);
		chatting = null;
	}

	var showNameError = function(error) {
		$("#errorLog").stop(true, true).text(error).show().fadeOut(2000);
	}

	var sendText = function(text) {
		if (!chatting) {
			soc.emit("chat", {username: myname, text: text});
			//console.log({username: myname, text: text});
		} else {
			addUserChatText(chatting, myname, text);
			messages[chatting].peerconnection.channel.send(text);
			scrollBottom(messages[chatting].bind.find(".hideScroll"));
			//console.log(chatting);
		}
	}

	var addUser = function(username) {
		if (username != myname) {
			users[username] = $("#userSample").clone().removeClass('unvisibility')
											  .removeAttr("id").text(username);
				$("#userlist .hideScroll").append(users[username]);
			
		}
	}

	var addMessgeRoom = function(username) {
		if (!messages[username]) {
			messages[username] = new User(username,
				p2p.getPeerConnection(username),
				$("#chatSample").clone().removeAttr("id"));
			$("#chat").append(messages[username].bind);
		}
	}

	var addTip = function(toadd, tips) {
		var add = $("#tipSample").clone().removeClass("hide").text(tips);
		toadd.find(".hideScroll").append(add);
		return add;
	}

	var addText = function(toadd, user, text) {
		var target = user == myname ? "#meSample" : "#otherSample";
		toadd.find(".hideScroll").append($(target).clone()
								           .removeAttr("id").removeClass("hide")
										   .find(".name").text(user).end()
										   .find(".text").text(text).end());
	}

	var addChatRoomText = function(username, text) {
		addText(chatRoomMessage, username, text);
		var area = chatRoomMessage.find(".hideScroll");
		scrollBottom(area);
	}

	var addUserChatText = function(username, teller, text) {
		if (!messages[username]) {
			addMessgeRoom(username);
		}
		addText(messages[username].bind, teller, text);
		return messages[username].bind;
	}

	var listenChannel = function(channel, username) {
		channel.onmessage = function(data) {
			var text = data.data;
			var area = addUserChatText(username, username, text);
			scrollBottom(area.find(".hideScroll"));
			if (chatting != username) {
				if (users[username].hasClass("notRead")) {
					return;
				}
				users[username].addClass("notRead");
			}
			//console.log(data);
		}
		channel.onclose = function(data) {
			p2p.removePeerConnection(username);
			addTip(messages[username].bind, "退出了房间");
			console.log("channel with", username, "closed");
		}
	}

	var scrollBottom = function(area) {
		area.scrollTop(area[0].scrollHeight);
	}

	soc.on("login", requieLogin(function(data) {
		addUser(data.username);
		addTip(chatRoomMessage, data.username + "进入了房间");
	}));

	soc.on("welcome", function(data) {
		isLogin = true;
		users = {};

		myname = $("#inputName").val();
		$("#me").text(myname);

		var allUser = data.allUser;
		for (var i in allUser) {
			addUser(allUser[i]);
		}

		$("#loginArea").fadeOut();
		chatRoomMessage.css("background-color", "#FFFCD7");

		p2p = new P2P(myname, soc);
	});

	soc.on("logout", requieLogin(function(data) {
		var username = data.username;
		users[username].slideUp(function() {
			$(this).hide();
		})
		if (chatting == username) {
			chatting = null;
		}
		delete users[username];
		messages[username] && messages[username].remove();
		addTip(chatRoomMessage, username + " 退出了房间")
	}));


	soc.on("p2p", requieLogin(function(data) {
		//console.log(data);
		var username = data.from;
		var pc = p2p.createPeerConnection(username, true, function() {
			listenChannel(this.channel, username);
		})
		pc && pc.dealReceive(data);
	}));

	soc.on("chat", requieLogin(function(data) {
		addChatRoomText(data.username, data.text);
	}));

	soc.on("exists", function(obj) {
		showNameError("哦哦，已经有人叫'" + obj.username + "'了 =_=");
	});

	$("#confirmName").click(function() {
		if (!!$("#inputName").val()) {
			soc.emit("login", {"username": $("#inputName").val(), id: Date.now() + Math.random()})
		} else {
			showNameError("名字不能为空 =_=");
		}
	});

	$("#userlist").on("click", function(e) {
		var target = $(e.target);
		if (target.hasClass("eachUser") && target.attr("id") != "me") {
			
			if (target.attr("id") != "chatroom") {
				if (target.hasClass("choose")) {
					target.removeClass("choose");
					chooseChatRoom();
				} else {
					target.removeClass("notRead");
					$(".choose").removeClass("choose");
					target.addClass("choose");
					var username = target.text();
					p2p.createPeerConnection(username, false, function() {
						listenChannel(this.channel, username);
					});
					choose(username);
				}
			} else {
				$(".choose").removeClass("choose");
				chooseChatRoom();
			}

		}
	})

	$("#text").keydown(function(e) {
		//console.log(e);
		if (e.ctrlKey && e.which == 13) {
			console.log("I send now");
			$("#sendText").click();
			return true;
		}
		return true;
	})

	$("#sendText").click(function() {
		var text = $("#text").val();
		$("#text").val("");
		if (text) {
			sendText(text);
		}
	})

	function User(name, pc, obj) {
		obj.username = name;
		//obj.peerconnection = pc;
		this.peerconnection = pc;
		this.bind = obj;
		this.remove = function() {
			p2p.removePeerConnection(name);
			obj.fadeOut(function() {
				$(this).hide();
			});
			delete messages[name];
		}
	}

});


