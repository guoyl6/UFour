IDSTATE = false;

function writeError(text) {
	if (text) {
		IDSTATE = false;
		$("#error").css("color", "red");
	} else {
		IDSTATE = true;
		$("#error").css("color", "green");
		text = "Your ID is ok !"
	}
	$("#error").text(text);
	$("#error").stop(true, true);
	$("#error").animate({
		"opacity":1,
	});
}

$(document).ready(function() {
	$('input').keyup(function() {
		if ($(this).val().length < 2) {
			IDSTATE = false;
			$("#error").animate({
				"opacity":0,
			});
			return;
		}
		$.post('/login', {
			'id': $(this).val(),
		}, function(result) {
			writeError(result);
		});
	});
	$("#login").click(function() {
		if (!IDSTATE) {
			return;
		}
		$.post('/index', {
			'id': $("input").val()
		}, function() {
			window.location = '/';
		})
	});
	$("#luren").click(function() {
		window.location = '/';
	});
});
