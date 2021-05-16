import { MAX_NUM_OF_DAYS } from './game-config';
import { GameState, PlayerTrees } from './game-state';
import { ShadowModifiersForWeek } from './game-state-enhancements';
import { keyToHexCoordinates } from './hex-map-transforms';
import { caluclatePlayerAverageSunProductionPerDay } from './player-ai-utils-common';

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
    let playerSunAtEndOfGame = playerAverageSunProductionPerDay * daysLeft;
    let currentNutrientsModifier = 0;

    Object.keys(playerTrees).forEach((treeKey) => {
        const tree = playerTrees[treeKey];
        if (tree.size === 0) {
            if (daysLeft < 6) {
                return;
            }
            playerSunAtEndOfGame = playerSunAtEndOfGame - (1 + 3 + 7);
        }
        if (tree.size === 1) {
            if (daysLeft < 5) {
                return;
            }
            playerSunAtEndOfGame = playerSunAtEndOfGame - (3 + 7);
        }
        if (tree.size === 2) {
            if (daysLeft < 4) {
                return;
            }
            playerSunAtEndOfGame = playerSunAtEndOfGame - 7;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const [q, r] = treeCoordinates;
        const richness = gameState.map.richnessMatrix[r][q] || 0;
        if (richness === 1) {
            playerProjectedFinalScore += 0;
        }
        if (richness === 2) {
            playerProjectedFinalScore += 2;
        }
        if (richness === 3) {
            playerProjectedFinalScore += 4;
        }
        playerProjectedFinalScore += gameState.nutrients + currentNutrientsModifier;
        currentNutrientsModifier -= 1;
        playerSunAtEndOfGame -= 4;
    });

    playerProjectedFinalScore += playerSunAtEndOfGame / 3;
    return playerProjectedFinalScore;
};

export const calculateRelativeProjectedScoreUtility = ({
    newGameState,
    shadowModifiersForWeek,
}: {
    newGameState: GameState;
    shadowModifiersForWeek: ShadowModifiersForWeek;
}): number => {
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

    if (myProjectedFinalScore <= 0 || opponentProjectedFinalScore <= 0) {
        return 0;
    }
    const totalProjectedScoreBetweenPlayers = myProjectedFinalScore + opponentProjectedFinalScore;

    const utility =
        totalProjectedScoreBetweenPlayers === 0 ? 0.5 : myProjectedFinalScore / totalProjectedScoreBetweenPlayers;
    return utility;
};
