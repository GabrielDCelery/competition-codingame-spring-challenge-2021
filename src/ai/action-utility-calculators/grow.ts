import { GameStateCalculator } from '../game-state-calculator';
import {} from '../utility-helpers';

export class GrowActionUtilityCalculator {
    gameStateCalculator: GameStateCalculator;

    constructor({ gameStateCalculator }: { gameStateCalculator: GameStateCalculator }) {
        this.gameStateCalculator = gameStateCalculator;
    }

    // calculateBlockingEnemyTreesUtility(): number {}

    calculateUtility({ cellID }: { cellID: number }): number {
        // if agent has not enough sun to grow it skips the calculation
        // the more enemy trees it blocks the more it wants to grow
        // the more friendly trees it blocks the less it wants to grow
        // the more enemy trees block it the less it wants to grow
        // the more uncovered area it covers the more it wants to grow
        // the more its worth in terms of scores the more it wants to grow

        if (!this.gameStateCalculator.isTreeAtCellIdGrowable({ cellID })) {
            return 0;
        }

        const tree = this.gameStateCalculator.getTreeAtCellID({ cellID });
        const treesBlocked = this.gameStateCalculator.getNumberOfTreesBlockedStatisticsAfterGrow({ tree });
        const numOfTrees = this.gameStateCalculator.getNumberOfTreesStatistics();

        console.error(treesBlocked);

        // const blockingEnemyTreesUtility = this.calculateBlockingEnemyTreesUtility();

        return 0;
    }
}
