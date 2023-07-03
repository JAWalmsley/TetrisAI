class Drawer {
    constructor(ctx) {
        this.ctx = ctx
        this.ctx.font = "11px sans-serif";
        this.ctx.textBaseline = "middle";
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
        const START_OFFSET_X = 100;
        const START_OFFSET_Y = 50;
        const CIRCLE_RADIUS = 5;
        const COLUMN_GAP = 100;
        const ROW_GAP = 20;

        const MIN_WEIGHT_DRAW = 0.01;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let inputs = nn.getDimensions()[0];
        let hiddens = nn.getDimensions()[1];
        let outputs = nn.getDimensions()[2];

        let inLabels = nn.inputLabels;
        let outLabels = nn.outputLabels;
        for (let i = 0; i < inputs; i++) {
            this.ctx.beginPath();
            this.ctx.arc(START_OFFSET_X, ROW_GAP * i + START_OFFSET_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
            this.ctx.stroke();
            if(inLabels)
            {
                this.ctx.textAlign = "right";
                this.ctx.fillText(inLabels[i], START_OFFSET_X - 10, ROW_GAP * i + START_OFFSET_Y);
            }
   
        }

        for (let i = 0; i < hiddens; i++) {
            this.ctx.beginPath();
            this.ctx.arc(START_OFFSET_X + COLUMN_GAP, ROW_GAP * i + START_OFFSET_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
            // this.ctx.fillStyle = Drawer.RainbowColor(nn.biasHidden.data[i][0], 1);
            this.ctx.fill();
            this.ctx.fillStyle = "black";
        }

        for (let i = 0; i < outputs; i++) {
            this.ctx.beginPath();
            this.ctx.arc(START_OFFSET_X + COLUMN_GAP * 2, ROW_GAP * i + START_OFFSET_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
            // this.ctx.fillStyle = Drawer.RainbowColor(nn.biasOutput.data[i][0], 1);
            this.ctx.fill();
            this.ctx.fillStyle = "black";
            if(outLabels)
            {
                this.ctx.textAlign = "left";
                this.ctx.fillText(outLabels[i], START_OFFSET_X + COLUMN_GAP * 2 + 10, ROW_GAP * i + START_OFFSET_Y);
            }

        }

        nn.weightsIH.foreach((x, r, c) => {
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

        nn.weightsHO.foreach((x, r, c) => {
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

        nn.weightsOI.foreach((x, r, c) => {
            if (Math.abs(x) < MIN_WEIGHT_DRAW) { return; }
            this.ctx.beginPath();
            this.ctx.moveTo(START_OFFSET_X, ROW_GAP * c + START_OFFSET_Y);
            this.ctx.lineTo(START_OFFSET_X + COLUMN_GAP * 2, ROW_GAP * r + START_OFFSET_Y);
            // this.ctx.lineWidth = Math.abs(x);
            this.ctx.strokeStyle = Drawer.RainbowColor(x, 1);
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black";
        })
    }
}