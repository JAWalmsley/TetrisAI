const SQ = squareSize = 10;
const VACANT = "WHITE"; // color of an empty square

const GAMEWIDTH = 100;
const GAMEHEIGHT = 200;

let activeGames = [];


for (let i = 0; i < 1; i++) {
    let d = document.createElement("span");
    d.setAttribute("style", "display: inline-block; margin: 10px");

    let canv = document.createElement("canvas");
    canv.setAttribute("width", GAMEWIDTH.toString());
    canv.setAttribute("height", GAMEHEIGHT.toString());
    canv.setAttribute("style", "border: 1px solid black");
    let scoreCounter = document.createElement("div")
    d.appendChild(canv);
    d.appendChild(scoreCounter);
    document.body.appendChild(d);
    activeGames.push(new Game(canv, scoreCounter, 1, true));
}

let ooo = document.createElement("div");
document.body.appendChild(ooo);
function canvasToMatrix(canvas) {
    let ctx = canvas.getContext("2d");
    let o = "";
    for (let y = SQ / 2; y < GAMEHEIGHT; y += SQ) {
        
        for (let x = SQ / 2; x < GAMEWIDTH; x += SQ) {
            let rgb = ctx.getImageData(x, y, 1, 1).data;
            o = o + ` ${((rgb[0]+rgb[1]+rgb[2])<765)?1:0}`
        }
        o = o + "<br>";
        
    }
    ooo.innerHTML = o;
}
function updateGames() {
    canvasToMatrix(activeGames[0].canvas);
    for (let game of activeGames) {
        game.update();
    }
    requestAnimationFrame(updateGames);
}

updateGames();

let nn = new NeuralNetwork(4, 4, 5);
console.log(nn.toString())