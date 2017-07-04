$(function() {
	var game2048 = new Game_2048({
		row: 4,
		col: 4
	});


	var bindEv = function() {
		var $game = view.$game, $score = view.$score;
		var dead = false;;
		['left', 'right', 'down', 'up'].forEach(function(direction) {
			$game.on(direction, function() {
				if (view.moving && !dead) {
					return;
				}
				var md = game2048.next(direction);
				if (md.isChanged) {
					var next = game2048.nextNum();
					view.moving = true;
					view.updateDom(game2048,
						$.extend({}, md, {
							added: next.index
						})
					).done(function() {
						view.moving = false;
						updateScore();
					});
					if (game2048.isDead()) {
						dead = true;
						return  view.showDead();
					}
				}
			})
		})
	}

	var updateScore = function() {
		view.updateScore(game2048.data.reduce(function(prevValue, value) {
			return prevValue + value;
		}, 0))
	}

	var bindController = function() {
		var $game = view.$game;

		$('body').on('keyup', function(e) {
			// console.log(e);
			var key = String.fromCharCode(e.which).toLowerCase();
			switch(key) {
				case "w":
					$game.trigger('up');
					break;
				case "s":
					$game.trigger('down');
					break;
				case "a":
					$game.trigger('left');
					break;
				case "d":
					$game.trigger('right');
					break;
			}
		})

		var touchObj = null, lmd = 50;

		$('body').on('touchstart', '.game', function(e) {
			if (touchObj) {
				return;
			}
			touchObj = e.originalEvent.targetTouches[0];
			e.preventDefault();
			return false;
		}).on('touchmove', '.game', function(e) {
			if (!touchObj) {
				return;
			}
			var now = e.originalEvent.targetTouches[0],
				disX = now.screenX - touchObj.screenX,
				disY = now.screenY - touchObj.screenY;

			if (Math.abs(disX) >= lmd || Math.abs(disY) >= lmd) {
				touchObj = null;
				if (disX <= -lmd) {
					$game.trigger('left');
				} else if (disX >= lmd) {
					$game.trigger('right');
				} else if (disY <= -lmd) {
					$game.trigger('up');
				} else if (disY >= lmd) {
					$game.trigger('down');
				}
			}
			// touchObj = null;
			e.preventDefault();
			return false;
		}).on('touchend', '.game', function(e) {
			var end = e.originalEvent.changedTouches[0];
			touchObj = null;
			e.preventDefault();
			return false;
		})
	}
		
	var init = function() {

		restart();
		bindEv();
		bindController();
	}

	var restart = function() {
		game2048.reset(game2048.length);
		game2048.nextNum();
		game2048.nextNum();
		view.initDom(game2048);
		updateScore();
		
	}

	view.load.done(init);

})