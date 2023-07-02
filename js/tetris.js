const SQ = squareSize = 10;
const VACANT = "WHITE"; // color of an empty square

const GAMEWIDTH = 100;
const GAMEHEIGHT = 200;

const TIMESCALE = 100;

let activeGames = [];
let completedGames = [];


const POPULATION = 50
const MUTATION_CHANCE = 0.1;

let canvList = [];

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
    activeGames.push(new Game(canv, scoreCounter, TIMESCALE, false));
}
// Wild DOM hack to turn a HTMLCollection into an array
let canvasses = Array.prototype.slice.call(canvList);

let cv = document.getElementById("neuralDisplay");
let draw = new Drawer(cv.getContext("2d"));

function nextGeneration() {
    let outputPop = [];
    // let totalFitness = 0;
    // for (let entry of completedGames) {
    //     totalFitness += entry.fitness;
    // }
    // for (let j = 0; j < POPULATION; j++) {
    //     let i = 0;
    //     let post = Math.random() * totalFitness;
    //     while (post > 0) {
    //         post -= completedGames[i].fitness;
    //         i++;
    //     }
    //     i--;
    //     let g = new Game(completedGames[j].game.canvas, completedGames[j].game.scoreElement, TIMESCALE, false, completedGames[i].game.neuralNet.copy().applyMutations());
    //     outputPop.push(g);
    // }

    completedGames.sort((a, b) => (a.fitness > b.fitness) ? -1 : ((b.fitness > a.fitness) ? 1 : 0));
    console.log(completedGames.map(g => g.fitness));
    draw.drawNN(completedGames[0].game.neuralNet);
    let tempCanvasses = canvasses.slice();
    for (let j = 0; j < POPULATION / 2; j++) {
        for (let i = 0; i < 2; i++) {
            let newBrain = completedGames[j].game.neuralNet.copy();
            newBrain.applyMutations(MUTATION_CHANCE);
            let c = tempCanvasses.pop();
            let g = new Game(c.getElementsByTagName("canvas")[0], c.getElementsByTagName("div")[0], TIMESCALE, false, newBrain);

            outputPop.push(g);
        }
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
        console.log("Max fitness: " + Math.max(...completedGames.map(g => g.fitness)), "Avg fitness: " + avg(completedGames));
        activeGames = nextGeneration();
        completedGames = [];
        console.log("restarting...")
    }
    requestAnimationFrame(updateGames);

}

updateGames();