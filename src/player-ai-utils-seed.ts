import { GameState, isValidHexCoordinates } from './game-state';
import { AreaAnalysis, ShadowModifiersForWeek } from './game-state-enhancements';
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

    const numOfTreesPerSize = [0, 0, 0, 0];
    Object.keys(gameState.players.me.trees).forEach((treeKey) => {
        const tree = gameState.players.me.trees[treeKey];
        numOfTreesPerSize[tree.size] += 1;
    });
    return numOfTreesPerSize[0] === 1 ? 0 : 1;
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

export const calculateAvoidCastingShadowOnOwnTreesUtility = (newGameState: GameState): number => {
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

export const calculateAvoidSeedsBeingInShadeUtility = (
    newGameState: GameState,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    const seedKeys = Object.keys(newGameState.players.me.trees).filter((treeKey) => {
        return newGameState.players.me.trees[treeKey].size === 0;
    });
    if (seedKeys.length === 0) {
        return 0.5;
    }
    const averageBeingInLight = average(seedKeys.map((seedKey) => 1 - shadowModifiersForWeek[seedKey]));
    return normalizedLinear({
        value: averageBeingInLight,
        max: 1,
    });
};
