class Connection {
    constructor(fromNode, toNode, weight) {
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.weight = weight;
    }

    getInnovation() {
        // Cantor pairing function
        let k1 = this.fromNode.id;
        let k2 = this.toNode.id;
        return 0.5 * (k1+k2) *(k1+k2+1) + k2
    }

    copy() {
        return new Connection(this.fromNode, this.toNode, this.weight);
    }

    toString() {
        return this.fromNode.id + " -> " + this.toNode.id + " : " + this.weight;
    }
}