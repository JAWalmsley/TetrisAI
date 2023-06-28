const LEFTARROW = 37;
const UPARROW = 38;
const RIGHTARROW = 39;
const DOWNARROW = 40;
const SPACEBAR = 32;

class Game {
    constructor(canvas, timescale, keyboardControlled) {
        this.drawer = new Drawer(canvas.getContext("2d"));
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

    movePiece() {
        let newScore = this.p.moveDown();
        if (newScore !== false) {
            this.newPiece();
            // this.score += newScore;
        }
    }

    newPiece() {
        this.drawBoard();
        this.p = Piece.random(this.board, this.drawer);
    }

    update() {
        if (this.gameOver) {
            return;
        }
        let now = Date.now();
        let delta = now - this.lastDrop;
        if (delta > 1000 / this.timescale) {
            this.movePiece();
            this.lastDrop = Date.now();
        }
    }
}