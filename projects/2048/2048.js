width = $(window).width();
height = $(window).height();
var value = [];
var state;
var mousex, mousey;
var score;
var numcolor = {
	'2' : "#FFCC99", '4' : "#FFCC66", '8' : "#FF9966",
	'16' : "#FF9933", '32' : "#FF9900", '64': '#FF6633',
	'128' : '#FF6600', '256':'', '512':'#FF3333',
	'1024':'#FF0000', '2048': '',
	'4096':'', '8192':'', '16384':''
}

$(window).resize(function() {
	$("#playarea").width("98%").height($("#playarea").width());
	var x = ($("#playarea").width() + 4) / 4;
	$(".playpiece").each(function(i, element) {
		$(element).width(x - 10);
		$(element).css({
			"top": x * parseInt(i / 4),
			"left": x * (i % 4),
			"font-size": x / 4 + 'px',
			"padding-top": (x - x / 2) / 3 + 'px',
		});
		$(element).height(x - parseFloat($(element).css("padding-top")) - 10);
	});
});


$(document).ready(function() {
	$(window).resize();
	init(true);
	$("#controlarea").click(function() {
		init(false);
	});
	$(document).mousedown(function(e) {
		state = true;
		mousex = e.pageX;
		mousey = e.pageY;
	});
	$(document).mousemove(function(e) {
		if (!state) {
			return;
		}

		var todo = getState(e.pageX, e.pageY);
		if (todo) {
			state = false;
			Function(todo+"();")();
			if (!nopos()) {
				getNum();
			}
			fresh();
		}
	});
	$(document).mouseup(function() {
		state = false;
	});
});

function nopos() {
	for (var i = 0; i < 16; i++) {
		if (!value[i]) {
			return false;
		}
	}
	return true;
}

function getState(x, y) {
	var disx = Math.abs(x - mousex);
	var disy = Math.abs(y - mousey);
	if (disx < 8) {
		if (disy > 20) {
			return y > mousey ? "down" : "up";
		}
	} else if (disy < 8) {
		if (disx > 20) {
			return x > mousex ? "right" : "left";
		}
	}
	return "";
}

function getNum() {
	var index = parseInt(Math.random() * 16);
	while (value[index]) {
		index = parseInt(Math.random() * 16);
	}
	value[index] = Math.random() >= 0.5 ? 2 : 4;
}

function fresh() {
	$(".playpiece").each(function(i, element) {
		$(element).text(value[i] ? value[i] : "");
		$(element).css({
			"background-color": value[i] ?  numcolor[value[i]] : "gray",
			"border-color": value[i] ?  numcolor[value[i]] : "gray",
		});
	});
	$("#score").text(score);
}

function init(ck) {
	if (!ck) {
		for (var i = 0; i < 16; i++) {
			value[i] = 0;
		}
	} else {
		if (document.cookie) {
			for (var i = 0; i < 16; i++) {
				value[i] = getCookie(i);
			}
		}
	}
	state = false;
	score = 0;
	getNum();
	getNum();
	fresh();
}

function changeValue(start, end, change) {
	var temp = [];
	var pd = function(i) {
		if (change > 0) {
			return i <= end;
		} else {
			return i >= end;
		}
	}
	for (var j = start; pd(j); j += change) {
		if (value[j]) {
			temp.push(value[j]);
		}
		value[j] = 0;
	}
	while (temp.length > 1) {
		if (temp[0] == temp[1]) {
			score += temp[0] < 128 ? temp[0] * 2 : temp[0] * 4;
			value[start] = temp[0] * 2;
			temp.shift();
			temp.shift();
		} else {
			value[start] = temp[0];
			temp.shift();
		}
		start += change;
	}
	if (temp.length == 1) {
		value[start] = temp[0];
	}
}

function left() {
	for (var i = 1; i <= 4; i++) {
		changeValue((i - 1) * 4, i * 4 - 1, 1);
	}
}

function right() {
	for (var i = 1; i <= 4; i++) {
		changeValue(i * 4 - 1, (i - 1) * 4, -1);
	}
}

function up() {
	for (var i = 0; i < 4; i++) {
		changeValue(i, i + 12, 4);
	}
}

function down() {
	for (var i = 0; i < 4; i++) {
		changeValue(12 + i, i, -4);
	}
}
