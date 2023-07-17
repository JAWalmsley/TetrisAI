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
        const START_OFFSET_Y = 10;
        const COLUMN_GAP = 50;
        const ROW_GAP = 20;

        const MIN_WEIGHT_DRAW = 0;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let layerHeights = {};
        let nodePositions = {};
        let nodes = nn.nodes.toSorted((a, b) => a.id - b.id);
        for (let i = 0; i < nodes.length; i++) {
            let size = 5;
            let node = nodes[i];
            if(node.isOutput) {
                size = 10;
            }
            this.ctx.beginPath();
            if (layerHeights[node.layer]) {
                layerHeights[node.layer]++;
            } else {
                layerHeights[node.layer] = 1;
            }
            let xoff = node.layer*0.5;
            // if (node.layer > 0 && !node.isOutput) {
            //     xoff = 1;
            //     layerHeights[node.layer]-=1;
            // }
            // if (node.isOutput) {
            //     xoff = 2;
            // }
            let x = START_OFFSET_X + COLUMN_GAP * xoff;
            let y = ROW_GAP * layerHeights[node.layer] + START_OFFSET_Y;
            nodePositions[node.id] = { x: x, y: y };
            this.ctx.arc(x, y, size, 0, 2 * Math.PI);
            this.ctx.fillStyle = Drawer.RainbowColor(node.outputValue, 1);
            this.ctx.fill();
            this.ctx.fillStyle = "black";
        }

        for (let i = 0; i < nn.connections.length; i++) {
            let conn = nn.connections[i];
            if (Math.abs(conn.weight) < MIN_WEIGHT_DRAW)
                continue;
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = Drawer.RainbowColor(conn.weight, 1);
            this.ctx.moveTo(nodePositions[conn.fromNode.id].x, nodePositions[conn.fromNode.id].y);
            this.ctx.lineTo(nodePositions[conn.toNode.id].x, nodePositions[conn.toNode.id].y);
            this.ctx.stroke();
        }

        for (let i = 0; i < nn.inputLabels.length; i++) {
            this.ctx.textAlign = "right";
            this.ctx.fontSize = "30px";
            this.ctx.fillText(nn.inputLabels[i], START_OFFSET_X - 10, ROW_GAP * (i + 1) + START_OFFSET_Y);
        }
    }

    drawGrid(data, dim, smallData, smallDim) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let row = 0;
        let col = 0;
       
        
        let sizeDiff = (dim-1)/(smallDim-1)
        for (let item of smallData) {
            this.ctx.beginPath();
            this.ctx.arc(20 + row * (40*sizeDiff), 20 + col * (40*sizeDiff), 2, 0, 2 * Math.PI);
            this.ctx.fillStyle = Drawer.RainbowColor(item?1:0, 1);
            this.ctx.fill();
            if (row == smallDim - 1) {
                row = 0;
                col++;
            }
            else {
                row++;
            }
        }
        row = 0;
        col = 0;
        for (let item of data) {
            this.ctx.beginPath();
            this.ctx.arc(20 + row * 40, 20 + col * 40, 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = Drawer.RainbowColor(item, 1);
            this.ctx.fill();
            if (row == dim - 1) {
                row = 0;
                col++;
            }
            else {
                row++;

            }
        }
    }
}