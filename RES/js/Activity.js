/*
	一个活动，可划分成
		准备 -> 执行 -> 收尾
	在任何阶段，我们都可以为其添加活动
	活动是有优先级的，相同优先级的活动将顺序执行。
*/

/*
	require jQuery, ./fn.js
*/

(function($) {

	var _getDeferred = function(calls) {
		var deferred = $.Deferred(), t = deferred;
		calls.forEach(function(call) {
			t = t.then(call);
		})
		return {
			executor: deferred,
			promise: t
		}
	}

	var _isAcceptType = function(obj) {
		return obj && (obj instanceof _activity || typeof obj === "function" || typeof obj.exec === "function");
	}

	var _realCall = function(obj) {
		return typeof obj === "function" ? obj : obj.exec.bind(obj);
	}

	var _exec = function(self, args) {
		if (args.length === 0) {
			// 用于在不同_activity间交换数据
			args.push({});

		}

		var calls = self.getCalls(args);

		var obj = _getDeferred(calls), deferred = obj.executor;
		setTimeout(deferred.resolve.bind(deferred));
		return obj.promise;

	}.addSelf().withArrayLikeArguments();

	function _activity() {
		this.toCall = {};
	}

	_activity.prototype.add = function(activity, priority) {
		priority = priority || 0;
		var key = priority.toString();
		if (_isAcceptType(activity) && activity != this) {
			this.toCall[key] = this.toCall[key] || [];
			this.toCall[key].push(activity);
		}
		return this;
	}

	_activity.prototype.getCalls = function(self, args) {
		var priorities = Object.keys(self.toCall), calls = [];

		priorities.sort(function(a, b) {
			return +b - +a;
		});

		priorities.forEach(function(priority) {
			calls = calls.concat(self.toCall[priority].map(function(obj) {
				return _realCall(obj).delay(args);
			}));
		})

		return calls;
	}.addSelf();
	
	_activity.prototype.exec = _exec;

	Activity = function() {
		
		this.before = new _activity();
		this.todo = new _activity();
		this.after = new _activity();

		this.toCall = this.todo.toCall;
	};

	Activity.prototype = new _activity();

	Activity.prototype.getCalls = function(self, args) {
		var calls = [], tuple = ["before", "todo", "after"];
		
		tuple.forEach(function(step) {
			var activity = self[step];
			calls.push(activity.exec.delay(args, activity));
		})

		return calls;
	}.addSelf();


})(jQuery);
