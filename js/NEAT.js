class NEAT {
    constructor(population, mutationChance, numInputs, numOutputs) {
        this.population = population;
        this.mutationChance = mutationChance;
        this.innovation = 0;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.agents = [];
        this.genes = [];
    }

    createPopulation() {
        while(this.agents.length < this.population) {
            let newBrain = new NeuralNetwork(this.numInputs, 0, this.numOutputs);
            let agent = {};

            newBrain.applyMutations(this.mutationChance);

            agent.brain = newBrain;
            agent.fitness = 0;

            this.agents.push(agent);
        }
    }

    performMutations() {
        for(let agent of this.agents) {
            let genome = this.NetToGenome(agent.brain);
        }
    }

    NetToGenome(network) {
        let genome = [];
        network.weightsIH.foreach((x, r, c) => {
            let g = new Gene(c, r, x, true, this.getInnovationNumber(`i${c}`, `h${r}`));
            genome.push(g);
        });
        network.weightsHO.foreach((x, r, c) => {
            let g = new Gene(c, r, x, true, this.getInnovationNumber(`h${c}`, `o${r}`));
            genome.push(g);
        });
        network.biasHidden.foreach((x, r, c) => {
            let g = new Gene(c, r, x, true, this.getInnovationNumber(`b`, `h${r}`));
            genome.push(g);
        });
        network.biasOutput.foreach((x, r, c) => {
            let g = new Gene(c, r, x, true, this.getInnovationNumber(`b`, `o${r}`));
            genome.push(g);
        });
        genome.sort((a, b) => a.innovation - b.innovation);
        return genome;
    }

    getInnovationNumber(input, output) {
        let ind = -1;
        for(let i = 0; i < this.genes.length; i++) {
            let gene = this.genes[i]
            if(gene[0] == input && gene[1]==output) {
                ind = i;
            }
        }
        if (ind == -1) {
            this.genes.push([input, output]);
            ind = this.genes.length - 1;
        }
        return ind;
        
    }
}