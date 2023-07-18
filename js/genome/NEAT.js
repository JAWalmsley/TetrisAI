const ELITISM = 0.2;
const WEIGHT = 0.8;
const NEWCONN = 0.05;
const NEWNODE = 0.03;

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
            // network.applyMutations(0.8, 0.05, 0.0);
            this.agents.push({ brain: network, fitness: 0 });
        }
    }

    nextGeneration() {
        this.speciate(0.13);
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
            for (let i = 0; i < Math.min(Math.floor(nextGenSize * ELITISM), species.members.length); i++) {
                let newBrain = species.members[i].brain.copy();
                // newBrain.applyMutations(WEIGHT, NEWCONN, NEWNODE);
                nextPop.push({ brain: newBrain, fitness: 0 });
            }
            // Crossover to reproduct and fill the next generation
            for (let i = 0; i < Math.floor(nextGenSize * (1 - ELITISM)); i++) {
                let rand1 = this.naturalSelection(species.members).brain;
                let rand2 = this.naturalSelection(species.members).brain;
                let newBrain = rand1.crossover(rand2);
                newBrain.applyMutations(WEIGHT, NEWCONN, NEWNODE);
                nextPop.push({ brain: newBrain, fitness: 0 });
            }
            // species.representative = species.members[Math.floor(Math.random() * species.members.length)].brain;
            this.agents.push(...nextPop);
            species.members = nextPop;
        }
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

        // Remove any species with no members
        this.species = this.species.filter((species) => species.members.length > 0);
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
        console.error("didnt select anything!!!", agentList, totalFitness, rand)
    }
}