/*
    an execute:
        beforeStart -> start -> afterStart -> beforeEnd -> end -> afterEnd
*/

function E(obj) {
	this.init(obj);
};

E.prototype.addFunc = function(array, func) {
	if (jQuery.type(func) === "function" && jQuery.type(array) === "array") {
		array.push(func);
	}
	return this;
};

(function() {
	var turple = ["beforeStart", "start", "afterStart",
				  "beforeEnd", "end", "afterEnd"];

	// bind addFunc for each step
	turple.forEach(function(ev) {
		E.prototype[ev] = function(func) {
			return this.addFunc(this[ev+"Exec"], func);
		}
	})

	E.prototype.init = function(obj) {

		// create an array to storage function for each event
		turple.forEach(function(ev) {
			this[ev+"Exec"] = [];
		}.bind(this));

		if (jQuery.type(obj) === "object") {

			turple.forEach(function(ev) {
				this[ev](obj[ev]);
			}.bind(this));

		}
	}
	E.prototype.exec = function(data) {
		var deferred = jQuery.Deferred(), promise = deferred.promise();
		var funcs = [];

		turple.forEach(function(ev) {
			funcs = funcs.concat(this[ev+"Exec"]);
		}.bind(this));

		// to deliver data
		funcs.push(function() {
			var t = $.Deferred(), args = arguments;
			setTimeout(function() {
				t.resolveWith(t, args);
			})
			return t.promise();
		})

		funcs.forEach(function(func) {
			promise = promise.then(function() {
				var args = jQuery.makeArray(arguments);
				args.unshift(data);
		  		return func.apply(this, args);
		  	});
		});

		setTimeout(function() {
			deferred.resolve();
		});

		return promise;
	}
})();

