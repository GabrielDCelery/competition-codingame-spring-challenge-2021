import { MAX_NUM_OF_DAYS, MAX_TREE_SIZE } from './game-config';
import { GameState, isValidHexCoordinates, PlayerTrees } from './game-state';
import { AreaAnalysis, ShadowModifiersForWeek } from './game-state-enhancements';
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

const caluclatePlayerAverageSunproductionPerDay = (
    playerTrees: PlayerTrees,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    let averageSunproductionPerDay = 0;
    Object.keys(playerTrees).forEach((treeKey) => {
        const tree = playerTrees[treeKey];
        const productionWeight = 1 - (shadowModifiersForWeek[treeKey] || 0);
        averageSunproductionPerDay += tree.size * productionWeight;
    });
    return averageSunproductionPerDay;
};

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
    const myAverageSunproductionPerDay = caluclatePlayerAverageSunproductionPerDay(
        newGameState.players.me.trees,
        shadowModifiersForWeek
    );
    const targetSunProduction = 20;
    const exponentialRiseWeight = normalizedExponential({ value: newGameState.day, max: MAX_NUM_OF_DAYS });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;
    const production =
        myAverageSunproductionPerDay > targetSunProduction ? targetSunProduction : myAverageSunproductionPerDay;
    return logarithmicDecayWeight * normalizedLinear({ value: production, max: targetSunProduction });
};

export const calculateSunReservedUtility = (newGameState: GameState): number => {
    const targetSunReserved = 3;
    const sunReserved =
        newGameState.players.me.sun > targetSunReserved ? targetSunReserved : newGameState.players.me.sun;

    return normalizedLinear({ value: sunReserved, max: targetSunReserved });
};

export const caluclateSeedUtility = (gameState: GameState): number => {
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

export const calculateAreaCoveredRichnessUtility = (newGameState: GameState): number => {
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
        return 0;
    }

    return normalizedLinearDecay({
        value: numOfSeeds > maxNumOfSeeds ? maxNumOfSeeds : numOfSeeds,
        max: maxNumOfSeeds,
    });
};

const calculatePlayerProjectedFinalScore = ({
    daysLeft,
    playerScore,
    playerTrees,
    shadowModifiersForWeek,
    gameState,
}: {
    daysLeft: number;
    playerScore: number;
    playerTrees: PlayerTrees;
    shadowModifiersForWeek: ShadowModifiersForWeek;
    gameState: GameState;
}): number => {
    const playerAverageSunProductionPerDay = caluclatePlayerAverageSunproductionPerDay(
        playerTrees,
        shadowModifiersForWeek
    );

    let playerProjectedFinalScore = playerScore;
    let playerSunProducedTillEndOfGame = playerAverageSunProductionPerDay * daysLeft * 0.8;
    let currentNutrientsModifier = 0;

    Object.keys(playerTrees).forEach((treeKey) => {
        const tree = playerTrees[treeKey];
        if (tree.size < 3) {
            return;
        }
        if (playerSunProducedTillEndOfGame < 4) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = gameState.map.richnessMatrix[r][q] || 0;
        playerProjectedFinalScore += gameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 1;
        playerSunProducedTillEndOfGame -= 4;
    });

    playerProjectedFinalScore += playerSunProducedTillEndOfGame / 3;
    return playerProjectedFinalScore;
};

export const calculateRelativeProjectedScoreAdvantageUtility = (
    newGameState: GameState,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    const myTreeKeys = Object.keys(newGameState.players.me.trees);
    const opponentTreeKeys = Object.keys(newGameState.players.opponent.trees);

    const myAverageSunproductionPerDay = caluclatePlayerAverageSunproductionPerDay(
        newGameState.players.me.trees,
        shadowModifiersForWeek
    );

    const opponentAverageSunproductionPerDay = caluclatePlayerAverageSunproductionPerDay(
        newGameState.players.opponent.trees,
        shadowModifiersForWeek
    );

    const daysLeft = MAX_NUM_OF_DAYS - newGameState.day;

    const myprojectedFinalScore = calculatePlayerProjectedFinalScore({
        daysLeft,
        playerScore: newGameState.players.me.score,
        playerTrees: newGameState.players.me.trees,
        shadowModifiersForWeek,
        gameState: newGameState,
    });

    let myProjectedFinalScore = newGameState.players.me.score;
    let mySunProducedTillEndOfGame = myAverageSunproductionPerDay * daysLeft * 0.8;
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
        myProjectedFinalScore += newGameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 1;
        mySunProducedTillEndOfGame -= 4;
    });

    myProjectedFinalScore += mySunProducedTillEndOfGame / 3;

    let opponentProjectedFinalScore = newGameState.players.opponent.score;
    let opponentSunProducedTillEndOfGame = opponentAverageSunproductionPerDay * daysLeft * 0.8;

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
        opponentProjectedFinalScore += newGameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 1;
        opponentSunProducedTillEndOfGame -= 4;
    });

    opponentProjectedFinalScore += opponentSunProducedTillEndOfGame / 3;

    const totalProjectedScoreBetweenPlayers = myProjectedFinalScore + opponentProjectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0 ? 0.5 : myProjectedFinalScore / totalProjectedScoreBetweenPlayers;
    return utility;
};

export const calculateRelativeProductionUtility = (
    newGameState: GameState,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    const myAverageSunproductionPerDay = caluclatePlayerAverageSunproductionPerDay(
        newGameState.players.me.trees,
        shadowModifiersForWeek
    );

    const opponentAverageSunproductionPerDay = caluclatePlayerAverageSunproductionPerDay(
        newGameState.players.opponent.trees,
        shadowModifiersForWeek
    );

    const totalAverageProduction = myAverageSunproductionPerDay + opponentAverageSunproductionPerDay;
    const utility = totalAverageProduction === 0 ? 0.5 : myAverageSunproductionPerDay / totalAverageProduction;
    return utility;
};
