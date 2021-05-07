type X = number;
type Y = number;
type Z = number;

export type CubeCoordinates = [X, Y, Z];

type Q = number;
type R = number;

export type HexCoordinates = [Q, R];

type HexSingleDirection = 1 | 0 | -1;

export type HexDirection = [HexSingleDirection, HexSingleDirection];
export type ScaledHexDirection = [number, number];

export class HexMapTransforms {
    hexDirections: [HexDirection, HexDirection, HexDirection, HexDirection, HexDirection, HexDirection];

    constructor() {
        this.hexDirections = [
            [1, 0],
            [1, -1],
            [0, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
        ];
    }

    cubeCoordinatesToHex(cubeCoordinates: CubeCoordinates): HexCoordinates {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [x, y, z] = cubeCoordinates;
        return [x, z];
    }

    hexCoordinatesToCube(hexCoordinates: HexCoordinates): CubeCoordinates {
        const [q, r] = hexCoordinates;
        const x = q;
        const z = r;
        const y = -x - z;
        return [x, y, z];
    }

    getHexDirectionByID(directionID: number): HexDirection {
        return this.hexDirections[directionID];
    }

    scaleHexDirection(hexDirection: HexDirection, scale: number): ScaledHexDirection {
        return [hexDirection[0] * scale, hexDirection[1] * scale];
    }

    addHexDirection(hexCoordinates: HexCoordinates, direction: ScaledHexDirection): HexCoordinates {
        return [hexCoordinates[0] + direction[0], hexCoordinates[1] + direction[1]];
    }

    hexNeighbour(hexCoordinates: HexCoordinates, direction: number): HexCoordinates {
        const hexDir = this.getHexDirectionByID(direction);
        const q = hexCoordinates[0] + hexDir[0];
        const r = hexCoordinates[1] + hexDir[1];
        return [q, r];
    }

    getMapRadius({ numOfCells }: { numOfCells: number }): number {
        if (numOfCells === 37) {
            return 3;
        }
        throw new Error(`Unexpected number of cells -> ${numOfCells}`);
    }

    hexCoordinatesToKey(hexCoordinates: HexCoordinates): string {
        const [q, r] = hexCoordinates;
        return `${q}_${r}`;
    }

    keyToHexCoordinates(key: string): HexCoordinates {
        const [q, r] = key.split('_').map((elem) => parseInt(elem, 10));
        return [q, r];
    }
}
