/*function maker*/

(function () {
	var slice = Array.prototype.slice;
	var fp = Function.prototype;
	var apply = function (func, args, ctx) {
		// console.log(func, args, ctx);
		return func.apply(getContext(this, ctx), args);
	}
	var getContext = function (defaultCtx, ctx) {
		if (typeof ctx === "undefined") {
			return defaultCtx;
		} else {
			return ctx;
		}
	}
	fp.addSelf = function (ctx) {
		return function (func, args) {
			args.unshift(this);
			return apply.call(this, func, args, ctx);
		}.withArrayLikeArguments(this);
	}
	fp.check = function (fn, ctx) {
		return function (func, args) {
			if (apply.call(this, fn, args, ctx)) {
				return apply.call(this, func, args, ctx);
			}
		}.withArrayLikeArguments(this);
	}
	fp.returnSelf = function (ctx) {
		return function (func, args) {
			apply.call(this, func, args, ctx);
			return this;
		}.withArrayLikeArguments(this);
	}
	fp.withArrayLikeArguments = function () {
		var func = this, extras = slice.apply(arguments);
		return function () {
			var args = extras.slice();
			args.push(slice.apply(arguments));
			return apply.call(this, func, extras, undefined);
		}
	}
})();
