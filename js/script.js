// --- 1. CONFIGURATION ---
const TAILLE_PIXEL_AFFICHAGE = 15; // Chaque case fera toujours 15px de large à l'écran
let tailleCanvasActuelle = 0;      // Sera calculé dynamiquement

// --- 2. VARIABLES D'ÉTAT ---
let couleurActuelle = "#000000"; 
let outilActuel = "crayon";      
let dessinEnCours = false;         
let tailleGrilleActuelle = 32;
let taillePinceauActuelle = 1;

// --- 3. ÉLÉMENTS DU DOM ---
const monCanvas = document.getElementById("mon-canvas");
const contexte = monCanvas.getContext("2d", { alpha: true }); 

const selecteurCouleur = document.getElementById("selecteur-couleur");
const choixTailleGrille = document.getElementById("taille-grille");
const choixTaillePinceau = document.getElementById("taille-pinceau");
const boutonSceau = document.getElementById("outil-sceau");
const boutonPipette = document.getElementById("outil-pipette");
const boutonGomme = document.getElementById("outil-gomme");
const boutonCrayon = document.getElementById("outil-crayon");

// --- 4. INITIALISATION ---
function initialiserEditeur() {
    // Calcul de la nouvelle taille d'affichage en fonction de la grille
    tailleCanvasActuelle = tailleGrilleActuelle * TAILLE_PIXEL_AFFICHAGE;

    // Taille interne du canvas (le nombre de pixels réels)
    monCanvas.width = tailleGrilleActuelle;
    monCanvas.height = tailleGrilleActuelle;

    // Taille d'affichage (le zoom)
    monCanvas.style.width = tailleCanvasActuelle + "px";
    monCanvas.style.height = tailleCanvasActuelle + "px";

    // Désactiver le lissage
    contexte.imageSmoothingEnabled = false;

    // Mise à jour des variables CSS pour que la grille visuelle suive le mouvement
    document.documentElement.style.setProperty('--taille-pixel', TAILLE_PIXEL_AFFICHAGE + 'px');
    document.documentElement.style.setProperty('--taille-canvas', tailleCanvasActuelle + 'px');
}

function definirOutilActif(nomOutil) {
    outilActuel = nomOutil;
    boutonCrayon.classList.toggle("actif", nomOutil === "crayon");
    boutonGomme.classList.toggle("actif", nomOutil === "gomme");
    boutonSceau.classList.toggle("actif", nomOutil === "sceau");
    boutonPipette.classList.toggle("actif", nomOutil === "pipette");
}

function obtenirCaseClic(evenement) {
    const rectangleCanvas = monCanvas.getBoundingClientRect();
    const sourisX = evenement.clientX - rectangleCanvas.left;
    const sourisY = evenement.clientY - rectangleCanvas.top;

    return {
        x: Math.floor((sourisX / tailleCanvasActuelle) * tailleGrilleActuelle),
        y: Math.floor((sourisY / tailleCanvasActuelle) * tailleGrilleActuelle)
    };
}

function obtenirIndexPixel(x, y) {
    return (y * tailleGrilleActuelle + x) * 4;
}

function estMemeCouleur(donnees, index, couleurCible) {
    return donnees[index] === couleurCible[0] &&
           donnees[index + 1] === couleurCible[1] &&
           donnees[index + 2] === couleurCible[2] &&
           donnees[index + 3] === couleurCible[3];
}

function remplirZone(departX, departY, couleurRemplissage) {
    const donneesImage = contexte.getImageData(0, 0, tailleGrilleActuelle, tailleGrilleActuelle);
    const donnees = donneesImage.data;
    const indexDepart = obtenirIndexPixel(departX, departY);
    const couleurCible = [donnees[indexDepart], donnees[indexDepart + 1], donnees[indexDepart + 2], donnees[indexDepart + 3]];
    const remplissageRgba = hexVersRgba(couleurRemplissage);

    if (estMemeCouleur(donnees, indexDepart, remplissageRgba)) {
        return; // On arrête si on clique sur une zone qui a déjà la bonne couleur
    }

    const pile = [[departX, departY]];

    while (pile.length > 0) {
        const [x, y] = pile.pop();

        if (x < 0 || x >= tailleGrilleActuelle || y < 0 || y >= tailleGrilleActuelle) {
            continue;
        }

        const index = obtenirIndexPixel(x, y);

        if (!estMemeCouleur(donnees, index, couleurCible)) {
            continue;
        }

        donnees[index] = remplissageRgba[0];
        donnees[index + 1] = remplissageRgba[1];
        donnees[index + 2] = remplissageRgba[2];
        donnees[index + 3] = remplissageRgba[3];

        pile.push([x + 1, y]);
        pile.push([x - 1, y]);
        pile.push([x, y + 1]);
        pile.push([x, y - 1]);
    }

    contexte.putImageData(donneesImage, 0, 0);
}

function hexVersRgba(couleurHex) {
    const normalise = couleurHex.replace("#", "");
    const rouge = parseInt(normalise.substring(0, 2), 16);
    const vert = parseInt(normalise.substring(2, 4), 16);
    const bleu = parseInt(normalise.substring(4, 6), 16);

    return [rouge, vert, bleu, 255];
}

function rgbaVersHex(rouge, vert, bleu) {
    return [rouge, vert, bleu]
        .map((composant) => composant.toString(16).padStart(2, "0"))
        .join("");
}

// --- 5. LOGIQUE DE DESSIN ---
function dessinerPixel(evenement) {
    const { x: pixelX, y: pixelY } = obtenirCaseClic(evenement);

    if (pixelX >= 0 && pixelX < tailleGrilleActuelle && pixelY >= 0 && pixelY < tailleGrilleActuelle) {
        const decalage = Math.floor(taillePinceauActuelle / 2);

        for (let y = pixelY - decalage; y < pixelY - decalage + taillePinceauActuelle; y++) {
            for (let x = pixelX - decalage; x < pixelX - decalage + taillePinceauActuelle; x++) {
                if (x >= 0 && x < tailleGrilleActuelle && y >= 0 && y < tailleGrilleActuelle) {
                    if (outilActuel === "crayon") {
                        contexte.fillStyle = couleurActuelle;
                        contexte.fillRect(x, y, 1, 1);
                    } else if (outilActuel === "gomme") {
                        contexte.clearRect(x, y, 1, 1);
                    }
                }
            }
        }
    }
}

function utiliserPipette(evenement) {
    const { x, y } = obtenirCaseClic(evenement);

    if (x < 0 || x >= tailleGrilleActuelle || y < 0 || y >= tailleGrilleActuelle) {
        return;
    }

    const pixelVise = contexte.getImageData(x, y, 1, 1).data;

    // Si le pixel est transparent (alpha = 0), on ne fait rien
    if (pixelVise[3] === 0) {
        return;
    }

    couleurActuelle = `#${rgbaVersHex(pixelVise[0], pixelVise[1], pixelVise[2])}`;
    selecteurCouleur.value = couleurActuelle;
    definirOutilActif("crayon"); // Repasse au crayon après avoir pris la couleur
}

function gererActionCanvas(evenement) {
    if (outilActuel === "pipette") {
        utiliserPipette(evenement);
        return;
    }

    if (outilActuel === "sceau") {
        const { x, y } = obtenirCaseClic(evenement);
        if (x >= 0 && x < tailleGrilleActuelle && y >= 0 && y < tailleGrilleActuelle) {
            remplirZone(x, y, couleurActuelle);
        }
        return;
    }

    // Sinon c'est crayon ou gomme
    dessinEnCours = true;
    dessinerPixel(evenement);
}

// --- 6. ÉVÉNEMENTS ---
selecteurCouleur.addEventListener("input", (evenement) => {
    couleurActuelle = evenement.target.value;
    definirOutilActif("crayon");
});

choixTailleGrille.addEventListener("change", (evenement) => {
    tailleGrilleActuelle = parseInt(evenement.target.value, 10);
    initialiserEditeur();
});

choixTaillePinceau.addEventListener("change", (evenement) => {
    taillePinceauActuelle = parseInt(evenement.target.value, 10);
});

boutonCrayon.addEventListener("click", () => {
    definirOutilActif("crayon");
});

boutonGomme.addEventListener("click", () => {
    definirOutilActif("gomme");
});

boutonSceau.addEventListener("click", () => {
    definirOutilActif("sceau");
});

boutonPipette.addEventListener("click", () => {
    definirOutilActif("pipette");
});

monCanvas.addEventListener("mousedown", (evenement) => {
    gererActionCanvas(evenement);
});

monCanvas.addEventListener("mousemove", (evenement) => {
    if (dessinEnCours) dessinerPixel(evenement);
});

window.addEventListener("mouseup", () => {
    dessinEnCours = false;
});

// Lancement au chargement
initialiserEditeur();