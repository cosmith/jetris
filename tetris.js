// Tetris remake
// Corentin Smith 2012

// A few definitions
var numCols = 11,
    numRows = 20,

    tileSize = 20,

    width = numCols*tileSize - 1,
    height = numRows*tileSize - 1,

    canvas = document.getElementById('canvas'),

    context = canvas.getContext('2d'),


    frame = 0;

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
    clearField();

    // ajoute le support du clavier
    document.addEventListener("keydown", keyDownMove, false);

    shape = new Tetrimino();

    gameLoop();
};


// Main game function
function gameLoop() {
    if (frame % 10 === 0) {
        shape.moveDown();
        if (!shape.canMoveDown) {
            shape.persist();
        }
    }
    clearCanvas();
    drawField();

    shape.draw();
    frame++;
    
    window.requestAnimFrame(function() { gameLoop() });
};


// Main game array
// 20 rows * 10 cols
// access via field[col][row]
var field = new Array(numCols);

for (var i = 0; i < numCols; i++) {
    field[i] = new Array(numRows);
};

function clearField() {
    for (var i = 0; i<numCols; i++) {
        for (var j = 0; j<numRows; j++) {
            field[i][j] = '#333';
        }
    }
};

function drawField() {
    for (var i = 0; i<numCols; i++) {
        for (var j = 0; j<numRows; j++) {
            // draw every tile
            context.fillStyle = field[i][j];
            context.fillRect(i*tileSize, j*tileSize, tileSize-1, tileSize-1);
        }
    }
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
               [[1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
        break;
        case 'J': 
            that.color = "#0000FF";
            that.arrayShape = 
               [[1, 1, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
        break;
        case 'L': 
            that.color = "#FF8040";
            that.arrayShape = 
               [[0, 0, 1, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
        break;
        case 'S': 
            that.color = "#00EA00";
            that.arrayShape = 
               [[0, 1, 1, 0],
                [1, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
        break;
        case 'T': 
            that.color = "#800080";
            that.arrayShape = 
               [[1, 1, 1, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
        break;
        case 'Z': 
            that.color = "#C60000";
            that.arrayShape = 
               [[1, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
        break;

        case 'O': 
            that.color = "#F2F200";
            that.arrayShape = 
               [[1, 1, 0, 0],
                [1, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
        break;


        default:
            that.arrayShape = 
               [[1, 0, 0, 1],
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [1, 0, 0, 1]];
        break;
    };

    // tile orientation = 0, 1, 2, 3
    that.orientation = 0;

    // tile position
    that.x = 3;
    that.y = 0;

    that.draw = function(col, row) {
        for (var r = 0; r<4; r++) {
            for (var c = 0; c<4; c++) {
                // select right color
                context.fillStyle = that.color;
                // draw based on arrayShape
                if (that.arrayShape[c][r] == 1) {
                    context.fillRect(that.x*tileSize + r*tileSize, 
                        that.y*tileSize + c*tileSize, tileSize-1, tileSize-1);
                }
            }
        }
    };

    that.canMoveDown = function() {
        var yes = true;

        for (var r = 0; r<4; r++) {
            for (var c = 0; c<4; c++) {
                if (that.arrayShape[c][r] == 1) {
                    if (that.y + c + 2 > numRows) {
                        yes = false;
                    }
                }
            }
        }

        return yes;
    };

    that.canMoveLeft = function() {
        var yes = true;

        for (var r = 0; r<4; r++) {
            for (var c = 0; c<4; c++) {
                if (that.arrayShape[c][r] == 1) {
                    if (that.x + r - 1 < 0) {
                        yes = false;
                    }
                }
            }
        }

        return yes;
    };

    that.canMoveRight = function() {
        var yes = true;

        for (var r = 0; r<4; r++) {
            for (var c = 0; c<4; c++) {
                if (that.arrayShape[c][r] == 1) {
                    if (that.x + r + 2 > numCols) {
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

    };

    that.persist = function() {
        for (var r = 0; r<4; r++) {
            for (var c = 0; c<4; c++) {
                if (that.arrayShape[c][r] == 1) {
                    field[r + that.x][c + that.y] = that.color;
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