
import { spendMoney } from "./economy.js";
import { increaseCapacity } from "./population.js";

export const buildingData = {
    city: {
        name: "Stadt",
        icon: "🏙️",
        cost: 100_000_000,
        capacity: 300
    }
};

export function buildCity(tile, playerId) {
    if (!tile) {
        return { success: false, message: "Keine Kachel ausgewählt." };
    }

    if (tile.terrain !== "land") {
        return { success: false, message: "Städte können nur auf Land gebaut werden." };
    }

    if (tile.owner !== playerId) {
        return { success: false, message: "Du kannst nur auf deinem eigenen Gebiet bauen." };
    }

    if (tile.building !== null) {
        return { success: false, message: "Auf dieser Kachel steht bereits ein Gebäude." };
    }

    const building = buildingData.city;

    if (!spendMoney(playerId, building.cost)) {
        return { success: false, message: "Du hast nicht genug Geld." };
    }

    tile.building = "city";

    increaseCapacity(playerId, building.capacity);

    return { success: true, message: "Stadt erfolgreich gebaut!" };
}
