const SQ = squareSize = 10;
const VACANT = "WHITE"; // color of an empty square

const GAMEWIDTH = 100;
const GAMEHEIGHT = 200;


let activeGames = [];
let completedGames = [];

const POPULATION = 200;
const MUTATION_CHANCE = 1;

let TIMESCALE = 1000;
let DRAW = true;

let canvList = [];

let lastGenerationTime = Date.now();

let generationNumber = 0;

for (let i = 0; i < POPULATION + 1; i++) {
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
}


let cv = document.getElementById("neuralDisplay");
let draw = new Drawer(cv.getContext("2d"));

let inlbl = [];
for (let i = 0; i < 10; i++) {
    inlbl.push("C" + i.toString() + " height");
}
inlbl.push("Z", "S", "T", "O", "L", "I", "J");
inlbl.push("Piece Y", "Piece X", "Piece Rotation");

let NEATManager = new NEAT(POPULATION, 10 + 10 + 1, 3, inlbl, ["left", "right", "rotate"]);
NEATManager.createPopulation();

function nextGeneration() {
    draw.drawNN(NEATManager.agents[0].brain);
    NEATManager.nextGeneration();
    activeGames = [];
    setUp();
}

function setUp() {
    // Wild DOM hack to turn a HTMLCollection into an array
    let canvasses = Array.prototype.slice.call(canvList);

    for (let i = 0; i < NEATManager.agents.length; i++) {
        let agent = NEATManager.agents[i];
        let div = canvasses.pop();
        let g;
        if (i == 0) {
            div = canvasses[0];
            g = new Game(div.getElementsByTagName("canvas")[0], div.getElementsByTagName("div")[0], TIMESCALE, false, DRAW, agent.brain,
                (fitness) => {
                    NEATManager.agents[i].fitness = fitness
                });
        }
        else {
            g = new Game(div.getElementsByTagName("canvas")[0], div.getElementsByTagName("div")[0], TIMESCALE, false, false, agent.brain,
                (fitness) => {
                    NEATManager.agents[i].fitness = fitness;
                });
        }

        activeGames.push(g);
    }
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
        let deltaTime = Date.now() - lastGenerationTime;
        lastGenerationTime = Date.now();
        console.log("Gen", generationNumber++,
            "Max fitness:", Math.max(...completedGames.map(g => g.fitness)),
            "Avg fitness:", avg(NEATManager.agents.map(x => x.fitness)),
            "Generation time:", deltaTime);
        completedGames = [];
        console.log("restarting...")
        nextGeneration();
    }
    // requestAnimationFrame(updateGames);
}

setUp();
updateGames();
setInterval(updateGames, 0.01)