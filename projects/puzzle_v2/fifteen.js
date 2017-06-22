var pos = [];
var size = 4;
var speed = 150;

$(document).ready(function() {
	$("#controls").append(
		"Difficult: ",
		$("<select></select>").attr("id", "chooshard")
	);
	$("#chooshard").width('50px');
	while ($("#chooshard option").length < 4) {
		$("#chooshard").append(
			"<option value=" + ($('#chooshard option').length + 4) + ">"
		    + ($('#chooshard option').length + 1) + "</option>"
		);
	}
	$("select").change(function() {
		$("#shufflebutton").text("Start!");
		$("#puzzlearea").css("background", "none");
		$("#puzzlearea div").show();
		checksize();
		initial();
		fresh();
	});
	$("select").change();
	$("#puzzlearea").mousemove(function() {
		if ($("#shufflebutton").text() == "Start!") {
			return;
		}
		for (var i = 0; i < $("#puzzlearea div").length; i++) {
			if (pos[i] != i) {
				return;
			}
		}
		$("#puzzlearea").css("background", "url(background"
		+ (size - 4 ? size - 4 : '') + '.jpg)');
		$("#puzzlearea div").hide();
		$("#shufflebutton").text("Start!");
	});
	$("#shufflebutton").click(function() {
		$("#puzzlearea").css("background", "none");
		$("#puzzlearea div").show();
		$("#shufflebutton").text("Shuffle");
		$("#controls *").attr("disabled", "disabled");
		toShuffle();
	});
	$(".movablepiece").live("click", function() {
		var index = $(this).text() - 1;
		var length = $("#puzzlearea div").length;
		var distance = pos[index] -  pos[length];
		if (Math.abs(distance) != 1 && Math.abs(distance) != size) {
			var tindex = pos[index] +
			(distance > 0 ? -1 : 1) * (Math.abs(distance) < size ? 1 : size);
			for (var i = 0; i < length; i++) {
				if (pos[i] == tindex) {
					$(".puzzlepiece:eq(" + i + ")").click();
					break;
				}
			}
		}
		$("#puzzlearea div").removeClass("movablepiece");
		Move(index);
		$(this).animate({
		    top: 100 * parseInt(pos[index] / $("#chooshard").val()) + 'px',
	        left: 100 * (pos[index] % $("#chooshard").val()) + 'px',
		}, speed, 'linear');
		fresh();
	});
});

var count = 0;
function toShuffle() {
	speed = 10;
	if (count >= size * 10) {
		$("#controls *").removeAttr("disabled");
		speed = 150;
		count = 0;
		return;
	}
	var i = Math.floor(Math.random() * $(".movablepiece").length);
	$(".movablepiece:eq(" + i + ")").click();
	count++;
	setTimeout(function() {toShuffle()}, 20);
}

function fresh() {
	$("#puzzlearea div").removeClass("movablepiece");
	var index = $("#chooshard").val() * $("#chooshard").val() - 1;
	var blanktop = 100 * parseInt(pos[index] / size);
	var blankleft = 100 * parseInt(pos[index] % size);
	for (var i = 0; i < index; i++) {
		if (parseInt($(".puzzlepiece:eq(" + i + ")").css("top")) == blanktop
		|| parseInt($(".puzzlepiece:eq(" + i + ")").css("left")) == blankleft) {
			$(".puzzlepiece:eq(" + i + ")").addClass("movablepiece");
		}
	}
}

function Move(index) {
	var length = $("#puzzlearea div").length;
	var temp = pos[index];
	pos[index] = pos[length];
	pos[length] = temp;
}

function checksize() {
	size = $("#chooshard").val();
	while ($("#puzzlearea div").length < size * size - 1) {
		$("#puzzlearea").append(
			"<div>" + ($("#puzzlearea div").length+1) + "</div>"
		);
	}
	if ($("#puzzlearea div").length > size * size - 1) {
		$("#puzzlearea div:gt(" + (size * size - 2) + ")").remove();
	}
	$("#puzzlearea div").addClass("puzzlepiece");
	$("#puzzlearea").css({"width": $("#chooshard").val() * 100 + 'px',
						  "height": $("#chooshard").val() * 100 + 'px'});
}

function bgposition(i) {
	return 100 * (size - i % size) + 'px '
	       + 100 * (size - parseInt(i / size)) + 'px';
}

function initial() {
	pos = [];
	for (var i = 0; i < size * size; i++) {
		pos[i] = i;
	}
	$(".puzzlepiece").css("top", function(i, v) {
		return 100 * parseInt(i / size) + 'px';
	});
	$(".puzzlepiece").css("left", function(i, v) {
		return 100 * (i % size) + 'px';
	});
	$(".puzzlepiece").css("background", "url(background"
		+ (size - 4 ? size - 4 : '') + '.jpg)');
	$(".puzzlepiece").css("background-position", function(i, v) {
		return bgposition(i);
	});
}

