
export const MAP_WIDTH = 35;
export const MAP_HEIGHT = 25;

export const TILE_SIZE = 48;

export const tiles = [];

export function createMap() {
    tiles.length = 0;

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            let terrain = "water";

            if (
                x >= 4 && x <= 16 &&
                y >= 5 && y <= 18
            ) {
                terrain = "land";
            }

            if (
                x >= 20 && x <= 30 &&
                y >= 3 && y <= 15
            ) {
                terrain = "land";
            }

            if (
                x >= 22 && x <= 26 &&
                y >= 19 && y <= 22
            ) {
                terrain = "land";
            }

            tiles.push({
                x,
                y,
                terrain,
                owner: null,
                building: null
            });
        }
    }

    // Startgebiete und Startstädte
    getTile(7, 9).owner = 1;
    getTile(7, 9).building = "city";

    getTile(25, 9).owner = 2;
    getTile(25, 9).building = "city";
}

export function getTile(x, y) {
    return tiles.find(
        tile => tile.x === x && tile.y === y
    );
}

export function getNeighbors(tile) {
    return [
        getTile(tile.x, tile.y - 1),
        getTile(tile.x + 1, tile.y),
        getTile(tile.x, tile.y + 1),
        getTile(tile.x - 1, tile.y)
    ].filter(Boolean);
}
