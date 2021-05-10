import { MAX_NUM_OF_DAYS } from './game-config';
import { EnhancedGameState, GameStateMinMax } from './game-state-enhancer';
import {
    normalizedExponential,
    normalizedLinear,
    normalizedLinearDecay,
    normalizedPyramid,
    normalizeValueBetweenZeroAndOne,
} from './utility-helpers';

export const calculateScoreUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateMinMax: GameStateMinMax
): number => {
    const linearRiseWeight = normalizedLinear({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS, a: 0.5 });
    return (
        linearRiseWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateMinMax.players.me.score.min,
            max: gameStateMinMax.players.me.score.max,
            value: newEnhancedGameState.players.me.score,
        })
    );
};

export const calculateAverageSunProductionUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateMinMax: GameStateMinMax
): number => {
    const exponentialRiseWeight = normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;
    return (
        logarithmicDecayWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateMinMax.players.me.averageSunProductionPerDay.min,
            max: gameStateMinMax.players.me.averageSunProductionPerDay.max,
            value: newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay,
        })
    );
};

export const calculateSunStoredUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateMinMax: GameStateMinMax
): number => {
    const linearDecayWeight = normalizedLinearDecay({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return (
        linearDecayWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateMinMax.players.me.sun.min,
            max: gameStateMinMax.players.me.sun.max,
            value: newEnhancedGameState.players.me.sun,
        })
    );
};

export const calculateTotalTreeSizeUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateMinMax: GameStateMinMax
): number => {
    const exponentialRiseWeight = normalizedExponential({
        value: newEnhancedGameState.day,
        max: MAX_NUM_OF_DAYS,
        a: 5,
    });
    const logarithmicDecayWeight = 1 - exponentialRiseWeight;

    return (
        logarithmicDecayWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateMinMax.players.me.totalTreeSize.min,
            max: gameStateMinMax.players.me.totalTreeSize.max,
            value: newEnhancedGameState.enhancements.players.me.totalTreeSize,
        })
    );
};

export const calculateInfluenceUtility = (
    newEnhancedGameState: EnhancedGameState,
    gameStateMinMax: GameStateMinMax
): number => {
    const pyramidWeight = normalizedPyramid({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return (
        pyramidWeight *
        normalizeValueBetweenZeroAndOne({
            min: gameStateMinMax.players.me.influence.min,
            max: gameStateMinMax.players.me.influence.max,
            value: newEnhancedGameState.enhancements.players.me.influence,
        })
    );
};

export const calcRelativeProjectedScoreAdvantage = (newEnhancedGameState: EnhancedGameState): number => {
    const totalProjectedScoreBetweenPlayers =
        newEnhancedGameState.enhancements.players.me.projectedFinalScore +
        newEnhancedGameState.enhancements.players.opponent.projectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.projectedFinalScore / totalProjectedScoreBetweenPlayers;
    // const linearRiseWeight = normalizedLinear({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return utility;
};

export const calcRelativeProductionUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const totalAverageProduction =
        newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay +
        newEnhancedGameState.enhancements.players.opponent.averageSunProductionPerDay;
    const utility =
        totalAverageProduction === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.averageSunProductionPerDay / totalAverageProduction;
    // const logarithmicDecayWeight =  1 - normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS, a: 3 });
    // const linearRiseWeight = normalizedLinear({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return utility;
};

export const calcRelativeProjectedProductionUtility = (newEnhancedGameState: EnhancedGameState): number => {
    const totalAverageProduction =
        newEnhancedGameState.enhancements.players.me.projectedAverageSunProductionPerDay +
        newEnhancedGameState.enhancements.players.opponent.projectedAverageSunProductionPerDay;
    const utility =
        totalAverageProduction === 0
            ? 0.5
            : newEnhancedGameState.enhancements.players.me.projectedAverageSunProductionPerDay / totalAverageProduction;
    //    const logarithmicDecayWeight =   1 - normalizedExponential({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS, a: 3 });
    const linearRiseWeight = normalizedLinear({ value: newEnhancedGameState.day, max: MAX_NUM_OF_DAYS });
    return linearRiseWeight * utility;
};
