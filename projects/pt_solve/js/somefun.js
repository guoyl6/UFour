function $(select) {
	if (select[0] == '#') {
		return document.getElementById(select.substring(1));
	} else if (select[0] == '.') {
		return document.getElementsByClassName(select.substring(1));
	} else {
		return document.getElementsByTagName(select);
	}
}

function hasClass(obj, className) {
	return obj.className.indexOf(className) != -1;
}

function addClass(obj, className) {
	if (hasClass(obj, className)) {
		return;
	}
	obj.className += " " + className;
}

function removeClass(obj, className) {
	if (!hasClass(obj, className)) {
		return;
	}
	var classes = obj.className;
	var index = classes.indexOf(className);
	obj.className = classes.substring(0, index - 1) + 
					classes.substring(index + className.length);
}