
export const players = {
    1: {
        population: 100,
        capacity: 500,
        allocated: 0
    },
    2: {
        population: 100,
        capacity: 500,
        allocated: 0
    }
};

export function getPlayerStats(playerId) {
    const player = players[playerId];

    return {
        population: player.population,
        capacity: player.capacity,
        allocated: player.allocated,
        free: Math.max(0, player.population - player.allocated)
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

export function spendPopulation(playerId, amount) {
    const player = players[playerId];

    const free = player.population - player.allocated;

    if (free < amount) {
        return false;
    }

    player.population -= amount;
    return true;
}

export function increaseCapacity(playerId, amount) {
    players[playerId].capacity += amount;
}

