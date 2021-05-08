import {
    createEmptyGameState,
    setCellRichnessFromGameInput,
    setGameStats,
    resetGameStateForTurn,
    setTreeFromGameInput,
} from './game-state';
import { getNextCommandAsGameInput } from './player-agent';

declare const readline: any;

const readNextLine = (): string => readline();

const numOfCells = parseInt(readNextLine()); // 37

const gameState = createEmptyGameState(numOfCells);

for (let i = 0; i < numOfCells; i++) {
    const inputs = readNextLine().split(' ');
    const cellID = parseInt(inputs[0]); // 0 is the center cell, the next cells spiral outwards
    const richness = parseInt(inputs[1]); // 0 if the cell is unusable, 1-3 for usable cells
    setCellRichnessFromGameInput({ gameState, cellID, richness });
}

while (true) {
    resetGameStateForTurn({ gameState });

    const day = parseInt(readNextLine()); // the game lasts 24 days: 0-23
    const nutrients = parseInt(readNextLine()); // the base score you gain from the next COMPLETE action
    const myInputs = readNextLine().split(' ');
    const mySun = parseInt(myInputs[0]); // your sun points
    const myScore = parseInt(myInputs[1]); // your current score
    const oppInputs = readNextLine().split(' ');
    const oppSun = parseInt(oppInputs[0]); // opponent's sun points
    const oppScore = parseInt(oppInputs[1]); // opponent's score
    const oppIsWaiting = oppInputs[2] !== '0'; // whether your opponent is asleep until the next day

    setGameStats({
        gameState,
        day,
        nutrients,
        mySun,
        myScore,
        oppSun,
        oppScore,
        oppIsWaiting,
    });

    const numberOfTrees = parseInt(readNextLine()); // the current amount of trees

    for (let i = 0; i < numberOfTrees; i++) {
        const treeInputs = readNextLine().split(' ');
        const cellID = parseInt(treeInputs[0]); // location of this tree
        const size = parseInt(treeInputs[1]); // size of this tree: 0-3
        const isMine = treeInputs[2] !== '0'; // 1 if this is your tree
        const isDormant = treeInputs[3] !== '0'; // 1 if this tree is dormant
        setTreeFromGameInput({ gameState, cellID, size, isMine, isDormant });
    }

    const numberOfPossibleMoves = parseInt(readNextLine());

    const possibleMoves: string[] = [];

    for (let i = 0; i < numberOfPossibleMoves; i++) {
        const possibleMove = readNextLine();
        possibleMoves.push(possibleMove);
    }

    const command = getNextCommandAsGameInput(gameState, possibleMoves);
    console.log(command);
}
