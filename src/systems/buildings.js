
import { spendMoney } from "./economy.js";

import {
    increaseCapacity,
    allocatePopulation
} from "./population.js";

export const buildingData = {
    city: {
        name: "Stadt",
        icon: "🏙️",
        cost: 100_000_000,
        capacity: 300
    },

    factory: {
        name: "Fabrik",
        icon: "🏭",
        cost: 250_000_000,
        workers: 50,
        income: 5_000_000
    }
};

function hasAdjacentCity(tile, playerId, tiles) {
    const directions = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0]
    ];

    return directions.some(([dx, dy]) => {
        const neighbor = tiles.find(
            other => other.x === tile.x + dx &&
                     other.y === tile.y + dy
        );

        return neighbor &&
            neighbor.owner === playerId &&
            neighbor.building === "city";
    });
}

export function buildCity(tile, playerId) {
    if (!tile) {
        return { success: false, message: "Keine Kachel ausgewählt." };
    }

    if (tile.terrain !== "land" || tile.owner !== playerId) {
        return { success: false, message: "Du kannst nur auf deinem eigenen Land bauen." };
    }

    if (tile.building !== null) {
        return { success: false, message: "Hier steht bereits ein Gebäude." };
    }

    const building = buildingData.city;

    if (!spendMoney(playerId, building.cost)) {
        return { success: false, message: "Du hast nicht genug Geld." };
    }

    tile.building = "city";

    increaseCapacity(playerId, building.capacity);

    return { success: true, message: "Stadt erfolgreich gebaut!" };
}

export function buildFactory(tile, playerId, allTiles) {
    if (!tile) {
        return { success: false, message: "Keine Kachel ausgewählt." };
    }

    if (tile.terrain !== "land" || tile.owner !== playerId) {
        return { success: false, message: "Du kannst nur auf deinem eigenen Land bauen." };
    }

    if (tile.building !== null) {
        return { success: false, message: "Hier steht bereits ein Gebäude." };
    }

    if (!hasAdjacentCity(tile, playerId, allTiles)) {
        return { success: false, message: "Eine eigene Stadt muss direkt daneben stehen." };
    }

    const building = buildingData.factory;

    if (!allocatePopulation(playerId, building.workers)) {
        return { success: false, message: "Du hast nicht genügend freie Bevölkerung für 50 Arbeiter." };
    }

    if (!spendMoney(playerId, building.cost)) {
        // Arbeiter wieder freigeben, wenn das Geld nicht reicht
        const player = getPlayerForRefund(playerId);
        player.allocated -= building.workers;

        return { success: false, message: "Du hast nicht genug Geld." };
    }

    tile.building = "factory";
    tile.workers = building.workers;

    return { success: true, message: "Fabrik gebaut! 50 Arbeiter wurden zugewiesen." };
}

import { players as populationPlayers } from "./population.js";

function getPlayerForRefund(playerId) {
    return populationPlayers[playerId];
}
