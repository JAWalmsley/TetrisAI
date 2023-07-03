class ATNeuralNetwork {
    constructor(inputs, outputs, inputLabels=[], outputLabels=[]) {
        this.numInputs = inputs;
        this.numOutputs = outputs;
        this.inputLabels = inputLabels;
        this.outputLabels = outputLabels;
        this.layers = 2;

        this.nodes = [];
        this.connections = [];
    }

    initialize() {
        for (let i = 0; i < this.numInputs; i++) {
            this.nodes.push(new Node(0, false, 0, this.nodes.length));
        }

        for (let i = 0; i < this.numOutputs; i++) {
            this.nodes.push(new Node(Infinity, true, Math.random() * 2 - 1, this.nodes.length));
        }

        for (let i = 0; i < this.numInputs; i++) {
            for (let j = 0; j < this.numOutputs; j++) {
                this.connections.push(new Connection(this.nodes[i], this.nodes[this.numInputs + j], Math.random() * 2 - 1));
            }
        }
    }

    refreshNodes() {
        for (let node of this.nodes) {
            // Clear connections and previous input values
            node.outboundConnections = [];
            node.inputValues = [];
        }
        for (let conn of this.connections) {
            // Add connections from this network
            conn.fromNode.outboundConnections.push(conn);
        }

        // Sort nodes by layer so the order is correct for outputs
        this.nodes.sort((a, b) => a.layer - b.layer);
    }

    getOutput(inputData) {
        this.refreshNodes();

        // Add inputs as the only input to first layer nodes
        for (let i = 0; i < this.numInputs; i++) {
            this.nodes[i].addInput(inputData[i]);
        }

        let output = [];
        for (let node of this.nodes) {
            node.calculateOutputAndSendFoward();
            if (node.isOutput) {
                output.push(node.outputValue);
            }
        }

        return output;
    }

   

    crossover(other) {
        let child = new ATNeuralNetwork(this.numInputs, this.numOutputs, this.inputLabels, this.outputLabels);

        for (let node of this.nodes) {
            child.nodes.push(node.copy());
        }

        for (let conn of this.connections) {
            let matchingConn = this.getMatchingConnection(other, conn.getInnovation());
            if (matchingConn == null) {
                // Other parent doesn't have a connection between these two nodes, so just copy this connection
                child.connections.push(conn.copy());
            } else {
                // Other parent does have a connection, pick randomly which one we pass on
                let chosenConn = Math.random() < 0.5 ? conn : matchingConn;

                // Check if the child has the nodes that this connection is between
                let fromNode = child.getMatchingNode(chosenConn.fromNode.id);
                let toNode = child.getMatchingNode(chosenConn.toNode.id);
                if (fromNode && toNode) {
                    // Copy the weight from the chosen connection
                    child.connections.push(new Connection(fromNode, toNode, chosenConn.weight));
                }
            }
        }

        child.layers = this.layers;
        return child;
    }

    applyMutations(weightChance, addChance, splitChance) {
        // Mutate weights
        if(Math.random() < weightChance) {
            for(let conn of this.connections) {
                conn.weight += gaussianRandom(0, 0.5);
            }
        }

        // Add node between existing ones
        if(Math.random() < addChance) {
            let pickedConn = this.connections[Math.floor(Math.random() * this.connections.length)];
            // Disable connection that we are splitting
            pickedConn.weight = 0; 

        }
    }

    getMatchingConnection(other, innovation) {
        for (let conn of other.connections) {
            if (conn.getInnovation() == innovation) {
                return conn;
            }
        }
        return null;
    }

    getMatchingNode(id) {
        for (let node of this.nodes) {
            if (node.id == id) {
                return node;
            }
        }
        return null;
    }
}