const SQ = squareSize = 10;
const VACANT = "WHITE"; // color of an empty square

const GAMEWIDTH = 100;
const GAMEHEIGHT = 200;


let activeGames = [];
let completedGames = [];


const POPULATION = 500;
const MUTATION_CHANCE = 0.01;

let TIMESCALE = 1000;
let DRAW = true;

let canvList = [];

let lastGenerationTime = Date.now();

for (let i = 0; i < POPULATION; i++) {
    let d = document.createElement("span");
    d.setAttribute("style", "display: inline-block; margin: 10px");

    let canv = document.createElement("canvas");
    canv.setAttribute("width", GAMEWIDTH.toString());
    canv.setAttribute("height", GAMEHEIGHT.toString());
    canv.setAttribute("style", "border: 1px solid black");
    let scoreCounter = document.createElement("div")
    d.appendChild(canv);
    d.appendChild(scoreCounter);
    document.getElementById("gameDisplay").appendChild(d);
    canvList.push(d);
    activeGames.push(new Game(canv, scoreCounter, TIMESCALE, false, false));
}
// Wild DOM hack to turn a HTMLCollection into an array
let canvasses = Array.prototype.slice.call(canvList);

let cv = document.getElementById("neuralDisplay");
let draw = new Drawer(cv.getContext("2d"));

function nextGeneration() {
    
    let outputPop = [];

    // completedGames.sort((a, b) => (a.fitness > b.fitness) ? -1 : ((b.fitness > a.fitness) ? 1 : 0));
    // console.log(completedGames.map(g => g.fitness));
    draw.drawNN(completedGames[0].game.neuralNet);
    let tempCanvasses = canvasses.slice().reverse();;

    while (outputPop.length < POPULATION) {
        let newBrain = weighted_random(completedGames).game.neuralNet.copy();
        let c = tempCanvasses.pop();
        let g;
        // Draw the best from last generation, mutate every other one
        if (outputPop.length == 0 && DRAW) {
            g = new Game(c.getElementsByTagName("canvas")[0], c.getElementsByTagName("div")[0], TIMESCALE, false, true, newBrain)
        } else {
            newBrain.applyMutations(MUTATION_CHANCE);
            g = new Game(c.getElementsByTagName("canvas")[0], c.getElementsByTagName("div")[0], TIMESCALE, false, false, newBrain)
        }
        outputPop.push(g);
    }


    return outputPop;
}

function avg(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i].fitness;
    }
    return sum / array.length
}

function updateGames() {
    for (let game of activeGames) {
        game.update();
        if (game.gameOver) {
            completedGames.push({ game: game, fitness: game.fitness });
            activeGames.splice(activeGames.indexOf(game), 1);
        }
    }
    if (activeGames.length == 0) {
        // console.log("all games finished", completedGames);
        let deltaTime = Date.now() - lastGenerationTime;
        lastGenerationTime = Date.now();
        console.log("Max fitness: " + Math.max(...completedGames.map(g => g.fitness)), "Avg fitness: " + avg(completedGames), "Generation time: " + deltaTime);
        activeGames = nextGeneration();
        completedGames = [];
        console.log("restarting...")
    }
    // requestAnimationFrame(updateGames);

}


setInterval(updateGames, 0.1)
// while(true){
//     updateGames();
// }
