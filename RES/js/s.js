/* require fn.js */

function s(initState) {
	this.state = {};
	this.setStatesFrom(initState);
}

s.prototype.add = function (self, stateName, value) {
	//增加状态位
	self.set(stateName, value);
}.addSelf().returnSelf();

s.prototype.set = function (self, stateName, value) {
	self.state[stateName] = value;
}.addSelf().returnSelf();

s.prototype.get = function (self, stateName) {
	var value = self.state[stateName];
	if (typeof value === "function") {
		return value.apply(self, [stateName]);
	} else {
		return value;
	}
}.addSelf();

s.prototype.setStatesFrom = function (self, stateObj) {
	for (var i in stateObj) {
		self.set(i, stateObj[i]);
	}
}.addSelf().check(function (obj) {
	return typeof obj === "object";
}).returnSelf();

s.prototype.clear = function (self, args) {
	// s.clear(state1, state2....)
	if (!args.length) {
		self.state = {};
	} else {
		args.forEach(function (stateName) {
			if (stateName && stateName in self.state) {
				delete self.state[stateName];
			}
		})	
	}
		
}.addSelf().returnSelf().withArrayLikeArguments();

s.prototype.isGood = function (self, args) {
	// s.isGood(state1, state2....)
	var isGood = true, checked = self.state;
	if (args.length) {
		checked = {};
		args.forEach(function (stateName) {
			checked[stateName] = true;
		})
	}
	for (var i in checked) {
		if (!self.get(i)) {
			return false;
		}
	}
	return isGood;
}.addSelf().withArrayLikeArguments();


s.prototype.child = function (self, states) {
	var child = new s();
	var unbindTurple = ["clear", "set", "get", "add", "child"];
	unbindTurple.forEach(function (pn) {
		child[pn] = null;
	});
	child.isGood = function () {
		return s.prototype.isGood.apply(self, states);
	}
	return child;
}.addSelf().withArrayLikeArguments();

s.prototype.antiChild = function (self, states) {
	var child = self.child.apply(self, states);
	child.isGood = function () {
		return !s.prototype.isGood.apply(self, states);
	}
	return child;
}.addSelf().withArrayLikeArguments();

/*
	test s:
		var s1 = new s(), t = 0;
		s1.add("start", false).add("tLargerThanTen", function () {return t > 10});
		s1.add("hello", true);
		console.log(s1.get("start"), s1.get("tLargerThanTen"), s1.get("hello"), s1.isGood());
		s1.set("start", true);
		console.log(s1.get("start"), s1.get("tLargerThanTen"), s1.get("hello"), s1.isGood());
		console.log("s1.isGood(someStateName...)", s1.isGood("start"), s1.isGood("start", "hello"), s1.isGood("start", "tLargerThanTen"));
		console.log("s1.child", s1.child().isGood(), s1.child("start", "tLargerThan").isGood(), s1.child("start", "hello").isGood());
		t = 11;
		console.log("t = 11, s1.isGood()", s1.isGood());
		s1.clear("hello", "start");
		console.log(s1.state);
		s1.add("temp", true);
		s1.clear();
		console.log(s1.state);

*/

var bs = function (self, fns) {
	self.calls = [];
	self.cares = [];
	self.addExec.apply(self, fns);
}.addSelf().withArrayLikeArguments();

bs.prototype.care = function (self, states) {
	states.forEach(function (state) {
		self.cares.push(state);
	}.check(function (state) {
		return state instanceof s;
	}))
}.addSelf().returnSelf().withArrayLikeArguments();

bs.prototype.addExec = function (self, fns) {
	fns.forEach(function (fn) {
		self.calls.push(fn);
	}.check(function (fn) {
		return typeof fn === "function" || fn instanceof bs;
	}))
}.addSelf().returnSelf().withArrayLikeArguments();

bs.prototype.exec = function (self, args) {
	var isAllGood = true;
	for (var i = self.cares.length; i--;) {
		if (!self.cares[i].isGood()) {
			isAllGood = false;
			return;
		}
	}
	self.calls.forEach(function (fn) {
		if (fn instanceof bs) {
			return fn.exec.apply(fn, args);
		}

		fn.apply(self, args);
	})
}.addSelf().withArrayLikeArguments();

/*
	test:
		var b = new bs();
		var s1 = new s(), s2 = new s();
		s1.add("mousedown", false); s2.add("mouseup", false);
		b.addExec(function () {console.log("hello");}, function () {console.log("hello 2");}).care(s1, s2);
		b.exec();
		s1.set("mousedown", true);
		b.exec();
		s2.set("mouseup", true);
		b.exec();
*/
