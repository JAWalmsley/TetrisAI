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
            agent.brain = newBrain;
            agent.fitness = 0;

            this.agents.push(agent);
        }
    }

    nextGeneration() {
        let nextPop = [];
        this.agents.sort((a, b) => b.fitness - a.fitness);
        // Add top 20% of agents to next generation
        for (let i = 0; i < this.population * 0.2; i++) {
            nextPop.push({ brain: this.agents[i].brain, fitness: 0 });
        }
        // Crossover fill the next 80% of population
        for (let i = Math.floor(this.population*0.2); i < this.population * 0.8; i++) {
            let rand1 = this.NetToGenome(this.agents[Math.floor(Math.random() * this.agents.length)].brain);
            let rand2 = this.NetToGenome(this.agents[Math.floor(Math.random() * this.agents.length)].brain);
            nextPop.push({ brain: NeuralNetwork.fromGenome(this.crossover(rand1, rand2)), fitness: 0 });
        }
        this.agents = nextPop;
        this.performMutations(0.1, 0.08, 0.8);
    }

    performMutations(addNode, addConnection, mutateWeight) {

        for (let agent of this.agents) {
            let r = Math.random();
            if (r > this.mutationChance) {
                continue;
            }
            // if (agent.brain.weightsIH.rows >= this.numInputs) {
            //     continue;
            // }
            let genome = this.NetToGenome(agent.brain);
            let rand = Math.random();
            if (rand < addNode) {
                // Create new hidden node
                let breakGene;
                while (true) {
                    breakGene = genome[Math.floor(Math.random() * (genome.length - 1))];
                    if (breakGene.input.startsWith('i') && breakGene.output.startsWith('o')) {
                        break;
                    }
                }
                // Remove old gene
                genome.splice(genome.indexOf(breakGene), 1);
                // Remove 'i' or 'o' prefix
                let input = breakGene.in();
                let output = breakGene.out();
                let g1 = this.createGene(input, 'i', agent.brain.weightsIH.rows, 'h', 1);
                let g2 = this.createGene(agent.brain.weightsIH.rows, 'h', output, 'o', breakGene.weight);
                genome.push(g1);
                genome.push(g2);
            }
            rand = Math.random();
            if (rand < addConnection) {
                // Add connection between two existing nodes
                let input = Math.floor(Math.random() * agent.brain.weightsIH.cols);
                let hidden = Math.floor(Math.random() * agent.brain.weightsIH.rows);
                let newGene = this.createGene(input, 'i', hidden, 'h', Math.random() * 2 - 1);
                genome = genome.filter(gene => gene.innovation != newGene.innovation);
                genome.push(newGene);
            }
            rand = Math.random();
            if (rand < mutateWeight) {
                //Mutate weight of a random connection
                let gene = genome[Math.floor(Math.random() * genome.length)];
                gene.weight += gaussianRandom();
            }
            agent.brain = NeuralNetwork.fromGenome(genome);
        }
    }

    createGene(input, inLayer, output, outLayer, weight) {
        return new Gene(`${inLayer}${input}`, `${outLayer}${output}`, weight, true, this.getInnovationNumber(`i${input}`, `o${output}`));
    }

    crossover(genome1, genome2) {
        let output = [];
        genome1.sort((a, b) => a.innovation - b.innovation);
        genome2.sort((a, b) => a.innovation - b.innovation);
        let g1 = 0;
        let g2 = 0;
        while (g1 < genome1.length || g2 < genome2.length) {
            if (genome1[g1] && genome2[g2] && genome1[g1].innovation == genome2[g2].innovation) {
                if (Math.random() < 0.5) {
                    output.push(genome1[g1])
                } else {
                    output.push(genome2[g2])
                }
                g1++;
                g2++;
            } else if (genome2[g2] && (genome1[g1] == undefined || genome1[g1].innovation > genome2[g2].innovation)) {
                // Genome 2 has an innovation that genome 1 doesn't, or it's the only one left
                output.push(genome2[g2])
                g2++;
            } else {
                // Genome 1 has an innovation that genome 2 doesn't
                output.push(genome1[g1])
                g1++;
            }
        }
        return output;
    }

    NetToGenome(network) {
        let genome = [];
        network.weightsIH.foreach((x, r, c) => {
            let g = new Gene(`i${c}`, `h${r}`, x, true, this.getInnovationNumber(`i${c}`, `h${r}`));
            if (x == 0)
                g.enable = false;
            genome.push(g);
        });
        network.weightsHO.foreach((x, r, c) => {
            let g = new Gene(`h${c}`, `o${r}`, x, true, this.getInnovationNumber(`h${c}`, `o${r}`));
            if (x == 0)
                g.enable = false;
            genome.push(g);
        });
        network.weightsOI.foreach((x, r, c) => {
            let g = new Gene(`i${c}`, `o${r}`, x, true, this.getInnovationNumber(`i${c}`, `o${r}`));
            if (x == 0)
                g.enable = false;
            genome.push(g);
        });
        network.biasHidden.foreach((x, r, c) => {
            let g = new Gene(`b`, `h${r}`, x, true, this.getInnovationNumber(`b`, `h${r}`));
            if (x == 0)
                g.enable = false;
            genome.push(g);
        });
        network.biasOutput.foreach((x, r, c) => {
            let g = new Gene(`b`, `o${r}`, x, true, this.getInnovationNumber(`b`, `o${r}`));
            if (x == 0)
                g.enable = false;
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