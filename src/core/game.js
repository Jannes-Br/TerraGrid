
import {
    createMap,
    tiles,
    TILE_SIZE,
    getNeighbors
} from "../world/map.js";

import {
    camera,
    renderMap,
    resizeCanvas
} from "../world/render.js";

// Spielzustand
let currentPlayer = 1;
let paused = false;

const canvas = document.getElementById("gameCanvas");

// Karte erstellen
createMap();

// Kamera zunächst zentrieren
function centerCamera() {
    camera.x = canvas.clientWidth / 2 -
        (35 * TILE_SIZE) / 2;

    camera.y = canvas.clientHeight / 2 -
        (25 * TILE_SIZE) / 2;
}

// Spieleranzeige aktualisieren
function updateInterface() {
    const ownedTiles = tiles.filter(
        tile => tile.owner === currentPlayer
    ).length;

    document.getElementById("currentPlayer").textContent =
        `Spieler ${currentPlayer}`;

    document.getElementById("territoryCount").textContent =
        `Gebiete: ${ownedTiles}`;
}

// Spieler wechseln
document.getElementById("switchPlayer").addEventListener("click", () => {
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    updateInterface();
    renderMap();
});

// Pause
document.getElementById("pauseButton").addEventListener("click", () => {
    paused = !paused;

    document.getElementById("pauseButton").textContent =
        paused ? "Fortsetzen" : "Pause";
});

// Bildschirmposition in Kartenposition umwandeln
function getTileFromScreen(mouseX, mouseY) {
    const worldX = (mouseX - camera.x) / camera.zoom;
    const worldY = (mouseY - camera.y) / camera.zoom;

    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);

    return tiles.find(
        tile => tile.x === tileX && tile.y === tileY
    );
}

// Kachel erobern
function captureTile(tile) {
    if (paused || !tile) return;

    if (tile.terrain !== "land") return;

    // Bereits besetzte Kacheln können hier noch
    // nicht angegriffen werden.
    if (tile.owner !== null) return;

    // Alle vier direkten Nachbarn überprüfen.
    const neighbors = getNeighbors(tile);

    const isAdjacent = neighbors.some(
        neighbor => neighbor.owner === currentPlayer
    );

    if (!isAdjacent) return;

    // Neutrale Kachel erobern
    tile.owner = currentPlayer;

    updateInterface();
    renderMap();
}

// Maussteuerung
let dragging = false;
let moved = false;

let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener("mousedown", event => {
    dragging = true;
    moved = false;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

window.addEventListener("mousemove", event => {
    if (!dragging) return;

    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;

    if (Math.abs(dx) + Math.abs(dy) > 2) {
        moved = true;
    }

    camera.x += dx;
    camera.y += dy;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    renderMap();
});

window.addEventListener("mouseup", event => {
    if (!dragging) return;

    dragging = false;

    if (!moved) {
        const rect = canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const tile = getTileFromScreen(mouseX, mouseY);

        captureTile(tile);
    }
});

// Mausrad-Zoom
canvas.addEventListener("wheel", event => {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const oldZoom = camera.zoom;
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

    const newZoom = Math.min(
        2.5,
        Math.max(0.4, oldZoom * zoomFactor)
    );

    // Zoom auf die Mausposition beziehen
    camera.x = mouseX -
        (mouseX - camera.x) * (newZoom / oldZoom);

    camera.y = mouseY -
        (mouseY - camera.y) * (newZoom / oldZoom);

    camera.zoom = newZoom;

    renderMap();
}, { passive: false });

// Spiel starten
resizeCanvas();
centerCamera();
updateInterface();
renderMap();

