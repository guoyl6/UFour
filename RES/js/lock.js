/*
    require　E.js
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
			e = new E(),
			obj = {};
		e.beforeStart(function() {
			return self.triggerAndGetResult("locking", obj);
		}).start(function() {
			return self.triggerAndGetResult("locked", obj);
		}).end(function() {
			return self.triggerAndGetResult("unlock", obj);
		}).exec();
		return deferred;
	}

})(jQuery);
