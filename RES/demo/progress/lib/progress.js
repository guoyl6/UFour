+function($) {
	$(function() {
		var _progress = parent.window._progress;
		if (!_progress) {
			return;
		}

		_progress.notify(_progress.domLoaded, _progress.imgLoading);

		var $imgs = $("img"), count = 0, $main = $(parent.document.getElementById('main'));

		$imgs.load(function() {
			count++;
			if (count >= $imgs.length) {
				_progress.notify(_progress.imgLoaded);
			}
		})

		// $(window).load(function() {
		// 	_progress.loadDone();
		// 	parent.document.title = document.title;
		// })

		$("body").on("click", "a", function(e) {
			
			var href = $(this).attr('href');
			if (/^#/.test(href)) {
				/* do nothing */

			} else {
				e.preventDefault();
				_progress.jumpTo(this.href);
				return false;
			}
		})

		$(window).on('hashchange', function() {
			_progress.follow();
		})

	})
}(jQuery);
