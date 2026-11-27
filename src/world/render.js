
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
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

        ctx.fillStyle = tile.terrain === "water"
            ? "#173b59"
            : "#6b985d";

        if (tile.owner !== null) {
            ctx.fillStyle = playerColors[tile.owner];
        }

        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

        if (tile.building) {
            const icons = {
                city: "🏙️",
                factory: "🏭"
            };

            ctx.font = "27px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
                icons[tile.building] || "❔",
                x + TILE_SIZE / 2,
                y + TILE_SIZE / 2
            );
        }
    }

    ctx.restore();
}

window.addEventListener("resize", () => {
    resizeCanvas();
    renderMap();
});
