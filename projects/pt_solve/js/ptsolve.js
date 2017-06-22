//state = [...]
function Node(lastNode, state, depth, size, blankPos, fx) {
	var yxj = undefined;
	var dr = typeof fx == "undefined" ? '-1' : fx;
	//0: up, 1: right, 2: down, 3: left
	var moveTo = function(direction) {
		var y = parseInt(blankPos / size) + (direction - 1) % 2,
		x = blankPos % size + (direction % 2 && 2 - direction);
		return (0 <= x && x < size && 0 <= y && y < size) ?
		y * size + x : null;
	}

	var getNum = function(correctIndex) {
		if (typeof correctIndex === "undefined") {
			correctIndex = true;
		}
		var count = 0;
		for (var i = 0; i < state.length; i++) {
			if (state[i] == i) {
				count++;
			}
		}
		return correctIndex ? count : state.length - count;
	}

	var getSpecialNum = function() {
		var count = 0;
		for (var i = 0; i < state.length; i++) {
			if (state[i] == i) {
				count++;
			} else {
				return count;
			}
		}
		return count;
	}

	var toCorrectDistance = function() {
		var count = 0;
		for (var i = 0; i < state.length; i++) {
			if (state[i] != i) {
				count += Math.abs(parseInt(state[i] / size) - parseInt(i / size))
					    + Math.abs(state[i] % size - i % size);//曼哈顿距离
			}
		}
		return -1 * count;
	}

	this.move = function(direction) {
		var result = moveTo(direction);
		if (result != null) {
			var copy = state.slice(0);
			copy[result] = copy[blankPos];
			copy[blankPos] = state[result];
			return new Node(this, copy, depth + 1, size, result, direction);
		} else {
			return null;
		}
	}

	this.getBlankPos = function() {
		if (typeof blankPos != "undefined") {
			return blankPos;
		}
		for (var i = 0; i < state.length; i++) {
			if (state[i] == state.length - 1) {
				blankPos = i;
			}
		}
		return blankPos;
	}

	this.getYXJ = function() {
		if (typeof yxj != "undefined") {
			return yxj;
		}
		//var correctNum = getNum(true),
			//wrongNum = getNum(false),
		var specialNum = getSpecialNum();
		var tcd = toCorrectDistance();
		//yxj = specialNum * 0.8 + correctNum * 0.6 + wrongNum * 0.4;
		//yxj = correctNum;
		yxj = tcd * 10 - specialNum;
		return yxj;
	}

	//标识符：0-1-2-...-(size * size - 1)-
	this.getState = function() {
		return state.join('-') + '-';
	}

	this.getDepth = function() {
		return depth;
	}
	this.getLast = function() {
		return lastNode;
	}
	this.moveDirection = function() {
		return dr;
	}
	this.findPos = function(index) {
		return state.indexOf(index);
	}
	var moveIn = function(node, directions, time) {
		var temp = node, result = node;
		while (time--) {
			temp = temp.move(directions);
			if (temp == null) {
				break;
			}
			result = temp;
		}
		return result;
	}
	this.movePath = function(node, path) {
		for (var i = 0; i < path.length; i++) {
			if (path[i].constructor && path[i].constructor.name == "Array") {
				node = moveIn(node, path[i][0], path[i][1] || 1);
			} else {
				node = moveIn(node, path[i], 1);
			}
			//console.log(node.getState());
		}
		return node;
	}
	//detour绕路
	var blankMoveTo = function(node, index, startY) {
		var blank = node.getBlankPos();
		if (blank == index) {
			return node;
		}
		var distancex = node.lineDistance(blank, index),
			distancey = node.rowDistance(blank, index);
		//console.log(distancex + '<>' + distancey);
		if (!startY) {
			node = distancex == 0 ? 
			node : moveIn(node, distancex > 0 ? 3 : 1, Math.abs(distancex));
			node = distancey == 0 ? 
			node : moveIn(node, distancey > 0 ? 0 : 2, Math.abs(distancey));
		} else {
			node = distancey == 0 ? 
			node : moveIn(node, distancey > 0 ? 0 : 2, Math.abs(distancey));
			node = distancex == 0 ? 
			node : moveIn(node, distancex > 0 ? 3 : 1, Math.abs(distancex));
		}
		return node;
	}
	this.moveBlankTo = function(index, startY) {
		return blankMoveTo(this, index, startY);
	}
	this.rowDistance = function(index1, index2) {
		return parseInt(index1 / size) - parseInt(index2 / size);
	}
	this.lineDistance = function(index1, index2) {
		return parseInt(index1 % size) - parseInt(index2 % size);
	}
	this.moveUp = function(index, steps) {
		var indexPos = this.findPos(index);
		var node = this;
		var x = indexPos % size, y = parseInt(indexPos / size);
		var distancex = node.lineDistance(blankPos, indexPos),
			distancey = node.rowDistance(blankPos, indexPos);
		var startY = y - 1;
		if (startY < 0) {
			return node;
		}
		if (distancex != 0 || distancey < 0) {
			node = blankMoveTo(node, x + startY * size, true);
		} else {
			node = moveIn(node, x == size - 1 ? 3 : 1, 1);
			node = blankMoveTo(node, x + startY * size, true);
		}
		//到达index的上方
		while(--y > 0 && steps-- > 1) {
			node = node.movePath(node, x == size - 1 ?
				[2, 3, 0, 0, 1] : [2, 1, 0, 0, 3]);
		}
		//这时的y是目的地址
		if (y >= 0) {
			node = moveIn(node, 2, 1);
		}
		return node;
	}
	this.moveDown = function(index, steps) {
		var indexPos = this.findPos(index);
		var node = this;
		var x = indexPos % size, y = parseInt(indexPos / size);
		var distancex = node.lineDistance(blankPos, indexPos),
			distancey = node.rowDistance(blankPos, indexPos);
		var startY = y + 1;
		if (startY == size) {
			return node;
		}
		if (distancex != 0 || distancey > 0) {
			node = blankMoveTo(node, x + startY * size, true);
		} else {
			node = moveIn(node, x == size - 1 ? 3 : 1, 1);
			node = blankMoveTo(node, x + startY * size, true);
		}
		//到达index的下方
		while(++y < size - 1 && steps-- > 1) {
			//console.log(y);
			node = node.movePath(node, x == size - 1 ?
				[0, 3, 2, 2, 1] : [0, 1, 2, 2, 3]);
		}
		//这时的y是目的地址
		if (y < size) {
			node = moveIn(node, 0, 1);
		}
		return node;
	}
	this.moveLeft = function(index, steps) {
		var indexPos = this.findPos(index);
		var x = indexPos % size, y = parseInt(indexPos / size);
		var node = this;
		var distancex = node.lineDistance(blankPos, indexPos),
			distancey = node.rowDistance(blankPos, indexPos);
		var startX = x - 1;
		if (startX < 0) {
			return node;
		}
		if (distancey != 0 || distancex < 0) {
			node = blankMoveTo(node, startX + y * size);
		} else {
			node = moveIn(node, y == size - 1 ? 0 : 2, 1);
			node = blankMoveTo(node, startX + y * size);
		}
		//到达index的左方
		while(--x > 0 && steps-- > 1) {
			node = node.movePath(node, y == size - 1 ?
				[1, 0, 3, 3, 2] : [1, 2, 3, 3, 0]);
		}
		//这时的x是目的地址
		if (x >= 0) {
			node = moveIn(node, 1, 1);
		}
		return node;
	}
	this.moveRight = function(index, steps) {
		var indexPos = this.findPos(index);
		var x = indexPos % size, y = parseInt(indexPos / size);
		var node = this;
		var distancex = node.lineDistance(blankPos, indexPos),
			distancey = node.rowDistance(blankPos, indexPos);
		var startX = x + 1;
		if (startX == size) {
			return node;
		}
		if (distancey != 0 || distancex > 0) {
			node = blankMoveTo(node, startX + y * size);
		} else {
			node = moveIn(node, y == size - 1 ? 0 : 2, 1);
			node = blankMoveTo(node, startX + y * size);
		}
		//到达index的右方
		while(++x < size - 1 && steps-- > 1) {
			node = node.movePath(node, y == size - 1 ?
				[3, 0, 1, 1, 2] : [3, 2, 1, 1, 0]);
		}
		//这时的x是目的地址
		if (x < size) {
			node = moveIn(node, 3, 1);
		}
		return node;
	}
	this.changeIndex = function(index, target, startY) {
		if (index == blankPos) {
			return blankMoveTo(this, target, startY);
		}
		console.log(index + ' ' + target)
		var node = this;
		var pos = node.findPos(index);
		var distancex = node.lineDistance(pos, target),
			distancey = node.rowDistance(pos, target);
		if (!startY) {
			node = distancex == 0 ? node : distancex > 0 ? 
					node.moveLeft(index, distancex) : node.moveRight(index, -distancex);
			node = distancey == 0 ? node : distancey > 0 ? 
					node.moveUp(index, distancey) : node.moveDown(index, -distancey);
		} else {
			node = distancey == 0 ? node : distancey > 0 ? 
					node.moveUp(index, distancey) : node.moveDown(index, -distancey);
			node = distancex == 0 ? node : distancex > 0 ? 
					node.moveLeft(index, distancex) : node.moveRight(index, -distancex);
		}
		return node;
	}
	this.getCircle = function(start, end) {
		var sx = start % size, sy = parseInt(start / size),
			ex = end % size, ey = parseInt(end / size);
		if (sx == ex) {
			ex++;
		}
		if (sy == ey) {
			ey++;
		}
		var path = [];
		var tcx = sx < ex ? 1 : -1, tcy = sy < ey ? 1 : -1;
		var tempx = sx, tempy = sy;
		while (tempx != ex) {
			tempx += tcx;
			path.push(tempx + tempy * size);
		}
		while (tempy != ey) {
			tempy += tcy;
			path.push(tempx + tempy * size);
		}
		while (tempx != sx) {
			tempx -= tcx;
			path.push(tempx + tempy * size);
		}
		while (tempy != sy) {
			tempy -= tcy;
			path.push(tempx + tempy * size);
		}
		if (sy > ey) {
			path = path.reverse();
			path.push(path.shift());
		}
		return path;
	}
}

//pos = {0:..., 1:..., ... }
function solvePt(pos, size) {
	var queue;
	var closeList;
	var correctState;
	var max_length = 30000;
	var startState;
	var init = function() {
		queue = [];
		queue.addNode = function(node) {
			var i;
			for (var i = 0; i < this.length; i++) {
				if (this[i].getYXJ() <= node.getYXJ()) {
					this.splice(i, 0, node);
					return i;
				}
			}
			this.push(node);
			return this.length - 1;
		}
		closeList = {};
		startState = [];
		correctState = '';
		for (var i = 0; i < size * size; i++) {
			startState.push(pos[i].index);
			correctState += i + '-';
			//console.log(pos[i]);
		}

	}
	var solve = function(YCL) {
		//var count = 0;
		var startNode = new Node(null, startState, 0, size);
		startNode.getBlankPos();
		if (YCL) {
			startNode = ycl(startNode);
			//return startNode;
			//console.log(startNode.getState());
		}
		queue.unshift(startNode);
		closeList[startNode.getState()] = true;
		//console.log(startNode.getState() + '\n' + startState);
		while (queue.length < max_length) {
			var node = queue.shift();
			var nodeState = node.getState();
			//尝试移动4个方向
			//console.log(nodeState);
			if (nodeState == correctState) {
				return node;
			}
			for (var i = 0; i < 4; i++) {
				var next = node.move(i);
				if (next != null) {
					var nextState = next.getState();
					if (closeList[nextState]) {
						continue;
					} else {
						queue.addNode(next);
						closeList[nextState] = true;
					}
				}
			}
		}
		console.log('I can\'t solute....')
		//console.log(queue[0].getState());
		return null;
	}

	var solveWithYCL = function(most) {
		var startNode = new Node(null, startState, 0, size);
		startNode.getBlankPos();
		startNode = ycl(startNode, most);
		//return startNode;
		queue.unshift(startNode);
		closeList[startNode.getState()] = true;
		//console.log(startNode.getState() + '\n' + startState);
		while (queue.length < max_length) {
			var node = queue.shift();
			var nodeState = node.getState();
			//尝试移动4个方向
			//console.log(nodeState);
			if (nodeState == correctState) {
				return node;
			}
			for (var i = 0; i < 4; i++) {
				var next = node.move(i);
				if (next != null) {
					var nextState = next.getState();
					if (closeList[nextState] || next.getBlankPos() < size * (size - 2)) {
						continue;
					} else {
						queue.addNode(next);
						closeList[nextState] = true;
					}
				}
			}
		}
		console.log('I can\'t solute....')
		//console.log(queue[0].getState());
		startNode.message = 'too difficult and I can\'t solute....\n';
		return startNode;
	}

	var ycl = function(node, most) {
		var correctIndex = function(index) {
			var pos = node.findPos(index);
			if (pos == index) {
				//correct position
				return;
			}
			var distancex = node.lineDistance(pos, index),
				distancey = node.rowDistance(pos, index);
			var target = parseInt(index) + parseInt(index % size == size - 1 ? size - 1 : size);
			if (node.getBlankPos() > target) {
				node = node.moveBlankTo(target);
			} else {
				node = node.moveBlankTo(target, true);
			}		
			//console.log(node.getState());
			pos = node.findPos(index);
			while (pos != target && pos != index) {
				var path = node.getCircle(node.getBlankPos(), pos);
				for (var i in path) {
					node = node.moveBlankTo(path[i]);
					pos = node.findPos(index);
					if (pos == target || pos == index) {
						break;
					}
				}
			}
			if (pos == index) {
				return;
			}
			//此时空格只可能在左或者右
			if (node.getBlankPos() < target) {
				node = node.movePath(node, [2, 1, 1, 0]);
			}
			//现在白块移到右方了
			if (index % size == size - 1) {
				node = node.movePath(node, 
					[2, [3, size - 1], 0, 0, [1, size - 2], 2, 1, 0, [3, size], 2]);
				return;
			} else {
				node = node.movePath(node, [0, 3, 2]);
			}
		}
		for (var i = 0; i < size * (size - 2); i++) {
			correctIndex(i);
			//node.message = 'correct ' + i;
			//console.log(node.getState());
		}
		if (!most) {
			return node;
		}
		node = node.moveBlankTo(size * (size - 2));
		//console.log(node.getState());
		for (var i = size * (size - 2); i < size * (size - 1); i++) {
			var pos = node.findPos(i);
			if (pos % size < i % size) {
				break;
			}
			while (pos != i) {
				//console.log(pos + ' ' +  i);
				var path = node.getCircle(node.getBlankPos(), pos);
				for (var j in path) {
					node = node.moveBlankTo(path[j]);
					pos = node.findPos(i);
					if (pos == i) {
						break;
					}
				}
			}
		}
		return node;
	}

	this.fresh = function() {
		init();
	}
	this.startSolve = function(showRunTime) {
		if (showRunTime) {
			console.time('solve');
		}
		var result = solve();
		if (showRunTime) {
			console.timeEnd('solve');
		}
		return result;
	}
	this.startSolveWithYCL = function(showRunTime, most) {
		if (showRunTime) {
			console.time('solve' + (most && ' with sort most'));
		}
		var result = solveWithYCL(most);
		if (showRunTime) {
			console.timeEnd('solve' + (most && ' with sort most'));
		}
		return result;
	}
	this.path = function(node) {
		var path = [];
		var directions = {
			'0': 'up',
			'1': 'right',
			'2': 'down',
			'3': 'left'
		}
		while (node != null) {
			if (path.length && path[0].moveDirection() != -1) {
				if ((path[0].moveDirection() ^ node.moveDirection()) == 2) {
					node = node.getLast();
					path.splice(0, 1);
					continue;
				}
			}
			path.unshift(node);
			node = node.getLast();
		}
		return path;
	}
	this.steps = function(path) {
		var step = '';
		var last = '';
		var directions = {
			'0': 'up',
			'1': 'right',
			'2': 'down',
			'3': 'left',
			'-1': 'start'
		}
		console.log(path.length);
		var count = 1;
		for (var i = 1; i < path.length; i++) {
			var md = path[i].moveDirection();
			console.log(directions[md]);
			if (last == '') {
				last = directions[md];
				continue;
			}
			if (directions[md] == last) {
				count++;
				continue;
			} else {
				step += last + '-' + count + ' ';
				last = directions[md];
				count = 1;
			}
		}
		step += last + '-' + count
		return step;
	}
	init();
}
