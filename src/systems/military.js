
export const playerMilitary = {
    1: { troops: 0 },
    2: { troops: 0 }
};

export function getTroops(playerId) {
    return playerMilitary[playerId].troops;
}

export function produceMilitaryUnits(baseCounts) {
    for (const playerId of [1, 2]) {
        const bases = baseCounts[playerId] || 0;
        playerMilitary[playerId].troops += bases * 10;
    }
}

