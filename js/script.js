// --- 1. CONFIGURATION ---
const CANVAS_WIDTH = 480; 
const CANVAS_HEIGHT = 480; 

// --- 2. VARIABLES D'ÉTAT ---
let currentColor = "#000000"; 
let currentTool = "pencil";      
let isDrawing = false;         
let currentGridSize = 32;
let currentBrushSize = 1;

// --- 3. ÉLÉMENTS DU DOM ---
const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d", { alpha: true }); 

const colorPicker = document.getElementById("color-picker");
const gridSizeSelect = document.getElementById("grid-size");
const brushSizeSelect = document.getElementById("brush-size");
const btnFill = document.getElementById("tool-fill");
const btnEyedropper = document.getElementById("tool-eyedropper");
const btnEraser = document.getElementById("tool-eraser");
const btnPencil = document.getElementById("tool-pencil");

// --- 4. INITIALISATION ---
function initEditor() {
    // Taille interne du canvas (le nombre de pixels réels)
    canvas.width = currentGridSize;
    canvas.height = currentGridSize;

    // Taille d'affichage (le zoom)
    canvas.style.width = CANVAS_WIDTH + "px";
    canvas.style.height = CANVAS_HEIGHT + "px";

    // Désactiver le lissage
    ctx.imageSmoothingEnabled = false;

    // Mise à jour de la variable CSS pour l'échiquier et la grille
    const pixelSize = CANVAS_WIDTH / currentGridSize;
    document.documentElement.style.setProperty('--pixel-size', pixelSize + 'px');
}

function setActiveTool(toolName) {
    currentTool = toolName;
    btnPencil.classList.toggle("active", toolName === "pencil");
    btnEraser.classList.toggle("active", toolName === "eraser");
    btnFill.classList.toggle("active", toolName === "fill");
    btnEyedropper.classList.toggle("active", toolName === "eyedropper");
}

function getCellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    return {
        x: Math.floor((mouseX / CANVAS_WIDTH) * currentGridSize),
        y: Math.floor((mouseY / CANVAS_HEIGHT) * currentGridSize)
    };
}

function getPixelIndex(x, y) {
    return (y * currentGridSize + x) * 4;
}

function isSameColor(data, index, targetColor) {
    return data[index] === targetColor[0] &&
        data[index + 1] === targetColor[1] &&
        data[index + 2] === targetColor[2] &&
        data[index + 3] === targetColor[3];
}

function floodFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, currentGridSize, currentGridSize);
    const data = imageData.data;
    const startIndex = getPixelIndex(startX, startY);
    const targetColor = [data[startIndex], data[startIndex + 1], data[startIndex + 2], data[startIndex + 3]];
    const fillRgba = hexToRgba(fillColor);

    if (isSameColor(data, startIndex, fillRgba)) {
        return;
    }

    const stack = [[startX, startY]];

    while (stack.length > 0) {
        const [x, y] = stack.pop();

        if (x < 0 || x >= currentGridSize || y < 0 || y >= currentGridSize) {
            continue;
        }

        const index = getPixelIndex(x, y);

        if (!isSameColor(data, index, targetColor)) {
            continue;
        }

        data[index] = fillRgba[0];
        data[index + 1] = fillRgba[1];
        data[index + 2] = fillRgba[2];
        data[index + 3] = fillRgba[3];

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
}

function hexToRgba(hexColor) {
    const normalized = hexColor.replace("#", "");
    const red = parseInt(normalized.substring(0, 2), 16);
    const green = parseInt(normalized.substring(2, 4), 16);
    const blue = parseInt(normalized.substring(4, 6), 16);

    return [red, green, blue, 255];
}

function rgbaToHex(red, green, blue) {
    return [red, green, blue]
        .map((component) => component.toString(16).padStart(2, "0"))
        .join("");
}

// --- 5. LOGIQUE DE DESSIN ---
function drawPixel(e) {
    const { x: pixelX, y: pixelY } = getCellFromEvent(e);

    if (pixelX >= 0 && pixelX < currentGridSize && pixelY >= 0 && pixelY < currentGridSize) {
        const offset = Math.floor(currentBrushSize / 2);

        for (let y = pixelY - offset; y < pixelY - offset + currentBrushSize; y++) {
            for (let x = pixelX - offset; x < pixelX - offset + currentBrushSize; x++) {
                if (x >= 0 && x < currentGridSize && y >= 0 && y < currentGridSize) {
                    if (currentTool === "pencil") {
                        ctx.fillStyle = currentColor;
                        ctx.fillRect(x, y, 1, 1);
                    } else if (currentTool === "eraser") {
                        ctx.clearRect(x, y, 1, 1);
                    }
                }
            }
        }
    }
}

function useEyedropper(e) {
    const { x, y } = getCellFromEvent(e);

    if (x < 0 || x >= currentGridSize || y < 0 || y >= currentGridSize) {
        return;
    }

    const imageData = ctx.getImageData(x, y, 1, 1).data;

    if (imageData[3] === 0) {
        return;
    }

    currentColor = `#${rgbaToHex(imageData[0], imageData[1], imageData[2])}`;
    colorPicker.value = currentColor;
    setActiveTool("pencil");
}

function handleCanvasAction(e) {
    if (currentTool === "eyedropper") {
        useEyedropper(e);
        return;
    }

    if (currentTool === "fill") {
        const { x, y } = getCellFromEvent(e);
        if (x >= 0 && x < currentGridSize && y >= 0 && y < currentGridSize) {
            floodFill(x, y, currentColor);
        }
        return;
    }

    isDrawing = true;
    drawPixel(e);
}

// --- 6. ÉVÉNEMENTS ---
colorPicker.addEventListener("input", (e) => {
    currentColor = e.target.value;
    setActiveTool("pencil");
});

gridSizeSelect.addEventListener("change", (e) => {
    currentGridSize = parseInt(e.target.value, 10);
    initEditor();
});

brushSizeSelect.addEventListener("change", (e) => {
    currentBrushSize = parseInt(e.target.value, 10);
});

btnPencil.addEventListener("click", () => {
    setActiveTool("pencil");
});

btnEraser.addEventListener("click", () => {
    setActiveTool("eraser");
});

btnFill.addEventListener("click", () => {
    setActiveTool("fill");
});

btnEyedropper.addEventListener("click", () => {
    setActiveTool("eyedropper");
});

canvas.addEventListener("mousedown", (e) => {
    handleCanvasAction(e);
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) drawPixel(e);
});

window.addEventListener("mouseup", () => {
    isDrawing = false;
});

// Lancement au chargement
initEditor();