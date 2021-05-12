import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, getNumOfTreesOfSameSize, isValidHexCoordinates } from './game-state';
import {
    addHexDirection,
    getHexDirectionByID,
    hexCoordinatesToKey,
    keyToHexCoordinates,
    scaleHexDirection,
} from './hex-map-transforms';
import { mean, standardDeviation } from './utility-helpers';

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
    totalNumOfTrees: number;
    totalNumOfSeeds: number;
    averageTreeSize: number;
    totalTreeSize: number;
    averageSunProductionPerDay: number;
    projectedFinalScore: number;
    influence: number;
    numOfDormantTrees: number;
    expansionsAverageSunninessPerDay: number;
    numOfExpansions: number;
    averageRichnessCovered: number;
};

type GameStateEnhancement = {
    totalNumOfViableCells: number;
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
            totalNumOfViableCells: 0,
            players: {
                me: {
                    totalNumOfTrees: 0,
                    totalNumOfSeeds: 0,
                    averageTreeSize: 0,
                    totalTreeSize: 0,
                    averageSunProductionPerDay: 0,
                    projectedFinalScore: 0,
                    influence: 0,
                    numOfDormantTrees: 0,
                    expansionsAverageSunninessPerDay: 0,
                    numOfExpansions: 0,
                    averageRichnessCovered: 0,
                },
                opponent: {
                    totalNumOfTrees: 0,
                    totalNumOfSeeds: 0,
                    averageTreeSize: 0,
                    totalTreeSize: 0,
                    averageSunProductionPerDay: 0,
                    projectedFinalScore: 0,
                    influence: 0,
                    numOfDormantTrees: 0,
                    expansionsAverageSunninessPerDay: 0,
                    numOfExpansions: 0,
                    averageRichnessCovered: 0,
                },
            },
        },
        areaAnalysisList: getAreaAnalysisList(newGameState),
    };

    const treeShadowModifiers = getTreeShadowModifiersForWeek(newGameState);
    const myTreeKeys = Object.keys(newGameState.players.me.trees);
    const opponentTreeKeys = Object.keys(newGameState.players.opponent.trees);

    //************ rework start */
    newGameState.map.cellIndexToHexCoordinates.forEach((coordinates) => {
        const [q, r] = coordinates;
        const richness = newGameState.map.richnessMatrix[r][q];
        if (richness === 0) {
            return;
        }
        enhancedGameState.enhancements.totalNumOfViableCells += 1;
    });

    let totalTreeSize = 0;
    let totalNumOfTrees = 0;
    let totalNumOfSeeds = 0;
    myTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.me.trees[treeKey];
        if (tree.size === 0) {
            totalNumOfSeeds += 1;
            return;
        }
        totalTreeSize += tree.size;
        totalNumOfTrees += 1;
    });
    enhancedGameState.enhancements.players.me.averageTreeSize = totalTreeSize / totalNumOfTrees;
    enhancedGameState.enhancements.players.me.totalNumOfTrees = totalNumOfTrees;
    enhancedGameState.enhancements.players.me.totalNumOfSeeds = totalNumOfSeeds;

    //************ rework end */
    const numOfSizeZeroTrees = getNumOfTreesOfSameSize(newGameState, 0);
    let myTotalRichness = 0;

    myTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.me.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.me.averageSunProductionPerDay += tree.size * productionWeight;

        enhancedGameState.enhancements.players.me.totalTreeSize += tree.size;

        const [q, r] = keyToHexCoordinates(treeKey);
        myTotalRichness += newGameState.map.richnessMatrix[r][q] || 0;

        if (tree.isDormant) {
            enhancedGameState.enhancements.players.me.numOfDormantTrees += 1;
        }

        if (tree.size === 0) {
            enhancedGameState.enhancements.players.me.expansionsAverageSunninessPerDay +=
                productionWeight / numOfSizeZeroTrees;
        }
    });

    enhancedGameState.enhancements.players.me.averageRichnessCovered = myTotalRichness / myTreeKeys.length;
    enhancedGameState.enhancements.players.me.numOfExpansions = numOfSizeZeroTrees;

    let opponentTotalRichness = 0;

    opponentTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.opponent.trees[treeKey];

        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        enhancedGameState.enhancements.players.opponent.averageSunProductionPerDay += tree.size * productionWeight;

        enhancedGameState.enhancements.players.opponent.totalTreeSize += tree.size;

        const [q, r] = keyToHexCoordinates(treeKey);
        opponentTotalRichness += newGameState.map.richnessMatrix[r][q] || 0;

        if (tree.isDormant) {
            enhancedGameState.enhancements.players.opponent.numOfDormantTrees += 1;
        }

        if (tree.size === 0) {
            enhancedGameState.enhancements.players.opponent.expansionsAverageSunninessPerDay +=
                productionWeight / numOfSizeZeroTrees;
        }
    });

    enhancedGameState.enhancements.players.opponent.averageRichnessCovered = opponentTotalRichness / myTreeKeys.length;

    const daysLeft = MAX_NUM_OF_DAYS - newGameState.day;
    enhancedGameState.enhancements.players.me.projectedFinalScore +=
        newGameState.players.me.score +
        (enhancedGameState.enhancements.players.me.averageSunProductionPerDay * daysLeft) / 3;

    let currentNutrientsModifier = 0;

    myTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.me.trees[treeKey];
        if (tree.size < 3) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = newGameState.map.richnessMatrix[r][q] || 0;
        enhancedGameState.enhancements.players.me.projectedFinalScore +=
            newGameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 2;
    });

    enhancedGameState.enhancements.players.opponent.projectedFinalScore +=
        newGameState.players.opponent.score +
        (enhancedGameState.enhancements.players.opponent.averageSunProductionPerDay * daysLeft) / 3;

    currentNutrientsModifier = 0;

    opponentTreeKeys.forEach((treeKey) => {
        const tree = newGameState.players.opponent.trees[treeKey];
        if (tree.size < 3) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = newGameState.map.richnessMatrix[r][q] || 0;
        enhancedGameState.enhancements.players.opponent.projectedFinalScore +=
            newGameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 2;
    });

    const influencedCells: { [index: string]: boolean } = {};

    myTreeKeys.forEach((treeKey) => {
        influencedCells[treeKey] = true;
        const treeCoordinates = keyToHexCoordinates(treeKey);
        [0, 1, 2, 3, 4, 5].forEach((directionID) => {
            const hexDirection = getHexDirectionByID(directionID);
            const influencedCoordinates = addHexDirection(treeCoordinates, hexDirection);
            if (!isValidHexCoordinates(newGameState, influencedCoordinates)) {
                return;
            }
            const influencedKey = hexCoordinatesToKey(influencedCoordinates);
            if (
                newGameState.players.me.trees[influencedKey] ||
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

type Statistics = { min: number; max: number; mean: number; standardDeviation: number };

type GameStatePlayerStatistics = {
    totalTreeSize: Statistics;
    sun: Statistics;
    score: Statistics;
    averageSunProductionPerDay: Statistics;
    influence: Statistics;
    expansionsAverageSunninessPerDay: Statistics;
    numOfExpansions: Statistics;
};

export type GameStateStatistics = {
    players: {
        me: GameStatePlayerStatistics;
    };
};

export const getGameStateStatistics = (enhancedGameStates: EnhancedGameState[]): GameStateStatistics => {
    const myTotalTreeSizes: number[] = [];
    const mySuns: number[] = [];
    const myScores: number[] = [];
    const averageSunProductionPerDayList: number[] = [];
    const myInfluences: number[] = [];
    const myExpansionsAverageSunninessPerDays: number[] = [];
    const myNumberOfExpansionsList: number[] = [];

    enhancedGameStates.forEach((enhancedGameState) => {
        myTotalTreeSizes.push(enhancedGameState.enhancements.players.me.totalTreeSize);
        mySuns.push(enhancedGameState.players.me.sun);
        myScores.push(enhancedGameState.players.me.score);
        averageSunProductionPerDayList.push(enhancedGameState.enhancements.players.me.averageSunProductionPerDay);
        myInfluences.push(enhancedGameState.enhancements.players.me.influence);
        myExpansionsAverageSunninessPerDays.push(
            enhancedGameState.enhancements.players.me.expansionsAverageSunninessPerDay
        );
        myNumberOfExpansionsList.push(enhancedGameState.enhancements.players.me.numOfExpansions);
    });

    const gameStateStatistics: GameStateStatistics = {
        players: {
            me: {
                totalTreeSize: {
                    min: Math.min(...myTotalTreeSizes),
                    max: Math.max(...myTotalTreeSizes),
                    mean: mean(myTotalTreeSizes),
                    standardDeviation: standardDeviation(myTotalTreeSizes),
                },
                sun: {
                    min: Math.min(...mySuns),
                    max: Math.max(...mySuns),
                    mean: mean(mySuns),
                    standardDeviation: standardDeviation(mySuns),
                },
                score: {
                    min: Math.min(...myScores),
                    max: Math.max(...myScores),
                    mean: mean(myScores),
                    standardDeviation: standardDeviation(myScores),
                },
                averageSunProductionPerDay: {
                    min: Math.min(...averageSunProductionPerDayList),
                    max: Math.max(...averageSunProductionPerDayList),
                    mean: mean(averageSunProductionPerDayList),
                    standardDeviation: standardDeviation(averageSunProductionPerDayList),
                },
                influence: {
                    min: Math.min(...myInfluences),
                    max: Math.max(...myInfluences),
                    mean: mean(myInfluences),
                    standardDeviation: standardDeviation(myInfluences),
                },
                expansionsAverageSunninessPerDay: {
                    min: Math.min(...myExpansionsAverageSunninessPerDays),
                    max: Math.max(...myExpansionsAverageSunninessPerDays),
                    mean: mean(myExpansionsAverageSunninessPerDays),
                    standardDeviation: standardDeviation(myExpansionsAverageSunninessPerDays),
                },
                numOfExpansions: {
                    min: Math.min(...myNumberOfExpansionsList),
                    max: Math.max(...myNumberOfExpansionsList),
                    mean: mean(myNumberOfExpansionsList),
                    standardDeviation: standardDeviation(myNumberOfExpansionsList),
                },
            },
        },
    };

    return gameStateStatistics;
};
