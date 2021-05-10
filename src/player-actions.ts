import { GameState, getNumOfTreesOfSameSize } from './game-state';
import { getHarvestScoreValue, getTreeGrowCost, getSeedCost } from './game-config';
import { hexCoordinatesToKey } from './hex-map-transforms';

export enum ActionType {
    GROW = 'GROW',
    SEED = 'SEED',
    COMPLETE = 'COMPLETE',
    WAIT = 'WAIT',
}

export type Action = {
    actionType: ActionType;
    sourceCellID: number;
    targetCellID: number;
};

export const convertGameInputStringToAction = (possibleMove: string): Action => {
    const [actionType, sourceCellID, targetCellID] = possibleMove.split(' ');
    return {
        actionType: actionType as ActionType,
        sourceCellID: parseInt(sourceCellID || '0', 10),
        targetCellID: parseInt(targetCellID || '0', 10),
    };
};

export const applyWaitActionToGameState = (gameState: GameState): GameState => {
    gameState.day += 1;
    return gameState;
};

export const applyHarvestActionToGameState = (gameState: GameState, sourceCellID: number): GameState => {
    gameState.day += 1;
    const treeCoordinates = gameState.map.cellIndexToHexCoordinates[sourceCellID];
    const [q, r] = treeCoordinates;
    const richness = gameState.map.richnessMatrix[r][q];
    const harvestScore = getHarvestScoreValue({ nutrients: gameState.nutrients, richness });
    gameState.players.me.score = gameState.players.me.score + harvestScore;
    const treeKey = hexCoordinatesToKey(treeCoordinates);
    delete gameState.players.me.trees[treeKey];
    return gameState;
};

export const applyGrowActionToGameState = (gameState: GameState, sourceCellID: number): GameState => {
    gameState.day += 1;
    const treeCoordinates = gameState.map.cellIndexToHexCoordinates[sourceCellID];
    const treeKey = hexCoordinatesToKey(treeCoordinates);
    const targetSize = gameState.players.me.trees[treeKey].size + 1;
    const numOfTreesOfSameSize = getNumOfTreesOfSameSize(gameState, targetSize);
    const growCost = getTreeGrowCost({ targetSize, numOfTreesOfSameSize });
    gameState.players.me.trees[treeKey].size = targetSize;
    gameState.players.me.trees[treeKey].isDormant = true;
    gameState.players.me.sun -= growCost;
    return gameState;
};

export const applySeedActionToGameState = (
    gameState: GameState,
    sourceCellID: number,
    targetCellID: number
): GameState => {
    gameState.day += 1;
    const sourceTreeCoordinates = gameState.map.cellIndexToHexCoordinates[sourceCellID];
    const targetCoordinates = gameState.map.cellIndexToHexCoordinates[targetCellID];
    const sourceTreeKey = hexCoordinatesToKey(sourceTreeCoordinates);
    const targetTreeKey = hexCoordinatesToKey(targetCoordinates);
    const seededTreeSize = 0;
    const numOfTreesOfSameSize = getNumOfTreesOfSameSize(gameState, seededTreeSize);
    const seedCost = getSeedCost(numOfTreesOfSameSize);
    gameState.players.me.trees[targetTreeKey] = {
        size: seededTreeSize,
        isDormant: true,
    };
    gameState.players.me.trees[sourceTreeKey].isDormant = true;
    gameState.players.me.sun -= seedCost;
    return gameState;
};

export const applyActionToGameState = (gameState: GameState, action: Action): GameState => {
    const { actionType, sourceCellID, targetCellID } = action;
    switch (actionType) {
        case ActionType.WAIT: {
            return applyWaitActionToGameState(gameState);
        }
        case ActionType.COMPLETE: {
            return applyHarvestActionToGameState(gameState, sourceCellID);
        }
        case ActionType.GROW: {
            return applyGrowActionToGameState(gameState, sourceCellID);
        }
        case ActionType.SEED: {
            return applySeedActionToGameState(gameState, sourceCellID, targetCellID);
        }
        default: {
            throw new Error(`failed to interpret action: ${action}`);
        }
    }
};
