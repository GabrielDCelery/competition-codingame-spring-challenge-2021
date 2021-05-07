import { GameState, TreeEntity } from '../entities';
import { HARVEST_TREE_SUN_COST, HARVESTABLE_TREE_SIZE, GameConfigs } from '../game-configs';

export class GameStateCalculator {
    gameState: GameState;
    gameConfigs: GameConfigs;

    constructor({ gameState, gameConfigs }: { gameState: GameState; gameConfigs: GameConfigs }) {
        this.gameConfigs = gameConfigs;
        this.gameState = gameState;
    }

    getTreeGrowCost(tree: TreeEntity): number {
        const targetSize = tree.size + 1;
        const numOfTreesOfSameSize = this.gameState.getNumOfTreesOfSameSize(targetSize);
        return this.gameConfigs.getTreeGrowCost({ targetSize, numOfTreesOfSameSize });
    }

    isTreeHarvestable(tree: TreeEntity): boolean {
        return (
            this.gameState.mySun >= HARVEST_TREE_SUN_COST &&
            tree.size === HARVESTABLE_TREE_SIZE &&
            tree.isDormant === false
        );
    }

    isTreeGrowable(tree: TreeEntity): boolean {
        if (tree.size === HARVESTABLE_TREE_SIZE || tree.isDormant === true) {
            return false;
        }
        return this.getTreeGrowCost(tree) <= this.gameState.mySun;
    }

    isTreeAtCellIdHarvestable({ cellID }: { cellID: number }): boolean {
        return this.isTreeHarvestable(this.gameState.getTreeAtCellID({ cellID }));
    }

    isTreeAtCellIdGrowable({ cellID }: { cellID: number }): boolean {
        return this.isTreeGrowable(this.gameState.getTreeAtCellID({ cellID }));
    }

    getTreeHarvestScoreByCellID(cellID: number): number {
        const [q, r] = this.gameState.cellIndexToHexCoordinates[cellID];
        const richness = this.gameState.richnessMatrix[r][q];
        return this.gameConfigs.getHarvestScoreValue({ nutrients: this.gameState.nutrients, richness });
    }

    getMaxPossibleTreeHarvestScore(): number {
        let maxPossibleRichness = 0;
        Object.keys(this.gameState.myTrees).forEach((treeKey) => {
            const tree = this.gameState.myTrees[treeKey];
            if (tree.size < HARVESTABLE_TREE_SIZE) {
                return;
            }
            const [q, r] = this.gameState.hexMapTransforms.keyToHexCoordinates(treeKey);
            const richness = this.gameState.richnessMatrix[r][q];
            if (richness === null) {
                throw new Error('getMaxPossibleTreeHarvestScore');
            }
            if (richness <= maxPossibleRichness) {
                return;
            }
            maxPossibleRichness = richness;
        });

        return this.gameConfigs.getHarvestScoreValue({
            nutrients: this.gameState.nutrients,
            richness: maxPossibleRichness,
        });
    }

    getTreeAtCellID({ cellID }: { cellID: number }): TreeEntity {
        return this.gameState.getTreeAtCellID({ cellID });
    }

    getNumberOfTreesStatistics(): { mineCount: number; opponentCount: number } {
        return {
            mineCount: Object.keys(this.gameState.myTrees).length,
            opponentCount: Object.keys(this.gameState.oppTrees).length,
        };
    }

    getNumberOfTreesBlockedStatisticsAfterGrow({
        tree,
    }: {
        tree: TreeEntity;
    }): { mineBefore: number; mineAfter: number; opponentBefore: number; opponentAfter: number } {
        const result = {
            mineBefore: 0,
            mineAfter: 0,
            opponentBefore: 0,
            opponentAfter: 0,
        };
        if (tree.size === 0) {
            return result;
        }
        const treeSizeAfterGrow = tree.size + 1;
        for (let directionID = 0, iMax = 6; directionID < iMax; directionID++) {
            for (let scale = 1; scale <= treeSizeAfterGrow; scale++) {
                const hexDirection = this.gameState.hexMapTransforms.getHexDirectionByID(directionID);
                const scaledHexDirection = this.gameState.hexMapTransforms.scaleHexDirection(hexDirection, scale);
                const shadowCoordinates = this.gameState.hexMapTransforms.addHexDirection(
                    tree.coordinates,
                    scaledHexDirection
                );
                const treeKey = this.gameState.hexMapTransforms.hexCoordinatesToKey(shadowCoordinates);
                if (this.gameState.myTrees[treeKey]) {
                    result.mineAfter += 1;
                    if (scale !== treeSizeAfterGrow) {
                        result.mineBefore += 1;
                    }
                }
                if (this.gameState.oppTrees[treeKey]) {
                    result.opponentAfter += 1;
                    if (scale !== treeSizeAfterGrow) {
                        result.opponentBefore += 1;
                    }
                }
            }
        }
        return result;
    }
}
