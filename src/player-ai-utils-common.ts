import { PlayerTrees } from './game-state';
import { ShadowModifiersForWeek } from './game-state-enhancements';

export const caluclatePlayerAverageSunProductionPerDay = ({
    playerTrees,
    shadowModifiersForWeek,
}: {
    playerTrees: PlayerTrees;
    shadowModifiersForWeek: ShadowModifiersForWeek;
}): number => {
    let averageSunproductionPerDay = 0;
    Object.keys(playerTrees).forEach((treeKey) => {
        const tree = playerTrees[treeKey];
        const productionWeight = 1 - (shadowModifiersForWeek[treeKey] || 0);
        averageSunproductionPerDay += tree.size * productionWeight;
    });
    return averageSunproductionPerDay;
};
