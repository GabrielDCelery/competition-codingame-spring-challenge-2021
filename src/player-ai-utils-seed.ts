import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, isValidHexCoordinates } from './game-state';
import { AreaAnalysis } from './game-state-enhancements';
import {
    addHexDirection,
    getHexDirectionByID,
    hexCoordinatesToKey,
    keyToHexCoordinates,
    scaleHexDirection,
} from './hex-map-transforms';
import { average, normalizedLinear, normalizedLinearDecay } from './utility-helpers';

export const caluclatePreventSeedingTooEarlyUtility = (gameState: GameState): number => {
    if (gameState.day >= 3) {
        return 1;
    }

    return -Infinity;
};

export const caluclatePreventSeedingAtTheEndOfGameUtility = (gameState: GameState): number => {
    const daysLeft = MAX_NUM_OF_DAYS - gameState.day;
    if (daysLeft >= 5) {
        return 1;
    }

    return -Infinity;
};

export const calculateMapCellsControlledUtility = (newGameState: GameState): number => {
    const myNumOfCells = Object.keys(newGameState.players.me.trees).length;
    const maxNumOfViableCells = newGameState.map.cellIndexToHexCoordinates.filter((coordinates) => {
        const [q, r] = coordinates;
        const richness = newGameState.map.richnessMatrix[r][q] || 0;
        return richness !== 0;
    }).length;
    const utility = normalizedLinear({ value: myNumOfCells, max: maxNumOfViableCells });
    return utility;
};

export const calculateAvoidCramnessUtility = (newGameState: GameState, areaAnalysisList: AreaAnalysis[]): number => {
    const numOfTreesInAreasWithTrees = areaAnalysisList
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

export const calculateAvoidCastingShadowOnOwnTreesUtility = (newGameState: GameState, treeSize: number): number => {
    const myTreeKeys = Object.keys(newGameState.players.me.trees);
    const numOfMytrees = myTreeKeys.length;
    if (numOfMytrees <= 1) {
        return 1;
    }
    const maxNumOfShadowsCast = numOfMytrees * (numOfMytrees - 1);
    let numOfTreesCastShadowOn = 0;
    const maxScale = treeSize;
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

export const calculateRichAreasSeededUtility = (newGameState: GameState): number => {
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

export const calculateAvoidSpammingSeedsUtility = (newGameState: GameState): number => {
    const numOfSeeds = Object.keys(newGameState.players.me.trees)
        .map((treeKey) => {
            return newGameState.players.me.trees[treeKey].size;
        })
        .filter((size) => {
            return size === 0;
        }).length;

    const maxNumOfSeeds = 5;

    if (numOfSeeds === 0) {
        return 0.5;
    }

    return normalizedLinearDecay({
        value: numOfSeeds > maxNumOfSeeds ? maxNumOfSeeds : numOfSeeds,
        max: maxNumOfSeeds,
    });
};
/*
export const calculatePreferCastingShadowOnEnemyTreesUtility = (newGameState: GameState): number => {
    const myTreeKeys = Object.keys(newGameState.players.me.trees);
    const numOfMytrees = myTreeKeys.length;
    if (numOfMytrees <= 1) {
        return 1;
    }
    let totalNumOfShadowsCastByMe = 0;
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
*/
