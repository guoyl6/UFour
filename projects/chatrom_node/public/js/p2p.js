// 标准化 RTC 对象名称
var RTCPeerConnection = window.webkitRTCPeerConnection
    || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription
    || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate
    || window.mozRTCIceCandidate;

/*
	0.发起方获得ice信息(stun)
	1.通信流程如下：发起方先发送sdp，再发送多个candicate
	2.接收方接收sdp和candicate(由于两者并未建立连接，所以须有服务器转发 turn)
	3.接收方先根据sdp信令setRemoteDescription,再addIceCandidate
	4.接收方已经知道发起方的一些信息了，接下来接收方要发送自己的信息给发起方
	5.接收方获得ice信息(stun)
	6.接收方先发送sdp，再发送多个candidate
	7.发起方先根据sdp信令setRemoteDescription,再addIceCandidate
	3.连接建立(如果所有ice穿越方案都失败后，将结果返回给用户，由用户决定是否重试)
*/

var P2P = function(myname, socket) {
	// RTCPeerConnection 选项
	var options = {
	  optional: [
	    // 实现 Chrome 和 Firefox 互通
	    {DtlsSrtpKeyAgreement: true},
	  ]
	};

	var server = {
		iceServers: [
			{url: "stun:stun.l.google.com:19302"},
		]
	};
	var pcs = {};

	var sendOffer = function(pc, to) {
		pc.createOffer(function (offer) {
			pc.setLocalDescription(offer, function() {
				socket.emit("p2p", {
					to: to,
					from: myname,
					sdp: pc.localDescription
				})
			});
		}, function (err) {console.err("offer error:", err)});
	}

	var sendAnswer = function(pc, to) {
		pc.createAnswer(function (answer) {
			pc.setLocalDescription(answer, function() {
				socket.emit('p2p', {
					to: to,
					from: myname,
					sdp: pc.localDescription
				});
			});
		}, function (err) {console.err('answer error:', err);});
	}


	//receive a username and a boolean which sign whether I am the offer
	//callback is call when the channel is open
	this.createPeerConnection = function (to, passive, callback) {
		if (to == myname) {
			return;
		} else if (pcs[to]) {
			return pcs[to];
		}
		var pc = new RTCPeerConnection(server, options);

		pcs[to] = pc;

		pc.onicecandidate = function(e) {
			if (e.candidate) {
				socket.emit("p2p", {
					to: to,
					from: myname,
					candidate: e.candidate
				})
			}
		}

		pc.onnegotiationneeded = function() {
			sendOffer(pc, to);
		}

		pc.dealReceive = function(p2pData) {
			/*Errors when ICE Candidates are received before answer is sent
			RemoteDescription should be set (which should be done at the moment of receiving offer).
			也就是说在处理candidate之前需要先设置RemoteDescription
			 */
			if (p2pData.candidate) {
				pc.addIceCandidate(new RTCIceCandidate(p2pData.candidate));
			} else if (p2pData.sdp) {
				// 收到对方的 LocalDescription，并设置
				pc.setRemoteDescription(new RTCSessionDescription(p2pData.sdp), function() {
					// 被动接受一方创建 Answer 信息，并发给主动一方
					if (pc.remoteDescription.type == "offer") {
						sendAnswer(pc, to);
					}
				})
			} else {
				console.err("p2pData", p2pData);
			}
		}

		if (passive) {
			pc.ondatachannel = function(e) {
				var channel = e.channel;
				console.log("recieve channel");
				pc.channel = channel;
				channel.onopen = function (e) {
					console.log("channel from", channel.label, "open");
					callback && callback.call(pc, e);
				}
			}
		} else {
			pc.channel = pc.createDataChannel(myname);
			pc.channel.onopen = function(e) {
				console.log("channel to", to, "open");
				callback && callback.call(pc, e);
			}
		}

		return pc;
	}

	this.getPeerConnection = function(name) {
		return pcs[name];
	}

	this.removePeerConnection = function(name) {
		pcs[name] && pcs[name].close();
		delete pcs[name];
		console.log("delete", name);
	}

}
