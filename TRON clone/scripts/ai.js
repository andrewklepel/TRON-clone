var aiPathfinding = (function(pathfinding) {
	pathfinding.findBestRotation = function(char, board) {
		//return simplePathfinding(char, board);
		//return wallhuggingPathfinding(char, board);
		return largestRoomPathfinding(char, board);
	}

	// pathfinding - only change directions when collision will happen
	function simplePathfinding(char, board) {
		var leftRotation = possibleRotations(char.rotation)[0];
		var rightRotation = possibleRotations(char.rotation)[2];

		if (!nextTile(char.x, char.y, char.rotation, board, board.markedTiles).isOccupied)
			return char.rotation;
		else if (!nextTile(char.x, char.y, leftRotation, board, board.markedTiles).isOccupied)
			return leftRotation;
		else if (!nextTile(char.x, char.y, rightRotation, board, board.markedTiles).isOccupied)
			return rightRotation;
		
		return char.rotation; // crash inevitable, keep going straight
	}

	// pathfinding - wallhugging algorithm
	function wallhuggingPathfinding(char, board) {
		var rotations = shuffle([0, 90, 180, 270]); // shuffle order of array, so that movement is not deterministic
		var validRotations = [true, true, true, true];

		for (var i = 0; i < 4; i++) {
			var forwardTile = nextTile(char.x, char.y, rotations[i], board, board.markedTiles);

			if (forwardTile.isOccupied) {
				validRotations[i] = false;
				continue;
			}

			// if the left or right bordering tiles are occupied, count this as 'wall hugging'
			var leftRotation = possibleRotations(forwardTile.rotation)[0];
			var leftBorderingTile = nextTile(forwardTile.x, forwardTile.y, leftRotation, board, board.markedTiles);
			if (leftBorderingTile.isOccupied) return rotation;

			var rightRotation = possibleRotations(forwardTile.rotation)[2];
			var rightBorderingTile = nextTile(forwardTile.x, forwardTile.y, rightRotation, board, board.markedTiles);
			if (rightBorderingTile.isOccupied) return rotation;
		}

		// if going straight will crash, turn to the next valid rotation
		if (validRotations[rotations.indexOf(char.rotation)] === false) {
			for (var i = 0; i < 4; i++) {
				if (validRotations[i]) return rotations[i];
			}
		}

		// with all else being equal (or if there's no way to avoid crashing), stay moving in the same direction
		return char.rotation;
	}

	// pathfinding - if there's a decision between entering two 'rooms', always choose the larger one
	function largestRoomPathfinding(char, board) {
		var scores = [0, 0, 0]; // left, straight, right
		var rotations = possibleRotations(char.rotation);

		for (var i = 0; i < 3; i++) { // for each possible rotation
			// copy 2d array by value, not reference
			var marked = [];
			for (var j = 0; j < board.markedTiles.length; j++)
			    marked.push(board.markedTiles[j].slice());

			var forwardTile = nextTile(char.x, char.y, rotations[i], board, marked);

			if (!forwardTile.isOccupied) {
				scores[i] += 1;

				// mark potential next tile as used, as if we've already hit it
				marked[forwardTile.x / board.gridBlockWidth][forwardTile.y / board.gridBlockWidth] = true;

				scores[i] = validNeighborCount(marked, forwardTile, rotations[i], char, board);
			}
		}

		if (scores.indexOf(Math.max.apply(null, scores)) == scores.lastIndexOf(Math.max.apply(null, scores))) // if there is a clear winner
			return rotations[scores.indexOf(Math.max.apply(null, scores))];
		else
			return wallhuggingPathfinding(char, board);
	}

	function validNeighborCount(marked, currentTile, rotation, char, board) {
		var rotations = possibleRotations(rotation);
		var score = 0;

		for (var i = 0; i < 3; i++) { // for each possible rotation
			var forwardTile = nextTile(currentTile.x, currentTile.y, rotations[i], board, marked);

			if (!forwardTile.isOccupied) {
				score += 1;
				// mark potential next tile as used, as if we've already hit it
				marked[forwardTile.x / board.gridBlockWidth][forwardTile.y / board.gridBlockWidth] = true;

				score += validNeighborCount(marked, forwardTile, rotations[i], char, board);
			}
		}

		return score;
	}

	function nextTile(x, y, rotation, board, marked) {
	    var tile = {
	    	x: 0,
	    	y: 0,
	    	isOccupied: false
	    };

		tile.x = rotation == 270 ? x - board.gridBlockWidth : rotation == 90 ? x + board.gridBlockWidth : x;
		tile.y = rotation == 0 ? y - board.gridBlockWidth : rotation == 180 ? y + board.gridBlockWidth : y;

		// if next tile is out of bounds or is already occupied
		if ((tile.x < 0) || (tile.x > board.canvasWidth - board.characterSize) ||
			(tile.y < 0) || (tile.y > board.canvasHeight - board.characterSize) ||
			marked[tile.x / board.gridBlockWidth][tile.y / board.gridBlockWidth]) {
			tile.isOccupied = true;
		}

	    return tile;
	}

	function possibleRotations(rotation) {
		return [(((rotation - 90) + 360) % 360), rotation, (((rotation + 90) + 360) % 360)];
	}

	function shuffle(a) {
	    var j, x, i;
	    for (i = a.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = a[i - 1];
	        a[i - 1] = a[j];
	        a[j] = x;
	    }
	    return a;
	}

	return pathfinding;
}(aiPathfinding || {}));