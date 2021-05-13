import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, isValidHexCoordinates } from './game-state';
import {
    addHexDirection,
    getHexDirectionByID,
    hexCoordinatesToKey,
    keyToHexCoordinates,
    scaleHexDirection,
} from './hex-map-transforms';

const getTreeShadowModifiersForWeek = (gameState: GameState): { [index: string]: number } => {
    const shadowModifiers: { [index: string]: number } = {};

    const treeKeys = [...Object.keys(gameState.players.me.trees), ...Object.keys(gameState.players.opponent.trees)];

    treeKeys.forEach((treeKey) => {
        const treeCastingShadow = gameState.players.me.trees[treeKey] || gameState.players.opponent.trees[treeKey];
        const treeCastingShadowSize = treeCastingShadow.size;

        if (treeCastingShadowSize === 0) {
            return;
        }

        const treeCoordinates = keyToHexCoordinates(treeKey);

        for (let directionID = 0, iMax = 6; directionID < iMax; directionID++) {
            const hexDirection = getHexDirectionByID(directionID);
            const maxScale = treeCastingShadow.size;

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

                const treeBeingCastShadowOnSize = treeBeingCastShadowOn.size;

                if (treeCastingShadowSize < treeBeingCastShadowOnSize) {
                    continue;
                }

                shadowModifiers[shadowCastOnTreeKey] = (shadowModifiers[shadowCastOnTreeKey] || 0) + 1 / 6;
            }
        }
    });

    return shadowModifiers;
};

export type AreaAnalysis = {
    players: {
        me: {
            numOfTrees: number;
            numOfSeeds: number;
        };
        opponent: {
            numOfTrees: number;
            numOfSeeds: number;
        };
    };
};

const getAreaAnalysisList = (gameState: GameState): AreaAnalysis[] => {
    //  const areaCenters = [11, 9, 13, 0, 7, 15, 17];
    const areaCenters = [11, 10, 9, 12, 3, 2, 8, 13, 4, 0, 1, 7, 14, 5, 6, 18, 15, 16, 17];
    const areaAnalysisList = areaCenters.map((areaCenterID) => {
        const areaAnalysis: AreaAnalysis = {
            players: {
                me: {
                    numOfTrees: 0,
                    numOfSeeds: 0,
                },
                opponent: {
                    numOfTrees: 0,
                    numOfSeeds: 0,
                },
            },
        };

        const areaCenterCoordinates = gameState.map.cellIndexToHexCoordinates[areaCenterID];

        const areaCoordinatesList = [
            areaCenterCoordinates,
            ...[0, 1, 2, 3, 4, 5].map((directionID) => {
                const hexDirection = getHexDirectionByID(directionID);
                return addHexDirection(areaCenterCoordinates, hexDirection);
            }),
        ];

        areaCoordinatesList.forEach((areaCoordinates) => {
            const key = hexCoordinatesToKey(areaCoordinates);
            const tree = gameState.players.me.trees[key];
            if (tree) {
                if (tree.size === 0) {
                    areaAnalysis.players.me.numOfSeeds += 1;
                } else {
                    areaAnalysis.players.me.numOfTrees += 1;
                }
            }
        });

        return areaAnalysis;
    });
    return areaAnalysisList;
};

type PlayerGameStateEnhancement = {
    averageSunProductionPerDay: number;
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
    areaAnalysisList: AreaAnalysis[];
};

export const enhanceGameState = (newGameState: GameState): EnhancedGameState => {
    const enhancedGameState: EnhancedGameState = {
        ...newGameState,
        enhancements: {
            players: {
                me: {
                    averageSunProductionPerDay: 0,
                    projectedFinalScore: 0,
                },
                opponent: {
                    averageSunProductionPerDay: 0,
                    projectedFinalScore: 0,
                },
            },
        },
        areaAnalysisList: getAreaAnalysisList(newGameState),
    };

    const treeShadowModifiers = getTreeShadowModifiersForWeek(newGameState);
    const myTreeKeys = Object.keys(newGameState.players.me.trees);
    const opponentTreeKeys = Object.keys(newGameState.players.opponent.trees);

    myTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.me.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.me.averageSunProductionPerDay += tree.size * productionWeight;
    });

    opponentTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.opponent.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.opponent.averageSunProductionPerDay += tree.size * productionWeight;
    });

    const daysLeft = MAX_NUM_OF_DAYS - newGameState.day;
    enhancedGameState.enhancements.players.me.projectedFinalScore += newGameState.players.me.score;
    let mySunProducedTillEndOfGame =
        enhancedGameState.enhancements.players.me.averageSunProductionPerDay * daysLeft * 0.8;

    let currentNutrientsModifier = 0;

    myTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.me.trees[treeKey];
        if (tree.size < 3) {
            return;
        }
        if (mySunProducedTillEndOfGame < 4) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = newGameState.map.richnessMatrix[r][q] || 0;
        enhancedGameState.enhancements.players.me.projectedFinalScore +=
            newGameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 1;
        mySunProducedTillEndOfGame -= 4;
    });

    enhancedGameState.enhancements.players.me.projectedFinalScore += mySunProducedTillEndOfGame / 3;

    enhancedGameState.enhancements.players.opponent.projectedFinalScore += newGameState.players.opponent.score;
    let opponentSunProducedTillEndOfGame =
        enhancedGameState.enhancements.players.opponent.averageSunProductionPerDay * daysLeft * 0.8;

    currentNutrientsModifier = 0;

    opponentTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.opponent.trees[treeKey];
        if (tree.size < 3) {
            return;
        }
        if (opponentSunProducedTillEndOfGame < 4) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = newGameState.map.richnessMatrix[r][q] || 0;
        enhancedGameState.enhancements.players.opponent.projectedFinalScore +=
            newGameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 1;
        opponentSunProducedTillEndOfGame -= 4;
    });

    enhancedGameState.enhancements.players.opponent.projectedFinalScore += opponentSunProducedTillEndOfGame / 3;

    return enhancedGameState;
};
