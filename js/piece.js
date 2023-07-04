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

    // spawn in the middle of the board
    this.x = Math.floor(this.board[0].length / 2) - 1;
    this.y = -1;
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
                if (this.drawer) {
                    this.drawer.drawSquare(this.x + c, this.y + r, color);
                }
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
    while (atBottom === false) {
        atBottom = this.moveDown();
    }
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

Piece.prototype.goToX = function (x) {
    let lastx = this.x;
    while (this.x < x) {
        lastx = this.x;
        this.moveRight();
        if (this.x == lastx) {
            return;
        }
    }
    while (this.x > x) {
        lastx = this.x;
        this.moveLeft();
        if (this.x == lastx) {
            return;
        }
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
                break;
            }
            // we lock the piece
            this.board[this.y + r][this.x + c] = this.color;
        }
    }
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