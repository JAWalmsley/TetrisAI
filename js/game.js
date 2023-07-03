const LEFTARROW = 37;
const UPARROW = 38;
const RIGHTARROW = 39;
const DOWNARROW = 40;
const SPACEBAR = 32;

const ROWCOMPLETEBONUS = 200;

class Game {
    constructor(canvas, scoreElement, timescale, keyboardControlled, draw, neuralNet, gameOverCallback=null) {
        this.fitness = 0;
        this.canvas = canvas;
        if (draw) {
            this.drawer = new Drawer(canvas.getContext("2d"));
            this.scoreElement = scoreElement;
        }
        this.score = 0;
        this.board = [];
        this.rows = canvas.clientHeight / SQ;
        this.cols = canvas.clientWidth / SQ;
        this.gameOver = false;
        this.blocksPlaced = 0;
        this.lastDrop = Date.now();
        this.gameOverCallback = gameOverCallback;

        if (keyboardControlled) {
            document.addEventListener("keydown", this.handleKeyEvent.bind(this));
        } else if (neuralNet) {
            this.neuralNet = neuralNet;
        } else {
            let inlbl = [];
            for(let i = 0; i < this.cols; i++) {
                inlbl.push("C" + i.toString() + " height");
            }
            inlbl.push("Z", "S", "T", "O", "L", "I", "J");
            inlbl.push("Piece Y", "Piece X", "Piece Rotation");
            this.neuralNet = new NeuralNetwork(this.cols + 10, this.cols + 7, 3, null, null, inlbl, ["left", "right", "rotate"]);
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
                if (this.drawer) {
                    this.drawer.drawSquare(c, r, this.board[r][c]);
                }
            }
        }
    }

    canvasToMatrix() {
        let ctx = this.canvas.getContext("2d");
        let m = new Matrix(GAMEHEIGHT / SQ, GAMEWIDTH / SQ);
        for (let y = SQ / 2; y < GAMEHEIGHT; y += SQ) {

            for (let x = SQ / 2; x < GAMEWIDTH; x += SQ) {
                let rgb = ctx.getImageData(x, y, 1, 1).data;
                m.data[Math.floor(y / SQ)][Math.floor(x / SQ)] = ((rgb[0] + rgb[1] + rgb[2]) < 765) ? 1 : 0
            }
        }
        return m;
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
        for (let c = 0; c < this.cols; c++) {
            if (this.board[0][c] !== VACANT) {
                this.gameOver = true;
                this.gameOverCallback(this.getFitness());
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
                for (let y = r; y > 0; y--) {
                    for (let c = 0; c < this.board[0].length; c++) {
                        this.board[y][c] = this.board[y - 1][c];
                    }
                }
                // the top row this.board[0][..] has no row above it
                for (let c = 0; c < this.board[0].length; c++) {
                    this.board[0][c] = VACANT;
                }
                // increment the score
                this.score += ROWCOMPLETEBONUS;
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
        this.blocksPlaced++;
        this.checkCompleteRow();
        this.drawBoard();
        this.p = Piece.random(this.board, this.drawer);
    }

    getInputs() {
        let ret = [];
        // Height of every column as input
        for (let x = 0; x < this.cols; x++) {
            let height = 0;
            // Go backwards through rows to find max height with item in it
            for (let y = this.rows - 1; y > 0; y--) {
                if (this.board[y][x] !== VACANT) {
                    height = y;
                }
            }
            // Normalized to [0, 1] because neural networks like that kinda stuff
            ret.push(height / this.rows);
        }

        // Type of piece up next as input
        // We give each possible tetromino its own input neuron because that is more optimal
        // https://stats.stackexchange.com/questions/157985/neural-network-binary-vs-discrete-continuous-input
        switch (this.p.tetromino) {
            case Z:
                ret.push(1, 0, 0, 0, 0, 0, 0);
                break;
            case S:
                ret.push(0, 1, 0, 0, 0, 0, 0);
                break;
            case T:
                ret.push(0, 0, 1, 0, 0, 0, 0);
                break;
            case O:
                ret.push(0, 0, 0, 1, 0, 0, 0);
                break;
            case L:
                ret.push(0, 0, 0, 0, 1, 0, 0);
                break;
            case I:
                ret.push(0, 0, 0, 0, 0, 1, 0);
                break;
            case J:
                ret.push(0, 0, 0, 0, 0, 0, 1);
                break;
            default:
                console.error("aaaaa");
                break;
        }

        // Add current piece's position and rotation
        ret.push(this.p.y / this.rows);
        ret.push(this.p.x / this.cols);
        ret.push(this.p.tetrominoN / 3)
        return ret;
    }

    makeAIMove() {
        let output = this.neuralNet.getOutput(this.getInputs()).toArray();
        let maxOutput = 0;
        for (let i = 0; i < output.length; i++) {
            if (output[i] > output[maxOutput]) {
                maxOutput = i;
            }
        }
        switch(maxOutput) {
            case 0:
                this.handleKeyEvent({ keyCode: LEFTARROW });
                break;
            case 1:
                this.handleKeyEvent({keyCode: RIGHTARROW});
                break;
            case 2:
                this.handleKeyEvent({keyCode: UPARROW});
                break;
        }
        // let maxRotation = 0;
        // for (let i = 0; i < 4; i++) {
        //     if (output[i + this.cols] > output[maxRotation + this.cols]) {
        //         maxRotation = i;
        //     }
        // }
        // this.p.goToX(maxColumn - 1);
        // for (let i = 0; i < maxRotation; i++) {
        //     // this.p.rotate();
        //     this.handleKeyEvent({ keyCode: UPARROW });
        // }

    }

    getFitness() {
        let ret = 100;
        ret += this.score;
        ret += this.blocksPlaced * 0.5;
        for (let i = 0; i < this.cols; i++) {
            let block = false;
            for (let j = 0; j < this.rows; j++) {
                if (block && this.board[j][i] === VACANT) {
                    // We have seen a block and then a vacant square, there is a hole
                    ret -= 1;
                    // break;
                }
                if (this.board[j][i] !== VACANT) {
                    block = true;
                }
            }

        }
        return Math.max(ret, 0);
    }

    update() {
        this.drawBoard();
        if (this.gameOver) {
            if (this.drawer) {
                this.scoreElement.innerText = "Game over, score: " + this.score.toString();
            }
            return;
        }
        let now = Date.now();
        let delta = now - this.lastDrop;
        if (delta > (1000 / this.timescale)) {
            if (this.neuralNet) {
                this.makeAIMove();
            }
            this.movePiece();
            this.lastDrop = Date.now();
        }
        this.checkGameOver();
        this.fitness = this.getFitness();
        if (this.drawer) {
            this.scoreElement.innerHTML = this.fitness.toString();
        }
    }
}