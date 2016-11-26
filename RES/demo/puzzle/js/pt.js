function Area(x, y) {
	this.x = x;
	this.y = y;
	this.toXY = function(index) {
		return new Location(index % this.x, parseInt(index / this.y));
	}
	this.toIndex = function(loc) {
		return loc.y * this.x + loc.x;
	}
	this.count = function() {
		return this.x * this.y;
	}
}

function Location(x, y) {
	this.x = x;
	this.y = y;
	this.between = function(loc) {
		if (this.equal(loc)) {
			return [];
		}
		var gx = this.towoards(loc);
		//console.log(gx);
		var betweens = [];
		var i = this.x;
		do {
			var j = this.y;
			do {
				betweens.push(new Location(i, j));
				j += gx.yc;
			} while (j != loc.y);
			i += gx.xc;
		} while (i != loc.x);
		betweens.push(new Location(loc.x, loc.y));
		//betweens.shift();
		//betweens.pop();
		return betweens;
	}
	this.towoards = function(loc) {
		return {
			'xdis': this.x - loc.x,
			'ydis': this.y - loc.y,
			'xc': this.x - loc.x && (this.x - loc.x > 0 ? -1 : 1),
			'yc': this.y - loc.y && (this.y - loc.y > 0 ? -1 : 1)
		}
	}
	this.equal = function(loc) {
		return this.x == loc.x && this.y == loc.y;
	}
	this.equalButNotSelf = function(loc) {
		return this != loc && this.equal(loc);
	}
}

function objParams(width, height) {
	this.objWidth = width;
	this.objHeight = height;
}

$(function() {
	var objparams = new objParams(100, 100);
	var objNumberInRow = 4, objNumberInCol = 4;
	var area = new Area(objNumberInRow, objNumberInCol);
	area.fresh = function() {
		$(".canMove").removeClass("canMove");
		var loc = $("#blank").data("inScreen");
		$(".block").not("#blank").filter(function() {
			return $(this).data("inScreen").x == loc.x
				|| $(this).data("inScreen").y == loc.y;
		}).addClass('canMove');
	}
	area.move = function(src, dest, options) {
		var loc = $(src).data("inScreen"), locTo = $(dest).data("inScreen");
		var betweens = loc.between(locTo);
		//console.log(betweens);
		for (var i = 0; i < betweens.length; i++) {
			var next = (i + 1) % betweens.length;
			var to = {
				top: betweens[next].y * objparams.objHeight + "px",
				left: betweens[next].x * objparams.objWidth + "px"
			}
			jQuery.extend(to, options);
			$(".block").filter(function() {
				return $(this).data("inScreen").equalButNotSelf(betweens[i]);
			}).data("inScreen", betweens[next]).stop(true).animate(to, 300);
		}
		area.fresh();
	}
	area.checkWin = function() {
		return $(".block").filter(function() {
			return area.toIndex($(this).data("inScreen")) == $(this).index();
		}).length == $(".block").length;
	}

	init(area, objparams);
	area.fresh();

	$("#area").on('click', function(e) {
		var obj = e.target;
		if (!$(obj).hasClass("canMove")) {
			console.log('wrong target');
			return;
		}
		area.move(obj, $("#blank"));
		console.log(area.checkWin());
	})
	$("#shuffle").click(function() {
		setTimeout(function() {shuffle(area);});
	})
});

function init(area, objparams) {
	$("#area").empty();
	for (var i = 0; i < area.y; i++) {
		for (var j = 0; j < area.x; j++) {
			var left = j * objparams.objWidth, top = i * objparams.objHeight;
			var params = {
				left: left + "px",
				top: top + "px",
				"background-position": -left + "px " + -top + "px",

			}
			var toadd = $("<div></div>").addClass("block");
			$("#area").append(toadd);
			toadd.css(params).data('inScreen', new Location(j, i));
		}
	}
	$("#area").children().eq(area.count() - 1).attr('id', 'blank');
}

function shuffle(area) {
	for (var i = 0; i < 100; i++) {
		var index = Math.floor(Math.random() * $(".canMove").length);
		area.move($(".canMove").eq(index), $("#blank"));
	}
}
