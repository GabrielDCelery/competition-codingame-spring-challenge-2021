import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, isValidHexCoordinates } from './game-state';
import {
    addHexDirection,
    getHexDirectionByID,
    hexCoordinatesToKey,
    keyToHexCoordinates,
    scaleHexDirection,
} from './hex-map-transforms';

const getTreeShadowModifiersForWeek = (
    gameState: GameState,
    treatEveryTreeAsSizeThree?: boolean
): { [index: string]: number } => {
    const shadowModifiers: { [index: string]: number } = {};

    const treeKeys = [...Object.keys(gameState.players.me.trees), ...Object.keys(gameState.players.opponent.trees)];

    treeKeys.forEach((treeKey) => {
        const treeCastingShadow = gameState.players.me.trees[treeKey] || gameState.players.opponent.trees[treeKey];
        const treeCastingShadowSize = treatEveryTreeAsSizeThree === true ? 3 : treeCastingShadow.size;

        if (treeCastingShadowSize === 0) {
            return;
        }

        const treeCoordinates = keyToHexCoordinates(treeKey);

        for (let directionID = 0, iMax = 6; directionID < iMax; directionID++) {
            const hexDirection = getHexDirectionByID(directionID);
            const maxScale = treatEveryTreeAsSizeThree ? 3 : treeCastingShadow.size;

            for (let scale = 1; scale <= maxScale; scale++) {
                const scaledHexDirection = scaleHexDirection(hexDirection, scale);
                const shadowCoordinates = addHexDirection(treeCoordinates, scaledHexDirection);

                if (!isValidHexCoordinates(gameState, shadowCoordinates)) {
                    break;
                }

                const shadowCastOnTreeKey = hexCoordinatesToKey(shadowCoordinates);
                const treeBeingCastShadowOn =
                    gameState.players.me.trees[shadowCastOnTreeKey] ||
                    gameState.players.opponent.trees[shadowCastOnTreeKey];

                if (!treeBeingCastShadowOn) {
                    continue;
                }

                const treeBeingCastShadowOnSize = treatEveryTreeAsSizeThree === true ? 3 : treeBeingCastShadowOn.size;

                if (treeCastingShadowSize < treeBeingCastShadowOnSize) {
                    continue;
                }

                shadowModifiers[shadowCastOnTreeKey] = (shadowModifiers[shadowCastOnTreeKey] || 0) + 1 / 6;
            }
        }
    });

    return shadowModifiers;
};

type PlayerGameStateEnhancement = {
    totalTreeSize: number;
    averageSunProductionPerDay: number;
    projectedAverageSunProductionPerDay: number;
    projectedFinalScore: number;
};

type GameStateEnhancement = {
    players: {
        me: PlayerGameStateEnhancement;
        opponent: PlayerGameStateEnhancement;
    };
};

export type EnhancedGameState = GameState & {
    enhancements: GameStateEnhancement;
};

export const enhanceGameState = (gameState: GameState): EnhancedGameState => {
    const enhancedGameState: EnhancedGameState = {
        ...gameState,
        enhancements: {
            players: {
                me: {
                    totalTreeSize: 0,
                    averageSunProductionPerDay: 0,
                    projectedAverageSunProductionPerDay: 0,
                    projectedFinalScore: 0,
                },
                opponent: {
                    totalTreeSize: 0,
                    averageSunProductionPerDay: 0,
                    projectedAverageSunProductionPerDay: 0,
                    projectedFinalScore: 0,
                },
            },
        },
    };

    const treeShadowModifiers = getTreeShadowModifiersForWeek(gameState);
    const treeShadowModifiersTreatingEveryTreeAsSizeThree = getTreeShadowModifiersForWeek(gameState, true);
    const myTreeKeys = Object.keys(gameState.players.me.trees);
    const opponentTreeKeys = Object.keys(gameState.players.opponent.trees);

    myTreeKeys.forEach((treeKey) => {
        const tree = gameState.players.me.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.me.averageSunProductionPerDay += tree.size * productionWeight;

        const projectedProductionWeight = 1 - (treeShadowModifiersTreatingEveryTreeAsSizeThree[treeKey] || 0);
        enhancedGameState.enhancements.players.me.projectedAverageSunProductionPerDay += 3 * projectedProductionWeight;

        enhancedGameState.enhancements.players.me.totalTreeSize += tree.size;
    });

    opponentTreeKeys.forEach((treeKey) => {
        const tree = gameState.players.opponent.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.opponent.averageSunProductionPerDay += tree.size * productionWeight;

        const projectedProductionWeight = 1 - (treeShadowModifiersTreatingEveryTreeAsSizeThree[treeKey] || 0);
        enhancedGameState.enhancements.players.opponent.projectedAverageSunProductionPerDay +=
            3 * projectedProductionWeight;

        enhancedGameState.enhancements.players.opponent.totalTreeSize += tree.size;
    });

    const daysLeft = MAX_NUM_OF_DAYS - gameState.day;
    enhancedGameState.enhancements.players.me.projectedFinalScore +=
        gameState.players.me.score +
        (enhancedGameState.enhancements.players.me.averageSunProductionPerDay * daysLeft) / 3;

    let currentNutrientsModifier = gameState.nutrients - 20;

    myTreeKeys.forEach((treeKey) => {
        const tree = gameState.players.me.trees[treeKey];
        if (tree.size < 3) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = gameState.map.richnessMatrix[r][q] || 0;
        enhancedGameState.enhancements.players.me.projectedFinalScore +=
            gameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 2;
    });

    enhancedGameState.enhancements.players.opponent.projectedFinalScore +=
        gameState.players.opponent.score +
        (enhancedGameState.enhancements.players.opponent.averageSunProductionPerDay * daysLeft) / 3;

    currentNutrientsModifier = gameState.nutrients - 20;

    opponentTreeKeys.forEach((treeKey) => {
        const tree = gameState.players.opponent.trees[treeKey];
        if (tree.size < 3) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = gameState.map.richnessMatrix[r][q] || 0;
        enhancedGameState.enhancements.players.opponent.projectedFinalScore +=
            gameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 2;
    });

    return enhancedGameState;
};

export type NormalizedGameStateEnhancement = {
    players: {
        me: PlayerGameStateEnhancement;
        opponent: PlayerGameStateEnhancement;
    };
};
