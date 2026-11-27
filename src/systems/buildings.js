
import {
    spendPopulation,
    increaseCapacity
} from "./population.js";

export function buildCity(tile, playerId) {
    if (!tile) return false;

    // Nur eigenes Land
    if (tile.owner !== playerId) return false;

    // Auf einer Kachel darf nur ein Gebäude stehen
    if (tile.building !== null) return false;

    // Kosten bezahlen
    if (!spendPopulation(playerId, 50)) {
        return false;
    }

    tile.building = "city";

    // Bevölkerungskapazität erhöhen
    increaseCapacity(playerId, 300);

    return true;
}

