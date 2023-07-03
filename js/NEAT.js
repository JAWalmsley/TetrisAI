class NEAT {
    constructor(population, mutationChance, numInputs, numOutputs, inputLabels, outputLabels) {
        this.population = population;
        this.mutationChance = mutationChance;
        this.innovation = 0;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.inputLabels = inputLabels;
        this.outputLabels = outputLabels;
        this.agents = [];
        this.genes = [];
        this.species = [];
    }

    createPopulation() {
        while (this.agents.length < this.population) {
            let newBrain = new NeuralNetwork(this.numInputs, 0, this.numOutputs, null, null, this.inputLabels, this.outputLabels);
            let agent = {};
            agent.brain = newBrain;
            agent.fitness = 0;

            this.agents.push(agent);
        }
    }

    nextGeneration() {
        this.speciate(0.1);
        this.agents = [];
        for (let species of this.species) {
            let nextPop = [];
            species.members.sort((a, b) => b.fitness - a.fitness);
            for (let i = 0; i < species.members.length * 0.2; i++) {
                nextPop.push({ brain: species.members[i].brain, fitness: 0 });
            }
            for (let i = 0; i < Math.floor(species.members.length * 0.8); i++) {
                let rand1 = this.NetToGenome(species.members[Math.floor(Math.random() * species.members.length)].brain);
                let rand2 = this.NetToGenome(species.members[Math.floor(Math.random() * species.members.length)].brain);
                nextPop.push({ brain: NeuralNetwork.fromGenome(this.crossover(rand1, rand2), this.inputLabels, this.outputLabels), fitness: 0 });
            }
            if (nextPop.length == 0) {
                this.species.splice(this.species.indexOf(species), 1);
                continue;
            }
            species.representative = this.NetToGenome(species.members[Math.floor(Math.random() * species.members.length)].brain);
            species.members = [];
            this.agents.push(...nextPop);
        }
        // let nextPop = [];
        // this.agents.sort((a, b) => b.fitness - a.fitness);
        // Add top 20% of agents to next generation
        // for (let i = 0; i < this.population * 0.2; i++) {
        //     nextPop.push({ brain: this.agents[i].brain, fitness: 0 });
        // }
        // Crossover fill the next 80% of population
        // for (let i = Math.floor(this.population*0.2); i < this.population * 0.8; i++) {
        //     let rand1 = this.NetToGenome(this.agents[Math.floor(Math.random() * this.agents.length)].brain);
        //     let rand2 = this.NetToGenome(this.agents[Math.floor(Math.random() * this.agents.length)].brain);
        //     nextPop.push({ brain: NeuralNetwork.fromGenome(this.crossover(rand1, rand2), this.inputLabels, this.outputLabels), fitness: 0 });
        // }
        // this.agents = nextPop;
        this.performMutations(0.03, 0.3, 0.01);
    }

    getCompatabilityDifference(gen1, gen2) {
        // Coefficients and formula from the NEAT paper
        // https://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf
        let c1 = 1.0;
        let c2 = 1.0;
        let c3 = 0.4;
        let E = 0;
        let D = 0;
        let N = Math.max(gen1.length, gen2.length);

        let g1 = 0;
        let g2 = 0;

        let weightDiffs = [];

        let genome1 = gen1.toSorted((a, b) => a.innovation - b.innovation);
        let genome2 = gen2.toSorted((a, b) => a.innovation - b.innovation);
        while (g1 < genome1.length || g2 < genome2.length) {
            if (genome1[g1] && genome2[g2] && genome1[g1].innovation == genome2[g2].innovation) {
                weightDiffs.push(genome1[g1].weight - genome2[g2].weight);
                g1++;
                g2++;
            } else if (genome2[g2] && (genome1[g1] == undefined || genome1[g1].innovation > genome2[g2].innovation)) {
                // Genome 2 has an innovation that genome 1 doesn't
                // Disjoint gene
                D++;
                g2++;
            } else {
                // Genome 1 has an innovation that genome 2 doesn't
                E++;
                g1++;
            }
        }

        let W = avg(weightDiffs);
        return c1 * E / N + c2 * D / N + c3 * W;
    }

    speciate(threshold) {
        this.agents.forEach((agent) => {
            let foundSpecies = false;
            for (let species of this.species) {
                if (this.getCompatabilityDifference(this.NetToGenome(agent.brain), species.representative) < threshold) {
                    species.members.push(agent);
                    foundSpecies = true;
                    break;
                }
            }
            if (!foundSpecies) {
                this.species.push({ representative: this.NetToGenome(agent.brain), members: [agent] });
            }
        })
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

            for (let i = 0; i < genome.length; i++) {
                rand = Math.random();
                if (rand < mutateWeight) {
                    //Mutate weight of a random connection
                    let gene = genome[Math.floor(Math.random() * genome.length)];
                    gene.weight += gaussianRandom();
                }
            }
            agent.brain = NeuralNetwork.fromGenome(genome, this.inputLabels, this.outputLabels);
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