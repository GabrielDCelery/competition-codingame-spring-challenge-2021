import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState } from './game-state';
import { getTreesInShadowMapForDay } from './game-state-enhancements';
import { keyToHexCoordinates } from './hex-map-transforms';
import { normalizedLinear } from './utility-helpers';

export const calculateRelativeSunProducedForNextXDays = ({
    newGameState,
    nextXDays,
}: {
    newGameState: GameState;
    nextXDays: number;
}): number => {
    const currentDay = newGameState.day;
    const daysLeft = MAX_NUM_OF_DAYS - currentDay;
    if (daysLeft === 0) {
        return 0;
    }
    const numOfDaysAhead = nextXDays > daysLeft ? daysLeft : nextXDays;

    let mySunForNextXDays = 0;
    let opponentSunForNextXDays = 0;

    for (let dayOffset = 1; dayOffset <= numOfDaysAhead; dayOffset++) {
        const targetDay = currentDay + dayOffset;
        const treesInShadowMap = getTreesInShadowMapForDay({ gameState: newGameState, day: targetDay });

        Object.keys(newGameState.players.me.trees).forEach((treeKey) => {
            if (treesInShadowMap[treeKey]) {
                return;
            }
            const tree = newGameState.players.me.trees[treeKey];
            mySunForNextXDays += tree.size;
        });

        Object.keys(newGameState.players.opponent.trees).forEach((treeKey) => {
            if (treesInShadowMap[treeKey]) {
                return;
            }
            const tree = newGameState.players.opponent.trees[treeKey];
            opponentSunForNextXDays += tree.size;
        });
    }

    const totalProductionBetweenPlayers = mySunForNextXDays + opponentSunForNextXDays;
    const utility = totalProductionBetweenPlayers === 0 ? 0.5 : mySunForNextXDays / totalProductionBetweenPlayers;
    return utility;
};

export const preferGrowingTreesInRichSoil = ({ newGameState }: { newGameState: GameState }): number => {
    let totalRichness = 0;
    let numOfTrees = 0;

    Object.keys(newGameState.players.me.trees).forEach((treeKey) => {
        const tree = newGameState.players.me.trees[treeKey];
        const [q, r] = keyToHexCoordinates(treeKey);
        const richness = newGameState.map.richnessMatrix[r][q] || 0;
        totalRichness += richness * tree.size;
        numOfTrees++;
    });

    const averageRichness = totalRichness / numOfTrees;
    return (
        normalizedLinear({ value: newGameState.day, max: MAX_NUM_OF_DAYS }) *
        0.5 *
        normalizedLinear({ value: averageRichness, max: 9 })
    );
};
