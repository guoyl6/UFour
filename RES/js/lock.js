/*
    require　E.js
*/

(function($) {
	$.fn.triggerAndGetResult = function(event, data) {
		var obj = {};
		data = $.makeArray(obj, data);
		this.trigger(event, data);
		return obj.result;
	}

	$.fn.lock = function() {
		var self = this,
			e = new E();
		e.beforeStart(function() {
			return self.triggerAndGetResult("locking");
		}).start(function() {
			return self.triggerAndGetResult("locked");
		}).end(function() {
			return self.triggerAndGetResult("unlock");
		}).exec();
		return deferred;
	}

})(jQuery);
