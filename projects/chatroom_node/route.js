exports.index = function(req, res) {
	res.render('index');
}

exports.NotFound = function(req, res) {
	res.send('<a href="/" >404 Not Found正确地址：http://172.18.43.143:8888/</a>');
}

function getDateAfterDays(days) {
	var d = new Date();
	d.setTime(d.getTime() + days * 24 * 3600 * 1000);
	return d;
}