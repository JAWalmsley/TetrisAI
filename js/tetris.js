const SQ = squareSize = 20;
const VACANT = "WHITE"; // color of an empty square

let currGame = new Game(document.getElementById("game"), document.getElementById("score"), 5, true);

// let game2 = new Game(document.getElementById("game2"), 5, false);

function updateGames(){
    currGame.update();
    // game2.update();
    requestAnimationFrame(updateGames);
}

updateGames();