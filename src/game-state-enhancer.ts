import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, getNumOfTreesOfSameSize, isValidHexCoordinates } from './game-state';
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
    influence: number;
    numOfDormantTrees: number;
    expansionsAverageSunninessPerDay: number;
    numOfExpansions: number;
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
                    influence: 0,
                    numOfDormantTrees: 0,
                    expansionsAverageSunninessPerDay: 0,
                    numOfExpansions: 0,
                },
                opponent: {
                    totalTreeSize: 0,
                    averageSunProductionPerDay: 0,
                    projectedAverageSunProductionPerDay: 0,
                    projectedFinalScore: 0,
                    influence: 0,
                    numOfDormantTrees: 0,
                    expansionsAverageSunninessPerDay: 0,
                    numOfExpansions: 0,
                },
            },
        },
    };

    const treeShadowModifiers = getTreeShadowModifiersForWeek(gameState);
    const treeShadowModifiersTreatingEveryTreeAsSizeThree = getTreeShadowModifiersForWeek(gameState, true);
    const myTreeKeys = Object.keys(gameState.players.me.trees);
    const opponentTreeKeys = Object.keys(gameState.players.opponent.trees);

    const numOfSizeZeroTrees = getNumOfTreesOfSameSize(gameState, 0);

    myTreeKeys.forEach((treeKey) => {
        const tree = gameState.players.me.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.me.averageSunProductionPerDay += tree.size * productionWeight;

        const projectedProductionWeight = 1 - (treeShadowModifiersTreatingEveryTreeAsSizeThree[treeKey] || 0);
        enhancedGameState.enhancements.players.me.projectedAverageSunProductionPerDay += 3 * projectedProductionWeight;

        enhancedGameState.enhancements.players.me.totalTreeSize += tree.size;

        if (tree.isDormant) {
            enhancedGameState.enhancements.players.me.numOfDormantTrees += 1;
        }

        if (tree.size === 0) {
            enhancedGameState.enhancements.players.me.expansionsAverageSunninessPerDay +=
                productionWeight / numOfSizeZeroTrees;
        }
    });

    enhancedGameState.enhancements.players.me.numOfExpansions = numOfSizeZeroTrees;

    opponentTreeKeys.forEach((treeKey) => {
        const tree = gameState.players.opponent.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.opponent.averageSunProductionPerDay += tree.size * productionWeight;

        const projectedProductionWeight = 1 - (treeShadowModifiersTreatingEveryTreeAsSizeThree[treeKey] || 0);
        enhancedGameState.enhancements.players.opponent.projectedAverageSunProductionPerDay +=
            3 * projectedProductionWeight;

        enhancedGameState.enhancements.players.opponent.totalTreeSize += tree.size;

        if (tree.isDormant) {
            enhancedGameState.enhancements.players.opponent.numOfDormantTrees += 1;
        }

        if (tree.size === 0) {
            enhancedGameState.enhancements.players.opponent.expansionsAverageSunninessPerDay +=
                productionWeight / numOfSizeZeroTrees;
        }
    });

    const daysLeft = MAX_NUM_OF_DAYS - gameState.day;
    enhancedGameState.enhancements.players.me.projectedFinalScore +=
        gameState.players.me.score +
        (enhancedGameState.enhancements.players.me.averageSunProductionPerDay * daysLeft) / 3;

    let currentNutrientsModifier = 0;

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

    currentNutrientsModifier = 0;

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

    const influencedCells: { [index: string]: boolean } = {};

    myTreeKeys.forEach((treeKey) => {
        influencedCells[treeKey] = true;
        const treeCoordinates = keyToHexCoordinates(treeKey);
        [0, 1, 2, 3, 4, 5].forEach((directionID) => {
            const hexDirection = getHexDirectionByID(directionID);
            const influencedCoordinates = addHexDirection(treeCoordinates, hexDirection);
            if (!isValidHexCoordinates(gameState, influencedCoordinates)) {
                return;
            }
            const influencedKey = hexCoordinatesToKey(influencedCoordinates);
            if (
                gameState.players.me.trees[influencedKey] ||
                // gameState.players.opponent.trees[influencedKey] ||
                influencedCells[influencedKey]
            ) {
                return;
            }
            influencedCells[influencedKey] = true;
        });
    });

    enhancedGameState.enhancements.players.me.influence = Object.keys(influencedCells).length;

    return enhancedGameState;
};

type GameStatePlayerMinMax = {
    totalTreeSize: { min: number; max: number };
    sun: { min: number; max: number };
    score: { min: number; max: number };
    averageSunProductionPerDay: { min: number; max: number };
    influence: { min: number; max: number };
    expansionsAverageSunninessPerDay: { min: number; max: number };
    numOfExpansions: { min: number; max: number };
};

export type GameStateMinMax = {
    players: {
        me: GameStatePlayerMinMax;
    };
};

export const getGameStateMinMax = (enhancedGameStates: EnhancedGameState[]): GameStateMinMax => {
    const myTotalTreeSizes: number[] = [];
    const mySuns: number[] = [];
    const myScores: number[] = [];
    const averageSunProductionPerDay: number[] = [];
    const myInfluences: number[] = [];
    const myExpansionsAverageSunninessPerDays: number[] = [];
    const myNumberOfExpansionsList: number[] = [];

    enhancedGameStates.forEach((enhancedGameState) => {
        myTotalTreeSizes.push(enhancedGameState.enhancements.players.me.totalTreeSize);
        mySuns.push(enhancedGameState.players.me.sun);
        myScores.push(enhancedGameState.players.me.score);
        averageSunProductionPerDay.push(enhancedGameState.enhancements.players.me.averageSunProductionPerDay);
        myInfluences.push(enhancedGameState.enhancements.players.me.influence);
        myExpansionsAverageSunninessPerDays.push(
            enhancedGameState.enhancements.players.me.expansionsAverageSunninessPerDay
        );
        myNumberOfExpansionsList.push(enhancedGameState.enhancements.players.me.numOfExpansions);
    });

    const gameStateMinMax: GameStateMinMax = {
        players: {
            me: {
                totalTreeSize: {
                    min: Math.min(...myTotalTreeSizes),
                    max: Math.max(...myTotalTreeSizes),
                },
                sun: {
                    min: Math.min(...mySuns),
                    max: Math.max(...mySuns),
                },
                score: {
                    min: Math.min(...myScores),
                    max: Math.max(...myScores),
                },
                averageSunProductionPerDay: {
                    min: Math.min(...averageSunProductionPerDay),
                    max: Math.max(...averageSunProductionPerDay),
                },
                influence: {
                    min: Math.min(...myInfluences),
                    max: Math.max(...myInfluences),
                },
                expansionsAverageSunninessPerDay: {
                    min: Math.min(...myExpansionsAverageSunninessPerDays),
                    max: Math.max(...myExpansionsAverageSunninessPerDays),
                },
                numOfExpansions: {
                    min: Math.min(...myNumberOfExpansionsList),
                    max: Math.max(...myNumberOfExpansionsList),
                },
            },
        },
    };

    return gameStateMinMax;
};
