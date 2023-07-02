class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    /**
     * Create a 1D matrix from an array
     * @param {Array} arr 
     * @returns 
     */
    static fromArray(arr) {
        return new Matrix(arr.length, 1).map((e, i) => arr[i]);
    }

    /**
     * Add two matrices together
     * @param {Matrix} a 
     * @param {Matrix} b 
     * @returns {Matrix}
     */
    add(b) {
        if (this.rows !== b.rows || this.cols !== b.cols) {
            console.error("Addition: Matrix dimensions don't match");
            return undefined;
        }
        this.map((v, i, j) => this.data[i][j] + b.data[i][j]);
    }

    /**
     * Multiply two matrices together
     * @param {Matrix} a 
     * @param {Matrix} b 
     * @returns {Matrix}
     */
    static multiply(a, b) {
        if(a.cols !== b.rows) {
            console.error("Multiplication: Matrix dimensions don't match", a.cols, b.rows);
            return undefined;
        }
        let output = new Matrix(a.rows, b.cols);
        output.map((v, i, j) => {
            let sum = 0;
            for(let c = 0; c < a.cols; c++) {
                sum += a.data[i][c] * b.data[c][j];
            }
            return sum;
        });
        return output;
    }

    toArray() {
        let arr = [];
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                arr.push(this.data[i][j]);
            }
        }
        return arr;
    }

    /**
     * Transpose a matrix (flip rows and columns)
     * @returns {Matrix}
     */
    transpose() {
        let ret = new Matrix(this.cols, this.rows);
        ret.map((v, i, j) => this.data[j][i]);
        return ret;
    }

    /**
     * Copy a matrix
     * @returns a new matrix with the same values as this one
     */
    copy() {
        let ret = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                ret.data[i][j] = this.data[i][j];
            }
        }
        return ret;
    }

    /** MUTATES array, apply function to every element (even across dimensions)
     * @param {function} callback 
     * @returns a copy of this matrix with the function applied to every element
     */
    map(callback) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let val = this.data[i][j];
                this.data[i][j] = callback(val, i, j);
            }
        }
        return this;
    }

    /**
     * Same as map, but doesn't mutate the array
     * @param {function} callback 
     */
    foreach(callback) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let val = this.data[i][j];
                callback(val, i, j);
            }
        }
    }

    /**
     * Randomize the values of this matrix from min to max
     * @param {Number} min 
     * @param {Number} max 
     */
    randomize(min=-1, max=1) {
        let mean = (min+max)/2
        let stddev = (max-mean)
        return this.map(() => gaussianRandom(mean, stddev));
    }

    toString() {
        let ret = "";
        for(let i = 0; i < this.rows; i++) {
            ret += this.data[i].join(" ") + "\n";
        }
        return ret;
    }
}