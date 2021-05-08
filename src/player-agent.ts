import { MAX_NUM_OF_DAYS } from './game-config';
import { cloneGameState, GameState } from './game-state';
import { evaluateGameState, normalizeGameStateEvaluations } from './game-state-evaluator';
import { ActionType, convertGameInputStringToAction, applyActionToGameState } from './player-actions';
import { average, normalizedExponential, normalizedLinear, normalizedLinearDecay } from './utility-helpers';

export const getNextCommandAsGameInput = (gameState: GameState, possibleMoves: string[]): string => {
    const gameStateEvaluations = possibleMoves.map((possibleMove) => {
        const newGameState = applyActionToGameState(
            cloneGameState(gameState),
            convertGameInputStringToAction(possibleMove)
        );
        return evaluateGameState(newGameState);
    });

    const normalizedGameStateEvaluations = normalizeGameStateEvaluations(gameStateEvaluations);

    const currentDay = gameState.day + 1;
    const maxNumOfDays = MAX_NUM_OF_DAYS;
    const linearRiseWeight = normalizedLinear({ value: currentDay, max: maxNumOfDays });
    const linearDecayWeight = normalizedLinearDecay({ value: currentDay, max: maxNumOfDays });
    // const exponentialRiseWeight3 = normalizedExponential({ value: currentDay, max: maxNumOfDays, a: 3 });
    const exponentialRiseWeight5 = normalizedExponential({ value: currentDay, max: maxNumOfDays, a: 5 });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight5;

    const utilities = normalizedGameStateEvaluations.map((normalizedGameStateEvaluation) => {
        const {
            myScoreAcquired,
            mySunStored,
            myAverageSunProductionPerDay,
            myInfluence,
            myTotalTreeSize,
            opponentAverageSunProductionPerDay,
        } = normalizedGameStateEvaluation;

        const myScoreUtility = linearRiseWeight * myScoreAcquired;
        const mySunStoredUtility = linearDecayWeight * mySunStored;
        const myProductionUtility = logarithmicDecayWeight * myAverageSunProductionPerDay;
        const myInfluenceutility = linearDecayWeight * myInfluence;
        const myTotalTreeSizeUtility = linearDecayWeight * myTotalTreeSize;
        const hinderOpponentProductionUtility = logarithmicDecayWeight * (1 - opponentAverageSunProductionPerDay);
        /*
        if (index === 0 || index === 1) {
            console.error([
                myScoreUtility,
                mySunStoredUtility,
                myProductionUtility,
                myInfluenceutility,
                myTotalTreeSizeUtility,
                hinderOpponentProductionUtility,
            ]);
        }
        */

        return average([
            myScoreUtility,
            mySunStoredUtility,
            myProductionUtility,
            myInfluenceutility,
            myTotalTreeSizeUtility,
            hinderOpponentProductionUtility,
        ]);
    });

    let lastChosenMoveUtility = 0;
    let chosenMove = `${ActionType.WAIT}`;

    possibleMoves.forEach((possibleMove, index) => {
        const possibleMoveUtility = utilities[index];
        console.error(`${possibleMoveUtility} - ${possibleMove}`);
        if (possibleMoveUtility <= lastChosenMoveUtility) {
            return;
        }
        chosenMove = possibleMove;
        lastChosenMoveUtility = possibleMoveUtility;
    });
    // console.error('--------------------gameStateEvaluations');
    // console.error(gameStateEvaluations);
    //  console.error('--------------------normalizedGameStateEvaluations');
    // console.error(normalizedGameStateEvaluations);
    return chosenMove;
};
