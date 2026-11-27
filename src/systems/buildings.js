
import { spendMoney } from "./economy.js";

import {
    increaseCapacity,
    allocatePopulation,
    players
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

function hasAdjacentCity(tile, playerId, allTiles) {
    const directions = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0]
    ];

    return directions.some(([dx, dy]) => {
        const neighbor = allTiles.find(
            other =>
                other.x === tile.x + dx &&
                other.y === tile.y + dy
        );

        return neighbor &&
            neighbor.owner === playerId &&
            neighbor.building === "city";
    });
}

export function buildCity(tile, playerId) {
    if (!tile || tile.terrain !== "land" || tile.owner !== playerId) {
        return { success: false, message: "Du brauchst eine eigene Landkachel." };
    }

    if (tile.building !== null) {
        return { success: false, message: "Hier steht bereits ein Gebäude." };
    }

    if (!spendMoney(playerId, buildingData.city.cost)) {
        return { success: false, message: "Nicht genug Geld." };
    }

    tile.building = "city";
    increaseCapacity(playerId, buildingData.city.capacity);

    return { success: true, message: "Stadt erfolgreich gebaut!" };
}

export function buildFactory(tile, playerId, allTiles) {
    if (!tile || tile.terrain !== "land" || tile.owner !== playerId) {
        return { success: false, message: "Du brauchst eine eigene Landkachel." };
    }

    if (tile.building !== null) {
        return { success: false, message: "Hier steht bereits ein Gebäude." };
    }

    if (!hasAdjacentCity(tile, playerId, allTiles)) {
        return {
            success: false,
            message: "Eine eigene Stadt muss direkt daneben stehen."
        };
    }

    const building = buildingData.factory;
    const player = players[playerId];

    if (player.population - player.allocated < building.workers) {
        return {
            success: false,
            message: "Du hast nicht genügend freie Bevölkerung."
        };
    }

    if (playerMoneyCheck(playerId, building.cost) === false) {
        return { success: false, message: "Nicht genug Geld." };
    }

    if (!spendMoney(playerId, building.cost)) {
        return { success: false, message: "Nicht genug Geld." };
    }

    allocatePopulation(playerId, building.workers);

    tile.building = "factory";
    tile.workers = building.workers;

    return {
        success: true,
        message: "Fabrik gebaut! 50 Arbeiter wurden zugewiesen."
    };
}

import { getMoney } from "./economy.js";

function playerMoneyCheck(playerId, cost) {
    return getMoney(playerId) >= cost;
}
