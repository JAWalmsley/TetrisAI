class Drawer {
    constructor(ctx) {
        this.ctx = ctx
    }

    drawSquare(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

        ctx.strokeStyle = "BLACK";
        ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
    }
}