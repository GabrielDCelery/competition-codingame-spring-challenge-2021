import { GameState, getNumOfCellsInfluenced, getTreeShadowModifiersForWeek } from './game-state';
import { normalizeValueBetweenZeroAndOne } from './utility-helpers';

export type GameStateEvaluation = {
    myScoreAcquired: number;
    mySunStored: number;
    myAverageSunProductionPerDay: number;
    myInfluence: number;
    myTotalTreeSize: number;
    opponentAverageSunProductionPerDay: number;
};

export const evaluateGameState = (gameState: GameState): GameStateEvaluation => {
    const gameStateEvaluation: GameStateEvaluation = {
        myScoreAcquired: 0,
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
    gameStateEvaluation.myScoreAcquired = gameState.players.me.score;

    return gameStateEvaluation;
};

export const normalizeGameStateEvaluations = (gameStateEvaluations: GameStateEvaluation[]): GameStateEvaluation[] => {
    const min = {
        myScoreAcquired: Infinity,
        mySunStored: Infinity,
        myAverageSunProductionPerDay: Infinity,
        myInfluence: Infinity,
        myTotalTreeSize: Infinity,
        opponentAverageSunProductionPerDay: Infinity,
    };

    const max = {
        myScoreAcquired: -Infinity,
        mySunStored: -Infinity,
        myAverageSunProductionPerDay: -Infinity,
        myInfluence: -Infinity,
        myTotalTreeSize: -Infinity,
        opponentAverageSunProductionPerDay: -Infinity,
    };

    gameStateEvaluations.forEach((gameStateEvaluation) => {
        const {
            mySunStored,
            myScoreAcquired,
            myAverageSunProductionPerDay,
            myInfluence,
            myTotalTreeSize,
            opponentAverageSunProductionPerDay,
        } = gameStateEvaluation;

        if (myScoreAcquired < min.myScoreAcquired) {
            min.myScoreAcquired = myScoreAcquired;
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

        if (max.myScoreAcquired < myScoreAcquired) {
            max.myScoreAcquired = myScoreAcquired;
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
            myScoreAcquired: normalizeValueBetweenZeroAndOne({
                min: min.myScoreAcquired,
                max: max.myScoreAcquired,
                value: gameStateEvaluation.myScoreAcquired,
            }),
            mySunStored: normalizeValueBetweenZeroAndOne({
                min: min.mySunStored,
                max: max.mySunStored,
                value: gameStateEvaluation.mySunStored,
            }),
            myAverageSunProductionPerDay: normalizeValueBetweenZeroAndOne({
                min: min.myAverageSunProductionPerDay,
                max: max.myAverageSunProductionPerDay,
                value: gameStateEvaluation.myAverageSunProductionPerDay,
            }),
            myInfluence: normalizeValueBetweenZeroAndOne({
                min: min.myInfluence,
                max: max.myInfluence,
                value: gameStateEvaluation.myInfluence,
            }),
            myTotalTreeSize: normalizeValueBetweenZeroAndOne({
                min: min.myTotalTreeSize,
                max: max.myTotalTreeSize,
                value: gameStateEvaluation.myTotalTreeSize,
            }),
            opponentAverageSunProductionPerDay: normalizeValueBetweenZeroAndOne({
                min: min.opponentAverageSunProductionPerDay,
                max: max.opponentAverageSunProductionPerDay,
                value: gameStateEvaluation.opponentAverageSunProductionPerDay,
            }),
        };
    });
};
