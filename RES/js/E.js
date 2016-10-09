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

E.prototype.addExec = function(array, func) {
	if (jQuery.type(func) === "function" && jQuery.type(array) === "array") {
		array.push(func);
	}
	return this;
}

E.prototype.beforeStart = function(func) {
	return this.addExec(this.beforeStartExec, func);
}

E.prototype.start = function(func) {
	return this.addExec(this.start, func);
}

E.prototype.end = function(func) {
	return this.addExec(this.end, func);
}

E.prototype.exec = function(data) {
	var deferred = jQuery.Deferred();
	[].concat(this.beforeStartExec)
	  .concat(this.startExec)
	  .concat(this.endExec)
	  .forEach(function(func) {
	  	deferred.then(func);
	  })
	setTimeout(function() {
		deferred.resolve(data);
	});
	return deferred.promise();
}
