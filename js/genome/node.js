class Node {
    /**
     * 
     * @param {*} innovation 
     * @param {*} layer 
     * @param {*} isOutput 
     * @param {*} bias 
     */
    constructor(layer, isOutput, bias, id) {
        // Layer 0: input, hidden after
        this.layer = layer;
        this.isOutput = isOutput;
        this.bias = bias;
        this.id = id;

        this.outboundConnections = [];
        this.inputValues = [];
        this.outputValue = 0;
    }

    static isConnected(node1, node2) {
        if(node1.outputsTo(node2) || node2.outputsTo(node1)) {
            return true;
        }
        return false;
    }

    addInput(val) {
        this.inputValues.push(val);
        if(this.layer == 0 && this.inputValues.length > 1) {
            console.error("Input node has more than one input value");
        }
    }

    calculateOutputAndSendFoward() {
        if(this.layer == 0) {
            // Input layer has one input and no activation function
            this.outputValue = this.inputValues[0]
        } else {
            this.outputValue = Math.tanh(sumArr(this.inputValues) + this.bias);
        }
    }

    copy() {
        return new Node(this.layer, this.isOutput, this.bias, this.id);
    }

    outputsTo(node) {
        if(this.layer == node.layer) {
            return false;
        }
        if(this.layer > node.layer) {
            return false;
        }
        for(let conn of this.outboundConnections) {
            if(conn.toNode == node) {
                return true;
            }
        }
    }
}