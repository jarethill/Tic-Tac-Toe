import Game from './Game.js';
import PlayerFactory from './PlayerFactory.js';

const GameBoard = (function () {
    function isValidMove(x, y, board) {
        if (x > 2 || y > 2 || x < 0 || y < 0) throw 'Invalid move, index out of bounds';

        return !board[x][y] ? true : false;
    }

    function checkGameOver(board) {
        // Check rows
        for (let x = 0; x < board.length; x++) {
            const rowResults = [];

            for (let y = 0; y < board[x].length; y++) {
                rowResults.push(board[x][y]);
            }

            if (rowResults.length > 0 && rowResults.every((result) => result === 'x')) {
                return 'x';
            } else if (rowResults.length > 0 && rowResults.every((result) => result === 'o')) {
                return 'o';
            }
        }

        // Check columns
        const arrayColumn = (arr, n) => arr.map((x) => x[n]);
        const columnResults = [];

        for (let i = 0; i < board.length; i++) {
            columnResults.push(arrayColumn(board, i));
        }

        for (let i = 0; i < columnResults.length; i++) {
            const result = columnResults[i];

            if (result.length > 0 && result.every((r) => r === 'x')) {
                return 'x';
            } else if (result.length > 0 && result.every((r) => r === 'o')) {
                return 'o';
            }
        }

        //Check diagonals
        let diagonalResults = [];

        // Top left diagonal
        for (let x = 0; x < board.length; x++) {
            let y = x;

            diagonalResults.push(board[x][y]);
        }

        if (diagonalResults.length > 0 && diagonalResults.every((result) => result === 'x')) {
            return 'x';
        } else if (diagonalResults.length > 0 && diagonalResults.every((result) => result === 'o')) {
            return 'o';
        }

        // Reset results array to empty to check for last diagonal
        diagonalResults = [];

        // Bottom left diagonal
        let j = 0;
        for (let i = board.length - 1; i >= 0; i--) {
            diagonalResults.push(board[i][j]);
            j++;
        }

        if (diagonalResults.length > 0 && diagonalResults.every((result) => result === 'x')) {
            return 'x';
        } else if (diagonalResults.length > 0 && diagonalResults.every((result) => result === 'o')) {
            return 'o';
        }

        // Check for tie
        if (board.flat().every((tile) => tile)) {
            return '/';
        }

        // Return null if no winner
        return null;
    }

    function endGame(winner) {
        winnerTitleElement.textContent = !winner ? 'Game is a tie!' : `${winner.name} has won the game!`;

        winnerTitleElement.classList.remove('invisible');
        playAgainBtn.classList.remove('invisible');

        Game.setInProgress(false);
    }

    function swapCurrentPlayer() {
        currentPlayer = players.find((player) => player.name !== currentPlayer.name);
    }

    function findPlayerWithMark(mark) {
        return players.find((player) => player.mark === mark);
    }

    function move(x, y, playerMark) {
        if (isValidMove(x, y, board) && Game.getInProgress()) {
            board[x][y] = playerMark;
            update();

            const roundResult = checkGameOver(board);

            switch (roundResult) {
                case 'x':
                    endGame(findPlayerWithMark('x'));
                    break;
                case 'o':
                    endGame(findPlayerWithMark('o'));
                    break;
                case '/':
                    endGame();
                    break;
                default:
                    swapCurrentPlayer();

                    if (currentPlayer.isAi) {
                        aiMove();
                    }
                    break;
            }
        }
    }

    function aiMove() {
        let maxScore = -Infinity;
        let bestMove;

        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (isValidMove(x, y, board)) {
                    if (!bestMove) bestMove = { x, y };

                    const simulatedBoard = deepClone2DArray(board);
                    simulatedBoard[x][y] = currentPlayer.mark;

                    const score = minimax(simulatedBoard, 1000, false);

                    if (score > maxScore) {
                        maxScore = score;
                        bestMove = { x, y };
                    }
                }
            }
        }

        move(bestMove.x, bestMove.y, currentPlayer.mark);
    }

    function minimax(board, depth, maximizingPlayer) {
        const roundResult = checkGameOver(board);

        if (depth === 0 || roundResult) {
            const roundResultMapping = {
                x: -1,
                '/': 0,
                o: 1,
            };

            return roundResultMapping[roundResult];
        }

        if (maximizingPlayer) {
            let maxScore = -Infinity;

            for (let x = 0; x < board.length; x++) {
                for (let y = 0; y < board[x].length; y++) {
                    if (isValidMove(x, y, board)) {
                        const simulatedBoard = deepClone2DArray(board);
                        simulatedBoard[x][y] = 'o';

                        const score = minimax(simulatedBoard, depth - 1, false);

                        maxScore = Math.max(maxScore, score);
                    }
                }
            }

            return maxScore;
        } else {
            let minScore = Infinity;

            for (let x = 0; x < board.length; x++) {
                for (let y = 0; y < board[x].length; y++) {
                    if (isValidMove(x, y, board)) {
                        const simulatedBoard = deepClone2DArray(board);
                        simulatedBoard[x][y] = 'x';

                        const score = minimax(simulatedBoard, depth - 1, true);

                        minScore = Math.min(minScore, score);
                    }
                }
            }

            return minScore;
        }
    }

    function update() {
        if (isInitialized === false) throw 'GameBoard must be initialized before using update';

        const flattenedBoard = board.flat();

        allTileTextElements.forEach((element, index) => (element.innerText = flattenedBoard[index]));
    }

    function handleMousedown(e) {
        if (!e.target.classList.contains('tile')) return;

        const { x, y } = e.target.dataset;

        move(x, y, currentPlayer.mark);
    }

    function reset() {
        isInitialized = false;
        players = [];
        board = deepClone2DArray(defaultBoard);

        playAgainBtn.classList.add('invisible');
        winnerTitleElement.classList.add('invisible');
    }

    function deepClone2DArray(array) {
        return array.map((arr) => arr.slice());
    }

    function initialize(playersArray) {
        if (isInitialized === true) throw 'GameBoard is already initialized';
        if (playersArray.length > 2) throw 'Maximum of Two Players allowed';

        // Initialize players
        playersArray.forEach((player) => {
            players.push(player);
        });

        currentPlayer = players[0];

        // Initialize board
        boardElement.innerHTML = '';

        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.dataset.x = x;
                tile.dataset.y = y;

                const text = document.createElement('p');
                text.innerText = board[x][y];
                tile.appendChild(text);

                boardElement.appendChild(tile);
            }
        }

        allTileTextElements = boardElement.querySelectorAll('.tile > p');
        winnerTitleElement = document.getElementById('winner-title');
        playAgainBtn = document.getElementById('play-again');

        isInitialized = true;

        boardElement.addEventListener('mousedown', (e) => handleMousedown(e));

        playAgainBtn.addEventListener('mousedown', () => {
            Game.reset();
            PlayerFactory.reset();
            this.reset();
        });
    }

    const boardElement = document.getElementById('board');
    let players = [];
    let isInitialized = false;

    let currentPlayer;
    let allTileTextElements;
    let winnerTitleElement;
    let playAgainBtn;
    const aiCheckbox = document.getElementById('ai-checkbox');

    const defaultBoard = [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ];

    let board = deepClone2DArray(defaultBoard);
    aiCheckbox.addEventListener('change', (e) => Game.setAiGame(e.target.checked));

    return {
        initialize,
        boardElement,
        reset,
    };
})();

export default GameBoard;
