var graphics = (function(drawing) {
	var playerImage = new Image();
	var enemyImage = new Image();

	drawing.drawInitialCanvas = function (board, player) {
	    // set up canvas and dynamically adjust grid size
		document.getElementById("gamewrapper").setAttribute("style", "height:" + board.canvasHeight + "px; width:" + board.canvasWidth + "px;");
		var canvas = document.getElementById("game");
		canvas.setAttribute("width", board.canvasWidth);
		canvas.setAttribute("height", board.canvasHeight);
		context = canvas.getContext("2d");
		context.lineJoin = "round";
		context.lineWidth = board.characterSize / 2.5;
		context.lineCap = "round";

		// draw characters after their icons have loaded
		playerImage.src = "images/character.png";
		playerImage.onload = function () {
			enemyImage.src = "images/enemy.png";
			enemyImage.onload = function () {
				drawing.renderBoard(board, player);
			}
		}
	}

    drawing.renderBoard = function(board, player) {
    	var canvas = document.getElementById("game");
	    context.clearRect(0, 0, canvas.width, canvas.height);

		drawCharacterPath("#464AFD", player.startX, player.startY, player.moves, board); // draw the player's path
	    drawCharacter(player.x, player.y, player.rotation, playerImage, board); // draw the player

    	for (var i = 0; i < board.enemies.length; i++) { // draw the alive enemies
    		drawCharacterPath("#FFA500", board.enemies[i].startX, board.enemies[i].startY, board.enemies[i].moves, board); // draw the enemy's path
			drawCharacter(board.enemies[i].x, board.enemies[i].y, board.enemies[i].rotation, enemyImage, board); // draw the enemy
    	}
	}

	function drawCharacter(x, y, rotation, image, board) {
		// need to compensate for rotation moving the character image
	    var xOffset = (rotation == 0 || rotation == 90) ? 0 : (board.characterSize * -1);
	    var yOffset = (rotation == 0 || rotation == 270) ? 0 : (board.characterSize * -1);

	    context.save();
		context.translate(x, y);
    	context.rotate(rotation * Math.PI/180);
    	context.drawImage(image, xOffset, yOffset);
    	context.restore();
	}

	function drawCharacterPath(color, startX, startY, moves, board) {
		context.beginPath();
	    context.strokeStyle = color;
    	context.moveTo(startX + (board.characterSize / 2), startY + (board.characterSize / 2));
    	for(var i = 0; i < moves.length; i++) {
		    context.lineTo(moves[i].x + (board.characterSize / 2), moves[i].y + (board.characterSize / 2));
    	}
    	context.stroke();
	}

	return drawing;
}(graphics || {}));