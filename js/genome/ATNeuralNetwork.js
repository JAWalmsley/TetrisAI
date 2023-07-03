class ATNeuralNetwork {
    constructor(inputs, outputs, inputLabels = [], outputLabels = []) {
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
            this.nodes.push(new Node(0, false, this.nodes.length));
        }

        for (let i = 0; i < this.numOutputs; i++) {
            this.nodes.push(new Node(1, true, this.nodes.length));
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
        if (Math.random() < weightChance) {
            for (let conn of this.connections) {
                conn.weight += gaussianRandom(0, 0.5);
            }
        }

        // Add connection between existing nodes
        if (Math.random() < addChance) {
            if (!this.checkFullyConnected()) {
                let node1 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                let node2 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                while (node1.layer == node2.layer || node1.outputsTo(node2) || node2.outputsTo(node1)) {
                    node1 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                    node2 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
                }

                let fromNode;
                let toNode;

                if (node1.layer < node2.layer) {
                    fromNode = node1;
                    toNode = node2;
                } else {
                    fromNode = node2;
                    toNode = node1;
                }
                let newConn = new Connection(fromNode, toNode, Math.random() * 2 - 1);
                this.connections.push(newConn);
            }
        }

        // Add node between existing ones (split connection)
        if (Math.random() < splitChance) {
            let pickedConn = this.connections[Math.floor(Math.random() * this.connections.length)];
            // Disable connection that we are splitting
            this.connections.splice(this.connections.indexOf(pickedConn), 1);

            let newNode = new Node(pickedConn.fromNode.layer + 1, false, this.nodes.length);
            // Create a new layer between the two existing layers, shift the ones on it down
            for (let node of this.nodes) {
                if (node.layer > pickedConn.fromNode.layer) {
                    node.layer++;
                }
            }

            this.layers++;

            // Create connections to the new node [from -> 1 -> new -> oldWeight -> to] (as in the paper)
            let con1 = new Connection(pickedConn.fromNode, newNode, 1);
            let con2 = new Connection(newNode, pickedConn.toNode, pickedConn.weight);

            this.connections.push(con1, con2);
            this.nodes.push(newNode);
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

    checkFullyConnected() {
        let maximum = 0;
        let numLayers

        let layerNodes = [];
        for (let node of this.nodes) {
            if (!layerNodes[node.layer]) {
                layerNodes[node.layer] = 0;
            }
            layerNodes[node.layer]++;
        }

        // Nodes can be connected to any layer greater than their own
        for (let i = 0; i < layerNodes.length - 1; i++) {
            for (let j = i + 1; j < layerNodes.length; j++) {
                maximum += layerNodes[i] * layerNodes[j];
            }
        }
        return maximum == this.connections.length;
    }
}