import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, getMyExpansionValue, getMyInfluence, getTreeShadowModifiersForWeek } from './game-state';
import { normalizeValueBetweenZeroAndOne } from './utility-helpers';

export type GameStateEvaluation = {
    myTotalScore: number;
    mySunStored: number;
    myAverageSunProductionPerDay: number;
    myInfluence: number;
    myExpansion: number;
    myTotalTreeSize: number;
    opponentAverageSunProductionPerDay: number;
    myProjectedFinalScore: number;
    opponentProjectedFinalScore: number;
};

export type NormalizedGameStateEvaluation = {
    myNormalizedTotalScore: number;
    myNormalizedSunStored: number;
    myNormalizedAverageSunProductionPerDay: number;
    myNormalizedInfluence: number;
    myNormalizedExpansion: number;
    myNormalizedTotalTreeSize: number;
    opponentNormalizedAverageSunProductionPerDay: number;
    myNormalizedRelativeScoreAdvantage: number;
};

export const evaluateGameState = (gameState: GameState): GameStateEvaluation => {
    const gameStateEvaluation: GameStateEvaluation = {
        myTotalScore: 0,
        mySunStored: 0,
        myAverageSunProductionPerDay: 0,
        myInfluence: 0,
        myExpansion: 0,
        myTotalTreeSize: 0,
        opponentAverageSunProductionPerDay: 0,
        myProjectedFinalScore: 0,
        opponentProjectedFinalScore: 0,
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

    gameStateEvaluation.myInfluence = getMyInfluence(gameState);
    gameStateEvaluation.mySunStored = gameState.players.me.sun;
    gameStateEvaluation.myTotalScore = gameState.players.me.score;
    gameStateEvaluation.myExpansion = getMyExpansionValue(gameState);

    const daysLeft = MAX_NUM_OF_DAYS - gameState.day;

    gameStateEvaluation.myProjectedFinalScore =
        gameState.players.me.score +
        (gameState.players.me.sun + gameStateEvaluation.myAverageSunProductionPerDay * daysLeft) / 3;

    gameStateEvaluation.opponentProjectedFinalScore =
        gameState.players.opponent.score +
        (gameState.players.opponent.sun + gameStateEvaluation.opponentProjectedFinalScore * daysLeft) / 3;

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
        myExpansion: Infinity,
        myTotalTreeSize: Infinity,
        opponentAverageSunProductionPerDay: Infinity,
        myOpponentTotalScore: Infinity,
    };

    const max = {
        myTotalScore: -Infinity,
        mySunStored: -Infinity,
        myAverageSunProductionPerDay: -Infinity,
        myInfluence: -Infinity,
        myExpansion: -Infinity,
        myTotalTreeSize: -Infinity,
        opponentAverageSunProductionPerDay: -Infinity,
        myOpponentTotalScore: -Infinity,
    };

    gameStateEvaluations.forEach((gameStateEvaluation) => {
        const {
            mySunStored,
            myTotalScore,
            myAverageSunProductionPerDay,
            myInfluence,
            myExpansion,
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
        if (myExpansion < min.myExpansion) {
            min.myExpansion = myExpansion;
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
        if (max.myExpansion < myExpansion) {
            max.myExpansion = myExpansion;
        }
    });

    return gameStateEvaluations.map((gameStateEvaluation) => {
        const totalProjectedScoreBetweenPlayers =
            gameStateEvaluation.myProjectedFinalScore + gameStateEvaluation.opponentProjectedFinalScore;

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
            myNormalizedExpansion: normalizeValueBetweenZeroAndOne({
                min: min.myExpansion,
                max: max.myExpansion,
                value: gameStateEvaluation.myExpansion,
            }),
            myNormalizedRelativeScoreAdvantage:
                totalProjectedScoreBetweenPlayers === 0
                    ? 0.5
                    : gameStateEvaluation.myProjectedFinalScore / totalProjectedScoreBetweenPlayers,
        };
    });
};
