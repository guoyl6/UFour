var pos = [];
var dire = []
var background = "background.jpg";
var size = 4;
var all = size * size;
var start = false;
var has_win = false;
var has_number = true;
var count = 0;
var last_do = 0;
var hard = 30;

function $(id) {
	return document.getElementById(id);
}

function num() {
	has_number = !has_number;
	var temp = $("puzzlearea").children;
	for (var i = 0; i < temp.length; i++) {
		temp[i].innerHTML = has_number ? i + 1 : '';
	}
}

function win() {
	for (var i = 0; i < pos.length; i++) {
		if (i != pos[i]) {
			return false;
		}
	}
	return true;
}

function near(i) {
	i = parseInt(i);
	if (pos[all-1] % size == 0) {
		return pos[all-1] + 1 == i || pos[all-1] + size == i || pos[all-1] - size == i;
	} else if ((pos[all-1] + 1) % size == 0) {
		return pos[all-1] - 1 == i || pos[all-1] + size == i || pos[all-1] - size == i;
	}
	return pos[all-1] - 1 == i || pos[all-1] + 1 == i
	       || pos[all-1] + size == i || pos[all-1] - size == i;
}

function show(i, now_x, now_y, to_x, to_y) {
	if (now_x == to_x && now_y == to_y) {
		return;
	}
	var temp = $("puzzlearea").children[i];
	if (now_x != to_x) {
		now_x +=  now_x > to_x ? -20 : 20;
		temp.style.left = now_x + 'px';
	} else {
		now_y += now_y > to_y ? -20 : 20;
		temp.style.top = now_y + 'px';
	}
	
	setTimeout(function() {
		show(i, now_x, now_y, to_x, to_y);
	}, 50);
	
}

function fresh() {
	var temp = $("puzzlearea").children;
	for (var i =0; i < temp.length; i++) {
		temp[i].className = "puzzlepiece";
		if (near(pos[i])) {
			temp[i].className += " movablepiece";
		}
	}
}

function move(i) {
	if (!near(pos[i])) {
		return;
	}
	var temp = $("puzzlearea").children[i];
	var to_x = 100 * parseInt(pos[all-1] % size);
	var to_y = 100 * parseInt(pos[all-1] / size);
	var now_x = parseInt(temp.style.left);
	var now_y = parseInt(temp.style.top);
	var temp = pos[all-1];
	pos[all-1] = pos[i];
	pos[i] = temp;
	show(i, now_x, now_y, to_x, to_y);
	fresh();
	if (win()) {
		has_win = true;
		add(all-1);
		num();
		notwork();
		$("shufflebutton").innerHTML = "restart";
		document.getElementsByTagName('select')[0].disabled = "disabled";
	}
}

function add(i) {
	var div = document.createElement("div");
	$("puzzlearea").appendChild(div);
	$("puzzlearea").children[i].innerHTML = i + 1;
	bgshow(i);
}

function del(i) {
	$("puzzlearea").removeChild($("puzzlearea").children[i]);
}

function work() {
	var temp = $("puzzlearea").children;
	for (var i =0; i < all - 1; i++) {
		bgshow(i);
		if (near(pos[i])) {
			temp[i].className += " movablepiece";
		}
		temp[i].onclick = Function("move(" + i + ")");
	}
}

function changesize() {
	if ($("puzzlearea").children.length < all) {
		for (var i = $("puzzlearea").children.length; i < all - 1; i++) {
			add(i);
			$("puzzlearea").children[i].className = "puzzlepiece";
		}
	} else if ($("puzzlearea").children.length > all) {
		while ($("puzzlearea").children.length >= all) {
			del($("puzzlearea").children.length - 1);
		}
	}
}

function notwork() {
	for (var i =0; i < all - 1; i++) {
		$("puzzlearea").children[i].className = "puzzlepiece";
		$("puzzlearea").children[i].onclick = null;
	}
}

function bgshow(i) {
	var temp = $("puzzlearea").children;
	var x = parseInt(pos[i] % size);
	var y = parseInt(pos[i] / size);
	temp[i].style.top = 100 * y + 'px';
	temp[i].style.left = 100 * x + 'px';
	temp[i].style.backgroundImage = "url(" + background + ")";
	temp[i].style.backgroundPosition = (size * 100 - 100 * (i % size)) + 'px ' + 
	(size * 100 - 100 * parseInt(i / size)) + 'px';

	temp[i].className = "puzzlepiece";
}

function can(i) {
	return i >= 0 && i < all; 
}

function buttonclick() {
	if (has_win) {
		$("shufflebutton").innerHTML = "Shuffle";
		$("shufflebutton").disabled = null;
		document.getElementsByTagName('select')[0].disabled = null;
		del(all-1);
		num();
		has_win = false;
	}
	$("shufflebutton").disabled = "disabled";
	document.getElementsByTagName('select')[0].disabled = "disabled";
	if (count >= hard) {
		$("shufflebutton").disabled = null;
		document.getElementsByTagName('select')[0].disabled = null;
		work();
		count = 0;
		return;
	}
	count++;
	var ii = dire[Math.floor(Math.random() * size)];
	while ((last_do == ii * -1) || !can(ii + pos[all-1])) {
		ii = dire[Math.floor(Math.random() * size)];
	}
	last_do = ii;
	for (var i = 0; i < all - 1; i++) {
		if (pos[i] == ii + pos[all-1]) {
			move(i);
			break;
		}
	}
	setTimeout(function() {
		buttonclick();
	}, 100);
}

function addselect(){
	var select = document.createElement("select");
	select.style.width = "50px";
	select.onchange = Function("changebackground()");
	for (var i = 0; i < 4; i++) {
		var option = document.createElement("option");
		select.appendChild(option);
		option.innerHTML = i + 1;
		if (i == 0) {
			option.selected = "selected";
		}
	}
	$("controls").appendChild(select);
}

function changebackground() {
	var i = 0;
	var tt = document.getElementsByTagName("option");
	for (var j = 0; j < tt.length; j++) {
		if (tt[j].selected) {
			i = j;
		}
	}
	hard = 50 * (i * 2 + 1);
	size = i + 4;
	all = size * size;
	background = "background";
	if (i) {
		background += i;
	}
	background += '.jpg';
	changesize();
	var temp = document.getElementsByClassName("puzzlepiece");
	for (var t = 0; t < temp.length; t++) {
		temp[t].style.backgroundImage = "url(" + background + ")";
	}
	init();
}


function init() {
	dire[0] = -size;
	dire[1] = size;
	dire[2] = -1;
	dire[3] = 1;
	for (var i = 0; i < all; i++) {
		pos[i] = i;
	}
	$("puzzlearea").style.height = size * 100 + 'px';
	work();
}

window.onload = function() {
	init();
	$("shufflebutton").onclick = Function("buttonclick()");
	addselect();
}