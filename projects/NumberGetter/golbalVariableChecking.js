+function() {
	var keys = null;

	loadGlobal = function() {
		keys = Object.keys(window);
	}

	checkGlobal = function() {
		console.log('user adding global variable:');
		Object.keys(window).filter(function(key) {
			return keys.indexOf(key) == -1;
		}).forEach(function(key) {
			console.log('    ', key, typeof window[key]);
		})
	}
	loadGlobal();
}();