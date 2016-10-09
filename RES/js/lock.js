/*
	require E.js
	tolock -> locking -> locked -> toUnlock -> unlocking -> unlocked
*/

(function($) {
	$.fn.triggerAndGetResult = function(event, obj) {
		obj = obj || {};
		obj.result = undefined;
		this.trigger(event, [obj]);
		return obj.result;
	}

	$.fn.lock = function() {
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
				return function(obj) {
					var result = self.triggerAndGetResult(e, obj);
					return result;
				}
			})(ev[i]);
			
		}

		return new E(handlers).exec({});
	}

})(jQuery);
