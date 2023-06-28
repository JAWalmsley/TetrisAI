const LEFTARROW = 37;
const UPARROW = 38;
const RIGHTARROW = 39;
const DOWNARROW = 40;
const SPACEBAR = 32;

class Game {
    constructor(canvas, scoreElement, timescale, keyboardControlled) {
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
            let newScore = this.p.drop();
            this.newPiece(newScore);
        }
    }

    movePiece() {
        let newScore = this.p.moveDown();
        if (newScore !== false) {
            this.newPiece(newScore);
        }
    }

    newPiece(newScore) {
        this.drawBoard();
        this.p = Piece.random(this.board, this.drawer);
        this.score += newScore;
    }

    update() {
        console.log(this.score);
        if (this.gameOver) {
            return;
        }
        let now = Date.now();
        let delta = now - this.lastDrop;
        if (delta > 1000 / this.timescale) {
            this.movePiece();
            this.lastDrop = Date.now();
        }
        this.scoreElement.innerHTML = this.score.toString();
    }
}