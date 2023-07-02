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
        while (this.agents.length < this.population) {
            let newBrain = new NeuralNetwork(this.numInputs, 0, this.numOutputs);
            let agent = {};

            // newBrain.applyMutations(this.mutationChance);

            agent.brain = newBrain;
            agent.fitness = 0;

            this.agents.push(agent);
        }
    }

    performMutations(an, ac, mw) {
        let totalChance = an + ac + mw;
        let addNode = an / totalChance;
        let addConnection = ac / totalChance;
        let mutateWeight = mw / totalChance;

        for (let agent of this.agents) {
            let r = Math.random();
            if (r > this.mutationChance) {
                continue;
            }
            if(agent.brain.weightsIH.rows >= this.numInputs) {
                continue;
            }
            let genome = this.NetToGenome(agent.brain);
            let rand = Math.random();
            if (rand < addNode) {
                let breakGene;
                while (true) {
                    breakGene = genome[Math.floor(Math.random() * (genome.length - 1))];
                    if (breakGene.input.startsWith('i') && breakGene.output.startsWith('o')) {
                        break;
                    }
                }
                console.log(this.agents.indexOf(agent), breakGene.input, breakGene.output);
                // Remove 'i' or 'o' prefix
                let input = breakGene.input.substring(1);
                let output = breakGene.output.substring(1);
                agent.brain.createHiddenNode(input, output, agent.brain.weights);
            } else if (rand < addNode + addConnection) {
                // Limited number of attempts just in case everything is connected already
                for(let i =0; i < this.numInputs * this.numOutputs; i++) {
                    let input = Math.floor(Math.random() * agent.brain.weightsIH.cols);
                    let hidden = Math.floor(Math.random() * agent.brain.weightsIH.rows);
                    if(!agent.brain.weightsIH.data[hidden][input] || agent.brain.weightsIH.data[hidden][input] == 0) {
                        console.log(this.agents.indexOf(agent), "making connection", input, hidden);
                        agent.brain.weightsIH.data[hidden][input] = Math.random() * 2 - 1;
                        break;
                    }
                }
            } else if (rand < addNode + addConnection + mutateWeight) {
                
            }
        }
    }

    NetToGenome(network) {
        let genome = [];
        network.weightsIH.foreach((x, r, c) => {
            let g = new Gene(`i${c}`, `h${r}`, x, true, this.getInnovationNumber(`i${c}`, `h${r}`));
            genome.push(g);
        });
        network.weightsHO.foreach((x, r, c) => {
            let g = new Gene(`h${c}`, `o${r}`, x, true, this.getInnovationNumber(`h${c}`, `o${r}`));
            genome.push(g);
        });
        network.weightsOI.foreach((x, r, c) => {
            let g = new Gene(`i${c}`, `o${r}`, x, true, this.getInnovationNumber(`i${c}`, `o${r}`));
            genome.push(g);
        });
        network.biasHidden.foreach((x, r, c) => {
            let g = new Gene(`b`, `h${r}`, x, true, this.getInnovationNumber(`b`, `h${r}`));
            genome.push(g);
        });
        network.biasOutput.foreach((x, r, c) => {
            let g = new Gene(`b`, `o${r}`, x, true, this.getInnovationNumber(`b`, `o${r}`));
            genome.push(g);
        });
        genome.sort((a, b) => a.innovation - b.innovation);
        return genome;
    }

    getInnovationNumber(input, output) {
        let ind = -1;
        for (let i = 0; i < this.genes.length; i++) {
            let gene = this.genes[i]
            if (gene[0] == input && gene[1] == output) {
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