class ATNeuralNetwork {
    constructor(inputs, outputs, inputLabels, outputLabels) {
        // Inputs plus 1 for bias, this will be inputs[0]
        // 0 : bias, [1-inputs): input nodes, [inputs-inputs+outputs): output nodes, rest are hidden nodes
        this.weights = new Matrix(inputs + 1, outputs).randomize();
        this.inputLabels = inputLabels;
        this.outputLabels = outputLabels;
    }

    getOutput(inputData) {
        let input = Matrix.fromArray(inputData);
        let nodeValues = [];
        for(let i = 1; i < input.rows+1; i++) {
            this.weights.data[i][0] = input.data[i][0];
        }
    }
}