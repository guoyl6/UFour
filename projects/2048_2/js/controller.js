$(function() {
	var game2048 = new Game_2048({
		row: 4,
		col: 4
	});

	var $game =  $('.game');

	['left', 'right', 'down', 'up'].forEach(function(direction) {
		$game.on(direction, function() {
			var md = game2048.next(direction);
			if (md.isChanged) {
				var next = game2048.nextNum();
				view.render($game, game2048, $.extend({}, md, {
					added: next.index
				}));
			}
		})
	})

	$('body').on('keydown', function(e) {
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
	game2048.nextNum();
	view.init($game, game2048);

})