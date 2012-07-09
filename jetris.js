// Tetris remake
// Corentin Smith 2012

// A few definitions
var numCols = 7,
    numRows = 20,

    tileSize = 20,

    width = numCols*tileSize - 1,
    height = numRows*tileSize - 1,

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
    // every (speed) frames do
    if (frame % speed === 0) {
        shape.moveDown();
        if (!shape.canMoveDown()) {
            shapeOnTheGround = true;
        }
    }

    frame++;

    if (frame % speed === 0 && shapeOnTheGround && !shape.canMoveDown()) {
        shape.persist();
        delete shape;

        shape = new Tetrimino();
        shapeOnTheGround = false;
    }

    clearCanvas();
    field.draw();

    shape.draw();
    
    window.requestAnimFrame(function() { gameLoop() });
};


// Main game array
// access via field.array[row][col]
function Field() {
    var that = this;

    that.array = new Array(numRows); // rows

    for (var i = 0; i < numRows; i++) { // cols
        that.array[i] = new Array(numCols);
    };

    that.clear = function() {
        for (var i = 0; i<numRows; i++) {
            for (var j = 0; j<numCols; j++) {
                that.array[i][j] = empty;
            };
        };
    };

    that.draw = function() {
        for (var i = 0; i<numRows; i++) {
            for (var j = 0; j<numCols; j++) {
                // draw every tile
                context.fillStyle = that.array[i][j];
                context.fillRect(j*tileSize, i*tileSize, tileSize-1, tileSize-1);
            };
        };
    };

    that.hasFullRows = function() {
        var fullRows = [];

        function isFull(row) {
            var full = true;

            for (var i=0; i<row.length; row++) {
                if (row[i] == empty) full = false; // if one is empty then the row isn't full
            };

            return full;
        };

        for (var r=0; r<numRows; r++) {
            if (isFull(that.array[r])) 
                fullRows.push(r);
        };
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
            that.color = "#0000FF";
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
            that.color = "#C60000";
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
               [[1, 0, 0, 1],
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [1, 0, 0, 1]];
        break;
    };

    // tile size
    that.arrayWidth = that.arrayShape[0].length;
    that.arrayHeight = that.arrayShape.length;

    // tile orientation = 0, 1, 2, 3
    that.orientation = 0;

    // tile position
    that.x = ~~(numCols / 2)-2;
    that.y = -1;

    that.draw = function(col, row) {
        for (var r = 0; r < that.arrayHeight; r++) {
            for (var c = 0; c < that.arrayWidth; c++) {
                // select right color
                context.fillStyle = that.color;
                // draw based on arrayShape
                if (that.arrayShape[r][c] == 1) {
                    context.fillRect(that.x*tileSize + c*tileSize, 
                        that.y*tileSize + r*tileSize, tileSize-1, tileSize-1);
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

    that.turn = function() {
        /*turnedShape =  [[0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]];

        for (var c = 0; c<4; c++) {
            for (var r = 0; r<4; r++) {
                turnedShape[r][c] = that.arrayShape[c][r];
            }
        }

        that.arrayShape = turnedShape;*/
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
    }
};


function keyDownMove(e) {
    var key = e.keyCode;
    
    switch (key) {
        case 37: shape.moveLeft();
        break;

        case 39: shape.moveRight();
        break;
    
        case 38: shape.turn();
        break;
    
        case 40: shape.moveDown();
        break;
    };
};

init();
