

class NeuralNetwork {
    constructor(a, b, c, d) {
        if (typeof a == "number") {
            let inputSize = a;
            let hiddenSize = b;
            let outputSize = c;
            // Weights from input to hidden
            this.weightsIH = new Matrix(hiddenSize, inputSize).randomize();
            // Weights from hidden to output
            this.weightsHO = new Matrix(outputSize, hiddenSize).randomize();
            // Bias for hidden layer
            this.biasHidden = new Matrix(hiddenSize, 1).randomize();
            // Bias for output layer
            this.biasOutput = new Matrix(outputSize, 1).randomize();
        } else if(a instanceof Matrix) {
            this.weightsIH = a;
            this.weightsHO = b;
            this.biasHidden = c;
            this.biasOutput = d;
        }

    }

    /**
     * Get the predicted output for a given input
     * @param {Array} inputData 
     * @returns {Matrix}
     */
    getOutput(inputData) {
        let input = Matrix.fromArray(inputData);
        // Multiply by weights to get hidden
        let hidden = Matrix.multiply(this.weightsIH, input);
        // Add biases
        hidden.add(this.biasHidden);
        // Apply activation fucntion (tanh)
        hidden.map((x) => Math.tanh(x));
        // Multiply by weights to get output
        let output = Matrix.multiply(this.weightsHO, hidden);
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
        let bh = this.biasHidden.copy();
        let bo = this.biasOutput.copy();
        return new NeuralNetwork(wih, who, bh, bo);
    }

    applyMutations(mutationChance) {
        this.mutate(this.weightsIH, mutationChance);
        this.mutate(this.weightsHO, mutationChance);
        this.mutate(this.biasHidden, mutationChance);
        this.mutate(this.biasOutput, mutationChance);
    }

    toString() {
        return `${this.weightsIH.toString()}\n${this.weightsHO.toString()}\n${this.biasHidden.toString()}\n${this.biasOutput.toString()}`
    }
}