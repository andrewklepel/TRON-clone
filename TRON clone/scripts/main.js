(function(pathfinding, graphics) {
	var board, player;
	initializeGame();

	// when play button is clicked
	document.getElementById("play").onclick = function () { 
		start();
	};

	// redraw board whenever setting is updated
	document.getElementById("enemy-count").oninput = function() {
		initializeGame();
	};
	document.getElementById("speed").oninput = function() {
		initializeGame();
	};
	document.getElementById("board-height").oninput = function() {
		initializeGame();
	};
	document.getElementById("board-width").oninput = function() {
		initializeGame();
		var newMax = Math.ceil(document.getElementById("board-width").value / 2);
		document.getElementById("enemy-count").setAttribute("max", newMax);
		if (document.getElementById("enemy-count").value > newMax)
			document.getElementById("enemy-count").value = newMax;
	};

    document.onkeydown = function (event) {
    	if ((event.keyCode == 38 || event.keyCode == 87) && player.rotation !== 180) {
    		player.rotationBuffer = 0;
	    }
	    if ((event.keyCode == 40 || event.keyCode == 83) && player.rotation !== 0) {
	    	player.rotationBuffer = 180;
	    }
	    if ((event.keyCode == 37 || event.keyCode == 65) && player.rotation !== 90) {
	    	player.rotationBuffer = 270;
	    }
	    if ((event.keyCode == 39 || event.keyCode == 68) && player.rotation !== 270) {
	    	player.rotationBuffer = 90;
	    }
	    // activate the 'play' button
	    if ((event.keyCode == 13 || event.keyCode == 80) && document.getElementById("control-box").style.display === "") {
	    	start();
	    }
    }

	function start() {
		document.getElementById("control-box").style.display = "none";
		initializeGame();

		// start the main loop
		requestAnimationFrame(update);
	}

	function stop(won) {
		document.getElementById("result-message").style.display = "";
		var text = won ? "You won!" : "You lost!";
		document.getElementById("result-message").innerHTML = text;

		setTimeout(function () {
			document.getElementById("result-message").style.display = "none";
			document.getElementById("control-box").style.display = "";
			initializeGame();
    	}, 1300);
	}

	function initializeGame() {
		initializeBoard();
		initializePlayer();
		initializeEnemies();

		graphics.drawInitialCanvas(board, player);
	}

	function initializeBoard() {
		// script assumes that canvasHeight and canvasWidth are multiples of gridBlockWidth, and speed is a divisor of gridBlockWidth

		// numbers from settings
		var enemyCount = document.getElementById("enemy-count").value;
		var tileHeight = document.getElementById("board-height").value;
		var tileWidth = document.getElementById("board-width").value;

		var speeds = [40, 20, 8, 5, 2, 1];
		var gameSpeedSetting = document.getElementById("speed").value; // MUST BE divisor of baseWidth
		var gameSpeed = speeds[gameSpeedSetting];

		var baseWidth = 40;
		board = {
			gridBlockWidth: baseWidth,
			speed: baseWidth / gameSpeed,
			canvasHeight: baseWidth * tileHeight,
			canvasWidth: baseWidth * tileWidth,
	    	characterSize: 40,
	    	initialEnemyCount: enemyCount,
	    	enemies: [],
	    	markedTiles: []
	    };

	    // initialize 2d array for markedTiles
	    for (var i = 0; i < board.canvasWidth / board.gridBlockWidth; i++) {
	    	board.markedTiles.push([]);
	    	for (var j = 0; j < board.canvasHeight / board.gridBlockWidth; j++) {
	    		board.markedTiles[i].push(false);
	    	}
	    }
	}

	function initializePlayer() {
	    var playerStartX = ((board.canvasWidth / 2) + ((board.canvasWidth / 2) % board.characterSize)) - board.characterSize;
	    var playerStartY = board.canvasHeight - (board.characterSize*4);
	    player = {
	    	startX: playerStartX,
	    	startY: playerStartY,
	    	x: playerStartX,
	    	y: playerStartY,
	    	rotation: 0,
	    	rotationBuffer: 0,
	    	moves: [{"x": playerStartX, "y": playerStartY}],
	    	isAlive: true,
	    	isPlayer: true
	    };
	}

	function initializeEnemies() {
		// evenly space out the enemies, all within their own grid blocks
		var x = (board.canvasWidth / 2 + ((board.canvasWidth / 2) % board.characterSize)) - (board.characterSize * (board.initialEnemyCount - 1) + board.characterSize);

    	for (var i = 0; i < board.initialEnemyCount; i++) {
    		var enemyStartX = x;
    		var enemyStartY = (board.characterSize*3);
	    	board.enemies.push({
	    		startX: enemyStartX,
	    		startY: enemyStartY,
	    		x: enemyStartX,
	    		y: enemyStartY,
	    		rotation: 180,
	    		rotationBuffer: 180,
	    		moves: [{"x": enemyStartX, "y": enemyStartY}],
	    		isAlive: true,
	    		isPlayer: false
			});
    		x += board.characterSize * 2;
    	}
	}

	function update() {
		moveCharacter(player);

		if (player.isAlive) {
			for (var i = 0; i < board.enemies.length; i++) {
				moveCharacter(board.enemies[i]);
			}

			graphics.renderBoard(board, player);
			requestAnimationFrame(update);
		}
		else { // game over
			// find out if the player was the last standing
			var didWin = true;
			for (var i = 0; i < board.enemies.length; i++) {
				if (board.enemies[i].isAlive)
					didWin = false;
			}
			stop(didWin);
		}
	}

	function moveCharacter(char) {
		if (char.isAlive) {
			// only rotate the character + update logic when they're perfectly within a grid block
			if (char.x % board.gridBlockWidth === 0 && char.y % board.gridBlockWidth === 0) {
				// they die if their current tile has already been used
				if (board.markedTiles[char.x / board.gridBlockWidth][char.y / board.gridBlockWidth]) {
					char.isAlive = false;
					return;
				}

				// mark this tile as used
				board.markedTiles[char.x / board.gridBlockWidth][char.y / board.gridBlockWidth] = true;

				if (!char.isPlayer)
					char.rotationBuffer = pathfinding.findBestRotation(char, board);

				// update drawn line if we're changing directions
				if (char.rotation != char.rotationBuffer) {
					char.moves.push({"x": char.x, "y": char.y});
				}

				char.rotation = char.rotationBuffer;
			}

			// move player in set direction
			if (char.rotation == 0 && char.y > 0) char.y -= board.speed;
			else if (char.rotation == 180 && char.y < board.canvasHeight - board.characterSize) char.y += board.speed;
			else if (char.rotation == 270 && char.x > 0) char.x -= board.speed;
			else if (char.rotation == 90 && char.x < board.canvasWidth - board.characterSize) char.x += board.speed;
			
			// set player's last trail coordinates to current location
			char.moves[char.moves.length - 1].x = char.x;
			char.moves[char.moves.length - 1].y = char.y;
		}
	}
}(aiPathfinding, graphics));