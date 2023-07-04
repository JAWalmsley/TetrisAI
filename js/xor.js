let POPULATION = 500;

let NM = new NEAT(POPULATION, 3, 2, ["x", "y", "bias"], ["output"]);

NM.createPopulation();
let generationNumber = 0;
let drawers = [];
for (let i = 0; i < 2; i++) {
    let canv = document.createElement("canvas");
    canv.setAttribute("width", 400);
    canv.setAttribute("height", 100);
    canv.setAttribute("style", "border: 1px solid black");
    document.getElementById("neuralNets").appendChild(canv);
    drawers.push(new Drawer(canv.getContext("2d")));
}


function nextGeneration() {
    for (let i = 0; i < Math.min(NM.species.length, drawers.length); i++) {
        if (NM.species[i].members.length == 0) {
            continue;
        }
        // NEATManager.species[i].representative.inputLabels = [NEATManager.species[i].averageFitness.toString().substr(0, 5)]
        // drawers[i].drawNN(NM.species[i].members[0].brain);
    }
    NM.nextGeneration();
}

let intr;
let best;

function getOutputs(agent) {

    let agentOut = [];
    for (let i = 0; i < inputs.length; i++) {
        let o = agent.brain.getOutput([...inputs[i], 1]);
        agentOut.push(o[0] > o[1])
    }
    return agentOut;
}

let inputs = [[0, 0], [1, 0], [0, 1], [1, 1]];
let desiredOutputs = [0, 1, 1, 0];
function game() {
    best = null;
    for (let agent of NM.agents) {
        
        let o = getOutputs(agent);
        // o = [0, 1, 1, 0]
        for (let i = 0; i < o.length; i++) {
            agent.fitness += 2 - Math.abs(o[i] - desiredOutputs[i]);
        }
        if(!best || agent.fitness > best.fitness) {
            best = agent;
        }

        if (agent.fitness > 7.8) {
            console.log("Found solution");
            best = agent;
            console.log(agent.brain);
            clearInterval(intr);
            break;
        }
        
    }
    drawers[0].drawNN(best.brain);
    drawers[1].drawGrid(getOutputs(best), 2)
    console.log("Gen", generationNumber++,
        "Max fitness:", best.fitness,
        "Avg fitness:", avg(NM.agents.map(x => x.fitness)));
    nextGeneration();
}

intr = setInterval(game, 10);