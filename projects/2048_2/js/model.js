+function($) {
Array.prototype.depart = function(fn) {
	var rs = {};
	this.forEach(function(value, index) {
		var key = fn.apply(this, arguments);
		if (key in rs) {
			rs[key].push(value);
		} else {
			rs[key] = [value];
		}
	})
	return rs;
}
window.Game_2048 = function(option) {
	this.init($.extend({}, this.getDefaultOption(), option));
}

Game_2048.defaultOption = {
	row: 4,
	col: 4
}

Game_2048.directions = ['left', 'right', 'down', 'up'];

Game_2048.appearNumbers = [2, 4];


Game_2048.prototype.getDefaultOption = function() {
	return Game_2048.defaultOption;
}

Game_2048.prototype.getAppearNumbers = function() {
	return Game_2048.appearNumbers;
}

Game_2048.prototype.init = function(option) {
	Object.defineProperty(this, 'length', {
		get: function() {
			return this.data.length;
		},
		set: function(length) {
			this.reset(length);
		}
	})
	this.option = option;
	this.length = this.option.row * this.option.col;
	return this;
}

Game_2048.prototype.reset = function(length) {
	this.data = new Array(length);
	for (var i = 0; i < length; i++) {
		this.data[i] = 0
	}
	return this;
}

Game_2048.prototype.nextNum = function() {
	var emptyAreas = [], appearNumbers = this.getAppearNumbers();
	this.data.forEach(function(value, index) {
		!value ? emptyAreas.push(index) : null;
	});
	if (!emptyAreas.length) {
		return null;
	}

	var index = emptyAreas[Math.floor(Math.random() * emptyAreas.length)],
		value = appearNumbers[Math.floor(Math.random() * appearNumbers.length)];
	this.data[index] = value;
	return {
		index: index,
		value: value
	};
}

Game_2048.prototype.isDead = function() {
	var t = this.clone();
	for (var i = Game_2048.directions.length; i--;) {
		if (t.next(Game_2048.directions[i]).isChanged) {
			return false;
		}
	}
	return true;
}


Game_2048.prototype.next = function(direction) {
	direction = direction.toLowerCase();
	var next = this.getChange(direction);
	if (!next.isChanged) {
		return next;
	}
	next.move.forEach(function(xy, index) {
		this.data[xy.index] = 0;
	}, this);
	
	next.rest.forEach(function(xy, index) {
		this.data[xy.next.index] = xy.next.value;
	}, this);
	
	return next;
}

Game_2048.prototype.getChange = function(direction) {
	var now = this.data.map(function(value, index) {
		var xy =  this.xy(index);
		xy.value = value;
		xy.next = $.extend({}, xy);
		xy.action = null;
		return xy;
	}, this).filter(function(xy) {
		return xy.value;
	}), rest = [];
	var departKey = (direction == "up" || direction == "down" ? "col" : "row"),
		updateKey = (departKey == "row" ? "col" : "row"),
		reverse = (direction == "right" || direction == "down");

	var dp = now.depart(function(xy) {
		return xy[departKey];
	});

	for (var i in dp) {
		var arr = reverse ? dp[i].reverse() : dp[i];
		arr.forEach(function(xy, index) {
			var next = arr[index+1];
			if (xy.action) {
				return;
			}
			if (!next) {
				xy.action = xy.action || "move";
				return;
			}
			if (next.value == xy.value) {
				xy.action = "delete";
				next.action = "double";
			}
		});

		arr.forEach(function(xy, index) {
			xy.next[updateKey] = reverse ? this.option[updateKey] - 1 - index : index;
			xy.next.index = this.toIndex(xy.next);
			xy.next.value = xy.action == "double" ? xy.value * 2 : xy.value;
		}, this);

		var a_d = 0;
		arr.forEach(function(xy) {
			xy.next[updateKey] += reverse ? a_d : -a_d;
			xy.next.index = this.toIndex(xy.next);
			xy.next.value = xy.action == "double" ? xy.value * 2 : xy.value;
			if (xy.action == "delete") {
				a_d++;
			} else {
				rest.push(xy);
			}
		}, this);

	}

	return {
		move: now,
		eated: now.filter(function(xy) {
			return xy.action == "delete"
		}),
		rest: rest,
		isChanged: !!rest.filter(function(xy) {
			return xy.index != xy.next.index;
		}).length,
		direction: direction
	};
}

Game_2048.prototype.xy = function(index) {
	if (index < 0 || index >= this.length) {
		throw "index out of range: [" + 0 + ", " + this.length + "] -->" + index;
	}
	return {
		col: index % this.option.col,
		row: parseInt(index / this.option.col),
		index: index
	}
}

Game_2048.prototype.toIndex = function(xy) {
	var index =  this.option.col * xy.row + xy.col;
	if (index < 0 || index >= this.length) {
		throw "index out of range: [" + 0 + ", " + this.length + "] -->" + xy;
	}
	return index;
}

Game_2048.prototype.clone = function() {
	var t = new Game_2048(this.option);
	t.data = this.data.slice();
	return t;
}

}(jQuery);
