import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
    createEmptyGameState,
    setCellRichnessFromGameInput,
    setGameStats,
    setTreeFromGameInput,
} from '../src/game-state';
import { getNextCommandAsGameInput } from '../src/player-ai';

describe('Custom', () => {
    it('does something', () => {
        const gameState = createEmptyGameState(37);
        setGameStats({
            gameState,
            day: 8,
            nutrients: 20,
            mySun: 15,
            myScore: 0,
            oppSun: 8,
            oppScore: 0,
            oppIsWaiting: false,
        });

        [0, 1, 2, 3, 4, 5, 6].forEach((cellID) => {
            return setCellRichnessFromGameInput({ gameState, cellID, richness: 3 });
        });
        [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].forEach((cellID) => {
            return setCellRichnessFromGameInput({ gameState, cellID, richness: 2 });
        });
        [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].forEach((cellID) => {
            return setCellRichnessFromGameInput({ gameState, cellID, richness: 1 });
        });

        setTreeFromGameInput({ gameState, cellID: 11, size: 2, isMine: true, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 27, size: 2, isMine: true, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 30, size: 2, isMine: true, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 32, size: 2, isMine: true, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 5, size: 3, isMine: true, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 17, size: 1, isMine: true, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 7, size: 1, isMine: true, isDormant: false });

        setTreeFromGameInput({ gameState, cellID: 9, size: 1, isMine: false, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 21, size: 1, isMine: false, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 34, size: 1, isMine: false, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 36, size: 1, isMine: false, isDormant: false });

        setTreeFromGameInput({ gameState, cellID: 6, size: 0, isMine: false, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 8, size: 0, isMine: false, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 20, size: 0, isMine: false, isDormant: false });
        setTreeFromGameInput({ gameState, cellID: 35, size: 0, isMine: false, isDormant: false });

        const possibleMoves = [
            'WAIT',
            'COMPLETE 5',
            'GROW 11',
            'GROW 27',
            'GROW 17',
            'GROW 7',
            'GROW 32',
            'GROW 30',
            'SEED 30 15',
            'SEED 30 4',
            'SEED 32 14',
            'SEED 11 4',
            'SEED 11 24',
            'SEED 11 13',
            'SEED 7 1',
            'SEED 11 3',
            'SEED 30 13',
            'SEED 11 10',
            'SEED 5 15',
            'SEED 30 31',
            'SEED 27 14',
            'SEED 11 0',
            'SEED 5 33',
            'SEED 7 19',
            'SEED 30 29',
            'SEED 30 16',
            'SEED 5 3',
            'SEED 7 18',
            'SEED 32 33',
            'SEED 11 23',
            'SEED 27 26',
            'SEED 11 2',
            'SEED 5 4',
            'SEED 5 0',
            'SEED 30 14',
            'SEED 27 12',
            'SEED 11 26',
            'SEED 27 3',
            'SEED 5 1',
            'SEED 5 12',
            'SEED 27 29',
            'SEED 5 29',
            'SEED 27 13',
            'SEED 27 4',
            'SEED 5 26',
            'SEED 5 28',
            'SEED 5 10',
            'SEED 27 25',
            'SEED 5 31',
            'SEED 32 16',
            'SEED 11 12',
            'SEED 32 15',
            'SEED 5 14',
            'SEED 5 13',
            'SEED 5 18',
            'SEED 27 28',
            'SEED 11 25',
            'SEED 5 16',
            'SEED 30 28',
            'SEED 5 2',
            'SEED 32 31',
        ];

        getNextCommandAsGameInput(gameState, possibleMoves);

        expect(true).to.deep.equal(true);
    });
});
