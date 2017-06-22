var width = 400, height = 400; //图片的大小
var size = 4; //每行拼图数量
var pos = {};
var start = false;
var background = null;
var data = {
	'1': {
		'size': '4',
		'width': '400',
		'height': '400',
	},
	'2': {
		'size': '5',
		'width': '500',
		'height': '500',
	},
	'3': {
		'size': '6',
		'width': '600',
		'height': '600',
	},
	'4': {
		'size': '7',
		'width': '700',
		'height': '700',
	},
};

window.onload = function() {
	init();
	$("#start").addEventListener('click', function() {
		init();
		removeCanMove();
		addCanMove();
		start = true;
		this.disabled = 'disabled';
	});
	$("#shuffle").onclick = function() {
		toShuffle();
	}
	$("#select").onchange = function() {
		init();
	}
	$("#solve").onclick = function() {
		var solve = new solvePt(pos, size);
		var result = solve.path(solve.startSolveWithYCL(true, true));
		console.log(result.length);
		if (result) {
			var show = function(index) {
				if (index >= result.length) {
					for (var i = 0; i < $(".each").length; i++) {
						$(".each")[i].style.transitionDuration = '';
					}
					return;
				}
				var tc = [-size, 1, size, -1]
				var xy = getIndex($("#blank"));
				var target = xy[1] * size + xy[0] + parseInt(tc[result[index].moveDirection()]);
				//console.log(target);
				pos[target].click();
				if (result[index].message) {
					alert(result[index].message);
				}
				setTimeout(function() {
					show(index + 1);
				});
			}
			for (var i = 0; i < $(".each").length; i++) {
				$(".each")[i].style.transitionDuration = '0s';
			}
			show(1);
		}
	}	
}

function createPT(num) {
	var pt = document.createElement('div');
	pt.index = num;
	addClass(pt, 'each');
	var eachwidth = width / size, eachheight = height / size;
	var top = parseInt(num / size) * eachheight,
	left = num % size * eachwidth;
	pt.style.top = top + 'px';
	pt.style.left = left + 'px';
	pt.style.backgroundPosition = left * -1 + 'px' + ' ' + top * -1 + 'px';
	pt.style.width = eachwidth + 'px';
	pt.style.height = eachheight + 'px';
	pt.style.lineHeight = eachheight + 'px';
	pt.style.fontSize = eachheight / 2 + 'px';
	pt.style.backgroundImage = "url(css/image/" + background + ")";
	pt.textContent = num;
	return pt;
}

function init() {
	start = false;
	pos = {};
	background = $("#select").selectedOptions[0].value;
	var option = $("#select").selectedOptions[0].text;
	size = data[option]['size'];
	width = data[option]['width'];
	height = data[option]['height'];
	$("#start").disabled = '';
	$("#displayarea").innerHTML = '';
	$("#displayarea").style.width = width + 'px';
	$("#displayarea").style.height = height + 'px';
	for (var i = 0; i < size * size; i++) {
		var pt = createPT(i);
		if (i == size * size - 1) {
			pt.id = 'blank';
			pt.textContent = '';
		}
		pos[i] = pt;
		pt.onclick = function() {
			if (!hasClass(this, 'canMove')) {
				return;
			}
			if (!move(this)) {
				return;
				//alert('error');
			}
			removeCanMove();
			if (checkWin() && start) {
				var all = $(".each");
				for (var i = 0; i < all.length; i++) {
					all[i].style.border = 'none';
					all[i].textContent = '';
				}
				$("#blank").id = '';
				$("#start").disabled = '';
			} else {
				addCanMove();
			}
		}
		$("#displayarea").appendChild(pt);
	}
}

function checkWin() {
	for (var i in pos) {
		if (pos[i].index != i) {
			return false;
		}
	}
	return true;
}

function move(obj) {
	var index = getIndex(obj);
	var x = index[0], y = index[1];
	var blankIndex = getIndex($("#blank"));
	var blankX = blankIndex[0], blankY = blankIndex[1];
	if (x != blankX && y != blankY) {
		alert('position error');
		return false;
	}
	var change = inDirection(blankX, blankY, 
		x == blankX ? y : x, x == blankX ? 
		(y < blankY ? 0 : 2) : (x < blankX ? 3 : 1));
	change.unshift(blankY * size + blankX);
	for (var i = 0; i < change.length - 1; i++) {
		var temp = pos[change[i+1]];
		var ttop = pos[change[i+1]].style.top,
			tleft = pos[change[i+1]].style.left;

		pos[change[i+1]].style.top = pos[change[i]].style.top;
		pos[change[i+1]].style.left = pos[change[i]].style.left;
		pos[change[i]].style.top = ttop;
		pos[change[i]].style.left = tleft;
		pos[change[i+1]] = pos[change[i]];
		pos[change[i]] = temp;
	}
	return true;
}

function removeCanMove() {
	var canMove = $(".each");
	for (var i = 0; i < canMove.length; i++) {
		//console.log(i);
		removeClass(canMove[i], 'canMove');
	}
}

function addCanMove() {
	if (!$("#blank")) {
		return;
	}
	var index = getIndex($("#blank"));
	var x = index[0], y = index[1];
	for (var i = 0; i < 4; i++) {
		//4个方向
		var result = inDirection(x, y, i % 3 && size - 1, i);
		for (var j in result) {
			addClass(pos[result[j]], 'canMove');
		}
	}
}

function getIndex(obj) {
	var eachheight = height / size, eachwidth = width / size;
	var y = parseInt(obj.style.top) / eachheight;
	var x = parseInt(obj.style.left) / eachwidth;
	return [x, y];
}

//0是上，1是右，2是下，3是左。
//x是x轴坐标，y是y轴坐标
function inDirection(x, y, end, direction) {
	if (direction < 0 || direction > 3) {
		return null;
	}
	var tcx = direction % 2 * (x < end ? 1 : -1);
	var tcy = (direction + 1) % 2 * (y < end ? 1 : -1);
	var result = [];
	while ((tcx != 0 && x != end)
		|| (tcy != 0 && y != end)) {
		x += tcx;
		y += tcy;
		result.push(y * size + x);
		//console.log(y + ' ' + x);
	}
	return result;
}

function toShuffle() {
	start = false;
	var all = $(".each");
	removeCanMove();
	addCanMove();
	for (var i = 0; i < 300; i++) {
		var canMove = $(".canMove");
		if (canMove.length == 0) {
			return false;
		}
		var index = Math.floor(Math.random() * canMove.length);
		canMove[index].click();
	}
	start = true;
}
