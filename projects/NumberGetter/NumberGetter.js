+function($) {
	/*
		渲染结果
			<div class="xxx">
				<div class="view">
					<div class="position"></div>
					<div class="items">
						<div class="item"></div>
					</div>
				</div>
			</div>

		option
			start: number, 开始边界
			end: number, 结束边界
			circle: boolean, 是否可以循环滚动
			active: number, 第几个item被选中
			scale: number, 鼠标移动一个像素点时item移动几个像素点
			easing: string, 动画速度曲线
			duration: number, 动画延迟，为0时无动画效果
			reverse: boolean, 规定items是否逆向滚动，默认与鼠标和滚轮滚动方向相同
			getter: function, 返回每个item的内容
			val: function, 返回每个元素的值
			vartical: boolean, isTrue ? 垂直滚动 : 水平滚动

		这样用
			<div class="xxx" data-start="1" data-end="10" data-circle="true" data-active="4" data-scale="3"></div>
			$('.xxx')
			.data(Your Option)
			.NumberGetter()

		事件
			当 item 从非active成 active 时，会触发 itemActive 事件
			支持滚轮控制，鼠标点击移动控制，移动端触屏单击移动控制
				若想禁止某种控制方式，只需 $('.xxx').NumberGetter('off', 'mouse').NumberGetter('off', 'wheel').NumberGetter('off', 'touch')
	*/

	var	defaultOption = {
		start: 0,
		end: 0,
		circle: false,
		active: 0,
		scale: 3,
		vertical: true,
		easing: 'linear',
		reverse: false,
		duration: 300,
		getter: function(num) {
			return num;
		},
		val: function(num) {
			return num;
		}
	};

	var nameSpace = 'numberGetter', addNameSpace = function(className) {
		return className
			   .split(' ')
			   .filter(function(cls) {return cls})
			   .map(function(cls) {return cls + '.' + nameSpace;})
			   .join(' ');
	}, containerquery = '>.items', itemquery = containerquery + ">.item";


	var notify = function($view, xy, nxy, startXY) {
		var option = $view.data('option'),
			mul = (option.reverse ? -1 : 1),

			valY = option.vertical && (nxy.y - xy.y) * mul,
			valX = !option.vertical && (nxy.x - xy.x) * mul,
			val = valX + valY,

			scale = option.scale,

			isAMove = option.vertical ? 
				Math.abs(startXY.y - nxy.y) * scale >= $view.outerHeight()
			  : Math.abs(startXY.x - nxy.x) * scale >= $view.outerWidth(),
			length = (
				option.vertical ?
					startXY.y - nxy.y : startXY.x - nxy.x
			) * mul;

		if (
			!option.circle &&
			(
				$view.find(itemquery + '').first().is('.active') && val >= 0
				|| $view.find(itemquery + '').last().is('.active') && val <= 0
			)
			|| (!val)
		) {
			return;
		}

		freshPosition($view, {
			top: valY * scale,
			left: valX * scale,
		}, {duration: 0})

		$.extend(xy, nxy);

		if (isAMove) {
			length <= 0 ? last($view, {duration: 0}) : next($view, {duration: 0});
			$.extend(startXY, nxy);
		}

	},
	end = function($view, xy, nxy) {
		freshActive($view, {duration: 100});
	},
	render = function($dom, option) {
		var $view = $('<div class="view"></div>'),
			// $posSetter = $('<div class="position"></div>'),
			$items = $('<div class="items"></div>'),
			getter = option.getter,
			val = option.val,
			initItem = function($item, num) {
				$item
				.append(getter.call($dom, num))
				.data({
					value: val.call($dom, num),
					index: num
				})
				.bind(addNameSpace('selectstart'), false);
				if (!option.vertical) {
					$item.css({
						display: 'inline-block'
					}).outerWidth($view.outerWidth());
				}
			};

		$items.css({position: 'relative'});

		$view
		.css({
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			margin: 'auto',
			boxSizing: 'border-box'

		})
		.append($items)
		.data('option', option)
		.appendTo($dom.empty().bind(addNameSpace('selectstart'), false));
		
		for (var i = option.start, end = option.end; i < end; i++) {
			var $item = $('<div class="item"></div>');

			$item.appendTo($items);
			initItem($item, i);
		}

		if (!option.vertical) {
			$items.innerWidth($view.outerWidth() * $items.children().length);
		}

		choseItem($view, option.active, {duration: 0});

	},

	choseItem = function($view, index, topt) {
		var $childrens = $view.find(containerquery).children(),
		vOffset = $view.offset(),
		option = $view.data('option');

		if (!option.circle && (index < 0 || index >= $childrens.length)) {
			return $.Deferred().resolve();
		} else {
			index = (index + $childrens.length) % $childrens.length;
		}

		var $target = $childrens.eq(index),
		offset = $.extend({}, vOffset, $target.offset());

		offset.top = vOffset.top - offset.top;
		offset.left = vOffset.left - offset.left;

		return freshPosition($view, offset, topt)
		.done(function(obj) {
			option.circle && freshCircle($view, index, 
				{
					duration: 0,
				}
			);
		})
		.done(function() {
			index = $target.index();
			option.active = $target.data('index');
		})
		.done(function() {
			var $last = $view.find(itemquery + '.active').removeClass('active');

			$target.addClass('active');
			$target.is($last) || $target.trigger('itemActive', [$target, $last]);
		})
	},
	next = function($view, topt) {
		return choseItem($view, $view.find(itemquery + '.active').index() + 1, topt);
	},
	last = function($view, topt) {
		return choseItem($view, $view.find(itemquery + '.active').index() - 1, topt);
	},

	freshCircle = function($view, index, topt) {
		topt = topt || {};
		var $content = $view.find(containerquery), $items = $content.children();
		var left = 0, right = $items.length - 1;
		var sub = Math.min(index - left, right - index),
			sl = index - left - sub,
			sr = right - index - sub;

		sl = Math.floor(sl / 2);
		sr = Math.floor(sr / 2);
		sl && $content.append($items.slice(0, sl));
		sr && $content.prepend($items.slice(right + 1 - sr, right + 1));
		return freshPosition($view, {
			top: (sl + sr) * $items.outerHeight() * (sl ? 1 : -1),
			left: (sl + sr) * $items.outerWidth() * (sl ? 1 : -1)
		}, topt);
	},
	freshActive = function($view, topt) {
		topt = topt || {duration: 100};
		var vOffset = $view.offset(),
			nearestItem = 0,
			min = -1;

		$view.find(itemquery + '').each(function(index) {
			var iOffset = $(this).offset(),
				temp = Math.abs(iOffset.top - vOffset.top) + Math.abs(iOffset.left - vOffset.left);

			if (min == -1 || min > temp) {
				min = temp;
				nearestItem = index;
			}
		})
		
		return choseItem($view, nearestItem, topt);
	},
	lastAnimation = null,
	freshPosition = function($view, offset, topt) {
		topt = topt || {};
		var deferred = $.Deferred(),
			$pos = $view.find(containerquery),
			opt = $view.data('option'),
			duration = 'duration' in topt ? topt.duration : opt.duration,
			easing = 'easing' in topt ? topt.easing : opt.easing;
		var formatOffset = function() {
			offset.left = !opt.vertical ? offset.left : 0;
			offset.top = opt.vertical ? offset.top : 0;
		};

		formatOffset();

		if (offset.top || offset.left) {
			var animate = duration ? $pos.animate : function(properties) {
				this.css(properties);
				return $.Deferred().resolve();
			};

			$pos.stop(true);

			lastAnimation = deferred;

			animate.call($pos, {
				marginTop: parseFloat($pos.css('margin-top')) + offset.top + 'px',
				marginLeft: parseFloat($pos.css('margin-left')) + offset.left + 'px'
			}, {
				duration: duration,
				easing: easing
			}).promise().done(function() {
				deferred.resolve();
			})

			deferred.done(function() {
				lastAnimation = null;
			})

		} else {
			deferred.resolve()
		}

			

		return deferred.promise();
	},

	bind = function($dom, opt, evs) {
		var	notifyEv = evs.notify,
		endEv = evs.end,
		startEv = evs.start,
		getXY = evs.getXY,
		$view = $dom.find('>.view'),
		bindEv = function(xy) {
			var startXY = $.extend({}, xy);
			$dom
			.on(notifyEv, function(e) {
				var nxy = getXY(e);
				e.preventDefault();
				notify($view, xy, nxy, startXY);
				return false;
			})
			.on(endEv, function(e) {
				var nxy = getXY(e);
				unbindEv();
				end($view, xy, nxy, startXY);
			});
		},
		unbindEv = function() {
			$dom.off(endEv).off(notifyEv);
		};

		unbindEv($dom);

		$view
		.off(startEv)
		.on(startEv, function(e) {
			e.stopPropagation();
			var xy = getXY(e);
			bindEv(xy);
			return false;
		})

	},
	bindWheel = function($dom, opt) {
		var $view = $dom.find('>.view'), method = null;
		$view.off(addNameSpace('mousewheel'))
		.on(addNameSpace('mousewheel'), function(e) {
			var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
		                (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));            // firefox


			e.stopPropagation();
		    e.preventDefault();
			// lastAnimation && lastAnimation.reject();


			delta *= opt.reverse ? -1 : 1;

		    if (delta > 0) {
		        // 向上滚
		        method = next;
		    } else if (delta < 0) {
		        // 向下滚
		        method = last;
		    }
		    method($view)

		    return false;
		})
	}

	var handler = {
		value: function($dom) {
			return $dom.find(itemquery + '.active').data('value');
		},
		serializeArray: function($dom) {
			$dom = $dom.eq(0);
			var name = $dom.data('name'),
				value = $dom.find(itemquery + '.active').data('value');

			return {
				name: name,
				value: value
			}
		},
		off: function($dom, ev) {
			var $view = $dom.find(">.view");
				
			var off = function(ev) {
				if (/^mouse$/i.test(ev)) {
					$view.off(addNameSpace('mousedown mousemove mouseup mouseleave'));
				} else if (/^wheel$/i.test(ev)) {
					$view.off(addNameSpace('mousewheel'));
				} else if (/^touch$/i.test(ev)) {
					$view.off(addNameSpace('touchstart touchend touchmove'));
				}
			}

			ev.split(' ').forEach(function(rev) {
				off(rev);
			})

		},
		on: function($dom, ev) {
			var $view = $dom.find(">.view");
			optionFormat($dom.data());
			var opt = $.extend({}, defaultOption, $dom.data());


			var on = function(ev) {
				if (/^mouse$/i.test(ev)) {
					bind($dom, opt, {
						notify: addNameSpace('mousemove'),
						end: addNameSpace('mouseup mouseleave'),
						start: addNameSpace('mousedown'),
						getXY: function(e) {
							return {
								x: e.clientX,
								y: e.clientY
							}
						}
					})
				} else if (/^wheel$/i.test(ev)) {
					bind($dom, opt, {
						notify: addNameSpace('touchmove'),
						end: addNameSpace('touchend'),
						start: addNameSpace('touchstart'),
						getXY: function(e) {
							var _touch = e.originalEvent.changedTouches[0];

							return {
								x: _touch.clientX,
								y: _touch.clientY
							}
						}
					})
				} else if (/^touch$/i.test(ev)) {
					bindWheel($dom, opt);
				}
			}

			ev.split(' ').forEach(function(rev) {
				on(rev);
			})

				
		}
	}

	var optionFormat = function(obj) {
		var transform = {
			number: function(val) {
				return parseFloat(val);
			},
			boolean: function(val) {
				return /^true$/i.test(val);
			}

		}
		for (var i in defaultOption) {
			if (i in obj) {
				var type = typeof defaultOption[i];
				if (typeof obj[i] != type) {
					obj[i] = type in transform ? transform[type](obj[i]) : obj[i];
				}
			}
		}
	}

	$.fn.NumberGetter = function(handle, option) {
		if (handle) {
			return handler[handle] && handler[handle](this, option);
		}
		return this.each(function() {
			var $dom = $(this);
			optionFormat($dom.data());
			var opt = $.extend({}, defaultOption, $dom.data());

			render($dom, opt);
			handler['on']($dom, 'mouse touch wheel')
		})
			

	}

}(jQuery);