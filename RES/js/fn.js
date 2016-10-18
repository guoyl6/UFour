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
			return apply.call(this, func, args, undefined);
		}
	}

	var _throttle = function (fn, opt) {
		var isIdle = true, toBeIdle = null, next = null, lastExecTime = null;
		var immediately = opt.immediately, delay = opt.delay || 0,
			debounce = opt.debounce || false, tail = opt.tail || false;
		if (!(immediately in opt)) {
			opt.immediately = true;
		}
		nextOn = function () {
			var diff = lastExecTime || delay, args = arguments;
			if (lastExecTime) {
				var now = Date.now();
				diff = now - (!debounce ? lastExecTime : now) - delay;
				diff = diff < 0 ? -diff : 0;
			}
			if (tail || !diff) {
				// console.log(diff);
				next = setTimeout(function () {
					exec.apply(this, args);
					next = null;
				}.bind(this), diff);
			}
				
		},
		nextOff = function () {
			clearTimeout(next);
			next = null;
		},
		exec = function () {
			fn.apply(this, arguments);
			lastExecTime = Date.now();
		},
		busy = function () {
			isIdle = false;
			clearTimeout(toBeIdle);
			toBeIdle = setTimeout(function () {
				isIdle = true;
				lastExecTime = null;
				toBeIdle = null;
			}, delay);
		};
		return function () {
			if (lastExecTime === null) {
				lastExecTime = Date.now();
			}
			if (isIdle) {
				if (immediately) {
					exec.apply(this, arguments);
				} else {
					nextOn.apply(this, arguments);
				}
			} else {
				if (debounce) {
					if (tail) {
						nextOff();
						nextOn.apply(this, arguments);
					}
				} else if (next === null) {
					nextOn.apply(this, arguments);
				}
			}
			busy();
		};
	}

	fp.debounce = function (delay, immediately, tail) {
		if (arguments.length < 2) {
			tail = true;
		}
		return _throttle(this, {
			immediately: immediately,
			delay: delay,
			debounce: true,
			tail: tail
		})
	}


	fp.throttle = function (delay, immediately, tail) {
		return _throttle(this, {
			delay: delay,
			immediately: immediately,
			debounce: false,
			tail: tail
		});
	}


})();
