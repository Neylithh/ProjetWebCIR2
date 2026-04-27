// Variables pour gérer l'interface et l'état du jeu
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('game-status');
const restartButton = document.getElementById('restart-button');

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];

// Les combinaisons gagnantes (3 en ligne, colonne ou diagonale)
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Messages affichés au joueur selon la situation
const messages = {
    playerTurn: () => `C'est au tour de ${currentPlayer}`,
    winningPlayer: () => `Le joueur ${currentPlayer} a gagné !`,
    draw: () => `Match nul !`,
    aiTurn: () => `C'est au tour de l'IA (O)`
};

// Prépare le plateau pour une nouvelle partie
function initializeGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = messages.playerTurn();
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('playerX', 'playerO');
        cell.addEventListener('click', handleCellClick, { once: true });
    });
}

// Quand le joueur clique sur une case
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    // Le joueur joue son coup
    handlePlayerMove(clickedCell, clickedCellIndex);
    checkResult();

    // Puis c'est le tour de l'IA
    if (gameActive) {
        currentPlayer = "O"; 
        statusDisplay.innerHTML = messages.aiTurn();
        setTimeout(handleAIMove, 700);
    }
}

// Place le X du joueur et met à jour la case
function handlePlayerMove(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add('playerX');
}

// L'IA détermine son meilleur coup
function handleAIMove() {
    if (!gameActive) {
        return;
    }

    // On cherche les cases vides disponibles
    let availableCells = [];
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            availableCells.push(i);
        }
    }

    if (availableCells.length === 0) {
        return;
    }

    let aiMove = null;

    // Petite fonction pour chercher si l'IA peut gagner
    const findWinningMove = (player) => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const line = [gameState[a], gameState[b], gameState[c]];
            
            if (line.filter(cell => cell === player).length === 2 && line.includes("")) {
                const emptyCellIndex = [a, b, c].find(index => gameState[index] === "");
                if (emptyCellIndex !== undefined) {
                    return emptyCellIndex;
                }
            }
        }
        return null;
    };

    // 1. L'IA essaie de gagner
    aiMove = findWinningMove("O");
    if (aiMove !== null) {
        makeAIMove(aiMove);
        return;
    }

    // 2. Sinon, l'IA bloque le joueur pour l'empêcher de gagner
    aiMove = findWinningMove("X");
    if (aiMove !== null) {
        makeAIMove(aiMove);
        return;
    }

    // 3. Si possible, l'IA prend le centre
    if (gameState[4] === "") {
        makeAIMove(4);
        return;
    }

    // 4. L'IA prend un coin si disponible
    const corners = [0, 2, 6, 8].filter(index => gameState[index] === "");
    if (corners.length > 0) {
        aiMove = corners[Math.floor(Math.random() * corners.length)];
        makeAIMove(aiMove);
        return;
    }

    // 5. Sinon un côté
    const sides = [1, 3, 5, 7].filter(index => gameState[index] === "");
    if (sides.length > 0) {
        aiMove = sides[Math.floor(Math.random() * sides.length)];
        makeAIMove(aiMove);
        return;
    }

    // 6. Sinon une case aléatoire
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    makeAIMove(availableCells[randomIndex]);
}

// Effectue le coup de l'IA et met à jour l'affichage
function makeAIMove(index) {
    gameState[index] = "O";
    cells[index].innerHTML = "O";
    cells[index].classList.add('playerO');
    cells[index].removeEventListener('click', handleCellClick);

    checkResult();
    if (gameActive) {
        currentPlayer = "X";
        statusDisplay.innerHTML = messages.playerTurn();
    }
}

// Vérifie si quelqu'un a gagné ou si c'est un match nul
function checkResult() {
    // Vérifie s'il y a un gagnant?
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = messages.winningPlayer();
        gameActive = false;
        return;
    }

    // Vérifie si le plateau est plein
    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = messages.draw();
        gameActive = false;
        return;
    }

}

// Recommence une nouvelle partie
function handleRestartGame() {
    initializeGame();
}

restartButton.addEventListener('click', handleRestartGame);
// Lancer le jeu au chargement
initializeGame();
