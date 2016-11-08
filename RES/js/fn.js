/*function maker*/

(function () {
    var slice = Array.prototype.slice;
    var fp = Function.prototype;
    var apply = function (func, args, ctx) {
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
    
    fp.forAllArguments = function() {
        return function(func, args) {
            var ctx = this;
            args.forEach(function(value) {
                apply.call(ctx, func, [value]);
            })
        }.withArrayLikeArguments(this);
    }

    var _throttle = function (fn, opt) {
        var isIdle = true, toBeIdle = null, next = null, lastExecTime = null,
            immediately = opt.immediately, delay = opt.delay || 0,
            debounce = opt.debounce || false, tail = opt.tail || false,
            nextOn = function () {
                var diff = lastExecTime || delay, args = arguments;
                if (lastExecTime) {
                    var now = Date.now();
                    diff = now - (!debounce ? lastExecTime : now) - delay;
                    diff = diff < 0 ? -diff : 0;
                }
                if (tail || !diff) {
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
        if (!("immediately" in opt)) {
            opt.immediately = true;
        }
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

    fp.delay = function(args, ctx) {
        var func = this;
        return function() {
            args = args || arguments;
            return apply.call(this, func, args, ctx);
        };
    }

    fp.after = function(fn) {
        var func = this;
        return function() {
            apply.call(this, fn, arguments);
            return apply.call(this, func, arguments);
        };
    }

    fp.before = function(fn) {
        return fn.after(this);
    }


    fp.timeout = function(delay, args, ctx) {
        delay = delay > 0 ? delay : 0;
        args = args || [];
        var t = setTimeout(this.delay(args, ctx), delay);
        return t;
    }

    fp.interval = function(delay, args, ctx) {
        delay = delay > 0 ? delay : 0;
        args = args || [];
        var t = setInterval(this.delay(args, ctx), delay);
        return t;
    }

    fp.loop = function(whenToStop, option) {
        if (typeof whenToStop === "number") {
            var count = whenToStop;
            whenToStop = function() {
                return count-- <= 0;
            }
        }

        option = option || {};

        var t =  {
            sync: true,
            delay: 0,
            args: [],
            ctx: undefined,
            step: null,
            callback: null
        };

        for (var i in t) {
            if (i in option) {
                t[i] = option[i];
            }
        }

        option = t;

        var sync = option.sync,
            delay = option.delay,
            args = option.args,
            ctx = option.ctx,
            step = typeof option.step === "function" ? option.step : null,
            callback = typeof option.callback === "function" ? option.callback : null;

        if (sync) {
            while (!whenToStop.apply(ctx, args)) {
                this.apply(ctx, args);
                step && step.call(ctx, args);
            }
            callback && callback.apply(ctx, args);
        } else {
            return function() {
                var shouldStop = whenToStop.apply(ctx, args);
                if (!shouldStop) {
                    this.apply(ctx, args);
                    step && step.call(ctx, args);

                } else {
                    clearInterval(t);
                    callback && callback.apply(ctx, args);
                }
            }.interval(delay, args, this);
        }
    }

})();
