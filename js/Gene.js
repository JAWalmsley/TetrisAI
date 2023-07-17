class Gene {
    constructor(input, output, weight, enable, innovation) {
        this.input = input;
        this.output = output;
        this.weight = weight;
        this.enable = enable;
        this.innovation = innovation;
    }

    in() {
        return parseInt(this.input.substring(1));
    }

    layerIn() {
        return this.input.substring(0, 1);
    }

    out() {
        return parseInt(this.output.substring(1));
    }

    layerOut() {
        return this.output.substring(0, 1);
    }

    static getInnovationNumber(gene) {
        
    }
}