window.view = {
	createPiece: function(xy, value) {
		var $dom = $("<div></div>")
		.text(value)
		.addClass('piece');
		this.updatePiece($dom, xy, value);
		return $dom;
	},
	cssValue: function(xy) {
		return {
			transform: 'translate(' + [xy.col * 100, xy.row * 100].join('%,') + '%)'
		}
	},
	updatePiece: function($piece, xy, value) {
		if (!value) {
			$piece.remove();
		}
		$piece.css(this.cssValue(xy)).data({
			index: xy.index,
			value: value
		}).text(value);
		return this;
	},
	init: function($dom, game2048) {
		$dom.empty().append(game2048.data.map(function(value, index) {
			return value ? this.createPiece(game2048.xy(index), value) : "";
		}, this))
		return this;
	},
	render: function ($dom, game2048, obj) {
		var self = this, $added = self
		.createPiece(game2048.xy(obj.added), game2048.data[obj.added])
		.addClass('added');
		var moveData = {}, eatData = {}, restData = {};
		obj.move.forEach(function(t) {
			moveData[t.index] = t.next.index;
		});
		obj.eated.forEach(function(t) {
			eatData[t.index] = t.next.index;
		});
		obj.rest.forEach(function(t) {
			restData[t.index] = t.next.index;
		})
		var time = null;
		$dom.children().each(function() {
			var index = $(this).data('index'),
				nextIndex = index in restData ? restData[index] : moveData[index];

			time = time === null ? +/[0-9]+.?[0-9]*(?=s)/.exec($(this).css('transition'))[0] * 1000 : time;

			$(this)
			.css(self.cssValue(game2048.xy(nextIndex)), $(this).data('value'))
			.addClass(index in restData ? '' : 'to_remove');

		})

		setTimeout(function() {
			$dom.children().each(function() {
				var index = $(this).data('index'),
					nextIndex = restData[index];

				if (!(index in restData)) {
					$(this).fadeOut(function() {
						$(this).remove();
					})
					return;
				}

				self.updatePiece($(this), game2048.xy(nextIndex), game2048.data[nextIndex]);

			})
			$dom.append($added);

		}, time);


		return this;
	}
}