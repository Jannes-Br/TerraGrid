
export const playerMoney = {
    1: 1_000_000_000,
    2: 1_000_000_000
};

export function getMoney(playerId) {
    return playerMoney[playerId];
}

export function spendMoney(playerId, amount) {
    if (playerMoney[playerId] < amount) {
        return false;
    }

    playerMoney[playerId] -= amount;
    return true;
}

export function addMoney(playerId, amount) {
    playerMoney[playerId] += amount;
}

export function produceFactoryIncome(factoryCounts) {
    for (const playerId of [1, 2]) {
        const factories = factoryCounts[playerId] || 0;

        addMoney(playerId, factories * 5_000_000);
    }
}
