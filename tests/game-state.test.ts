import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
    createEmptyGameState,
    setCellRichnessFromGameInput,
    setGameStats,
    setTreeFromGameInput,
    cloneGameState,
    GameState,
} from '../src/game-state';

describe('GameState', () => {
    it('initialises game map', () => {
        // Given
        const gameState = createEmptyGameState(37);

        // Then
        expect(gameState).to.deep.equal({
            day: 0,
            nutrients: 0,
            map: {
                numOfCells: 37,
                width: 7,
                height: 7,
                cellIndexToHexCoordinates: [
                    [3, 3],
                    [4, 3],
                    [4, 2],
                    [3, 2],
                    [2, 3],
                    [2, 4],
                    [3, 4],
                    [5, 3],
                    [5, 2],
                    [5, 1],
                    [4, 1],
                    [3, 1],
                    [2, 2],
                    [1, 3],
                    [1, 4],
                    [1, 5],
                    [2, 5],
                    [3, 5],
                    [4, 4],
                    [6, 3],
                    [6, 2],
                    [6, 1],
                    [6, 0],
                    [5, 0],
                    [4, 0],
                    [3, 0],
                    [2, 1],
                    [1, 2],
                    [0, 3],
                    [0, 4],
                    [0, 5],
                    [0, 6],
                    [1, 6],
                    [2, 6],
                    [3, 6],
                    [4, 5],
                    [5, 4],
                ],
                richnessMatrix: [
                    [null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null],
                ],
            },
            players: {
                me: { sun: 0, score: 0, trees: {}, isWaiting: false },
                opponent: { sun: 0, score: 0, trees: {}, isWaiting: false },
            },
        });
    });

    describe('setCellRichnessFromGameInput', () => {
        it('sets cell richness', () => {
            const gameState = createEmptyGameState(37);

            const richnessList = [...new Array(7).fill(3), ...new Array(12).fill(2), ...new Array(18).fill(1)];

            richnessList.forEach((richness, cellID) => {
                setCellRichnessFromGameInput({ gameState, cellID, richness });
            });

            expect(gameState).to.deep.equal({
                day: 0,
                nutrients: 0,
                map: {
                    numOfCells: 37,
                    width: 7,
                    height: 7,
                    cellIndexToHexCoordinates: [
                        [3, 3],
                        [4, 3],
                        [4, 2],
                        [3, 2],
                        [2, 3],
                        [2, 4],
                        [3, 4],
                        [5, 3],
                        [5, 2],
                        [5, 1],
                        [4, 1],
                        [3, 1],
                        [2, 2],
                        [1, 3],
                        [1, 4],
                        [1, 5],
                        [2, 5],
                        [3, 5],
                        [4, 4],
                        [6, 3],
                        [6, 2],
                        [6, 1],
                        [6, 0],
                        [5, 0],
                        [4, 0],
                        [3, 0],
                        [2, 1],
                        [1, 2],
                        [0, 3],
                        [0, 4],
                        [0, 5],
                        [0, 6],
                        [1, 6],
                        [2, 6],
                        [3, 6],
                        [4, 5],
                        [5, 4],
                    ],
                    richnessMatrix: [
                        [null, null, null, 1, 1, 1, 1],
                        [null, null, 1, 2, 2, 2, 1],
                        [null, 1, 2, 3, 3, 2, 1],
                        [1, 2, 3, 3, 3, 2, 1],
                        [1, 2, 3, 3, 2, 1, null],
                        [1, 2, 2, 2, 1, null, null],
                        [1, 1, 1, 1, null, null, null],
                    ],
                },
                players: {
                    me: { sun: 0, score: 0, trees: {}, isWaiting: false },
                    opponent: { sun: 0, score: 0, trees: {}, isWaiting: false },
                },
            });
        });
    });

    describe('cloneGameState', () => {
        it('clones game state', () => {
            const gameState: GameState = {
                day: 2,
                nutrients: 3,
                map: {
                    numOfCells: 37,
                    width: 7,
                    height: 7,
                    cellIndexToHexCoordinates: [
                        [3, 3],
                        [4, 3],
                        [4, 2],
                        [3, 2],
                        [2, 3],
                        [2, 4],
                        [3, 4],
                        [5, 3],
                        [5, 2],
                        [5, 1],
                        [4, 1],
                        [3, 1],
                        [2, 2],
                        [1, 3],
                        [1, 4],
                        [1, 5],
                        [2, 5],
                        [3, 5],
                        [4, 4],
                        [6, 3],
                        [6, 2],
                        [6, 1],
                        [6, 0],
                        [5, 0],
                        [4, 0],
                        [3, 0],
                        [2, 1],
                        [1, 2],
                        [0, 3],
                        [0, 4],
                        [0, 5],
                        [0, 6],
                        [1, 6],
                        [2, 6],
                        [3, 6],
                        [4, 5],
                        [5, 4],
                    ],
                    richnessMatrix: [
                        [null, null, null, 1, 1, 1, 1],
                        [null, null, 1, 2, 2, 2, 1],
                        [null, 1, 2, 3, 3, 2, 1],
                        [1, 2, 3, 3, 3, 2, 1],
                        [1, 2, 3, 3, 2, 1, null],
                        [1, 2, 2, 2, 1, null, null],
                        [1, 1, 1, 1, null, null, null],
                    ],
                },
                players: {
                    me: {
                        sun: 0,
                        score: 0,
                        trees: {
                            '4_3': { size: 3, isDormant: false },
                            '5_3': { size: 2, isDormant: true },
                            '6_3': { size: 1, isDormant: false },
                        },
                        isWaiting: false,
                    },
                    opponent: {
                        sun: 0,
                        score: 0,
                        trees: {
                            '3_2': { size: 3, isDormant: false },
                            '3_1': { size: 2, isDormant: false },
                            '3_0': { size: 1, isDormant: false },
                        },
                        isWaiting: false,
                    },
                },
            };

            const expected = JSON.parse(JSON.stringify(gameState));
            const result = cloneGameState(gameState);

            expect(result).to.deep.equal(expected);
        });
    });

    describe('setGameStats', () => {
        it('sets game stats', () => {
            const gameState = createEmptyGameState(37);

            setGameStats({
                gameState,
                day: 1,
                nutrients: 2,
                mySun: 3,
                myScore: 4,
                oppSun: 5,
                oppScore: 6,
                oppIsWaiting: true,
            });

            expect(gameState).to.deep.equal({
                day: 1,
                nutrients: 2,
                map: {
                    numOfCells: 37,
                    width: 7,
                    height: 7,
                    cellIndexToHexCoordinates: [
                        [3, 3],
                        [4, 3],
                        [4, 2],
                        [3, 2],
                        [2, 3],
                        [2, 4],
                        [3, 4],
                        [5, 3],
                        [5, 2],
                        [5, 1],
                        [4, 1],
                        [3, 1],
                        [2, 2],
                        [1, 3],
                        [1, 4],
                        [1, 5],
                        [2, 5],
                        [3, 5],
                        [4, 4],
                        [6, 3],
                        [6, 2],
                        [6, 1],
                        [6, 0],
                        [5, 0],
                        [4, 0],
                        [3, 0],
                        [2, 1],
                        [1, 2],
                        [0, 3],
                        [0, 4],
                        [0, 5],
                        [0, 6],
                        [1, 6],
                        [2, 6],
                        [3, 6],
                        [4, 5],
                        [5, 4],
                    ],
                    richnessMatrix: [
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                    ],
                },
                players: {
                    me: { sun: 3, score: 4, trees: {}, isWaiting: false },
                    opponent: { sun: 5, score: 6, trees: {}, isWaiting: true },
                },
            });
        });
    });

    describe('setTreeFromGameInput', () => {
        it('sets tree', () => {
            const gameState = createEmptyGameState(37);

            setTreeFromGameInput({ gameState, cellID: 1, size: 3, isMine: true, isDormant: false });
            setTreeFromGameInput({ gameState, cellID: 7, size: 2, isMine: true, isDormant: true });
            setTreeFromGameInput({ gameState, cellID: 19, size: 1, isMine: true, isDormant: false });

            setTreeFromGameInput({ gameState, cellID: 3, size: 3, isMine: false, isDormant: false });
            setTreeFromGameInput({ gameState, cellID: 11, size: 2, isMine: false, isDormant: false });
            setTreeFromGameInput({ gameState, cellID: 25, size: 1, isMine: false, isDormant: false });

            expect(gameState).to.deep.equal({
                day: 0,
                nutrients: 0,
                map: {
                    numOfCells: 37,
                    width: 7,
                    height: 7,
                    cellIndexToHexCoordinates: [
                        [3, 3],
                        [4, 3],
                        [4, 2],
                        [3, 2],
                        [2, 3],
                        [2, 4],
                        [3, 4],
                        [5, 3],
                        [5, 2],
                        [5, 1],
                        [4, 1],
                        [3, 1],
                        [2, 2],
                        [1, 3],
                        [1, 4],
                        [1, 5],
                        [2, 5],
                        [3, 5],
                        [4, 4],
                        [6, 3],
                        [6, 2],
                        [6, 1],
                        [6, 0],
                        [5, 0],
                        [4, 0],
                        [3, 0],
                        [2, 1],
                        [1, 2],
                        [0, 3],
                        [0, 4],
                        [0, 5],
                        [0, 6],
                        [1, 6],
                        [2, 6],
                        [3, 6],
                        [4, 5],
                        [5, 4],
                    ],
                    richnessMatrix: [
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                        [null, null, null, null, null, null, null],
                    ],
                },
                players: {
                    me: {
                        sun: 0,
                        score: 0,
                        trees: {
                            '4_3': { size: 3, isDormant: false },
                            '5_3': { size: 2, isDormant: true },
                            '6_3': { size: 1, isDormant: false },
                        },
                        isWaiting: false,
                    },
                    opponent: {
                        sun: 0,
                        score: 0,
                        trees: {
                            '3_2': { size: 3, isDormant: false },
                            '3_1': { size: 2, isDormant: false },
                            '3_0': { size: 1, isDormant: false },
                        },
                        isWaiting: false,
                    },
                },
            });
        });
    });
});
