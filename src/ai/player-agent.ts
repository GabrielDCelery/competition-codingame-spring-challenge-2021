import { GameState } from '../entities';
import { GameConfigs } from '../game-configs';
import {
    WaitActionUtilityCalculator,
    HarvestActionUtilityCalculator,
    GrowActionUtilityCalculator,
} from './action-utility-calculators';
import { GameStateCalculator } from './game-state-calculator';

export enum PlayerAction {
    GROW = 'GROW',
    SEED = 'SEED',
    COMPLETE = 'COMPLETE',
    WAIT = 'WAIT',
}

export class PlayerAgent {
    waitActionUtilityCalculator: WaitActionUtilityCalculator;
    harvestActionUtilityCalculator: HarvestActionUtilityCalculator;
    growActionUtilityCalculator: GrowActionUtilityCalculator;

    constructor({ gameState, gameConfigs }: { gameState: GameState; gameConfigs: GameConfigs }) {
        const gameStateCalculator = new GameStateCalculator({ gameState, gameConfigs });
        this.waitActionUtilityCalculator = new WaitActionUtilityCalculator({ gameStateCalculator });
        this.harvestActionUtilityCalculator = new HarvestActionUtilityCalculator({ gameStateCalculator });
        this.growActionUtilityCalculator = new GrowActionUtilityCalculator({ gameStateCalculator });
    }

    calculatePossibleMoveUtility({ possibleMove }: { possibleMove: string }): number {
        const [action, cellID] = possibleMove.split(' ');
        switch (action) {
            case PlayerAction.WAIT: {
                return this.waitActionUtilityCalculator.calculateUtility();
            }
            case PlayerAction.COMPLETE: {
                return this.harvestActionUtilityCalculator.calculateUtility({ cellID: parseInt(cellID, 10) });
            }
            case PlayerAction.GROW: {
                return this.growActionUtilityCalculator.calculateUtility({ cellID: parseInt(cellID, 10) });
            }
            case PlayerAction.SEED: {
                return 0;
            }
            default: {
                throw new Error(`failed to interpret possible move: ${possibleMove}`);
            }
        }
    }

    getNextCommandAsGameInput({ possibleMoves }: { possibleMoves: string[] }): string {
        let lastChosenMoveUtility = 0;
        let chosenMove = `${PlayerAction.WAIT}`;
        possibleMoves.forEach((possibleMove) => {
            const possibleMoveUtility = this.calculatePossibleMoveUtility({ possibleMove });
            console.error(`${possibleMoveUtility} - ${possibleMove}`);
            if (possibleMoveUtility <= lastChosenMoveUtility) {
                return;
            }
            chosenMove = possibleMove;
            lastChosenMoveUtility = possibleMoveUtility;
        });
        return chosenMove;
    }
}
