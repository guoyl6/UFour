/*function maker*/

(function() {
	var slice = Array.prototype.slice;
	var fp = Function.prototype;
	var apply = function(func, args, ctx) {
		// console.log(func, args, ctx);
		return func.apply(getContext(this, ctx), args);
	}
	var getContext = function(defaultCtx, ctx) {
		if (typeof ctx === "undefined") {
			return defaultCtx;
		} else {
			return ctx;
		}
	}
	fp.addSelf = function(ctx) {
		var func = this;
		return function() {
			// debugger;
			var args = slice.apply(arguments);
			args.unshift(this);
			return apply.call(this, func, args, ctx);
		}
	}
	fp.check = function(fn, ctx) {
		var func = this;
		return function() {
			var args = slice.apply(arguments);
			if (apply.call(this, fn, args, ctx)) {
				return apply.call(this, func, args, ctx);
			}
		}
	}
})();
