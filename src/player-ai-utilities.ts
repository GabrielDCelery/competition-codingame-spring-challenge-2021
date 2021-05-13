import { MAX_NUM_OF_DAYS, MAX_TREE_SIZE } from './game-config';
import { isValidHexCoordinates } from './game-state';
import { EnhancedGameState } from './game-state-enhancer';
import {
    addHexDirection,
    getHexDirectionByID,
    hexCoordinatesToKey,
    keyToHexCoordinates,
    scaleHexDirection,
} from './hex-map-transforms';
import {
    average,
    normalizedExponential,
    normalizedExponentialDecay,
    normalizedLinear,
    normalizedLinearDecay,
} from './utility-helpers';

export const calculateTreeSizeUtility = (newGameState: EnhancedGameState): number => {
    const treeSizes = Object.keys(newGameState.players.me.trees).map((treeKey) => {
        return newGameState.players.me.trees[treeKey].size;
    });
    const averageTreeSize = average(treeSizes);
    return 1 - normalizedExponentialDecay({ value: averageTreeSize, max: MAX_TREE_SIZE });
};

export const calculateSunProductionUtility = (newGameState: EnhancedGameState): number => {
    const targetSunProduction = 20;
    const exponentialRiseWeight = normalizedExponential({ value: newGameState.day, max: MAX_NUM_OF_DAYS });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;
    const production =
        newGameState.enhancements.players.me.averageSunProductionPerDay > targetSunProduction
            ? targetSunProduction
            : newGameState.enhancements.players.me.averageSunProductionPerDay;
    return logarithmicDecayWeight * normalizedLinear({ value: production, max: targetSunProduction });
};

export const calculateSunReservedUtility = (newGameState: EnhancedGameState): number => {
    const targetSunReserved = 3;
    const sunReserved =
        newGameState.players.me.sun > targetSunReserved ? targetSunReserved : newGameState.players.me.sun;

    return normalizedLinear({ value: sunReserved, max: targetSunReserved });
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

export const calculateMapCellsControlledUtility = (newGameState: EnhancedGameState): number => {
    const myNumOfCells = Object.keys(newGameState.players.me.trees).length;
    const maxNumOfViableCells = newGameState.map.cellIndexToHexCoordinates
        .map((coordinates) => {
            const [q, r] = coordinates;
            const richness = newGameState.map.richnessMatrix[r][q];
            return richness || 0;
        })
        .filter((richness) => {
            return richness !== 0;
        }).length;
    const utility = normalizedLinear({ value: myNumOfCells, max: maxNumOfViableCells });
    return utility;
};

export const calculateAvoidCramnessUtility = (newGameState: EnhancedGameState): number => {
    const numOfTreesInAreasWithTrees = newGameState.areaAnalysisList
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

export const calculateAvoidCastingShadowOnOwnTreesUtility = (newGameState: EnhancedGameState): number => {
    const myTreeKeys = Object.keys(newGameState.players.me.trees);
    const numOfMytrees = myTreeKeys.length;
    if (numOfMytrees <= 1) {
        return 1;
    }
    const maxNumOfShadowsCast = numOfMytrees * (numOfMytrees - 1);
    let numOfTreesCastShadowOn = 0;
    const maxScale = 3;
    myTreeKeys.forEach((treeKey) => {
        const treeCoordinates = keyToHexCoordinates(treeKey);
        [0, 1, 2, 3, 4, 5].forEach((directionID) => {
            const hexDirection = getHexDirectionByID(directionID);
            for (let scale = 1; scale <= maxScale; scale++) {
                const scaledHexDirection = scaleHexDirection(hexDirection, scale);
                const influencedCoordinates = addHexDirection(treeCoordinates, scaledHexDirection);
                if (!isValidHexCoordinates(newGameState, influencedCoordinates)) {
                    return;
                }
                const influencedKey = hexCoordinatesToKey(influencedCoordinates);
                if (newGameState.players.me.trees[influencedKey]) {
                    numOfTreesCastShadowOn += 1;
                }
            }
        });
    });
    return normalizedLinearDecay({
        value: numOfTreesCastShadowOn,
        max: maxNumOfShadowsCast,
    });
};

export const calculateAreaCoveredRichnessUtility = (newGameState: EnhancedGameState): number => {
    const richnessList = Object.keys(newGameState.players.me.trees).map((treeKey) => {
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = newGameState.map.richnessMatrix[r][q];
        return richness || 0;
    });
    const averageRichness = average(richnessList);
    const maxRichness = 3;

    return normalizedLinear({ value: averageRichness, max: maxRichness });
};

export const calculateAvoidSpammingSeedsUtility = (newGameState: EnhancedGameState): number => {
    const numOfSeeds = Object.keys(newGameState.players.me.trees)
        .map((treeKey) => {
            return newGameState.players.me.trees[treeKey].size;
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

export const calculateRelativeProjectedScoreAdvantageUtility = (newGameState: EnhancedGameState): number => {
    /*
    console.error(
        JSON.stringify([
            newGameState.enhancements.players.me.projectedFinalScore,
            newGameState.enhancements.players.opponent.projectedFinalScore,
        ])
    );
    */
    const totalProjectedScoreBetweenPlayers =
        newGameState.enhancements.players.me.projectedFinalScore +
        newGameState.enhancements.players.opponent.projectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0
            ? 0.5
            : newGameState.enhancements.players.me.projectedFinalScore / totalProjectedScoreBetweenPlayers;
    // const linearRiseWeight = normalizedLinear({ value: newGameState.day, max: MAX_NUM_OF_DAYS });
    return utility;
};

export const calculateRelativeProductionUtility = (newGameState: EnhancedGameState): number => {
    const totalAverageProduction =
        newGameState.enhancements.players.me.averageSunProductionPerDay +
        newGameState.enhancements.players.opponent.averageSunProductionPerDay;
    const utility =
        totalAverageProduction === 0
            ? 0.5
            : newGameState.enhancements.players.me.averageSunProductionPerDay / totalAverageProduction;
    // const logarithmicDecayWeight =  1 - normalizedExponential({ value: newGameState.day, max: MAX_NUM_OF_DAYS, a: 3 });
    // const linearRiseWeight = normalizedLinear({ value: newGameState.day, max: MAX_NUM_OF_DAYS });
    return utility;
};
