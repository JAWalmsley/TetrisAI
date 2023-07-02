class Drawer {
    constructor(ctx) {
        this.ctx = ctx
    }

    static RainbowColor(length, maxLength) {
        var i = Math.abs(length * 255 / maxLength);
        var r = length < 0 ? i : 0;
        var g = length >= 0 ? i : 0;
        var b = 0;
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    drawSquare(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
        this.ctx.strokeStyle = "BLACK";
        this.ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
    }

    drawNN(nn) {
        const START_OFFSET_X = 50;
        const START_OFFSET_Y = 50;
        const CIRCLE_RADIUS = 5;
        const COLUMN_GAP = 100;
        const ROW_GAP = 20;

        const MIN_WEIGHT_DRAW = 0.9;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let inputs = nn.weightsIH.cols;
        let hiddens = nn.weightsIH.rows;
        let outputs = nn.weightsHO.rows;
        for (let i = 0; i < inputs; i++) {
            this.ctx.beginPath();
            this.ctx.arc(START_OFFSET_X, ROW_GAP * i + START_OFFSET_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
            this.ctx.stroke();

        }

        for (let i = 0; i < hiddens; i++) {
            this.ctx.beginPath();
            this.ctx.arc(START_OFFSET_X + COLUMN_GAP, ROW_GAP * i + START_OFFSET_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
            this.ctx.stroke();
        }

        for (let i = 0; i < outputs; i++) {
            this.ctx.beginPath();
            this.ctx.arc(START_OFFSET_X + COLUMN_GAP * 2, ROW_GAP * i + START_OFFSET_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
            this.ctx.stroke();
        }

        nn.weightsIH.map((x, r, c) => {
            if (Math.abs(x) < MIN_WEIGHT_DRAW) { return; }
            this.ctx.beginPath();
            this.ctx.moveTo(START_OFFSET_X, ROW_GAP * c + START_OFFSET_Y);
            this.ctx.lineTo(START_OFFSET_X + COLUMN_GAP, ROW_GAP * r + START_OFFSET_Y);
            // this.ctx.lineWidth = Math.abs(x);
            this.ctx.strokeStyle = Drawer.RainbowColor(x, 1);
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black";
        })

        nn.weightsHO.map((x, r, c) => {
            if (Math.abs(x) < MIN_WEIGHT_DRAW) { return; }
            this.ctx.beginPath();
            this.ctx.moveTo(START_OFFSET_X + COLUMN_GAP, ROW_GAP * c + START_OFFSET_Y);
            this.ctx.lineTo(START_OFFSET_X + COLUMN_GAP * 2, ROW_GAP * r + START_OFFSET_Y);
            // this.ctx.lineWidth = Math.abs(x);
            this.ctx.strokeStyle = Drawer.RainbowColor(x, 1);
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black";
        })
    }
}