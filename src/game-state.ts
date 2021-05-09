import {
    HexCoordinates,
    getHexMapRadius,
    getHexDirectionByID,
    scaleHexDirection,
    addHexDirection,
    hexCoordinatesToKey,
    keyToHexCoordinates,
} from './hex-map-transforms';

type TreeState = {
    size: number;
    isDormant: boolean;
};

type PlayerState = {
    sun: number;
    score: number;
    trees: { [index: string]: TreeState };
    isWaiting: boolean;
};

export type GameState = {
    day: number;
    nutrients: number;

    map: {
        numOfCells: number;
        width: number;
        height: number;
        cellIndexToHexCoordinates: HexCoordinates[];
        richnessMatrix: (number | null)[][];
    };

    players: {
        me: PlayerState;
        opponent: PlayerState;
    };
};

export const createEmptyGameState = (numOfCells: number): GameState => {
    const mapRadius = getHexMapRadius(numOfCells);
    const width = 2 * mapRadius + 1;
    const height = 2 * mapRadius + 1;
    const richnessMatrix = new Array(height).fill(null).map(() => new Array(width).fill(null));

    const centerCoordinates: HexCoordinates = [mapRadius, mapRadius];
    const cellIndexToHexCoordinates = [centerCoordinates];

    let pointerCoordinates: HexCoordinates = centerCoordinates;

    for (let radius = 1; radius <= mapRadius; radius++) {
        const hexDirection = getHexDirectionByID(0);
        const scaledHexDirection = scaleHexDirection(hexDirection, radius);
        pointerCoordinates = addHexDirection(centerCoordinates, scaledHexDirection);
        [2, 3, 4, 5, 0, 1].forEach((diretionID) => {
            for (let step = 1; step <= radius; step++) {
                cellIndexToHexCoordinates.push([...pointerCoordinates]);
                const hexDirection = getHexDirectionByID(diretionID);
                pointerCoordinates = addHexDirection(pointerCoordinates, hexDirection);
            }
        });
    }

    return {
        day: 0,
        nutrients: 0,
        map: {
            numOfCells,
            width,
            height,
            cellIndexToHexCoordinates,
            richnessMatrix,
        },
        players: {
            me: {
                sun: 0,
                score: 0,
                trees: {},
                isWaiting: false,
            },
            opponent: {
                sun: 0,
                score: 0,
                trees: {},
                isWaiting: false,
            },
        },
    };
};

export const setGameStats = ({
    gameState,
    day,
    nutrients,
    mySun,
    myScore,
    oppSun,
    oppScore,
    oppIsWaiting,
}: {
    gameState: GameState;
    day: number;
    nutrients: number;
    mySun: number;
    myScore: number;
    oppSun: number;
    oppScore: number;
    oppIsWaiting: boolean;
}): void => {
    gameState.day = day;
    gameState.nutrients = nutrients;
    gameState.players.me.sun = mySun;
    gameState.players.me.score = myScore;
    gameState.players.opponent.sun = oppSun;
    gameState.players.opponent.score = oppScore;
    gameState.players.opponent.isWaiting = oppIsWaiting;
};

export const setCellRichnessFromGameInput = ({
    gameState,
    cellID,
    richness,
}: {
    gameState: GameState;
    cellID: number;
    richness: number;
}): void => {
    const [q, r] = gameState.map.cellIndexToHexCoordinates[cellID];
    gameState.map.richnessMatrix[r][q] = richness;
};

export const resetGameStateForTurn = ({ gameState }: { gameState: GameState }): void => {
    gameState.day = 0;
    gameState.nutrients = 0;
    gameState.players.me = {
        sun: 0,
        score: 0,
        trees: {},
        isWaiting: false,
    };
    gameState.players.opponent = {
        sun: 0,
        score: 0,
        trees: {},
        isWaiting: false,
    };
};

export const setTreeFromGameInput = ({
    gameState,
    cellID,
    size,
    isMine,
    isDormant,
}: {
    gameState: GameState;
    cellID: number;
    size: number;
    isMine: boolean;
    isDormant: boolean;
}): void => {
    const coordinates = gameState.map.cellIndexToHexCoordinates[cellID];
    const tree: TreeState = { size, isDormant };
    const key = hexCoordinatesToKey(coordinates);
    const map = isMine ? gameState.players.me.trees : gameState.players.opponent.trees;
    map[key] = tree;
};

export const cloneGameState = (gameState: GameState): GameState => {
    return {
        day: gameState.day,
        nutrients: gameState.nutrients,
        map: {
            numOfCells: gameState.map.numOfCells,
            width: gameState.map.width,
            height: gameState.map.height,
            cellIndexToHexCoordinates: JSON.parse(JSON.stringify(gameState.map.cellIndexToHexCoordinates)),
            richnessMatrix: JSON.parse(JSON.stringify(gameState.map.richnessMatrix)),
        },
        players: {
            me: {
                sun: gameState.players.me.sun,
                score: gameState.players.me.score,
                trees: JSON.parse(JSON.stringify(gameState.players.me.trees)),
                isWaiting: gameState.players.me.isWaiting,
            },
            opponent: {
                sun: gameState.players.opponent.sun,
                score: gameState.players.opponent.score,
                trees: JSON.parse(JSON.stringify(gameState.players.opponent.trees)),
                isWaiting: gameState.players.opponent.isWaiting,
            },
        },
    };
};

export const isValidHexCoordinates = (gameState: GameState, hexCoordinates: HexCoordinates): boolean => {
    const [q, r] = hexCoordinates;
    if (q < 0 || r < 0 || q >= gameState.map.width || r >= gameState.map.height) {
        return false;
    }
    return gameState.map.richnessMatrix[r][q] !== null;
};

export const getTreeShadowModifiersForWeek = (gameState: GameState): { [index: string]: number } => {
    const shadowModifiers: { [index: string]: number } = {};

    const treesMap = {
        ...gameState.players.me.trees,
        ...gameState.players.opponent.trees,
    };

    Object.keys(treesMap).forEach((treeKey) => {
        const treeCastingShadow = treesMap[treeKey];

        if (treeCastingShadow.size === 0) {
            return;
        }

        const treeCoordinates = keyToHexCoordinates(treeKey);

        for (let directionID = 0, iMax = 6; directionID < iMax; directionID++) {
            const hexDirection = getHexDirectionByID(directionID);

            for (let scale = 1; scale <= treeCastingShadow.size; scale++) {
                const scaledHexDirection = scaleHexDirection(hexDirection, scale);
                const shadowCoordinates = addHexDirection(treeCoordinates, scaledHexDirection);

                if (!isValidHexCoordinates(gameState, shadowCoordinates)) {
                    break;
                }

                const shadowCastOnTreeKey = hexCoordinatesToKey(shadowCoordinates);
                const treeBeingCastShadowOn = treesMap[shadowCastOnTreeKey];

                if (!treeBeingCastShadowOn || treeCastingShadow.size < treeBeingCastShadowOn.size) {
                    continue;
                }

                shadowModifiers[shadowCastOnTreeKey] = (shadowModifiers[shadowCastOnTreeKey] || 0) + 1 / 6;
            }
        }
    });

    return shadowModifiers;
};

export const getNumOfTreesOfSameSize = (gameState: GameState, size: number): number => {
    let count = 0;
    Object.keys(gameState.players.me.trees).forEach((key) => {
        if (gameState.players.me.trees[key].size !== size) {
            return;
        }
        count++;
    });
    return count;
};

export const getNumOfCellsInfluenced = (gameState: GameState): number => {
    const influencedCells: { [index: string]: boolean } = {};

    Object.keys(gameState.players.me.trees).forEach((treeKey) => {
        influencedCells[treeKey] = true;
        const treeCoordinates = keyToHexCoordinates(treeKey);
        [0, 1, 2, 3, 4, 5].forEach((directionID) => {
            const hexDirection = getHexDirectionByID(directionID);
            const influencedCoordinates = addHexDirection(treeCoordinates, hexDirection);
            if (!isValidHexCoordinates(gameState, influencedCoordinates)) {
                return;
            }
            const influencedKey = hexCoordinatesToKey(influencedCoordinates);
            if (
                gameState.players.me.trees[influencedKey] ||
                // gameState.players.opponent.trees[influencedKey] ||
                influencedCells[influencedKey]
            ) {
                return;
            }
            influencedCells[influencedKey] = true;
        });
    });

    return Object.keys(influencedCells).length;
};

/*
export const getNumOfCellsInfluenced = (gameState: GameState): number => {
    const influencedCells: { [index: string]: boolean } = {};

    Object.keys(gameState.players.me.trees).forEach((treeKey) => {
        influencedCells[treeKey] = true;
        const tree = gameState.players.me.trees[treeKey];
        if (tree.size === 0) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        [0, 1, 2, 3, 4, 5].forEach((directionID) => {
            const hexDirection = getHexDirectionByID(directionID);
            new Array(tree.size)
                .fill(null)
                .map((e, i) => i + 1)
                .forEach((scale) => {
                    const scaledHexDirection = scaleHexDirection(hexDirection, scale);
                    const influencedCoordinates = addHexDirection(treeCoordinates, scaledHexDirection);
                    if (!isValidHexCoordinates(gameState, influencedCoordinates)) {
                        return;
                    }
                    const influencedKey = hexCoordinatesToKey(influencedCoordinates);
                    if (
                        gameState.players.me.trees[influencedKey] ||
                        // gameState.players.opponent.trees[influencedKey] ||
                        influencedCells[influencedKey]
                    ) {
                        return;
                    }
                    influencedCells[influencedKey] = true;
                });
        });
    });

    return Object.keys(influencedCells).length;
};
*/
