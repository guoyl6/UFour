var index = 0;
var height = 0;

function getNew() {
	$.post('/new', {
		'index': index
	}, function(result) {
		if (!result) {
			setTimeout(getNew, 300);
			return;
		} else {
			var temp = JSON.parse(result);
			var t = $("<div><span></span>:<p></p></div>");
			index = parseInt(index) + temp.length;
			$('#index').text(index);
			//alert(temp);
			for (var i = 0; i < temp.length; i++) {
				t.find('span').text(temp[i].name);
				t.find('p').text(temp[i].value);
				$("#message").append(t);
				height += t.height();
				if ($("#rt")[0].checked) {
					$("#message").animate({
						scrollTop: height
					}, 300);
				}
			}
			setTimeout(getNew, 300);
		}
	});
}

function getNewPic() {
	$.post('/newpic', function(mes) {
		mes = JSON.parse(mes);
		result = mes.showing;
		length = mes.length;
		$('#lgth').text(length);
		if ($("#showing img").attr('src').indexOf(result) != -1) {
		    result = '';
		}
		if (!result) {
			setTimeout(getNewPic, 300);
		} else {
			$("#showing").fadeToggle(500, function() {
				$("#showing img").attr('src', 'static/data/images/' + result
					+ '?t=' + Math.random());
				$("#showing h4").text(result);
				$("#showing").fadeToggle(500, function() {
					setTimeout(getNewPic, 300);
				});
			});
		}
	});
}

$(document).ready(function() {
	index = $('#index').text();
	$("#message div").each(function(i, elem) {
		height += $(elem).height();
	});
	$(window).resize(function() {
		$("*").css('font-size', $(window).height() / 50 + 'px');
	});
	$("#send").click(function() {
		if (!$("#words").val()) {
			return;
		}
		var temp = {
			'value': $("#words").val(),
			'not_name' : $("#not_name")[0].checked
		}
		$.post('/send', {
			'words': JSON.stringify(temp),
		}, function(result) {
			if (result) {
				alert(result);
				window.location = '/error';
			}
			$("#words").val('');
		});
	});
	$("#sendpt button").click(function() {
		$("#getpt").click();
	});
	$("#getpt").live('change', function() {
		$.ajaxFileUpload({  
            url: "/image",            //需要链接到服务器地址  
            secureuri: true,
            fileElementId:'getpt',        //文件选择框的id属性
            dataType: 'JSON',
            success: function(data, status) {     
                alert('Upload OK!');
                $("#position").val(JSON.parse(data).msg).change();
            },
            error: function (data, status, e){  
                alert('Some error exists');
            }
         });
	});
	$("#position").change(function() {
		if ($(this).val().length < 4) {
			return;
		}
		if ($(this).val().indexOf('.jpg') != -1) {
			$('#picindex img').stop(true, true);
			$('#picindex img').fadeToggle('fast', function() {
				$('#picindex img').attr('src',
				'static/data/images/' + $("#position").val() + '?t=' + Math.random());
				$('#picindex img').fadeToggle('fast');
			});
		}
	});
	$("#position").live('onmousewheel', function(event, delta, deltaX, deltaY) {
		
	});
	var tcl, change = 0;
	$("#picindex :button").click(function() {
		if ($(this).val() == '<') {
			change = -1;
		} else {
			change = 1;
		}
		var pos = parseInt($('#position').val());
		if (!pos) {
			pos = 0;
		}
		pos = (pos + change + parseInt($("#lgth").text()))
		      % $("#lgth").text();
		if (pos < 0) {
			pos = parseInt($("#lgth").text());
		}
		$('#position').val(pos + '.jpg').change();
	});
	$("#getMore").click(function() {
		var ts = index - $("#message div").length;
		$.post("/more", {
			'index': ts
		}, function(result) {
			if (result) {
				var temp = JSON.parse(result);
				var toad = $("#message div").first();
				for (var i = temp.length - 1; i >= 0; i--) {
					var t = $("<div><span></span>:<p></p></div>");
					t.find('span').text(temp[i].name);
					t.find('p').text(temp[i].value);
					$("#getMore").after(t);
					height += t.height();
				}
				if (ts - temp.length == 0) {
					$("#getMore").after($("<h4>没有了</h4>"));
					$("#getMore").remove();
				}
			}
		});
	});
	getNew();
	getNewPic();
	$(window).resize();
});