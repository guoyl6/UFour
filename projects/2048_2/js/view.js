window.view = {
	duration: 300,
	createPiece: function(xy, value) {
		var $dom = $("<div></div>")
		.text(value)
		.addClass('piece');
		this.setStyle($dom, xy, value).bindData($dom, xy, value);
		return $dom;
	},
	blockCss: function(xy) {
		return {
			width: this.blockSize.width,
			height: this.blockSize.height,
			translate: [this.blockSize.width * xy.col, this.blockSize.height * xy.row]
		}
	},
	pieceCss: function(xy) {
		var prt = this.blockCss(xy);
		prt.top = 10;
		prt.left = 10;
		prt.width -= 20;
		prt.height -= 20;
		prt.lineHeight = prt.height + "px";
		return prt;
	},

	setStyle: function($piece, xy, value) {
		$piece.css(this.pieceCss(xy));
		return this;
	},
	bindData: function($piece, xy, value) {
		if (!value) {
			$piece.remove();
		}
		$piece.data({
			index: xy.index,
			value: value
		})
		.text(value)
		.addClass("val_" + value);
		return this;
	},
	movePiece: function($piece, xy, direction) {
		var self = this,
			nextValue = self.pieceCss(xy.next),
			dis = Math.abs(xy.next.row - xy.row) + Math.abs(xy.next.col - xy.col),
			time = self.duration,
			deferred = $.Deferred(), promise = deferred.promise();

		if (xy.action == "delete") {
			time = time * dis / (dis + 1);
			promise = promise.then(function() {
				return $piece.fadeOut(self.duration - time)
				.promise().done(function() {
					$piece.remove();
				});
			})
		}

		$piece.transition(nextValue, {
			duration: time,
			easing: 'linear',
			complete: function() {
				deferred.resolve();
				self.bindData($piece, xy.next, xy.next.value);
			}
		})

		return promise;
	},
	initDom: function(game2048) {

		var $dom = this.$game,
		self = this;
		
		self.blockSize = {
			width: this.$game.width() / game2048.option.col,
			height: this.$game.height() / game2048.option.row
		};
		self.moving = false;

		$dom.find('.block').empty().append(game2048.data.map(function(value, index) {
			return $("<div></div>").css(self.blockCss(game2048.xy(index)));
		}));
		$dom.find('.pieces').empty().append(game2048.data.map(function(value, index) {
			return value ? this.createPiece(game2048.xy(index), value) : "";
		}, this))
		return this;
	},
	updateDom: function (game2048, obj) {
		var self = this,
			$dom = self.$game.find('.pieces'),
			$added = self
		.createPiece(game2048.xy(obj.added), game2048.data[obj.added])
		.addClass('added');

		var moveData = {}, eatData = {}, restData = {};
		obj.move.forEach(function(t) {
			moveData[t.index] = t;
		});
		obj.eated.forEach(function(t) {
			eatData[t.index] = t;
		});
		obj.rest.forEach(function(t) {
			restData[t.index] = t;
		});
		
		return $.when.apply($, 
			$dom.children().toArray().map(function(dom) {
				var $piece = $(dom),
					index = $piece.data('index'),
					xy = index in restData ? restData[index] : moveData[index];

				return self.movePiece($piece, xy, obj.direction);
			})
		).done(function() {
			$dom.append($added);
		});

	},
	updateScore: function(value) {
		this.$score.text(value);
	},
	showDead: function($dom) {
		this.$score.addClass('text-danger');
	},
	init: function() {
		this.$game = $(".game");
		this.$score = $(".score");
		this.$game.width(this.$game.width());
		this.$game.height(this.$game.width());
		this.load.resolve();
	},
	load: $.Deferred()
}

$(function() {
	view.init();
})