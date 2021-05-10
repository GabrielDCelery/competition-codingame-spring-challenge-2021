import { expect } from 'chai';
import { describe, it } from 'mocha';
import { GameState } from '../src/game-state';
import { evaluateGameState } from '../src/game-state-evaluator';

describe('GameStateEvaluator', () => {
    describe('getUniqueCoordinatesListWithShadow', () => {
        it('creates a list of coordinates cast with hadow', () => {
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

            expect(evaluateGameState(gameState)).to.deep.equal({
                myAverageSunProductionPerDay: 5.333333333333334,
                myInfluence: 10,
                myExpansion: 0,
                myTotalScore: 0,
                mySunStored: 0,
                myTotalTreeSize: 6,
                opponentAverageSunProductionPerDay: 5.333333333333334,
                myProjectedFinalScore: 39.111111111111114,
                opponentProjectedFinalScore: 0,
            });
        });
    });
});
