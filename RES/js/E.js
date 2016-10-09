/*
    an execute:
        beforeStart -> start -> end
*/

function E() {
	this.deferred = jQuery.Deferred();
	this.beforeStartExec = [];
	this.startExec = [];
	this.endExec = [];
}

E.prototype.addFunc = function(array, func) {
	if (jQuery.type(func) === "function" && jQuery.type(array) === "array") {
		array.push(func);
	}
	return this;
}

E.prototype.beforeStart = function(func) {
	return this.addFunc(this.beforeStartExec, func);
}

E.prototype.start = function(func) {
	return this.addFunc(this.startExec, func);
}

E.prototype.end = function(func) {
	return this.addFunc(this.endExec, func);
}

E.prototype.exec = function(data) {
	var deferred = jQuery.Deferred(), t = deferred;
	[].concat(this.beforeStartExec)
	  .concat(this.startExec)
	  .concat(this.endExec)
	  .forEach(function(func) {
	  	t = t.then(func);
	  })
	setTimeout(function() {
		deferred.resolve(data);
	});
	return t;
}
