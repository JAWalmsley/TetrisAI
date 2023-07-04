class NEAT {
    constructor(population, numInputs, numOutputs, inputLabels, outputLabels) {
        this.population = population;
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
        for (let i = 0; i < this.population; i++) {
            let network = new ATNeuralNetwork(this.numInputs, this.numOutputs, this.inputLabels, this.outputLabels);
            network.initialize();
            network.refreshNodes();
            network.applyMutations(0.8, 0.05, 0.03);
            this.agents.push({ brain: network, fitness: 0 });
        }
    }

    nextGeneration() {
        this.speciate(2);
        console.log(this.species.length);
        let totalPopulationFitness = 0;
        this.species.map((species) => totalPopulationFitness += species.totalFitness);
        this.agents = [];
        for (let species of this.species) {
            // Size of next gen is proportional to the fitness of this species (better ones get more offspring)
            let nextGenSize = Math.floor(species.totalFitness / totalPopulationFitness * this.population);
            let nextPop = [];
            species.members.sort((a, b) => b.fitness - a.fitness);
            // Elitism: Add top 20% of agents to next generation
            // for (let i = 0; i < nextGenSize * 0.2; i++) {
            //     nextPop.push({ brain: species.members[i].brain.copy(), fitness: 0 });
            // }
            // Crossover to reproduct and fill the next generation
            for (let i = 0; i < nextGenSize; i++) {
                let rand1 = species.members[Math.floor(Math.random() * species.members.length)].brain;
                let rand2 = species.members[Math.floor(Math.random() * species.members.length)].brain;
                nextPop.push({ brain: rand1.crossover(rand2), fitness: 0 });
            }
            species.representative = species.members[Math.floor(Math.random() * species.members.length)].brain;
            this.agents.push(...nextPop);
            species.members = nextPop;
        }

        for(let agent of this.agents) {
            agent.brain.applyMutations(0.8, 0.5, 0.3);
        }

        // let nextPop = [];
        // this.agents.sort((a, b) => b.fitness - a.fitness);
        // // Add top 20% of agents to next generation
        // for (let i = 0; i < this.population * 0.2; i++) {
        //     nextPop.push({ brain: this.agents[i].brain.copy(), fitness: 0 });
        // }
        // // Crossover fill the next 80% of population
        // for (let i = 0; i < this.population * 0.8; i++) {
        //     let rand1 = this.agents[Math.floor(Math.random() * this.agents.length)].brain;
        //     let rand2 = this.agents[Math.floor(Math.random() * this.agents.length)].brain;
        //     nextPop.push({ brain: rand1.crossover(rand2), fitness: 0 });
        // }
        // for(let agent of nextPop) {
        //     agent.brain.applyMutations(0.8, 0.05, 0.03);
        // }
        // this.agents = nextPop;
    }

    speciate(threshold) {
        // Clear species members
        for (let species of this.species) {
            species.members = [];
        }
        this.agents.forEach((agent) => {
            let foundSpecies = false;
            for (let species of this.species) {
                if (agent.brain.geneticDistance(species.representative) < threshold) {
                    species.members.push(agent);
                    species.totalFitness += agent.fitness;
                    foundSpecies = true;
                    break;
                }
            }
            if (!foundSpecies) {
                this.species.push({ representative: agent.brain, members: [agent], totalFitness: agent.fitness });
            }
        })

        // Remove any species with no members or just one (can't reproduce)
        this.species = this.species.filter((species) => species.members.length > 1);
    }
}