import { cloneGameState, GameState } from './game-state';
import { getAreaAnalysisList, getShadowModifiersForWeek } from './game-state-enhancements';
import {
    PlayerActionType,
    PlayerAction,
    convertGameInputStringToAction,
    applyActionToGameState,
} from './player-actions';
import { average } from './utility-helpers';
import { calculateRelativeProjectedScoreUtility } from './player-ai-utils-harvest';
import {
    calculateRelativeSunProducedForHalfCycleUtility,
    calculateRelativeSunProducedForFullCycleUtility,
    calculateStopGrowingTreesAtTheEndUtility,
} from './player-ai-utils-grow';
import {
    calculateMapCellsControlledUtility,
    calculateAvoidCramnessUtility,
    calculateAvoidSpammingSeedsUtility,
    calculateRichAreasSeededUtility,
    calculateAvoidCastingShadowOnOwnTreesUtility,
    caluclatePreventSeedingTooEarlyUtility,
    caluclatePreventSeedingAtTheEndOfGameUtility,
} from './player-ai-utils-seed';

export const getNextCommandAsGameInput = (oldGameState: GameState, possibleMoves: string[]): string => {
    const groupedActions: { [key in PlayerActionType]: PlayerAction[] } = {
        [PlayerActionType.WAIT]: [],
        [PlayerActionType.COMPLETE]: [],
        [PlayerActionType.GROW]: [],
        [PlayerActionType.SEED]: [],
    };

    possibleMoves.forEach((possibleMove) => {
        const action = convertGameInputStringToAction(possibleMove);
        groupedActions[action.actionType].push(action);
    });

    if (groupedActions[PlayerActionType.COMPLETE].length > 0) {
        let lastChosenMoveUtility = 0;
        let chosenMove = `${PlayerActionType.WAIT}`;
        [...groupedActions[PlayerActionType.WAIT], ...groupedActions[PlayerActionType.COMPLETE]].forEach(
            (playerAction) => {
                const clonedGameState = cloneGameState(oldGameState);
                const newGameState = applyActionToGameState(clonedGameState, playerAction);
                const shadowModifiersForWeek = getShadowModifiersForWeek(newGameState);
                const utilities = [calculateRelativeProjectedScoreUtility({ newGameState, shadowModifiersForWeek })];
                const possibleMoveUtility = average(utilities);
                if (possibleMoveUtility <= lastChosenMoveUtility) {
                    return;
                }
                chosenMove = playerAction.possibleMove;
                lastChosenMoveUtility = possibleMoveUtility;
            }
        );
        if (chosenMove !== `${PlayerActionType.WAIT}`) {
            return chosenMove;
        }
    }

    if (groupedActions[PlayerActionType.GROW].length > 0) {
        let lastChosenMoveUtility = 0;
        let chosenMove = `${PlayerActionType.WAIT}`;
        [...groupedActions[PlayerActionType.WAIT], ...groupedActions[PlayerActionType.GROW]].forEach((playerAction) => {
            const clonedGameState = cloneGameState(oldGameState);
            const newGameState = applyActionToGameState(clonedGameState, playerAction);
            //  const shadowModifiersForWeek = getShadowModifiersForWeek(newGameState);
            const utilities = [
                calculateRelativeSunProducedForHalfCycleUtility({ newGameState }),
                calculateRelativeSunProducedForFullCycleUtility({ newGameState }),
                calculateStopGrowingTreesAtTheEndUtility({ newGameState }),
            ];
            const possibleMoveUtility = average(utilities);
            if (possibleMoveUtility <= lastChosenMoveUtility) {
                return;
            }
            chosenMove = playerAction.possibleMove;
            lastChosenMoveUtility = possibleMoveUtility;
        });
        if (chosenMove !== `${PlayerActionType.WAIT}`) {
            return chosenMove;
        }
    }

    if (groupedActions[PlayerActionType.SEED].length > 0) {
        let lastChosenMoveUtility = 0;
        let chosenMove = `${PlayerActionType.WAIT}`;
        [...groupedActions[PlayerActionType.WAIT], ...groupedActions[PlayerActionType.SEED]].forEach((playerAction) => {
            const clonedGameState = cloneGameState(oldGameState);
            const newGameState = applyActionToGameState(clonedGameState, playerAction);
            const areaAnalysisList = getAreaAnalysisList(newGameState);
            const utilities = [
                caluclatePreventSeedingTooEarlyUtility({ newGameState }),
                caluclatePreventSeedingAtTheEndOfGameUtility({ newGameState }),
                calculateMapCellsControlledUtility({ newGameState }),
                calculateAvoidCramnessUtility({ newGameState, areaAnalysisList }),
                calculateAvoidSpammingSeedsUtility({ newGameState }),
                calculateAvoidCastingShadowOnOwnTreesUtility(newGameState, 3),
                calculateRichAreasSeededUtility({ newGameState }),
            ];
            const possibleMoveUtility = average(utilities);
            if (possibleMoveUtility <= lastChosenMoveUtility) {
                return;
            }
            chosenMove = playerAction.possibleMove;
            lastChosenMoveUtility = possibleMoveUtility;
        });
        if (chosenMove !== `${PlayerActionType.WAIT}`) {
            return chosenMove;
        }
    }

    return `${PlayerActionType.WAIT}`;
};
