import { HexMapTransforms, HexCoordinates } from './hex-map-transforms';

export type TreeEntity = {
    coordinates: HexCoordinates;
    size: number;
    isDormant: boolean;
};

export class GameState {
    hexMapTransforms: HexMapTransforms;

    numOfCells: number;
    width: number;
    height: number;

    cellIndexToHexCoordinates: HexCoordinates[];

    richnessMatrix: (number | null)[][];

    day: number;
    nutrients: number;

    mySun: number;
    myScore: number;
    myTrees: { [index: string]: TreeEntity };

    oppSun: number;
    oppScore: number;
    oppIsWaiting: boolean;
    oppTrees: { [index: string]: TreeEntity };

    constructor({ numOfCells }: { numOfCells: number }) {
        this.hexMapTransforms = new HexMapTransforms();
        this.numOfCells = numOfCells;
        const mapRadius = this.hexMapTransforms.getMapRadius({ numOfCells: this.numOfCells });
        this.width = 2 * mapRadius + 1;
        this.height = 2 * mapRadius + 1;
        this.richnessMatrix = new Array(this.height).fill(null).map(() => new Array(this.width).fill(null));

        this.resetGameStats();
        this.resetGameMap();

        const centerCoordinates: HexCoordinates = [mapRadius, mapRadius];
        this.cellIndexToHexCoordinates = [centerCoordinates];

        let pointerCoordinates: HexCoordinates = centerCoordinates;

        for (let radius = 1; radius <= mapRadius; radius++) {
            const hexDirection = this.hexMapTransforms.getHexDirectionByID(0);
            const scaledHexDirection = this.hexMapTransforms.scaleHexDirection(hexDirection, radius);
            pointerCoordinates = this.hexMapTransforms.addHexDirection(centerCoordinates, scaledHexDirection);
            [2, 3, 4, 5, 0, 1].forEach((diretionID) => {
                for (let step = 1; step <= radius; step++) {
                    this.cellIndexToHexCoordinates.push([...pointerCoordinates]);
                    const hexDirection = this.hexMapTransforms.getHexDirectionByID(diretionID);
                    pointerCoordinates = this.hexMapTransforms.addHexDirection(pointerCoordinates, hexDirection);
                }
            });
        }
    }

    resetGameStats(): this {
        this.day = 0;
        this.nutrients = 0;
        this.mySun = 0;
        this.myScore = 0;
        this.oppSun = 0;
        this.oppScore = 0;
        this.oppIsWaiting = false;
        return this;
    }

    resetGameMap(): this {
        this.myTrees = {};
        this.oppTrees = {};
        return this;
    }

    setGameStats({
        day,
        nutrients,
        mySun,
        myScore,
        oppSun,
        oppScore,
        oppIsWaiting,
    }: {
        day: number;
        nutrients: number;
        mySun: number;
        myScore: number;
        oppSun: number;
        oppScore: number;
        oppIsWaiting: boolean;
    }): void {
        this.day = day;
        this.nutrients = nutrients;
        this.mySun = mySun;
        this.myScore = myScore;
        this.oppSun = oppSun;
        this.oppScore = oppScore;
        this.oppIsWaiting = oppIsWaiting;
    }

    isValidHexCoordinates(hexCoordinates: HexCoordinates): boolean {
        const [q, r] = hexCoordinates;
        if (q < 0 || r < 0 || q >= this.width || r >= this.height) {
            return false;
        }
        return this.richnessMatrix[r][q] !== null;
    }

    setCellRichnessFromGameInput({ cellID, richness }: { cellID: number; richness: number }): void {
        const [q, r] = this.cellIndexToHexCoordinates[cellID];
        this.richnessMatrix[r][q] = richness;
    }

    setTreeFromGameInput({
        cellID,
        size,
        isMine,
        isDormant,
    }: {
        cellID: number;
        size: number;
        isMine: boolean;
        isDormant: boolean;
    }): void {
        const coordinates = this.cellIndexToHexCoordinates[cellID];
        const treeEntity: TreeEntity = { coordinates, size, isDormant };
        const key = this.hexMapTransforms.hexCoordinatesToKey(coordinates);
        const map = isMine ? this.myTrees : this.oppTrees;
        map[key] = treeEntity;
    }

    getTreeAtCellID({ cellID }: { cellID: number }): TreeEntity {
        const treeCoordinates = this.cellIndexToHexCoordinates[cellID];
        const treeKey = this.hexMapTransforms.hexCoordinatesToKey(treeCoordinates);
        const tree = this.myTrees[treeKey];
        return tree;
    }

    getNumOfTreesOfSameSize(size: number): number {
        let numOfSize = 0;
        const treeKeys = Object.keys(this.myTrees);
        treeKeys.forEach((treeKey) => {
            const tree = this.myTrees[treeKey];
            if (tree.size !== size) {
                return;
            }
            numOfSize += 1;
        });
        return numOfSize;
    }

    getSunDirection(): number {
        return this.day % 6;
    }
}
