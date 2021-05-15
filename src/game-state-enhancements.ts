import { GameState, isValidHexCoordinates } from './game-state';
import {
    addHexDirection,
    getHexDirectionByID,
    hexCoordinatesToKey,
    keyToHexCoordinates,
    scaleHexDirection,
} from './hex-map-transforms';

export type TreesInShadowMap = { [index: string]: true };

export const getTreesInShadowMapForDay = ({
    gameState,
    day,
}: {
    gameState: GameState;
    day: number;
}): TreesInShadowMap => {
    const treesInShadowMap: TreesInShadowMap = {};
    const directionID = day % 6;
    const treeKeys = [...Object.keys(gameState.players.me.trees), ...Object.keys(gameState.players.opponent.trees)];
    treeKeys.forEach((treeKey) => {
        const treeCastingShadow = gameState.players.me.trees[treeKey] || gameState.players.opponent.trees[treeKey];
        const treeCastingShadowSize = treeCastingShadow.size;
        if (treeCastingShadowSize === 0) {
            return;
        }
        const treeCoordinates = keyToHexCoordinates(treeKey);
        const hexDirection = getHexDirectionByID(directionID);
        const maxScale = treeCastingShadow.size;
        for (let scale = 1; scale <= maxScale; scale++) {
            const scaledHexDirection = scaleHexDirection(hexDirection, scale);
            const shadowCoordinates = addHexDirection(treeCoordinates, scaledHexDirection);

            if (!isValidHexCoordinates(gameState, shadowCoordinates)) {
                break;
            }

            const shadowCastOnTreeKey = hexCoordinatesToKey(shadowCoordinates);
            const treeBeingCastShadowOn =
                gameState.players.me.trees[shadowCastOnTreeKey] ||
                gameState.players.opponent.trees[shadowCastOnTreeKey];

            if (!treeBeingCastShadowOn) {
                continue;
            }

            const treeBeingCastShadowOnSize = treeBeingCastShadowOn.size;

            if (treeCastingShadowSize < treeBeingCastShadowOnSize) {
                continue;
            }

            treesInShadowMap[shadowCastOnTreeKey] = true;
        }
    });
    return treesInShadowMap;
};

export type ShadowModifiersForWeek = { [index: string]: number };

export const getShadowModifiersForWeek = (gameState: GameState): ShadowModifiersForWeek => {
    const shadowModifiers: { [index: string]: number } = {};

    const treeKeys = [...Object.keys(gameState.players.me.trees), ...Object.keys(gameState.players.opponent.trees)];

    treeKeys.forEach((treeKey) => {
        const treeCastingShadow = gameState.players.me.trees[treeKey] || gameState.players.opponent.trees[treeKey];
        const treeCastingShadowSize = treeCastingShadow.size;

        if (treeCastingShadowSize === 0) {
            return;
        }

        const treeCoordinates = keyToHexCoordinates(treeKey);

        for (let directionID = 0, iMax = 6; directionID < iMax; directionID++) {
            const hexDirection = getHexDirectionByID(directionID);
            const maxScale = treeCastingShadow.size;

            for (let scale = 1; scale <= maxScale; scale++) {
                const scaledHexDirection = scaleHexDirection(hexDirection, scale);
                const shadowCoordinates = addHexDirection(treeCoordinates, scaledHexDirection);

                if (!isValidHexCoordinates(gameState, shadowCoordinates)) {
                    break;
                }

                const shadowCastOnTreeKey = hexCoordinatesToKey(shadowCoordinates);
                const treeBeingCastShadowOn =
                    gameState.players.me.trees[shadowCastOnTreeKey] ||
                    gameState.players.opponent.trees[shadowCastOnTreeKey];

                if (!treeBeingCastShadowOn) {
                    continue;
                }

                const treeBeingCastShadowOnSize = treeBeingCastShadowOn.size;

                if (treeCastingShadowSize < treeBeingCastShadowOnSize) {
                    continue;
                }

                shadowModifiers[shadowCastOnTreeKey] = (shadowModifiers[shadowCastOnTreeKey] || 0) + 1 / 6;
            }
        }
    });

    return shadowModifiers;
};

export type AreaAnalysis = {
    players: {
        me: {
            numOfTrees: number;
            numOfSeeds: number;
        };
        opponent: {
            numOfTrees: number;
            numOfSeeds: number;
        };
    };
};

export const getAreaAnalysisList = (gameState: GameState): AreaAnalysis[] => {
    // const areaCenters = [11, 9, 13, 0, 7, 15, 17];
    const areaCenters = [11, 10, 9, 12, 3, 2, 8, 13, 4, 0, 1, 7, 14, 5, 6, 18, 15, 16, 17];
    const areaAnalysisList = areaCenters.map((areaCenterID) => {
        const areaAnalysis: AreaAnalysis = {
            players: {
                me: {
                    numOfTrees: 0,
                    numOfSeeds: 0,
                },
                opponent: {
                    numOfTrees: 0,
                    numOfSeeds: 0,
                },
            },
        };

        const areaCenterCoordinates = gameState.map.cellIndexToHexCoordinates[areaCenterID];

        const areaCoordinatesList = [
            areaCenterCoordinates,
            ...[0, 1, 2, 3, 4, 5].map((directionID) => {
                const hexDirection = getHexDirectionByID(directionID);
                return addHexDirection(areaCenterCoordinates, hexDirection);
            }),
        ];

        areaCoordinatesList.forEach((areaCoordinates) => {
            const key = hexCoordinatesToKey(areaCoordinates);
            const tree = gameState.players.me.trees[key];
            if (tree) {
                if (tree.size === 0) {
                    areaAnalysis.players.me.numOfSeeds += 1;
                } else {
                    areaAnalysis.players.me.numOfTrees += 1;
                }
            }
        });

        return areaAnalysis;
    });
    return areaAnalysisList;
};
