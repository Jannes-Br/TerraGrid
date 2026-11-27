
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

import {
    getPlayerStats,
    updatePopulation
} from "../systems/population.js";

import {
    buildCity
} from "../systems/buildings.js";

const canvas = document.getElementById("gameCanvas");

let currentPlayer = 1;
let paused = false;
let buildingCity = false;

// Karte erstellen
createMap();

// Kamera zentrieren
function centerCamera() {
    camera.x = canvas.clientWidth / 2 -
        (35 * TILE_SIZE) / 2;

    camera.y = canvas.clientHeight / 2 -
        (25 * TILE_SIZE) / 2;
}

// Anzahl der Städte pro Spieler berechnen
function getCityCounts() {
    const counts = { 1: 0, 2: 0 };

    for (const tile of tiles) {
        if (tile.building === "city" && tile.owner !== null) {
            counts[tile.owner]++;
        }
    }

    return counts;
}

// Anzeigen aktualisieren
function updateInterface() {
    const ownedTiles = tiles.filter(
        tile => tile.owner === currentPlayer
    ).length;

    const stats = getPlayerStats(currentPlayer);

    document.getElementById("currentPlayer").textContent =
        `Spieler ${currentPlayer}`;

    document.getElementById("territoryCount").textContent =
        `Gebiete: ${ownedTiles}`;

    document.getElementById("populationCount").textContent =
        `Bevölkerung: ${Math.floor(stats.population)} / ${stats.capacity}`;

    document.getElementById("freePopulation").textContent =
        `Frei: ${Math.floor(stats.free)}`;
}

// Spieler wechseln
document.getElementById("switchPlayer").addEventListener("click", () => {
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    buildingCity = false;

    document.getElementById("buildCityButton").classList.remove("active");

    updateInterface();
    renderMap();
});

// Pause
document.getElementById("pauseButton").addEventListener("click", () => {
    paused = !paused;

    document.getElementById("pauseButton").textContent =
        paused ? "Fortsetzen" : "Pause";
});

// Stadtbaumodus
document.getElementById("buildCityButton").addEventListener("click", () => {
    buildingCity = !buildingCity;

    document.getElementById("buildCityButton").classList.toggle(
        "active",
        buildingCity
    );

    document.getElementById("gameMessage").textContent =
        buildingCity
            ? "Klicke auf eine freie eigene Landkachel, um eine Stadt zu bauen."
            : "Erobere Land und baue neue Städte.";
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

// Neutrale Kachel erobern
function captureTile(tile) {
    if (paused || !tile) return;

    if (tile.terrain !== "land") return;
    if (tile.owner !== null) return;

    const neighbors = getNeighbors(tile);

    const isAdjacent = neighbors.some(
        neighbor => neighbor.owner === currentPlayer
    );

    if (!isAdjacent) return;

    tile.owner = currentPlayer;

    updateInterface();
    renderMap();
}

// Stadt bauen oder Kachel erobern
function handleTileClick(tile) {
    if (paused || !tile) return;

    if (buildingCity) {
        const success = buildCity(tile, currentPlayer);

        if (success) {
            document.getElementById("gameMessage").textContent =
                "Stadt erfolgreich gebaut.";

            buildingCity = false;

            document.getElementById("buildCityButton").classList.remove("active");

            updateInterface();
            renderMap();
        } else {
            document.getElementById("gameMessage").textContent =
                "Stadtbau nicht möglich. Prüfe Gebiet, Gebäude und Bevölkerung.";
        }

        return;
    }

    captureTile(tile);
}

// Maussteuerung
let dragging = false;
let moved = false;

let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener("mousedown", event => {
    if (event.button !== 0) return;

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

        handleTileClick(tile);
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

    camera.x = mouseX -
        (mouseX - camera.x) * (newZoom / oldZoom);

    camera.y = mouseY -
        (mouseY - camera.y) * (newZoom / oldZoom);

    camera.zoom = newZoom;

    renderMap();
}, { passive: false });

// Bevölkerung regelmäßig aktualisieren
let previousTime = performance.now();

function gameLoop(currentTime) {
    const deltaTime = Math.min(
        (currentTime - previousTime) / 1000,
        0.25
    );

    previousTime = currentTime;

    if (!paused) {
        updatePopulation(deltaTime, getCityCounts());
        updateInterface();
    }

    requestAnimationFrame(gameLoop);
}

// Spiel starten
resizeCanvas();
centerCamera();
updateInterface();
renderMap();

requestAnimationFrame(gameLoop);
