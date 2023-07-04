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
        this.speciate(3);
        console.log(this.species.length);
        let totalPopulationFitness = 0;
        this.species.map((species) => totalPopulationFitness += species.averageFitness);
        this.agents = [];
        for (let species of this.species) {
            // Size of next gen is proportional to the fitness of this species (better ones get more offspring)
            let nextGenSize = Math.floor(species.averageFitness / totalPopulationFitness * this.population);
            let nextPop = [];
            species.members.sort((a, b) => b.fitness - a.fitness);
            // Elitism: Add top 20% of agents to next generation
            for (let i = 0; i < Math.min(Math.floor(nextGenSize * 0.2), species.members.length); i++) {
                nextPop.push({ brain: species.members[i].brain.copy(), fitness: 0 });
            }
            // Crossover to reproduct and fill the next generation
            for (let i = 0; i < Math.floor(nextGenSize * 0.8); i++) {
                let rand1 = this.naturalSelection(species.members).brain;
                let rand2 = this.naturalSelection(species.members).brain;
                let newBrain = rand1.crossover(rand2);
                newBrain.applyMutations(0.8, 0.05, 0.03);
                nextPop.push({ brain: newBrain, fitness: 0 });
            }
            // species.representative = species.members[Math.floor(Math.random() * species.members.length)].brain;
            this.agents.push(...nextPop);
            species.members = nextPop;
        }

        // for(let agent of this.agents) {
        //     agent.brain.applyMutations(0.8, 0.05, 0.03);
        // }

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
            species.averageFitness = 0;
        }
        this.agents.forEach((agent) => {
            let foundSpecies = false;
            for (let species of this.species) {
                if (agent.brain.geneticDistance(species.representative) < threshold) {
                    species.members.push(agent);
                    // Formula for adding averages
                    // https://math.stackexchange.com/questions/22348/how-to-add-and-subtract-values-from-an-average
                    species.averageFitness = species.averageFitness + (agent.fitness - species.averageFitness) / species.members.length;
                    foundSpecies = true;
                    break;
                }
            }
            if (!foundSpecies) {
                this.species.push({ representative: agent.brain, members: [agent], averageFitness: agent.fitness });
            }
        })

        // Remove any species with no members or just one (can't reproduce)
        this.species = this.species.filter((species) => species.members.length > 1);
    }

    naturalSelection(agentList) {
        let totalFitness = 0;
        for (let agent of agentList) {
            totalFitness += agent.fitness;
        }
        let rand = Math.random() * totalFitness;
        for (let agent of agentList) {
            rand -= agent.fitness;
            if (rand <= 0) {
                return agent;
            }
        }
    }
}