/*
	解决以下问题：
		var t = {}, a = [], b = [];
		t[a] = 'this is value of a';
		t[b] == t[a] -> true
		因为t在得到对象的key值时都会变成[object object]，
		所以没办法区分 t[a] 和 t[b] 的区别

	var t = new dict(), a = [], b = [];
	t.set(a, 'this is value of a').set(b, 'this is value of b');
	t.get(b) == t.get(a) -> false

	==> dict.from([1, 2, 3], [4, 5, 6]);

*/


function dict() {
	this.dict = {};
	this.object_dict = [];
}

dict.prototype.accelerateTab = '__dict__';

dict.prototype.pair = function(key, value) {
	this.key = key;
	this.value = value;
}

dict.prototype.pair.prototype.getKey = function() {
	return this.key;
}

dict.prototype.pair.prototype.getValue = function() {
	return this.value;
}

dict.prototype.pair.updateValue = function(value) {
	this.value = value;
	return this;
}

dict.prototype.accelerate = function(pair) {
	var key = pair.getKey(), accelerateValue = this.createAccelerateValue(pair);
	if (!(this.accelerateTab in key)) {
		Object.defineProperty(key, this.accelerateTab, {
			value: accelerateValue,
			writable: true,
		    enumerable: true,
		    configurable: true
		})
	} else {
		key[this.accelerateTab] = accelerateValue;
	}
	return this;
}

dict.prototype.removeAccelerateTab = function(pair) {
	var key = pair.getKey();
	delete key[this.accelerateTab];
	return this;
}

dict.prototype.getAccelerateValue = function(key) {
	return key[this.accelerateTab];
}

dict.prototype.createAccelerateValue = function(pair) {
	return this.object_dict.indexOf(pair);
}

dict.prototype.accelerateValueLegal = function(key) {
	if (!(this.accelerateTab in key)) {
		return false;
	}
	var index = this.getAccelerateValue(key), pair = this.object_dict[index];
	return pair ? pair.getKey() === key : false;

}

dict.prototype.accelerateGet = function(key) {
	var accelerateValue = this.getAccelerateValue(key);
	return this.object_dict[accelerateValue];
}

dict.prototype.addPair = function(key, value) {
	var pair = new this.pair(key, value);
	this.object_dict.push(pair);
	this.accelerate(pair);
	return this;
}

dict.prototype.getPair = function(key) {
	var pair = null,
		temp = null;

	if (this.accelerateValueLegal(key)) {
		return this.accelerateGet(key);
	} else {
		for (var i = this.object_dict.length; i--;) {
			temp = this.object_dict[i];
			if (temp.getKey() === key) {
				pair = temp;
				break;
			}
		}
		pair && this.accelerate(pair);
		return pair;
	}
}

dict.prototype.setPair = function(key, value) {
	var pair = this.getPair(key);
	if (!pair) {
		this.addPair(key, value);
	} else {
		pair.updateValue(value);
	}
	return this;
}

/*exports*/

dict.prototype.set = function(key, value) {
	if (typeof key === 'object' && key !== null) {
		this.setPair(key, value);
	} else {
		this.dict[key] = value;
	}
	return this;
}

dict.prototype.get = function(key) {
	if (typeof key === 'object' && key !== null) {
		var pair = this.getPair(key);
		return pair ? pair.getValue() : undefined;
	} else {
		return this.dict[key];
	}
}

dict.prototype.remove = function(key) {
	if (typeof key === 'object' && key !== null) {
		var pair = this.getPair(key);
		if (pair) {
			var index = this.object_dict.indexOf(pair);
			this.removeAccelerateTab(pair);
			this.object_dict.splice(index, 1);
		}
	} else {
		delete this.dict[key];
	}
	return this;
}


dict.from = function(keys, values) {
	var t = new dict();
	keys.forEach(function(key, index) {
		var value = values[index];
		t.set(key, value);
	})
	return t;
}

if (typeof module === 'object') {
	module.exports = dict;
}
