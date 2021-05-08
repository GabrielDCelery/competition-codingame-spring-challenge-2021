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

const hexDirections: [HexDirection, HexDirection, HexDirection, HexDirection, HexDirection, HexDirection] = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
];

export const getHexDirectionByID = (directionID: number): HexDirection => {
    return hexDirections[directionID];
};

export const scaleHexDirection = (hexDirection: HexDirection, scale: number): ScaledHexDirection => {
    return [hexDirection[0] * scale, hexDirection[1] * scale];
};

export const addHexDirection = (hexCoordinates: HexCoordinates, direction: ScaledHexDirection): HexCoordinates => {
    return [hexCoordinates[0] + direction[0], hexCoordinates[1] + direction[1]];
};

export const hexNeighbour = (hexCoordinates: HexCoordinates, direction: number): HexCoordinates => {
    const hexDir = getHexDirectionByID(direction);
    const q = hexCoordinates[0] + hexDir[0];
    const r = hexCoordinates[1] + hexDir[1];
    return [q, r];
};

export const getHexMapRadius = (numOfCells: number): number => {
    if (numOfCells === 37) {
        return 3;
    }
    throw new Error(`Unexpected number of cells -> ${numOfCells}`);
};

export const hexCoordinatesToKey = (hexCoordinates: HexCoordinates): string => {
    const [q, r] = hexCoordinates;
    return `${q}_${r}`;
};

export const keyToHexCoordinates = (key: string): HexCoordinates => {
    const [q, r] = key.split('_').map((elem) => parseInt(elem, 10));
    return [q, r];
};
