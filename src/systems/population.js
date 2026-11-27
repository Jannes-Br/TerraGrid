
export const players = {
    1: {
        population: 100,
        capacity: 500
    },
    2: {
        population: 100,
        capacity: 500
    }
};

export function getPlayerStats(playerId) {
    const player = players[playerId];

    return {
        population: player.population,
        capacity: player.capacity,
        free: player.population
    };
}

export function updatePopulation(deltaTime, cityCounts) {
    for (const playerId of [1, 2]) {
        const player = players[playerId];
        const cityCount = cityCounts[playerId] || 0;

        const growth = cityCount * 0.5 * deltaTime;

        player.population = Math.min(
            player.capacity,
            player.population + growth
        );
    }
}

export function increaseCapacity(playerId, amount) {
    players[playerId].capacity += amount;
}
