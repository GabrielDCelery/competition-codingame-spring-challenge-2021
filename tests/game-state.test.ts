import { expect } from 'chai';
import { describe, it } from 'mocha';
import { GameState } from '../src/entities';

describe('GameState', () => {
    it('initialises game map', () => {
        // Given
        const gameState = new GameState({ numOfCells: 37 });

        // Then

        expect(gameState.width).to.deep.equal(7);
        expect(gameState.height).to.deep.equal(7);
        expect(gameState.cellIndexToHexCoordinates).to.deep.equal([
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
        ]);
    });

    describe('setCellRichnessFromGameInput', () => {
        it('sets cell richness', () => {
            const gameState = new GameState({ numOfCells: 37 });

            const richnessList = [...new Array(7).fill(3), ...new Array(12).fill(2), ...new Array(18).fill(1)];

            richnessList.forEach((richness, cellID) => {
                gameState.setCellRichnessFromGameInput({ cellID, richness });
            });

            expect(gameState.richnessMatrix).to.deep.equal([
                [null, null, null, 1, 1, 1, 1],
                [null, null, 1, 2, 2, 2, 1],
                [null, 1, 2, 3, 3, 2, 1],
                [1, 2, 3, 3, 3, 2, 1],
                [1, 2, 3, 3, 2, 1, null],
                [1, 2, 2, 2, 1, null, null],
                [1, 1, 1, 1, null, null, null],
            ]);
        });
    });

    describe('setTreeFromGameInput', () => {
        it('sets tree', () => {
            const gameState = new GameState({ numOfCells: 37 });

            gameState.setTreeFromGameInput({ cellID: 1, size: 3, isMine: true, isDormant: false });
            gameState.setTreeFromGameInput({ cellID: 7, size: 2, isMine: true, isDormant: true });
            gameState.setTreeFromGameInput({ cellID: 19, size: 1, isMine: true, isDormant: false });

            gameState.setTreeFromGameInput({ cellID: 3, size: 3, isMine: false, isDormant: false });
            gameState.setTreeFromGameInput({ cellID: 11, size: 2, isMine: false, isDormant: false });
            gameState.setTreeFromGameInput({ cellID: 25, size: 1, isMine: false, isDormant: false });

            expect(gameState.myTrees).to.deep.equal({
                '4_3': { coordinates: [4, 3], size: 3, isDormant: false },
                '5_3': { coordinates: [5, 3], size: 2, isDormant: true },
                '6_3': { coordinates: [6, 3], size: 1, isDormant: false },
            });

            expect(gameState.oppTrees).to.deep.equal({
                '3_2': { coordinates: [3, 2], size: 3, isDormant: false },
                '3_1': { coordinates: [3, 1], size: 2, isDormant: false },
                '3_0': { coordinates: [3, 0], size: 1, isDormant: false },
            });
        });
    });
});
