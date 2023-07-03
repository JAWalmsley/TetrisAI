class NeuralNetwork {
    /**
     * 
     * @param {Number} a Input size / IH weights 
     * @param {Number} b Hidden size / HO weights
     * @param {Number} c Output size / Bias hidden
     * @param {*} d NA / Bias output
     * @param {*} e Input labels
     * @param {*} f Output labels
     */
    constructor(a, b, c, d, e, inlb = [], outlb = []) {
        if (typeof a == "number") {
            let inputSize = a;
            let hiddenSize = b;
            let outputSize = c;
            // Weights from input to hidden
            this.weightsIH = new Matrix(hiddenSize, inputSize);
            // Weights from hidden to output
            this.weightsHO = new Matrix(outputSize, hiddenSize);
            // Weights from input to output
            this.weightsOI = new Matrix(outputSize, inputSize).randomize();
            // Bias for hidden layer
            this.biasHidden = new Matrix(hiddenSize, 1);
            // Bias for output layer
            this.biasOutput = new Matrix(outputSize, 1).randomize();
        } else if (a instanceof Matrix) {
            this.weightsIH = a;
            this.weightsHO = b;
            this.biasHidden = c;
            this.biasOutput = d;
            this.weightsOI = e;
        }
        this.inputLabels = inlb;
        this.outputLabels = outlb;
    }

    static fromGenome(genome, inputLabels = [], outputLabels = []) {
        let wIH = new Matrix(1, 1);
        let wHO = new Matrix(1, 1);
        let wOI = new Matrix(1, 1);
        let bH = new Matrix(1, 1);
        let bO = new Matrix(1, 1);
        genome.forEach((g) => {
            if (g.layerIn() == 'i') {
                if (g.layerOut() == 'o') {
                    wOI.resize(g.out() + 1, g.in() + 1);
                    wOI.data[g.out()][g.in()] = g.weight;
                    bO.resize(g.out(), 1);
                } else if (g.layerOut() == 'h') {
                    if(wIH.data[g.out()] == undefined || wIH.data[g.out()][g.in()] == undefined)
                    {
                        wIH.resize(g.out() + 1, g.in() + 1);
                    }
                    bH.resize(g.out(), 1);
                    wIH.data[g.out()][g.in()] = g.weight;
                }
            } else if(g.layerIn() == 'h') {
                wHO.resize(g.out() + 1, g.in() + 1);
                bH.resize(g.in(), 1);
                wHO.data[g.out()][g.in()] = g.weight;
            } else if(g.layerIn() == 'b') {
                if(g.layerOut() == 'h') {
                    bH.resize(g.out() + 1, 1);
                    bH.data[g.out()][0] = g.weight;
                } else if(g.layerOut() == 'o') {
                    bO.resize(g.out() + 1, 1);
                    bO.data[g.out()][0] = g.weight;
                }
            }
        });
        
        bO.resize(wHO.rows, 1);
        return new NeuralNetwork(wIH, wHO, bH, bO, wOI, inputLabels, outputLabels);
    }

    /**
     * Get the predicted output for a given input
     * @param {Array} inputData 
     * @returns {Matrix}
     */
    getOutput(inputData) {
        let numInputs = this.getDimensions()[0];
        let numHidden = this.getDimensions()[1];
        let numOutputs = this.getDimensions()[2];
        // Resize matrices for multiplication
        this.weightsIH.resize(numHidden, numInputs);
        this.weightsHO.resize(numOutputs, numHidden);
        this.weightsOI.resize(numOutputs, numInputs);
        this.biasOutput.resize(numOutputs, 1);
        this.biasHidden.resize(numHidden, 1);
        let input = Matrix.fromArray(inputData);
        // Multiply by weights to get hidden
        let hidden = Matrix.multiply(this.weightsIH, input);
        // Add biases
        hidden.add(this.biasHidden);
        // Apply activation fucntion (tanh)
        hidden.map((x) => Math.tanh(x));
        // Multiply by weights to get output
        let output = Matrix.multiply(this.weightsHO, hidden);
        output.add(Matrix.multiply(this.weightsOI, input))
        // Add biases
        output.add(this.biasOutput);
        // Apply activation function (tanh)
        output.map((x) => Math.tanh(x));
        return output;
    }

    mutate(m, chance) {
        if (Math.random(1) < chance) {
            m.map((x) => x + gaussianRandom());
        }
    }

    copy() {
        let wih = this.weightsIH.copy();
        let who = this.weightsHO.copy();
        let woi = this.weightsOI.copy();
        let bh = this.biasHidden.copy();
        let bo = this.biasOutput.copy();
        let il = this.inputLabels.slice();
        let ol = this.outputLabels.slice();
        return new NeuralNetwork(wih, who, bh, bo, woi, il, ol);
    }

    applyMutations(mutationChance) {
        this.mutate(this.weightsIH, mutationChance);
        this.mutate(this.weightsHO, mutationChance);
        this.mutate(this.biasHidden, mutationChance);
        this.mutate(this.biasOutput, mutationChance);
    }

    // createHiddenNode(input, output) {
    //     this.weightsIH.expand(1, 0);
    //     this.weightsIH.data[this.weightsIH.rows - 1][input] = 1;
    //     this.weightsHO.expand(0, 1);
    //     this.weightsHO.data[output][this.weightsHO.cols - 1] = this.weightsOI.data[output][input];
    //     this.weightsOI.data[output][input] = 0;
    // }

    getDimensions() {
        let numInputs = Math.max(this.weightsIH.cols, this.weightsOI.cols);
        let numHidden = Math.max(this.weightsHO.cols, this.weightsIH.rows);
        let numOutputs = Math.max(this.weightsOI.rows, this.weightsHO.rows);
        return [numInputs, numHidden, numOutputs]
    }

    toString() {
        return `${this.weightsIH.toString()}\n${this.weightsHO.toString()}\n${this.biasHidden.toString()}\n${this.biasOutput.toString()}`
    }
}