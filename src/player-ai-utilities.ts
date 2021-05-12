import { MAX_NUM_OF_DAYS, MAX_TREE_SIZE } from './game-config';
import { isValidHexCoordinates } from './game-state';
import { EnhancedGameState, GameStateStatistics } from './game-state-enhancer';
import { addHexDirection, getHexDirectionByID, hexCoordinatesToKey, keyToHexCoordinates } from './hex-map-transforms';
import {
    average,
    normalizedExponential,
    normalizedExponentialDecay,
    normalizedLinear,
    normalizedLinearDecay,
    normalizedPyramid,
    normalizeValueBetweenZeroAndOne,
    normalizedLogistic,
} from './utility-helpers';

export const calculateTreeSizeUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const treeSizes = Object.keys(newEnhancedGameState.players.me.trees).map((treeKey) => {
        return newEnhancedGameState.players.me.trees[treeKey].size;
    });
    const averageTreeSize = average(treeSizes);
    return 1 - normalizedExponentialDecay({ value: averageTreeSize, max: MAX_TREE_SIZE });
};

export const calculateSunProductionUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const targetSunProduction = 20;
    const exponentialRiseWeight = normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;

    const production =
        newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay > targetSunProduction
            ? targetSunProduction
            : newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay;
    return logarithmicDecayWeight * normalizedLinear({ value: production, max: targetSunProduction });
};

export const caluclateSeedUtility = (gameState: EnhancedGameState): number => {
    if (gameState.day >= 4) {
        return 1;
    }

    const numOfTreesPerSize = [0, 0, 0, 0];
    Object.keys(gameState.players.me.trees).forEach((treeKey) => {
        const tree = gameState.players.me.trees[treeKey];
        numOfTreesPerSize[tree.size] += 1;
    });
    return numOfTreesPerSize[0] === 1 ? 0 : 1;
};

export const calculateMapCellsControlledUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const myNumOfCells = Object.keys(newEnhancedGameState.players.me.trees).length;
    const maxNumOfViableCells = newEnhancedGameState.enhancements.totalNumOfViableCells;
    const utility = normalizedLinear({ value: myNumOfCells, max: maxNumOfViableCells });
    return utility;
};

export const calculateAvoidCramnessUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const numOfTreesInAreasWithTrees = newEnhancedGameState.areaAnalysisList
        .map((areaAnalysis) => {
            return areaAnalysis.players.me.numOfTrees + areaAnalysis.players.me.numOfSeeds;
        })
        .filter((totalNumOfTrees) => {
            return totalNumOfTrees > 0;
        });
    const averageTreeCountInAreasWithTrees = average(numOfTreesInAreasWithTrees);
    const areaSize = 7;
    return (
        1 -
        normalizedLinear({
            value: averageTreeCountInAreasWithTrees,
            max: areaSize,
        })
    );
};

export const calculateAvoidCastingShadowOnOwnTreesUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const myTreeKeys = Object.keys(newEnhancedGameState.players.me.trees);
    const numOfMytrees = myTreeKeys.length;
    if (numOfMytrees <= 1) {
        return 1;
    }
    const maxNumOfShadowsCast = numOfMytrees * (numOfMytrees - 1);
    let numOfTreesCastShadowOn = 0;
    myTreeKeys.forEach((treeKey) => {
        const treeCoordinates = keyToHexCoordinates(treeKey);
        [0, 1, 2, 3, 4, 5].forEach((directionID) => {
            const hexDirection = getHexDirectionByID(directionID);
            const influencedCoordinates = addHexDirection(treeCoordinates, hexDirection);
            if (!isValidHexCoordinates(newEnhancedGameState, influencedCoordinates)) {
                return;
            }
            const influencedKey = hexCoordinatesToKey(influencedCoordinates);
            if (newEnhancedGameState.players.me.trees[influencedKey]) {
                numOfTreesCastShadowOn += 1;
            }
        });
    });
    return normalizedLinearDecay({
        value: numOfTreesCastShadowOn,
        max: maxNumOfShadowsCast,
    });
};

export const calculateAreaCoveredRichnessUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const richnessList = Object.keys(newEnhancedGameState.players.me.trees).map((treeKey) => {
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = newEnhancedGameState.map.richnessMatrix[r][q];
        return richness || 0;
    });
    const averageRichness = average(richnessList);
    const maxRichness = 3;

    return normalizedLinear({ value: averageRichness, max: maxRichness });
};

export const calculateAvoidSpammingSeedsUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const numOfSeeds = Object.keys(newEnhancedGameState.players.me.trees)
        .map((treeKey) => {
            return newEnhancedGameState.players.me.trees[treeKey].size;
        })
        .filter((size) => {
            return size === 0;
        }).length;

    const maxNumOfSeeds = 5;

    if (numOfSeeds === 0) {
        return 0;
    }

    return normalizedLinearDecay({
        value: numOfSeeds > maxNumOfSeeds ? maxNumOfSeeds : numOfSeeds,
        max: maxNumOfSeeds,
    });
};

export const calculateScoreUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateStatistics: GameStateStatistics
): number => {
    const linearRiseWeight = normalizedLinear({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS, a: 0.5 });
    return (
        linearRiseWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateStatistics.players.me.score.min,
            max: gameStateStatistics.players.me.score.max,
            value: newEnhancedGameState.players.me.score,
        })
    );
};

export const calculateAverageSunProductionUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateStatistics: GameStateStatistics
): number => {
    const exponentialRiseWeight = normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;
    return (
        logarithmicDecayWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateStatistics.players.me.averageSunProductionPerDay.min,
            max: gameStateStatistics.players.me.averageSunProductionPerDay.max,
            value: newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay,
        })
    );
};
/*
export const calculateSunStoredUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateStatistics: GameStateStatistics
): number => {
    const linearDecayWeight = normalizedLinearDecay({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return (
        linearDecayWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateStatistics.players.me.sun.min,
            max: gameStateStatistics.players.me.sun.max,
            value: newEnhancedGameState.players.me.sun,
        })
    );
};
*/
export const calculateTotalTreeSizeUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateStatistics: GameStateStatistics
): number => {
    const exponentialRiseWeight = normalizedExponential({
        value: newEnhancedGameState.day,
        max: MAX_NUM_OF_DAYS,
        a: 5,
    });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;

    return (
        logarithmicDecayWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateStatistics.players.me.totalTreeSize.min,
            max: gameStateStatistics.players.me.totalTreeSize.max,
            value: newEnhancedGameState.enhancements.players.me.totalTreeSize,
        })
    );
};

export const calculateInfluenceUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateStatistics: GameStateStatistics
): number => {
    const pyramidWeight = normalizedPyramid({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return (
        pyramidWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateStatistics.players.me.influence.min,
            max: gameStateStatistics.players.me.influence.max,
            value: newEnhancedGameState.enhancements.players.me.influence,
        })
    );
};

export const calculateExpansionUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateStatistics: GameStateStatistics
): number => {
    const exponentialRiseWeight = normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;
    return (
        logarithmicDecayWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateStatistics.players.me.expansionsAverageSunninessPerDay.min,
            max: gameStateStatistics.players.me.expansionsAverageSunninessPerDay.max,
            value: newEnhancedGameState.enhancements.players.me.expansionsAverageSunninessPerDay,
        })
    );
};

export const calculateNoOverExtensionUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateStatistics: GameStateStatistics
): number => {
    const weight = normalizedExponentialDecay({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    const normalizedNumOfExpansions = normalizeValueBetweenZeroAndOne({
        min: gameStateStatistics.players.me.numOfExpansions.min,
        max: gameStateStatistics.players.me.numOfExpansions.max,
        value: newEnhancedGameState.enhancements.players.me.numOfExpansions,
    });
    return weight * (1 - normalizedNumOfExpansions);
};

export const calculateRelativeProjectedScoreAdvantageUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const totalProjectedScoreBetweenPlayers =
        newEnhancedGameState.enhancements.players.me.projectedFinalScore +
        newEnhancedGameState.enhancements.players.opponent.projectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.projectedFinalScore / totalProjectedScoreBetweenPlayers;
    // const linearRiseWeight = normalizedLinear({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return utility;
};

export const calculateRelativeProductionUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const totalAverageProduction =
        newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay +
        newEnhancedGameState.enhancements.players.opponent.averageSunProductionPerDay;
    const utility =
        totalAverageProduction === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay / totalAverageProduction;
    // const logarithmicDecayWeight =  1 - normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS, a: 3 });
    // const linearRiseWeight = normalizedLinear({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return utility;
};
