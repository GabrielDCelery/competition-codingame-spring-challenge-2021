import { GameStateCalculator } from '../game-state-calculator';
import { normalizedLinear, average } from '../utility-helpers';

export class HarvestActionUtilityCalculator {
    gameStateCalculator: GameStateCalculator;

    constructor({ gameStateCalculator }: { gameStateCalculator: GameStateCalculator }) {
        this.gameStateCalculator = gameStateCalculator;
    }

    calculateScoreUtility({ cellID }: { cellID: number }): number {
        const maxPossibleScore = this.gameStateCalculator.getMaxPossibleTreeHarvestScore();
        const harvestScore = this.gameStateCalculator.getTreeHarvestScoreByCellID(cellID);
        if (maxPossibleScore === 0 || harvestScore === 0) {
            return 0;
        }
        const utility = normalizedLinear({ value: harvestScore, max: maxPossibleScore });
        return utility;
    }

    calculateUtility({ cellID }: { cellID: number }): number {
        // if agent has not enough sun to harvest the tree or if the tree is not big enough it skips the whole calculation
        // the closer to the end of the game the more it wants to be harvested
        // the more it is in shadow the more it wants to be harvested
        // the less it adds to map coverage the more it wants to be harvested
        // the more the tree worth in terms of scores the more it wants to be harvested

        if (!this.gameStateCalculator.isTreeAtCellIdHarvestable({ cellID })) {
            return 0;
        }
        const scoreUtility = this.calculateScoreUtility({ cellID });
        return average([scoreUtility]);
    }
}
