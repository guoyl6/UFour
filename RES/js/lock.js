/*
	require E.js
*/

(function($) {
	$.fn.triggerAndGetResult = function(event, args) {
		obj = args[0] || {};
		args[0] = obj;
		obj.result = undefined;
		this.trigger(event, args);
		return obj.result;
	}

	$.fn.lock = function(opt) {
		var self = this,
			ev = {
				"beforeStart": "toLock",
				"start": "locking",
				"afterStart": "locked",
				"beforeEnd": "toUnlock",
				"end": "unlocking",
				"afterEnd": "unlocked"
			};
		var handlers = {};
		for (var i in ev) {

			handlers[i] = (function(e) {
				return function() {
					var result = self.triggerAndGetResult(e, $.makeArray(arguments));
					return result;
				}
			})(ev[i]);
			
		}

		return new E(handlers).afterStart(opt).exec({});
	}

})(jQuery);
