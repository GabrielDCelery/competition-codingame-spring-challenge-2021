import { MAX_NUM_OF_DAYS } from './game-config';
import { EnhancedGameState } from './game-state-enhancer';
import { normalizedExponential } from './utility-helpers';

export const calculateSunStoredUtility = (
    oldEnhancedGameState: EnhancedGameState,
    newEnhancedGameState: EnhancedGameState
): number => {
    const totalProjectedScoreBetweenPlayers =
        newEnhancedGameState.enhancements.players.me.projectedFinalScore +
        newEnhancedGameState.enhancements.players.opponent.projectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.projectedFinalScore / totalProjectedScoreBetweenPlayers;
    return utility;
};

export const calcRelativeProjectedScoreAdvantage = (
    oldEnhancedGameState: EnhancedGameState,
    newEnhancedGameState: EnhancedGameState
): number => {
    const totalProjectedScoreBetweenPlayers =
        newEnhancedGameState.enhancements.players.me.projectedFinalScore +
        newEnhancedGameState.enhancements.players.opponent.projectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.projectedFinalScore / totalProjectedScoreBetweenPlayers;
    return utility;
};

export const calcRelativeProductionUtility = (
    oldEnhancedGameState: EnhancedGameState,
    newEnhancedGameState: EnhancedGameState
): number => {
    const totalAverageProduction =
        newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay +
        newEnhancedGameState.enhancements.players.opponent.averageSunProductionPerDay;
    const utility =
        totalAverageProduction === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay / totalAverageProduction;
    const logarithmicDecayWeight =
        1 - normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS, a: 3 });
    return logarithmicDecayWeight * utility;
};

export const calcRelativeProjectedProductionUtility = (
    oldEnhancedGameState: EnhancedGameState,
    newEnhancedGameState: EnhancedGameState
): number => {
    const totalAverageProduction =
        newEnhancedGameState.enhancements.players.me.projectedAverageSunProductionPerDay +
        newEnhancedGameState.enhancements.players.opponent.projectedAverageSunProductionPerDay;
    const utility =
        totalAverageProduction === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.projectedAverageSunProductionPerDay / totalAverageProduction;
    const logarithmicDecayWeight =
        1 - normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS, a: 3 });
    return logarithmicDecayWeight * utility;
};
