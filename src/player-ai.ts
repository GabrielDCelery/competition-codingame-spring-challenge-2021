import { cloneGameState, GameState } from './game-state';
import { enhanceGameState, getGameStateMinMax } from './game-state-enhancer';
import { ActionType, convertGameInputStringToAction, applyActionToGameState } from './player-actions';
import { average } from './utility-helpers';
import {
    calculateScoreUtility,
    calculateSunStoredUtility,
    calcRelativeProductionUtility,
    //  calcRelativeProjectedProductionUtility,
    calcRelativeProjectedScoreAdvantage,
    calculateAverageSunProductionUtility,
    calculateTotalTreeSizeUtility,
    calculateInfluenceUtility,
    calculateExpansionUtility,
    calculateNoOverExtensionUtility,
} from './player-ai-utilities';

export const getNextCommandAsGameInput = (gameState: GameState, possibleMoves: string[]): string => {
    let lastChosenMoveUtility = 0;
    let chosenMove = `${ActionType.WAIT}`;
    //const oldEnhancedGameState = enhanceGameState(gameState);

    const newEnhancedGameStates = possibleMoves.map((possibleMove) => {
        const newGameState = applyActionToGameState(
            cloneGameState(gameState),
            convertGameInputStringToAction(possibleMove)
        );
        return enhanceGameState(newGameState);
    });

    const gameStateMinMax = getGameStateMinMax(newEnhancedGameStates);

    const utilities = newEnhancedGameStates.map((newEnhancedGameState, index) => {
        const utilities = [
            calculateScoreUtility(newEnhancedGameState, gameStateMinMax),
            calculateAverageSunProductionUtility(newEnhancedGameState, gameStateMinMax),
            // calculateSunStoredUtility(newEnhancedGameState, gameStateMinMax),
            calculateTotalTreeSizeUtility(newEnhancedGameState, gameStateMinMax),
            calculateInfluenceUtility(newEnhancedGameState, gameStateMinMax),
            calculateExpansionUtility(newEnhancedGameState, gameStateMinMax),
            calculateNoOverExtensionUtility(newEnhancedGameState, gameStateMinMax),
            calcRelativeProductionUtility(newEnhancedGameState),
            //  calcRelativeProjectedProductionUtility(newEnhancedGameState),
            calcRelativeProjectedScoreAdvantage(newEnhancedGameState),
        ];

        const averagedUtilities = average(utilities);

        console.error(
            JSON.stringify({
                move: possibleMoves[index],
                averagedUtilities,
                utilities,
            })
        );

        return averagedUtilities;
    });

    possibleMoves.forEach((possibleMove, index) => {
        const possibleMoveUtility = utilities[index];
        if (possibleMoveUtility <= lastChosenMoveUtility) {
            return;
        }
        chosenMove = possibleMove;
        lastChosenMoveUtility = possibleMoveUtility;
    });

    return chosenMove;
};
