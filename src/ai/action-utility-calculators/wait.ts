import { GameStateCalculator } from '../game-state-calculator';

export class WaitActionUtilityCalculator {
    gameStateCalculator: GameStateCalculator;

    constructor({ gameStateCalculator }: { gameStateCalculator: GameStateCalculator }) {
        this.gameStateCalculator = gameStateCalculator;
    }

    calculateUtility(): number {
        return 0.4;
    }
}
