// --- 1. CONFIGURATION ---
const GRID_SIZE = 32;   
const CANVAS_WIDTH = 480; 
const CANVAS_HEIGHT = 480; 

// --- 2. VARIABLES D'ÉTAT ---
let currentColor = "#000000"; 
let currentTool = "pencil";      
let isDrawing = false;         

// --- 3. ÉLÉMENTS DU DOM ---
const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d", { alpha: true }); 

const colorPicker = document.getElementById("color-picker");
const btnEraser = document.getElementById("tool-eraser");
const btnPencil = document.getElementById("tool-pencil");

// --- 4. INITIALISATION ---
function initEditor() {
    // Taille interne du canvas (le nombre de pixels réels)
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;

    // Taille d'affichage (le zoom)
    canvas.style.width = CANVAS_WIDTH + "px";
    canvas.style.height = CANVAS_HEIGHT + "px";

    // Désactiver le lissage
    ctx.imageSmoothingEnabled = false;

    // Mise à jour de la variable CSS pour l'échiquier et la grille
    const pixelSize = CANVAS_WIDTH / GRID_SIZE;
    document.documentElement.style.setProperty('--pixel-size', pixelSize + 'px');
}

// --- 5. LOGIQUE DE DESSIN ---
function drawPixel(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pixelX = Math.floor((mouseX / CANVAS_WIDTH) * GRID_SIZE);
    const pixelY = Math.floor((mouseY / CANVAS_HEIGHT) * GRID_SIZE);

    if (pixelX >= 0 && pixelX < GRID_SIZE && pixelY >= 0 && pixelY < GRID_SIZE) {
        if (currentTool === "pencil") {
            ctx.fillStyle = currentColor;
            ctx.fillRect(pixelX, pixelY, 1, 1);
        } else if (currentTool === "eraser") {
            ctx.clearRect(pixelX, pixelY, 1, 1);
        }
    }
}

// --- 6. ÉVÉNEMENTS ---
colorPicker.addEventListener("input", (e) => {
    currentColor = e.target.value;
    currentTool = "pencil";
    btnPencil.classList.add("active");
    btnEraser.classList.remove("active");
});

btnPencil.addEventListener("click", () => {
    currentTool = "pencil";
    btnPencil.classList.add("active");
    btnEraser.classList.remove("active");
});

btnEraser.addEventListener("click", () => {
    currentTool = "eraser";
    btnEraser.classList.add("active");
    btnPencil.classList.remove("active");
});

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    drawPixel(e);
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) drawPixel(e);
});

window.addEventListener("mouseup", () => {
    isDrawing = false;
});

// Lancement au chargement
initEditor();