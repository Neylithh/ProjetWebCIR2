const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('game-status');
const restartButton = document.getElementById('restart-button');

let gameActive = true;
let currentPlayer = "X"; // Joueur humain
let gameState = ["", "", "", "", "", "", "", "", ""]; // Représente les 9 cellules

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

const messages = {
    playerTurn: () => `C'est au tour de ${currentPlayer}`,
    winningPlayer: () => `Le joueur ${currentPlayer} a gagné !`,
    draw: () => `Match nul !`,
    aiTurn: () => `C'est au tour de l'IA (O)`
};

// Fonctions d'initialisation et de mise à jour
function initializeGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = messages.playerTurn();
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('playerX', 'playerO');
        cell.addEventListener('click', handleCellClick, { once: true }); // Écouteur d'événement pour le clic de l'utilisateur
    });
}

// Gestion du clic sur une cellule
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handlePlayerMove(clickedCell, clickedCellIndex);
    checkResult();

    if (gameActive) {
        currentPlayer = "O"; 
        statusDisplay.innerHTML = messages.aiTurn();
        setTimeout(handleAIMove, 700); // L'IA joue après un court délai
    }
}

function handlePlayerMove(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add('playerX'); // Style pour le joueur X
}

// Logique de l'IA (aléatoire)
function handleAIMove() {
    if (!gameActive) {
        return;
    }

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

    aiMove = findWinningMove("O");
    if (aiMove !== null) {
        makeAIMove(aiMove);
        return;
    }

    aiMove = findWinningMove("X");
    if (aiMove !== null) {
        makeAIMove(aiMove);
        return;
    }

    if (gameState[4] === "") {
        makeAIMove(4);
        return;
    }

    const corners = [0, 2, 6, 8].filter(index => gameState[index] === "");
    if (corners.length > 0) {
        aiMove = corners[Math.floor(Math.random() * corners.length)];
        makeAIMove(aiMove);
        return;
    }

    const sides = [1, 3, 5, 7].filter(index => gameState[index] === "");
    if (sides.length > 0) {
        aiMove = sides[Math.floor(Math.random() * sides.length)];
        makeAIMove(aiMove);
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    makeAIMove(availableCells[randomIndex]);
}

function makeAIMove(index) {
    gameState[index] = "O";
    cells[index].innerHTML = "O";
    cells[index].classList.add('playerO');
    cells[index].removeEventListener('click', handleCellClick);

    checkResult();
    if (gameActive) {
        currentPlayer = "X"; // Repasse au joueur humain après le tour de l'IA
        statusDisplay.innerHTML = messages.playerTurn();
    }
}


// Vérification du résultat du jeu
function checkResult() {
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

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = messages.draw();
        gameActive = false;
        return;
    }

}

// Gestion du bouton Recommencer
function handleRestartGame() {
    initializeGame();
}

// Écouteurs d'événements
restartButton.addEventListener('click', handleRestartGame);
initializeGame(); // Initialise le jeu au chargement de la page