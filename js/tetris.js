const scoreElement = document.getElementById("score");

const SQ = squareSize = 20;
const VACANT = "WHITE"; // color of an empty square

const FRAMETIME = 1000;

let score = 0;

let currGame = new Game(document.getElementById("game"), 5, true);

// let game2 = new Game(document.getElementById("game2"), 5, false);

function updateGames(){
    currGame.update();
    // game2.update();
    requestAnimationFrame(updateGames);
}

updateGames();