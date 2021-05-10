import { MAX_NUM_OF_DAYS } from './game-config';
import { cloneGameState, GameState } from './game-state';
import { evaluateGameState, normalizeGameStateEvaluations } from './game-state-evaluator';
import { ActionType, convertGameInputStringToAction, applyActionToGameState } from './player-actions';
import {
    average,
    normalizedExponential,
    normalizedLinear,
    normalizedLinearDecay,
    normalizedPyramid,
} from './utility-helpers';

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
    const linearRiseWeight = normalizedLinear({ value: currentDay, max: maxNumOfDays, a: 0.5 });
    const linearDecayWeight = normalizedLinearDecay({ value: currentDay, max: maxNumOfDays });
    // const exponentialRiseWeight3 = normalizedExponential({ value: currentDay, max: maxNumOfDays, a: 3 });
    const exponentialRiseWeight = normalizedExponential({ value: currentDay, max: maxNumOfDays, a: 3 });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;
    const pyramidWeight = normalizedPyramid({ value: currentDay, max: maxNumOfDays });

    const utilities = normalizedGameStateEvaluations.map((normalizedGameStateEvaluation) => {
        const {
            myNormalizedTotalScore,
            myNormalizedSunStored,
            myNormalizedAverageSunProductionPerDay,
            myNormalizedInfluence,
            myNormalizedExpansion,
            myNormalizedTotalTreeSize,
            opponentNormalizedAverageSunProductionPerDay,
            myNormalizedRelativeScoreAdvantage,
        } = normalizedGameStateEvaluation;

        const myTotalScoreUtility = linearRiseWeight * myNormalizedTotalScore;
        const mySunStoredUtility = linearDecayWeight * myNormalizedSunStored;
        const myProductionUtility = logarithmicDecayWeight * myNormalizedAverageSunProductionPerDay;
        const myInfluenceUtility = pyramidWeight * myNormalizedInfluence;
        const myTotalTreeSizeUtility = logarithmicDecayWeight * myNormalizedTotalTreeSize;
        const myExpansionUtility = logarithmicDecayWeight * myNormalizedExpansion;
        const hinderOpponentProductionUtility =
            logarithmicDecayWeight * (1 - opponentNormalizedAverageSunProductionPerDay);
        const myRelativeScoreAdvantageUtility = myNormalizedRelativeScoreAdvantage;

        return average([
            myTotalScoreUtility,
            mySunStoredUtility,
            myProductionUtility,
            myInfluenceUtility,
            // myExpansionUtility,
            myTotalTreeSizeUtility,
            hinderOpponentProductionUtility,
            myRelativeScoreAdvantageUtility,
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
