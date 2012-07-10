// Tetris remake
// Corentin Smith 2012

// A few definitions
var numCols = 11,
    numRows = 20,

    tileSize = 18,

    width = numCols*tileSize,
    height = numRows*tileSize,

    canvas = document.getElementById('canvas'),

    context = canvas.getContext('2d'),

    empty = "#333", // background color

    speed = 10, // lower is faster

    frame = 0,

    shapeOnTheGround = false,

    field = new Field();

// Setting up canvas
canvas.width = width;
canvas.height = height;

function clearCanvas() {
    canvas.width = canvas.width;

    context.fillStyle = 'black';

    context.fillRect(0, 0, width, height);
};


// Framerate definition, cross-browser style. 
// Taken from http://www.siteduzero.com/
window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       || // La forme standardisée
           window.webkitRequestAnimationFrame || // Pour Chrome et Safari
           window.mozRequestAnimationFrame    || // Pour Firefox
           window.oRequestAnimationFrame      || // Pour Opera
           window.msRequestAnimationFrame     || // Pour Internet Explorer
           function(callback){                   // Pour les autres
               window.setTimeout(callback, 1000 / 60);
           };
})();


// Initializing
function init() {
    clearCanvas();
    field.clear();

    // ajoute le support du clavier
    document.addEventListener("keydown", keyDownMove, false);

    shape = new Tetrimino();

    gameLoop();
};


// Main game function
function gameLoop() {
    // every (speed) frames move the shape down
    if (frame % speed === 0) {
        shape.moveDown();
        if (!shape.canMoveDown()) {
            shapeOnTheGround = true;
        }
    }

    frame++;

    // after (speed) more frames, persist the shape on the ground 
    if (frame % speed === 0 && shapeOnTheGround && !shape.canMoveDown()) {
        shape.persist();
        delete shape;

        shape = new Tetrimino();
        shapeOnTheGround = false;
    }

    clearCanvas();
    field.draw();

    field.deleteFullRows();

    shape.draw();
    
    window.requestAnimFrame(function() { gameLoop() });
};

function drawCircle(top, left, radius, color) {
 
    context.fillStyle = empty;

    context.beginPath();
    context.arc(top + radius, left + radius, radius, 0, 7, true); 
    context.closePath();
    context.fill();

    context.fillStyle = color;

    context.beginPath();
    context.arc(top + radius - 1, left + radius - 1, radius-1, 0, 7, true); 
    context.closePath();
    context.fill();
}

// Main game array
// access via field.array[row][col]
function Field() {
    var that = this;

    that.array = new Array(numRows); // rows

    for (var i = 0; i < numRows; i++) { // cols
        that.array[i] = new Array(numCols);
    }

    that.clear = function() {
        for (var i = 0; i<numRows; i++) {
            for (var j = 0; j<numCols; j++) {
                that.array[i][j] = empty;
            }
        }
    };

    that.draw = function() {
        for (var i = 0; i<numRows; i++) {
            for (var j = 0; j<numCols; j++) {
                if (that.array[i][j] != empty) 
                    // draw every tile
                    drawCircle(j*tileSize, i*tileSize, tileSize/2, that.array[i][j]);
            }
        }
    };

    that.fullRowsList = function() {
        var fullRows = [];

        function isFull(row) {
            var i = 0;

            // if one cell is empty the row isn't full
            while (row[i] != empty && i < row.length) {
                i++;
            }

            return (i == row.length);
        };

        for (var r = 0; r < numRows; r++) {
            if (isFull(that.array[r])) 
                fullRows.push(r);
        }
        return fullRows;
    };

    that.deleteRow = function(fullRow) {
        if (fullRow === 0) {
            for (var c = 0; c < fullRow; c++) {
                that.array[0][c] = empty;
            }
        }
        else {
            for (var row = fullRow; row > 0; row--) { // start from the bottom
                for (var c = 0; c < numCols; c++) {
                    that.array[row][c] = that.array[row - 1][c]; // copy row above
                }
            }
        }
    };

    that.deleteFullRows = function() {
        l = that.fullRowsList();

        for (var i = 0; i < l.length; i++) {
            that.deleteRow(l[i]);
        }
    };
};


// Tetrimino class
// type = I, J, L, O, S, T, Z
function Tetrimino() {
    var that = this;

    shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    that.shape = shapes[~~(Math.random()*7)];
    
    switch (that.shape) {
        case 'I': 
            that.color = "#5CCBE2";
            that.arrayShape = 
               [[1, 1, 1, 1]];
        break;
        case 'J': 
            that.color = "#6F4FF0";
            that.arrayShape = 
               [[1, 1, 1],
                [0, 0, 1]];
        break;
        case 'L': 
            that.color = "#FF8040";
            that.arrayShape = 
               [[0, 0, 1],
                [1, 1, 1]];
        break;
        case 'S': 
            that.color = "#00EA00";
            that.arrayShape = 
               [[0, 1, 1],
                [1, 1, 0]];
        break;
        case 'T': 
            that.color = "#800080";
            that.arrayShape = 
               [[1, 1, 1],
                [0, 1, 0]];
        break;
        case 'Z': 
            that.color = "#FF2828";
            that.arrayShape = 
               [[1, 1, 0],
                [0, 1, 1]];
        break;

        case 'O': 
            that.color = "#F2F200";
            that.arrayShape = 
               [[1, 1],
                [1, 1]];
        break;


        default:
            that.arrayShape = 
               [[1]];
        break;
    };

    // tile size
    that.arrayWidth = that.arrayShape[0].length;
    that.arrayHeight = that.arrayShape.length;

    // tile orientation = 0, 1, 2, 3
    that.orientation = 0;

    // tile position
    that.x = ~~(numCols / 2) - 1;
    that.y = -1;

    that.draw = function(col, row) {
        for (var r = 0; r < that.arrayHeight; r++) {
            for (var c = 0; c < that.arrayWidth; c++) {
                // draw based on arrayShape
                if (that.arrayShape[r][c] == 1) {
                    drawCircle((that.x + c)*tileSize, (that.y + r)*tileSize, tileSize/2, that.color);
                }
            }
        }
    };

    that.canMoveDown = function() {
        var yes = true;

        if (that.y >= 0) {
        for (var r = 0; r < that.arrayHeight; r++) {
            for (var c = 0; c < that.arrayWidth; c++) {
                    if (that.arrayShape[r][c] == 1) {
                        if (that.y + r + 1 >= numRows || field.array[that.y + r + 1][that.x + c] != empty) {
                            yes = false;
                        }
                    }
                }
            }
        } 

        return yes;
    };

    that.canMoveLeft = function() {
        var yes = true;

        for (var r = 0; r < that.arrayHeight; r++) {
            for (var c = 0; c < that.arrayWidth; c++) {
                if (that.arrayShape[r][c] == 1) {
                    if (that.x + c - 1 < 0 || field.array[that.y + r][that.x + c - 1] != empty) {
                        yes = false;
                    }
                }
            }
        }

        return yes;
    };

    that.canMoveRight = function() {
        var yes = true;

        for (var r = 0; r < that.arrayHeight; r++) {
            for (var c = 0; c < that.arrayWidth; c++) {
                if (that.arrayShape[r][c] == 1) {
                    if (that.x + c + 2 > numCols || field.array[that.y + r][that.x + c + 1] != empty) {
                        yes = false;
                    }
                }
            }
        }

        return yes;
    };

    that.moveDown = function() {
        if (that.canMoveDown()) {
            that.y += 1;
        }
    };

    that.moveRight = function() {
        if (that.canMoveRight()) {
            that.x += 1;
        }
    };

    that.moveLeft = function() {
        if (that.canMoveLeft()) {
            that.x -= 1;
        }
    };

    that.rotate = function() {
        rotated = new Array(that.arrayWidth);

        for (var i = 0; i < that.arrayWidth; i++) {
            rotated[i] = new Array(that.arrayHeight);
        }

        for (var r = 0; r < that.arrayHeight; r++) {
            for (var c = 0; c < that.arrayWidth; c++) {
                rotated[c][that.arrayHeight-1-r] = that.arrayShape[r][c];
            }
        }

        that.arrayShape = rotated;

        // update the tile size
        that.arrayWidth = that.arrayShape[0].length;
        that.arrayHeight = that.arrayShape.length;
    };

    // write the tetrimino to the field.array when it can't move anymore
    that.persist = function() {
        for (var r = 0; r < that.arrayHeight; r++) {
            for (var c = 0; c < that.arrayWidth; c++) {
                if (that.arrayShape[r][c] == 1 && r >= 0 && c >= 0) {
                    field.array[r + that.y][c + that.x] = that.color;
                }
            }
        }
    };
};


function keyDownMove(e) {
    var key = e.keyCode;
    
    switch (key) {
        case 37: shape.moveLeft();
        break;

        case 39: shape.moveRight();
        break;
    
        case 38: shape.rotate();
        break;
    
        case 40: shape.moveDown();
        break;
    };
};

init();
