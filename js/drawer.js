class Drawer {
    constructor(ctx) {
        this.ctx = ctx
    }

    drawSquare(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
        this.ctx.strokeStyle = "BLACK";
        this.ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
    }
}