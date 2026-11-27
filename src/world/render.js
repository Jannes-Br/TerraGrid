
import { tiles, TILE_SIZE } from "./map.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

export const camera = {
    x: 0,
    y: 0,
    zoom: 1
};

export const playerColors = {
    1: "#3188e8",
    2: "#e65353"
};

export function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    ctx.setTransform(
        window.devicePixelRatio, 0,
        0, window.devicePixelRatio,
        0, 0
    );
}

export function renderMap() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#080d13";
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    for (const tile of tiles) {
        const x = tile.x * TILE_SIZE;
        const y = tile.y * TILE_SIZE;

        if (tile.terrain === "water") {
            ctx.fillStyle = "#173b59";
        } else {
            ctx.fillStyle = "#6b985d";
        }

        if (tile.owner !== null) {
            ctx.fillStyle = playerColors[tile.owner];
        }

        ctx.fillRect(
            x,
            y,
            TILE_SIZE,
            TILE_SIZE
        );

        // Kachelgrenzen
        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
            x,
            y,
            TILE_SIZE,
            TILE_SIZE
        );
    }

    ctx.restore();
}

window.addEventListener("resize", () => {
    resizeCanvas();
    renderMap();
});

