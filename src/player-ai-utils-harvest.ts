import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, PlayerTrees } from './game-state';
import { ShadowModifiersForWeek } from './game-state-enhancements';
import { keyToHexCoordinates } from './hex-map-transforms';
import { caluclatePlayerAverageSunProductionPerDay } from './player-ai-utils-common';
import { normalizedExponential, normalizedLinear } from './utility-helpers';

const calculatePlayerProjectedFinalScore = ({
    daysLeft,
    playerScore,
    playerTrees,
    shadowModifiersForWeek,
    gameState,
}: {
    daysLeft: number;
    playerScore: number;
    playerTrees: PlayerTrees;
    shadowModifiersForWeek: ShadowModifiersForWeek;
    gameState: GameState;
}): number => {
    const playerAverageSunProductionPerDay = caluclatePlayerAverageSunProductionPerDay({
        playerTrees,
        shadowModifiersForWeek,
    });

    let playerProjectedFinalScore = playerScore;
    let playerSunProducedTillEndOfGame = playerAverageSunProductionPerDay * daysLeft * 0.7;
    let currentNutrientsModifier = 0;

    Object.keys(playerTrees).forEach((treeKey) => {
        const tree = playerTrees[treeKey];
        if (tree.size < 3) {
            return;
        }
        if (playerSunProducedTillEndOfGame < 4) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = gameState.map.richnessMatrix[r][q] || 0;
        playerProjectedFinalScore += gameState.nutrients + currentNutrientsModifier + richness;
        currentNutrientsModifier -= 1;
        playerSunProducedTillEndOfGame -= 4;
    });

    playerProjectedFinalScore += playerSunProducedTillEndOfGame / 3;
    return playerProjectedFinalScore;
};

export const calculateProjectedScoreUtility = (
    newGameState: GameState,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    const daysLeft = MAX_NUM_OF_DAYS - newGameState.day;
    const myProjectedFinalScore = calculatePlayerProjectedFinalScore({
        daysLeft,
        playerScore: newGameState.players.me.score,
        playerTrees: newGameState.players.me.trees,
        shadowModifiersForWeek,
        gameState: newGameState,
    });
    const targetMaxScore = 260;
    const myScore = myProjectedFinalScore > targetMaxScore ? targetMaxScore : myProjectedFinalScore;
    return (
        (1 - normalizedExponential({ value: newGameState.day, max: MAX_NUM_OF_DAYS, a: 3 })) *
        normalizedLinear({ value: myScore, max: myProjectedFinalScore })
    );
};

export const calculateRelativeProjectedScoreUtility = (
    newGameState: GameState,
    shadowModifiersForWeek: ShadowModifiersForWeek
): number => {
    const daysLeft = MAX_NUM_OF_DAYS - newGameState.day;

    const myProjectedFinalScore = calculatePlayerProjectedFinalScore({
        daysLeft,
        playerScore: newGameState.players.me.score,
        playerTrees: newGameState.players.me.trees,
        shadowModifiersForWeek,
        gameState: newGameState,
    });

    const opponentProjectedFinalScore = calculatePlayerProjectedFinalScore({
        daysLeft,
        playerScore: newGameState.players.opponent.score,
        playerTrees: newGameState.players.opponent.trees,
        shadowModifiersForWeek,
        gameState: newGameState,
    });

    const totalProjectedScoreBetweenPlayers = myProjectedFinalScore + opponentProjectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0 ? 0.5 : myProjectedFinalScore / totalProjectedScoreBetweenPlayers;
    return utility;
};
