const SQ = squareSize = 10;
const VACANT = "WHITE"; // color of an empty square

let activeGames = [];

// let currGame = new Game(document.getElementById("game"), document.getElementById("score"), 5, true);

// let game2 = new Game(document.getElementById("game2"), 5, false);
for(let i = 0; i < 10; i++) {
    let d = document.createElement("span");
    d.setAttribute("style", "display: inline-block; margin: 10px");

    let canv = document.createElement("canvas");
    canv.setAttribute("width", "150");
    canv.setAttribute("height", "200");
    canv.setAttribute("style", "border: 1px solid black");
    let scoreCounter = document.createElement("div")
    d.appendChild(canv);
    d.appendChild(scoreCounter);
    document.body.appendChild(d);
    activeGames.push(new Game(canv, scoreCounter, 5, true));
}

function updateGames(){
    for(let game of activeGames) {
        game.update();
    }
    requestAnimationFrame(updateGames);
}

updateGames();