const LEFTARROW = 37;
const UPARROW = 38;
const RIGHTARROW = 39;
const DOWNARROW = 40;
const SPACEBAR = 32;

class Game {
    constructor(canvas, scoreElement, timescale, keyboardControlled) {
        this.canvas = canvas;
        this.drawer = new Drawer(canvas.getContext("2d"));
        this.scoreElement = scoreElement;
        this.score = 0;
        this.board = [];
        this.rows = canvas.clientHeight / SQ;
        this.cols = canvas.clientWidth / SQ;
        this.gameOver = false;
        this.lastDrop = Date.now();
        if (keyboardControlled) {
            document.addEventListener("keydown", this.handleKeyEvent.bind(this));
        }

        this.setupBoard();
        this.drawBoard();
        this.timescale = timescale;
        this.p = Piece.random(this.board, this.drawer);
    }

    setupBoard() {
        for (let r = 0; r < this.rows; r++) {
            this.board[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.board[r][c] = VACANT;
            }
        }
        // for(let c = 0; c < this.cols - 1; c++) {
        //     this.board[19][c] = "YELLOW"
        // }
        
    }


    drawBoard() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.drawer.drawSquare(c, r, this.board[r][c]);
            }
        }
    }

    handleKeyEvent(event) {
        if (event.keyCode == LEFTARROW) {
            this.p.moveLeft();
            this.dropStart = Date.now();
        } else if (event.keyCode == UPARROW) {
            this.p.rotate();
            this.dropStart = Date.now();
        } else if (event.keyCode == RIGHTARROW) {
            this.p.moveRight();
            this.dropStart = Date.now();
        } else if (event.keyCode == DOWNARROW) {
            this.movePiece();
        } else if (event.keyCode == SPACEBAR) {
            this.p.drop();
            this.newPiece();
        }
    }

    checkGameOver() {
        // console.log("checking game over")
        for(let c = 0; c < this.cols; c++) {
            if(this.board[0][c] !== VACANT) {
                this.gameOver = true;
                return;
            }
        }
    }

    checkCompleteRow() {
        for (let r = 0; r < this.board.length; r++) {
            let isRowFull = true;
            for (let c = 0; c < this.board[0].length; c++) {
                isRowFull = isRowFull && (this.board[r][c] != VACANT);
            }
            if (isRowFull) {
                // if the row is full
                // we move down all the rows above it
                for (let y = r; y > 1; y--) {
                    for (let c = 0; c < this.board[0].length; c++) {
                        this.board[y][c] = this.board[y - 1][c];
                    }
                }
                // the top row this.board[0][..] has no row above it
                for (let c = 0; c < this.board[0].length; c++) {
                    this.board[0][c] = VACANT;
                }
                // increment the score
                this.score += 10;
            }
        }
    }

    movePiece() {
        
        let locked = this.p.moveDown();
        if (locked) {
            this.newPiece();
        }
    }

    newPiece() {
        this.checkCompleteRow();
        this.drawBoard();
        this.p = Piece.random(this.board, this.drawer);
    }

    update() {
        if (this.gameOver) {
            console.log("Game is over")
            this.scoreElement.innerText = "Game over, score: " + this.score.toString();
            return;
        }
        let now = Date.now();
        let delta = now - this.lastDrop;
        if (delta > 1000 / this.timescale) {
            this.movePiece();
            this.lastDrop = Date.now();
        }
        this.checkGameOver();
        this.scoreElement.innerHTML = this.score.toString();
    }
}