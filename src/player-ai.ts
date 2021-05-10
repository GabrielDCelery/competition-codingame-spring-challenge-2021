import { cloneGameState, GameState } from './game-state';
import { enhanceGameState } from './game-state-enhancer';
import { ActionType, convertGameInputStringToAction, applyActionToGameState } from './player-actions';
import { average } from './utility-helpers';
import {
    calcRelativeProductionUtility,
    calcRelativeProjectedProductionUtility,
    calcRelativeProjectedScoreAdvantage,
} from './player-ai-utilities';

export const getNextCommandAsGameInput = (gameState: GameState, possibleMoves: string[]): string => {
    let lastChosenMoveUtility = 0;
    let chosenMove = `${ActionType.WAIT}`;
    const oldEnhancedGameState = enhanceGameState(gameState);

    const newEnhancedGameStates = possibleMoves.map((possibleMove) => {
        const newGameState = applyActionToGameState(
            cloneGameState(gameState),
            convertGameInputStringToAction(possibleMove)
        );
        return enhanceGameState(newGameState);
    });

    const utilities = newEnhancedGameStates.map((newEnhancedGameState) => {
        return average([
            calcRelativeProductionUtility(oldEnhancedGameState, newEnhancedGameState),
            calcRelativeProjectedProductionUtility(oldEnhancedGameState, newEnhancedGameState),
            calcRelativeProjectedScoreAdvantage(oldEnhancedGameState, newEnhancedGameState),
        ]);
    });

    possibleMoves.forEach((possibleMove, index) => {
        const possibleMoveUtility = utilities[index];
        console.error(`${possibleMoveUtility} - ${possibleMove}`);
        if (possibleMoveUtility <= lastChosenMoveUtility) {
            return;
        }
        chosenMove = possibleMove;
        lastChosenMoveUtility = possibleMoveUtility;
    });

    /*
    const normalizedGameStateEvaluations = normalizeGameStateEvaluations(gameStateEvaluations);

    const currentDay = gameState.day + 1;
    const maxNumOfDays = MAX_NUM_OF_DAYS;
    const linearRiseWeight = normalizedLinear({ value: currentDay, max: maxNumOfDays, a: 0.5 });
    const linearDecayWeight = normalizedLinearDecay({ value: currentDay, max: maxNumOfDays });
    const exponentialRiseWeight3 = normalizedExponential({ value: currentDay, max: maxNumOfDays, a: 3 });
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
            //  myInfluenceUtility,
            myExpansionUtility,
            myTotalTreeSizeUtility,
            hinderOpponentProductionUtility,
            myRelativeScoreAdvantageUtility,
        ]);
    });
    */

    // console.error('--------------------gameStateEvaluations');
    // console.error(gameStateEvaluations);
    //  console.error('--------------------normalizedGameStateEvaluations');
    // console.error(normalizedGameStateEvaluations);
    return chosenMove;
};
