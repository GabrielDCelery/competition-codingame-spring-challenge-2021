import { GameState, getNumOfCellsInfluenced, getTreeShadowModifiersForWeek } from './game-state';
import { normalizeValueBetweenZeroAndOne } from './utility-helpers';

export type GameStateEvaluation = {
    myTotalScore: number;
    mySunStored: number;
    myAverageSunProductionPerDay: number;
    myInfluence: number;
    myTotalTreeSize: number;
    opponentAverageSunProductionPerDay: number;
};

export type NormalizedGameStateEvaluation = {
    myNormalizedTotalScore: number;
    myNormalizedSunStored: number;
    myNormalizedAverageSunProductionPerDay: number;
    myNormalizedInfluence: number;
    myNormalizedTotalTreeSize: number;
    opponentNormalizedAverageSunProductionPerDay: number;
};

export const evaluateGameState = (gameState: GameState): GameStateEvaluation => {
    const gameStateEvaluation: GameStateEvaluation = {
        myTotalScore: 0,
        mySunStored: 0,
        myAverageSunProductionPerDay: 0,
        myInfluence: 0,
        myTotalTreeSize: 0,
        opponentAverageSunProductionPerDay: 0,
    };

    const treeShadowModifiers = getTreeShadowModifiersForWeek(gameState);

    Object.keys(gameState.players.me.trees).forEach((treeKey) => {
        const tree = gameState.players.me.trees[treeKey];
        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        gameStateEvaluation.myAverageSunProductionPerDay += tree.size * productionWeight;
        gameStateEvaluation.myTotalTreeSize += tree.size;
    });

    Object.keys(gameState.players.opponent.trees).forEach((treeKey) => {
        const tree = gameState.players.opponent.trees[treeKey];
        const productionWeight = 1 - (treeShadowModifiers[treeKey] || 0);
        gameStateEvaluation.opponentAverageSunProductionPerDay += tree.size * productionWeight;
    });

    gameStateEvaluation.myInfluence = getNumOfCellsInfluenced(gameState);
    gameStateEvaluation.mySunStored = gameState.players.me.sun;
    gameStateEvaluation.myTotalScore = gameState.players.me.score;

    return gameStateEvaluation;
};

export const normalizeGameStateEvaluations = (
    gameStateEvaluations: GameStateEvaluation[]
): NormalizedGameStateEvaluation[] => {
    const min = {
        myTotalScore: Infinity,
        mySunStored: Infinity,
        myAverageSunProductionPerDay: Infinity,
        myInfluence: Infinity,
        myTotalTreeSize: Infinity,
        opponentAverageSunProductionPerDay: Infinity,
    };

    const max = {
        myTotalScore: -Infinity,
        mySunStored: -Infinity,
        myAverageSunProductionPerDay: -Infinity,
        myInfluence: -Infinity,
        myTotalTreeSize: -Infinity,
        opponentAverageSunProductionPerDay: -Infinity,
    };

    gameStateEvaluations.forEach((gameStateEvaluation) => {
        const {
            mySunStored,
            myTotalScore,
            myAverageSunProductionPerDay,
            myInfluence,
            myTotalTreeSize,
            opponentAverageSunProductionPerDay,
        } = gameStateEvaluation;

        if (myTotalScore < min.myTotalScore) {
            min.myTotalScore = myTotalScore;
        }
        if (mySunStored < min.mySunStored) {
            min.mySunStored = mySunStored;
        }
        if (myAverageSunProductionPerDay < min.myAverageSunProductionPerDay) {
            min.myAverageSunProductionPerDay = myAverageSunProductionPerDay;
        }
        if (myInfluence < min.myInfluence) {
            min.myInfluence = myInfluence;
        }
        if (opponentAverageSunProductionPerDay < min.opponentAverageSunProductionPerDay) {
            min.opponentAverageSunProductionPerDay = opponentAverageSunProductionPerDay;
        }
        if (myTotalTreeSize < min.myTotalTreeSize) {
            min.myTotalTreeSize = myTotalTreeSize;
        }

        if (max.myTotalScore < myTotalScore) {
            max.myTotalScore = myTotalScore;
        }
        if (max.mySunStored < mySunStored) {
            max.mySunStored = mySunStored;
        }
        if (max.myAverageSunProductionPerDay < myAverageSunProductionPerDay) {
            max.myAverageSunProductionPerDay = myAverageSunProductionPerDay;
        }
        if (max.myInfluence < myInfluence) {
            max.myInfluence = myInfluence;
        }
        if (max.opponentAverageSunProductionPerDay < opponentAverageSunProductionPerDay) {
            max.opponentAverageSunProductionPerDay = opponentAverageSunProductionPerDay;
        }
        if (max.myTotalTreeSize < myTotalTreeSize) {
            max.myTotalTreeSize = myTotalTreeSize;
        }
    });

    return gameStateEvaluations.map((gameStateEvaluation) => {
        return {
            myNormalizedTotalScore: normalizeValueBetweenZeroAndOne({
                min: min.myTotalScore,
                max: max.myTotalScore,
                value: gameStateEvaluation.myTotalScore,
            }),
            myNormalizedSunStored: normalizeValueBetweenZeroAndOne({
                min: min.mySunStored,
                max: max.mySunStored,
                value: gameStateEvaluation.mySunStored,
            }),
            myNormalizedAverageSunProductionPerDay: normalizeValueBetweenZeroAndOne({
                min: min.myAverageSunProductionPerDay,
                max: max.myAverageSunProductionPerDay,
                value: gameStateEvaluation.myAverageSunProductionPerDay,
            }),
            myNormalizedInfluence: normalizeValueBetweenZeroAndOne({
                min: min.myInfluence,
                max: max.myInfluence,
                value: gameStateEvaluation.myInfluence,
            }),
            myNormalizedTotalTreeSize: normalizeValueBetweenZeroAndOne({
                min: min.myTotalTreeSize,
                max: max.myTotalTreeSize,
                value: gameStateEvaluation.myTotalTreeSize,
            }),
            opponentNormalizedAverageSunProductionPerDay: normalizeValueBetweenZeroAndOne({
                min: min.opponentAverageSunProductionPerDay,
                max: max.opponentAverageSunProductionPerDay,
                value: gameStateEvaluation.opponentAverageSunProductionPerDay,
            }),
        };
    });
};
