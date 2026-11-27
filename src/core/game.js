
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
    getMoney,
    produceFactoryIncome
} from "../systems/economy.js";

import {
    buildCity,
    buildFactory
} from "../systems/buildings.js";

const canvas = document.getElementById("gameCanvas");

let currentPlayer = 1;
let paused = false;
let buildingMode = null;

createMap();

function centerCamera() {
    camera.x = canvas.clientWidth / 2 - (35 * TILE_SIZE) / 2;
    camera.y = canvas.clientHeight / 2 - (25 * TILE_SIZE) / 2;
}

function getBuildingCounts() {
    const counts = {
        cities: { 1: 0, 2: 0 },
        factories: { 1: 0, 2: 0 }
    };

    for (const tile of tiles) {
        if (tile.owner === null) continue;

        if (tile.building === "city") {
            counts.cities[tile.owner]++;
        }

        if (tile.building === "factory") {
            counts.factories[tile.owner]++;
        }
    }

    return counts;
}

function formatMoney(value) {
    if (value >= 1_000_000_000) {
        return (value / 1_000_000_000).toFixed(2).replace(".", ",") + " Mrd. €";
    }

    if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(2).replace(".", ",") + " Mio. €";
    }

    return Math.floor(value).toLocaleString("de-DE") + " €";
}

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
        `Bevölkerung: ${Math.floor(stats.population).toLocaleString("de-DE")} / ${stats.capacity.toLocaleString("de-DE")}`;

    document.getElementById("freePopulation").textContent =
        `Frei: ${Math.floor(stats.free).toLocaleString("de-DE")}`;

    document.getElementById("moneyCount").textContent =
        `Geld: ${formatMoney(getMoney(currentPlayer))}`;
}

function setBuildingMode(mode) {
    if (paused) return;

    buildingMode = buildingMode === mode ? null : mode;

    document.getElementById("buildCityButton").classList.toggle(
        "active",
        buildingMode === "city"
    );

    document.getElementById("buildFactoryButton").classList.toggle(
        "active",
        buildingMode === "factory"
    );

    const messages = {
        city: "Stadtbau aktiv: Klicke auf eine freie eigene Landkachel.",
        factory: "Fabrikbau aktiv: Klicke auf eine freie eigene Landkachel neben einer Stadt."
    };

    document.getElementById("gameMessage").textContent =
        buildingMode ? messages[buildingMode] : "Baumodus beendet.";
}

document.getElementById("buildCityButton").addEventListener(
    "click",
    () => setBuildingMode("city")
);

document.getElementById("buildFactoryButton").addEventListener(
    "click",
    () => setBuildingMode("factory")
);

document.getElementById("switchPlayer").addEventListener("click", () => {
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    buildingMode = null;

    document.getElementById("buildCityButton").classList.remove("active");
    document.getElementById("buildFactoryButton").classList.remove("active");

    updateInterface();
    renderMap();
});

document.getElementById("pauseButton").addEventListener("click", () => {
    paused = !paused;

    document.getElementById("pauseButton").textContent =
        paused ? "Fortsetzen" : "Pause";
});

function getTileFromScreen(mouseX, mouseY) {
    const worldX = (mouseX - camera.x) / camera.zoom;
    const worldY = (mouseY - camera.y) / camera.zoom;

    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);

    return tiles.find(
        tile => tile.x === tileX && tile.y === tileY
    );
}

function captureTile(tile) {
    if (!tile || tile.terrain !== "land") return;
    if (tile.owner !== null) return;

    const isAdjacent = getNeighbors(tile).some(
        neighbor => neighbor.owner === currentPlayer
    );

    if (!isAdjacent) return;

    tile.owner = currentPlayer;

    document.getElementById("gameMessage").textContent =
        "Gebiet erobert!";

    updateInterface();
    renderMap();
}

function handleTileClick(tile) {
    if (paused || !tile) return;

    if (buildingMode === "city") {
        const result = buildCity(tile, currentPlayer);

        document.getElementById("gameMessage").textContent =
            result.message;

        if (result.success) {
            buildingMode = null;
            document.getElementById("buildCityButton").classList.remove("active");
        }

        updateInterface();
        renderMap();
        return;
    }

    if (buildingMode === "factory") {
        const result = buildFactory(tile, currentPlayer, tiles);

        document.getElementById("gameMessage").textContent =
            result.message;

        if (result.success) {
            buildingMode = null;
            document.getElementById("buildFactoryButton").classList.remove("active");
        }

        updateInterface();
        renderMap();
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

        handleTileClick(
            getTileFromScreen(
                event.clientX - rect.left,
                event.clientY - rect.top
            )
        );
    }
});

canvas.addEventListener("wheel", event => {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const oldZoom = camera.zoom;
    const factor = event.deltaY < 0 ? 1.1 : 0.9;

    const newZoom = Math.min(2.5, Math.max(0.4, oldZoom * factor));

    camera.x = mouseX - (mouseX - camera.x) * (newZoom / oldZoom);
    camera.y = mouseY - (mouseY - camera.y) * (newZoom / oldZoom);

    camera.zoom = newZoom;

    renderMap();
}, { passive: false });

// Spielschleife
let previousTime = performance.now();
let incomeTimer = 0;

function gameLoop(currentTime) {
    const deltaTime = Math.min(
        (currentTime - previousTime) / 1000,
        0.25
    );

    previousTime = currentTime;

    if (!paused) {
        const counts = getBuildingCounts();

        updatePopulation(deltaTime, counts.cities);

        incomeTimer += deltaTime;

        if (incomeTimer >= 5) {
            produceFactoryIncome(counts.factories);
            incomeTimer -= 5;
        }

        updateInterface();
    }

    requestAnimationFrame(gameLoop);
}

// Start
resizeCanvas();
centerCamera();
updateInterface();
renderMap();

requestAnimationFrame(gameLoop);
