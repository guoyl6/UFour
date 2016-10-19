function $(obj) {
	var bind = function(obj) {
		obj.bind = function(event, fn) {
			obj.addEventListener(event, fn);
			return obj;
		}
		obj.css = function(name, value) {
			if (arguments.length >= 2) {
				obj.style[name] = value;
				return obj;
			}
			var styles = getComputedStyle(obj);
			if (name in styles) {
				value = styles[name];
				if (value.indexOf("px") != -1) {
					return parseFloat(styles[name].replace("px", ""));
				} else {
					return value;
				}
			} else {
				return undefined;
			}
		}
	}
	if (obj.length) {
		for (var i = obj.length; i--;) {
			bind(obj[i]);
		}
	} else {
		bind(obj);
	}

	return obj;
		
}

window.onload = function() {
	var area;
	var costTime = 0, timerObject = $(document.getElementById("time"));
	timerObject.updateTime = function() {
		this.textContent = costTime + "s";
	}

	var block = $(document.getElementById("block")), areaDom = $(document.getElementById("area")),
		walls = $(document.getElementsByClassName("wall"));
	var wallValue = -1, blockValue = 1, emptyValue = 0;
	var outSide = "出界啦", touchWall = "撞墙啦";

	function initArea() {

		var width = areaDom.css("width"), height = areaDom.css("height");
		area = new Array(width * height);
		for (var i = area.length; i--;) {
			area[i] = emptyValue;
		}
		area.each = function(square, fn) {
			// console.log(square);
			for (var w = square.width; w--;) {
				for (var h = square.height; h--;) {
					var x = square.left + w, y = square.top + h;
					if (0 <= x && x < width && 0 <= y && y < height) {
						var index = y * width + x, ctrl = {};
						fn(index, area[index], ctrl);
						if (ctrl.return) {
							return ctrl.value;
						}
					}
				}
			}
		}
		area.setObj = function(square, value) {
			var count = 0;
			area.each(square, function (index) {
				area[index] = value;
				count++;
			});
			// console.log(count);
			return count;
		}
		area.hasValue = function (square, tofind) {
			return area.each(square, function(index, value, ctrl) {
				if (value == tofind) {
					ctrl.return = true;
					ctrl.value = true;
				}
			}) || false;
		}
		area.getSquare = function(obj) {
			return {
				top: obj.css("top"),
				left: obj.css("left"),
				width: obj.css("width"),
				height: obj.css("height")
			}
		}
		for (var i = walls.length; i--;) {
			var wall = walls[i], square = area.getSquare(wall);
			area.setObj(square, wallValue);
		}
		area.setObj(area.getSquare(block), blockValue);
		return area;
	}

	var move = new s().add("startMove", false).add("alive", true).add("arrive", false).add("nx", -1).add("ny", -1);

	var alive = move.child("alive");

	var timer = null;

	var startTimer = function() {
		timer = setInterval(function() {
			costTime += 1;
			timerObject.updateTime();
		}, 1000);
	}.check(function() {
		return timer === null;
	})

	function endTimer() {
		clearInterval(timer);
		timer = null;
	}

	var startMoving = new bs().care(alive);
	startMoving.addExec(function(e) {
		move.set("nx", e.clientX).set("ny", e.clientY).set("startMove", true);
	}, startTimer);

	var moving = new bs().care(alive, move.child("startMove")).addExec(function(e) {
		console.log("moving");
		var nx = move.get("nx"), ny = move.get("ny"),
			dx = e.clientX - nx, dy = e.clientY - ny,
			nt = block.css("top") + dy, nl = block.css("left") + dx,
			square = area.getSquare(block), c = area.setObj(square, emptyValue);
		if (c != square.width * square.height) {
			die.exec(outSide);
			return;
		}
		square.top = nt;
		square.left = nl;
		block.css("top", nt + "px").css("left", nl + "px");
		if (area.hasValue(square, wallValue)) {
			die.exec(touchWall);
		} else {
			area.setObj(square, blockValue);
			move.set("nx", e.clientX).set("ny", e.clientY);
		}


	}, new bs().care(alive).addExec(function() {
		if (block.css("left") >= areaDom.css("width") - block.css("width")) {
			// console.log(block.css("left"), alive.isGood());
			move.set("start", false).set("arrive", true);
			die.exec("到达出口")
		}
	}))

	var movingDone = new bs().care(alive).addExec(function(e) {
		move.set("startMove", false);
	})

	var die = new bs().care(alive).addExec(function(ev) {
		move.set("alive", false);
		restartButton.textContent = ev;
	}, endTimer);

	var restart = function() {
		block.css("top", "").css("left", "");
		initArea();
		move.set("startMove", false).set("alive", true)
			.set("arrive", false).set("nx", -1).set("nx", -1);
		restartButton.textContent = "重来";
		costTime = 0;
		timerObject.updateTime();
	}

	block.bind("click", function(e) {
		if (move.isGood("startMove")) {
			movingDone.exec(e);
		} else {
			startMoving.exec(e);
		}
	}).bind("mousemove", moving.exec.bind(moving).throttle(10, true, false))
	  .bind("mouseleave", movingDone.exec.bind(movingDone));

	var restartButton = $(document.getElementById("restart"));

	restartButton.bind("click", restart);


	restart();

}
