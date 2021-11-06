// Mode variables
let eraseMode = false;
let pressed = false;
let shapeMode = false;
let gridMode = false;

// Stroke Color
let strokeColor = "#000";

// Shape Variables
let shapeType = "";
let originX;
let originY;

// Grid Variable
let numGridSquares = document.getElementById("gridSize").value;

// Canvases
let gridContext;
let drawingContext;
let shapeContext;

// Saves the Canvas Picture
function downloadImage(e) {
    let gridCanvasCopy = document.getElementById('gridCanvas');
    let drawingCanvasCopy = document.getElementById('drawingCanvas');

    let saveCanvas = document.createElement("canvas");
    let saveCanvasContext = saveCanvas.getContext('2d');
    saveCanvasContext.canvas.width = drawingContext.canvas.width;
    saveCanvasContext.canvas.height = drawingContext.canvas.height;

    saveCanvasContext.drawImage(gridCanvasCopy, 0, 0);
    saveCanvasContext.drawImage(drawingCanvasCopy, 0, 0);

    e.href = saveCanvas.toDataURL("image/png");
    saveCanvas.remove();
}

// Sets the Color
function setColor() {
    let colorBtnId = this.id;
    if (colorBtnId == "blackBtn") {
        drawingContext.strokeStyle = "#000";
        shapeContext.strokeStyle = "#000";
    } else if (colorBtnId == "redBtn") {
        drawingContext.strokeStyle = "#B56A5B"
        shapeContext.strokeStyle = "#B56A5B"
    } else if (colorBtnId == "greenBtn") {
        drawingContext.strokeStyle = "#64BD68";
        shapeContext.strokeStyle = "#64BD68";
    } else if (colorBtnId == "blueBtn") {
        drawingContext.strokeStyle = "#1A9999";
        shapeContext.strokeStyle = "#1A9999";
    }
    strokeColor = drawingContext.strokeStyle;
}

// Function to find distance between a point and a line
function shortest_distance(x1, y1, a, b, c)
{
    let d = Math.abs((a * x1 + b * y1 + c)) / (Math.sqrt(a * a + b * b));
    return d;
}

/// Draws a Shape at the current x,y coordinate
function drawShape(e, contextObj) {
    const mousePos = getMousePos(shapeCanvas, e);

    // clears the temporary shape
    shapeContext.clearRect(0, 0, shapeContext.canvas.width, shapeContext.canvas.height);

    let currentX = mousePos.x;
    let currentY = mousePos.y;
    // Draws a shape
    if(shapeType == "rectangleBtn") {
        let width = Math.abs(currentX - originX);
        let height = Math.abs(currentY - originY);
        let newX = (currentX > originX) ? originX : currentX;
        let newY = (currentY > originY) ? originY : currentY;
        contextObj.rect(newX, newY, width, height);

    } else if (shapeType == "circleBtn") {
        let midX = (originX + currentX) / 2;
        let midY = (originY + currentY) / 2;
        let radius = Math.sqrt(Math.pow((midX - originX), 2) + Math.pow((midY - originY), 2));
        contextObj.arc(midX, midY, radius, 0, 2 * Math.PI);

    } else { // Square
        let dist1 = shortest_distance(currentX, currentY, -1, 1, originX - originY);
        let dist2 = shortest_distance(currentX, currentY, 1, 1, -originX - originY);
        let intX;
        let intY;
        if(dist1 > dist2) {
            // get point of intersection
            intX = (originX + originY - currentY + currentX)/2
            intY = -intX + originX + originY;
        } else {
            intX = (currentX + currentY + originX - originY) / 2
            intY = intX - originX + originY;
        }
        let side = Math.abs(intX - originX);
        let newX = (intX > originX) ? originX : intX;
        let newY = (intY > originY) ? originY : intY;
        contextObj.rect(newX, newY, side, side);
    }
    contextObj.closePath();
    contextObj.stroke();
    contextObj.beginPath();
}

// Returns the true mouse position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

// Draws or erases
function drawOrErase(e, contextObj) {
    const mousePos = getMousePos(shapeCanvas, e);
    contextObj.lineTo(mousePos.x, mousePos.y);
    contextObj.closePath();
    contextObj.stroke();
    contextObj.moveTo(mousePos.x, mousePos.y);
}

// Handles mousedown
function handleDown(e) {
    const mousePos = getMousePos(shapeCanvas, e);
    pressed = true;
    drawingContext.moveTo(mousePos.x, mousePos.y);
    drawingContext.beginPath();

    // Sets the origin mouse click point
    if (shapeMode) {
        originX = mousePos.x;
        originY = mousePos.y;
    }
}

// Handles mousemove
function handleMouseMove(e) {
    const mousePos = getMousePos(shapeCanvas, e);

    if (pressed) { // Held Down Mouse
        // Erases or draws a line
        if (eraseMode || !shapeMode) {
            drawOrErase(e, drawingContext);
        } else { // Draws a temporary shape
            drawShape(e, shapeContext);
        }
    } else {
        const mousePos = getMousePos(shapeCanvas, e);
        drawingContext.moveTo(mousePos.x, mousePos.y);
    }
}

// Handles mouseup
function handleUp(e) {
    pressed = false;
    if(shapeMode) {
        drawShape(e, drawingContext);
    }
}

// Toggles Grid On or Off
function toggleGrid() {
    // Clears Grid
    gridContext.clearRect(0, 0, gridContext.canvas.width, gridContext.canvas.height);

    if (gridMode) { // Turn Grid On
        let width = gridContext.canvas.width;
        let height = gridContext.canvas.height;
        let pad = width / numGridSquares;
        for(let i = 0; i <= width; i+= pad) {
            gridContext.beginPath();
            gridContext.moveTo(i, 0);
            gridContext.lineTo(i, height);
            gridContext.closePath();
            gridContext.stroke();
        }
        for(let i = 0; i <= height; i+= pad) {
            gridContext.beginPath();
            gridContext.moveTo(0,       i);
            gridContext.lineTo(width,   i);
            gridContext.closePath();
            gridContext.stroke();
        }
    }
}

// Toggles Erase Mode
function toggleErase(isErase) {
    eraseMode = isErase;
    if (eraseMode) {
        shapeMode = false;
        drawingContext.globalCompositeOperation = "destination-out";  
        drawingContext.strokeStyle = "rgba(255,255,255,1)";
    } else {
        drawingContext.globalCompositeOperation = "source-over";
        drawingContext.strokeStyle = strokeColor;
    }
}

// Sets Stroke Style
function setStyle(contextObj, strokeStyle, lineJoin, lineWidth) {
    contextObj.strokeStyle = strokeStyle;
    contextObj.lineJoin = lineJoin;
    contextObj.lineWidth = lineWidth;
}

// Sets up events
function setup() {
    // Creates the drawing canvas and sets size    
    drawingContext = document.getElementById("drawingCanvas").getContext("2d");
    drawingContext.canvas.width = window.innerWidth;
    drawingContext.canvas.height = window.innerHeight - 60;

    // Creates the grid canvas and sets size
    gridContext = document.getElementById("gridCanvas").getContext("2d");
    gridContext.canvas.width = window.innerWidth;
    gridContext.canvas.height = window.innerHeight - 60;

    // Creates the shape canvas and sets size
    shapeContext = document.getElementById("shapeCanvas").getContext("2d");
    shapeContext.canvas.width = window.innerWidth;
    shapeContext.canvas.height = window.innerHeight - 60;

    // Stroke Style
    setStyle(drawingContext, "#000", "round", 5);
    setStyle(gridContext, "grey", "round", 2);
    setStyle(shapeContext, "#000", "round", 5);

    // Clear Button for Drawing Context
    $("#clearBtn").click(function() {
        drawingContext.clearRect(0, 0, drawingContext.canvas.width, drawingContext.canvas.height);
    });

    // Draw Button Handler
    $("#drawBtn").click(function() {
        shapeMode = false;
        toggleErase(false);
    });

    // Stroke Width Handler
    $("#lineWidth").change(function() {
        drawingContext.lineWidth = this.value;
        shapeContext.lineWidth = this.value;
    });

    // Rectangle Length Handler
    $("#lineLength").change(function() {
        rectangleLength = this.value * 50;
    });

    // Color Picker Handler
    $("#colorPicker").change(function() {
        drawingContext.strokeStyle = this.value;
        shapeContext.strokeStyle = this.value;
        strokeColor = drawingContext.strokeColor;
    });

    // Preset Color Buttons Handler
    $(".colorBtn").click(setColor)

    // Shape Buttons Handler
    $(".shapeBtn").click(function() {
        shapeMode = true;
        shapeType = this.id;
        toggleErase(false);
    });

    // Grid Size Handler
    $("#gridSize").change(function() {
        numGridSquares = this.value;
        gridMode = true;
        toggleGrid();
    });

    // Grid Button Handler
    $("#gridBtn").click(function() {
        gridMode = !gridMode;
        toggleGrid();
    });

    // Erase Button Handler
    $("#eraseBtn").click(function() {
        toggleErase(true);
    });

    // Mouse Movements
    $("#shapeCanvas").mousedown(handleDown)
    $("#shapeCanvas").mousemove(handleMouseMove)
    $("#shapeCanvas").mouseup(handleUp)
}

$(document).ready(setup)