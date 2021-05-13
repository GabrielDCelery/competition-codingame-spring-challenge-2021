import { MAX_TREE_SIZE } from './game-config';
import { GameState } from './game-state';
import { ShadowModifiersForWeek } from './game-state-enhancements';
import { average, normalizedExponentialDecay, normalizedLinear } from './utility-helpers';
import { caluclatePlayerAverageSunProductionPerDay } from './player-ai-utils-common';

export const calculateTreeSizeUtility = (newGameState: GameState): number => {
    const treeSizes = Object.keys(newGameState.players.me.trees).map((treeKey) => {
        return newGameState.players.me.trees[treeKey].size;
    });
    const averageTreeSize = average(treeSizes);
    return 1 - normalizedExponentialDecay({ value: averageTreeSize, max: MAX_TREE_SIZE });
};

export const calculateSunProductionUtility = (
    newGameState: GameState,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    const targetSunProduction = 20;
    const myAverageSunproductionPerDay = caluclatePlayerAverageSunProductionPerDay({
        playerTrees: newGameState.players.me.trees,
        shadowModifiersForWeek,
    });
    const production =
        myAverageSunproductionPerDay > targetSunProduction ? targetSunProduction : myAverageSunproductionPerDay;
    const utility = normalizedLinear({ value: production, max: targetSunProduction });
    return utility;
};

export const calculateRelativeSunProductionUtility = (
    newGameState: GameState,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    const myAverageSunproductionPerDay = caluclatePlayerAverageSunProductionPerDay({
        playerTrees: newGameState.players.me.trees,
        shadowModifiersForWeek,
    });

    const opponentAverageSunproductionPerDay = caluclatePlayerAverageSunProductionPerDay({
        playerTrees: newGameState.players.opponent.trees,
        shadowModifiersForWeek,
    });

    const totalAverageProduction = myAverageSunproductionPerDay + opponentAverageSunproductionPerDay;
    const utility = totalAverageProduction === 0 ? 0.5 : myAverageSunproductionPerDay / totalAverageProduction;
    return utility;
};
