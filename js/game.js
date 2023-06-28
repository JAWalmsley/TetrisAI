const LEFTARROW = 37;
const UPARROW = 38;
const RIGHTARROW = 39;
const DOWNARROW = 40;
const SPACEBAR = 32;

class Game {
    constructor(drawer, timescale, keyboardControlled) {
        this.board = [];
        this.drawer = drawer;
        this.gameOver = false;
        this.lastDrop = Date.now();
        if(keyboardControlled){
            document.addEventListener("keydown",this.handleKeyEvent.bind(this));
        }

        this.setupBoard();
        this.drawBoard();
        this.timescale = timescale;
        this.p = Piece.random(this.board, this.drawer);
    }

    setupBoard() {
        for (let r = 0; r < ROW; r++) {
            this.board[r] = [];
            for (let c = 0; c < COL; c++) {
                this.board[r][c] = VACANT;
            }
        }
    }


    drawBoard() {
        for (let r = 0; r < ROW; r++) {
            for (let c = 0; c < COL; c++) {
                this.drawer.drawSquare(c, r, this.board[r][c]);
            }
        }
    }

    handleKeyEvent(event) {
        if(event.keyCode == LEFTARROW){
            this.p.moveLeft();
            this.dropStart = Date.now();
        }else if(event.keyCode == UPARROW){
            this.p.rotate();
            this.dropStart = Date.now();
        }else if(event.keyCode == RIGHTARROW){
            this.p.moveRight();
            this.dropStart = Date.now();
        }else if(event.keyCode == DOWNARROW){
            if(this.p.moveDown()){
                this.p = Piece.random(this.board, this.drawer);
            }
        } else if(event.keyCode == SPACEBAR){
            this.p.drop();
            this.p = Piece.random(this.board, this.drawer);
        }
    }

    update() {
        if(this.gameOver) {
            return;
        }
        let now = Date.now();
        let delta = now - this.lastDrop;
        if (delta > 1000/this.timescale) {
            this.p.moveDown();
            this.lastDrop = Date.now();
        }
    }
}