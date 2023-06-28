// the pieces and their colors

const PIECES = [
    [Z, "red"],
    [S, "green"],
    [T, "#aa00aa"],
    [O, "blue"],
    [L, "purple"],
    [I, "cyan"],
    [J, "orange"]
];

function Piece(board, drawer, tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.board = board;
    this.drawer = drawer;

    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // we need to control the pieces
    this.x = 3;
    this.y = -2;
}

Piece.random = function (board, drawer) {
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece(board, drawer, PIECES[r][0], PIECES[r][1]);
}

// fill function

Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            // we draw only occupied squares
            if (this.activeTetromino[r][c]) {
                this.drawer.drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

// draw a piece to the this.board

Piece.prototype.draw = function () {
    this.fill(this.color);
}

// undraw a piece


Piece.prototype.unDraw = function () {
    this.fill(VACANT);
}

// Drop piece to bottom
Piece.prototype.drop = function () {
    let atBottom = false;
    while (!atBottom) {
        atBottom = this.moveDown();
    }
    return true;
}

// move Down the piece

/**
 * 
 * @returns true if the piece is locked at the bottom
 */
Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
        return false;
    } else {
        // we lock the piece and generate a new one
        this.lock();
        return true;
    }

}

// move Right the piece
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
        if (this.x > this.board[0].length / 2) {
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        } else {
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

Piece.prototype.lock = function () {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            // we skip the vacant squares
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            // pieces to lock on top = game over
            if (this.y + r < 0) {
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            this.board[this.y + r][this.x + c] = this.color;
        }
    }
    // remove full rows
    for (r = 0; r < this.board.length; r++) {
        let isRowFull = true;
        for (c = 0; c < this.board[0].length; c++) {
            isRowFull = isRowFull && (this.board[r][c] != VACANT);
        }
        if (isRowFull) {
            // if the row is full
            // we move down all the rows above it
            for (y = r; y > 1; y--) {
                for (c = 0; c < this.board[0].length; c++) {
                    this.board[y][c] = this.board[y - 1][c];
                }
            }
            // the top row this.board[0][..] has no row above it
            for (c = 0; c < this.board[0].length; c++) {
                this.board[0][c] = VACANT;
            }
            // increment the score
            score += 10;
        }
    }

    // update the score
    scoreElement.innerHTML = score;
}

// collision fucntion

Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {
            // if the square is empty, we skip it
            if (!piece[r][c]) {
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if (newX < 0 || newX >= this.board[0].length || newY >= this.board.length) {
                return true;
            }
            // skip newY < 0; this.board[-1] will crush our game
            if (newY < 0) {
                continue;
            }
            // check if there is a locked piece alrady in place
            if (this.board[newY][newX] != VACANT) {
                return true;
            }
        }
    }
    return false;
}