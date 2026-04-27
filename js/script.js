// Configuration du pixel sur l'écran
const TAILLE_PIXEL_AFFICHAGE = 15;
let tailleCanvasActuelle = 0;

// Variables pour gérer les outils et les couleurs
let couleurActuelle = "#000000"; 
let outilActuel = "crayon";      
let dessinEnCours = false;         
let tailleGrilleActuelle = 32;
let taillePinceauActuelle = 1;

// Récupère les éléments de l'interface
const monCanvas = document.getElementById("mon-canvas");
const contexte = monCanvas.getContext("2d", { alpha: true }); 

const selecteurCouleur = document.getElementById("selecteur-couleur");
const choixTailleGrille = document.getElementById("taille-grille");
const choixTaillePinceau = document.getElementById("taille-pinceau");
const boutonSceau = document.getElementById("outil-sceau");
const boutonPipette = document.getElementById("outil-pipette");
const boutonGomme = document.getElementById("outil-gomme");
const boutonCrayon = document.getElementById("outil-crayon");

// Initialise le canvas et l'éditeur
function initialiserEditeur() {
    // On calcule la taille du canvas en pixels d'affichage
    tailleCanvasActuelle = tailleGrilleActuelle * TAILLE_PIXEL_AFFICHAGE;

    monCanvas.width = tailleGrilleActuelle;
    monCanvas.height = tailleGrilleActuelle;

    monCanvas.style.width = tailleCanvasActuelle + "px";
    monCanvas.style.height = tailleCanvasActuelle + "px";

    // On désactive le lissage pour garder les pixels nets
    contexte.imageSmoothingEnabled = false;

    // On met à jour les variables CSS
    document.documentElement.style.setProperty('--taille-pixel', TAILLE_PIXEL_AFFICHAGE + 'px');
    document.documentElement.style.setProperty('--taille-canvas', tailleCanvasActuelle + 'px');
}

function definirOutilActif(nomOutil) {
    outilActuel = nomOutil;
    // On met à jour le style des boutons pour montrer quel outil est actif
    boutonCrayon.classList.toggle("actif", nomOutil === "crayon");
    boutonGomme.classList.toggle("actif", nomOutil === "gomme");
    boutonSceau.classList.toggle("actif", nomOutil === "sceau");
    boutonPipette.classList.toggle("actif", nomOutil === "pipette");
}

// Récupère les coordonnées du clic sur le canvas
function obtenirCaseClic(evenement) {
    // On calcule la position de la souris par rapport au canvas
    const rectangleCanvas = monCanvas.getBoundingClientRect();
    const sourisX = evenement.clientX - rectangleCanvas.left;
    const sourisY = evenement.clientY - rectangleCanvas.top;

    // On convertit en coordonnées de la grille
    return {
        x: Math.floor((sourisX / tailleCanvasActuelle) * tailleGrilleActuelle),
        y: Math.floor((sourisY / tailleCanvasActuelle) * tailleGrilleActuelle)
    };
}

// Convertit les coordonnées en index du tableau de pixels
function obtenirIndexPixel(x, y) {
    // Les pixels sont stockés dans un array avec 4 valeurs par pixel (RGBA)
    return (y * tailleGrilleActuelle + x) * 4;
}

// Vérifie si deux couleurs sont identiques
function estMemeCouleur(donnees, index, couleurCible) {
    // Compare chaque composante de couleur (rouge, vert, bleu, alpha)
    return donnees[index] === couleurCible[0] &&
           donnees[index + 1] === couleurCible[1] &&
           donnees[index + 2] === couleurCible[2] &&
           donnees[index + 3] === couleurCible[3];
}

// Remplit une zone avec la couleur (outil sceau)
function remplirZone(departX, departY, couleurRemplissage) {
    // On récupère les données de tous les pixels
    const donneesImage = contexte.getImageData(0, 0, tailleGrilleActuelle, tailleGrilleActuelle);
    const donnees = donneesImage.data;
    const indexDepart = obtenirIndexPixel(departX, departY);
    // On sauvegarde la couleur du pixel où on a cliqué
    const couleurCible = [donnees[indexDepart], donnees[indexDepart + 1], donnees[indexDepart + 2], donnees[indexDepart + 3]];
    const remplissageRgba = hexVersRgba(couleurRemplissage);

    // Si la zone a déjà la bonne couleur, on ne fait rien
    if (estMemeCouleur(donnees, indexDepart, remplissageRgba)) {
        return;
    }

    // On utilise une pile pour explorer tous les pixels connectés
    const pile = [[departX, departY]];

    while (pile.length > 0) {
        const [x, y] = pile.pop();

        // On vérifie que les coordonnées sont dans le canvas
        if (x < 0 || x >= tailleGrilleActuelle || y < 0 || y >= tailleGrilleActuelle) {
            continue;
        }

        const index = obtenirIndexPixel(x, y);

        // Si le pixel n'a pas la couleur à remplacer, on le saute
        if (!estMemeCouleur(donnees, index, couleurCible)) {
            continue;
        }

        // On colore le pixel
        donnees[index] = remplissageRgba[0];
        donnees[index + 1] = remplissageRgba[1];
        donnees[index + 2] = remplissageRgba[2];
        donnees[index + 3] = remplissageRgba[3];

        // On ajoute les 4 pixels voisins à la pile
        pile.push([x + 1, y]);
        pile.push([x - 1, y]);
        pile.push([x, y + 1]);
        pile.push([x, y - 1]);
    }

    // On met à jour l'affichage avec les nouvelles données
    contexte.putImageData(donneesImage, 0, 0);
}

// Convertit du code hex en RGBA
function hexVersRgba(couleurHex) {
    // On enlève le # et on sépare en composantes
    const normalise = couleurHex.replace("#", "");
    const rouge = parseInt(normalise.substring(0, 2), 16);
    const vert = parseInt(normalise.substring(2, 4), 16);
    const bleu = parseInt(normalise.substring(4, 6), 16);

    // On retourne un array avec les 4 composantes (alpha à 255 = opaque)
    return [rouge, vert, bleu, 255];
}

// Convertit du RGBA en code hex
function rgbaVersHex(rouge, vert, bleu) {
    // On convertit chaque composante en hexadécimal et on les joint
    return [rouge, vert, bleu]
        .map((composant) => composant.toString(16).padStart(2, "0"))
        .join("");
}

// Dessine un ou plusieurs pixels avec le pinceau
function dessinerPixel(evenement) {
    const { x: pixelX, y: pixelY } = obtenirCaseClic(evenement);

    if (pixelX >= 0 && pixelX < tailleGrilleActuelle && pixelY >= 0 && pixelY < tailleGrilleActuelle) {
        const decalage = Math.floor(taillePinceauActuelle / 2);

        // Dessine un carré de pixels selon la taille du pinceau
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

// Utilise la pipette pour prendre une couleur
function utiliserPipette(evenement) {
    const { x, y } = obtenirCaseClic(evenement);

    if (x < 0 || x >= tailleGrilleActuelle || y < 0 || y >= tailleGrilleActuelle) {
        return;
    }

    const pixelVise = contexte.getImageData(x, y, 1, 1).data;

    // On ignore les pixels transparents
    if (pixelVise[3] === 0) {
        return;
    }

    couleurActuelle = `#${rgbaVersHex(pixelVise[0], pixelVise[1], pixelVise[2])}`;
    selecteurCouleur.value = couleurActuelle;
    // On repasse au crayon après avoir pris la couleur
    definirOutilActif("crayon");
}

// Gère les actions sur le canvas selon l'outil actif
function gererActionCanvas(evenement) {
    // Si c'est la pipette, on prend la couleur
    if (outilActuel === "pipette") {
        utiliserPipette(evenement);
        return;
    }

    // Si c'est le sceau, on remplit la zone
    if (outilActuel === "sceau") {
        const { x, y } = obtenirCaseClic(evenement);
        if (x >= 0 && x < tailleGrilleActuelle && y >= 0 && y < tailleGrilleActuelle) {
            remplirZone(x, y, couleurActuelle);
        }
        return;
    }

    // Pour le crayon et la gomme
    dessinEnCours = true;
    dessinerPixel(evenement);
}

// Ajoute les écouteurs d'événements
// Quand on change la couleur
selecteurCouleur.addEventListener("input", (evenement) => {
    couleurActuelle = evenement.target.value;
    definirOutilActif("crayon");
});

// Quand on change la taille de la grille
choixTailleGrille.addEventListener("change", (evenement) => {
    tailleGrilleActuelle = parseInt(evenement.target.value, 10);
    initialiserEditeur();
});

// Quand on change la taille du pinceau
choixTaillePinceau.addEventListener("change", (evenement) => {
    taillePinceauActuelle = parseInt(evenement.target.value, 10);
});

// Les boutons pour changer d'outil
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

// Les événements de dessin
monCanvas.addEventListener("mousedown", (evenement) => {
    gererActionCanvas(evenement);
});

monCanvas.addEventListener("mousemove", (evenement) => {
    if (dessinEnCours) dessinerPixel(evenement);
});

window.addEventListener("mouseup", () => {
    dessinEnCours = false;
});

// Lance l'éditeur au chargement
initialiserEditeur();
