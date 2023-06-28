const cvs = document.getElementById("game");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const SQ = squareSize = 20;
const ROW = cvs.clientHeight / SQ;
const COL = COLUMN = cvs.clientWidth / SQ;
const VACANT = "WHITE"; // color of an empty square

const FRAMETIME = 1000;

let score = 0;

let currGame = new Game(new Drawer(ctx), 5, true);

let gam2 = new Game(new Drawer(document.getElementById("game2").getContext("2d")), 5, false);

function updateGames(){
    currGame.update();
    gam2.update();
    requestAnimationFrame(updateGames);
}

updateGames();