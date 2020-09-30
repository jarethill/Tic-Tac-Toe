(() => {
    const Game = (function () {
        function start(e) {
            e.preventDefault();

            if (isInProgress) throw 'Game has already started';

            if (!playerOneName) {
                playerOneName = 'Player 1';
            }

            if (!playerTwoName) {
                playerTwoName = 'Player 2';
            }

            const playerOne = PlayerFactory.construct(playerOneName, 'x');

            let playerTwo;

            if (isAiGame) {
                playerTwo = PlayerFactory.construct('AI', 'o', true);
            } else {
                playerTwo = PlayerFactory.construct(playerTwoName, 'o');
            }

            GameBoard.initialize([playerOne, playerTwo]);

            menu.classList.add('invisible');
            GameBoard.boardElement.classList.remove('invisible');
            GameBoard.boardElement.parentElement.classList.remove('invisible');

            isInProgress = true;
        }

        function reset() {
            isInProgress = false;
            menu.classList.remove('invisible');
            GameBoard.boardElement.classList.add('invisible');
            GameBoard.boardElement.parentElement.classList.add('invisible');

            if (isAiGame) {
                playerTwoInput.parentElement.style.display = 'none';
            }
        }

        function getInProgress() {
            return isInProgress;
        }

        function setInProgress(bool) {
            isInProgress = bool;
        }

        function setAiGame(checked) {
            if (checked) {
                playerTwoInput.parentElement.style.display = 'none';
                isAiGame = true;
            } else {
                playerTwoInput.parentElement.style.display = '';
                isAiGame = false;
            }
        }

        const menu = document.querySelector('#menu');
        const menuForm = menu.querySelector('#menu-form');

        const playerOneInput = menuForm.querySelector('#player-one');
        const playerTwoInput = menuForm.querySelector('#player-two');

        playerOneInput.addEventListener('input', (e) => (playerOneName = e.target.value));
        playerTwoInput.addEventListener('input', (e) => (playerTwoName = e.target.value));

        // Start game on form submit
        menuForm.addEventListener('submit', (e) => start(e));

        let playerOneName = playerOneInput.value;
        let playerTwoName = playerTwoInput.value;

        let isInProgress = false;
        let isAiGame = false;

        return {
            reset,
            getInProgress,
            setInProgress,
            setAiGame,
        };
    })();

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
            let maxEval = -Infinity;
            let bestMove;

            for (let x = 0; x < board.length; x++) {
                for (let y = 0; y < board[x].length; y++) {
                    if (isValidMove(x, y, board)) {
                        if (!bestMove) bestMove = { x, y };

                        const simulatedBoard = deepClone2DArray(board);
                        simulatedBoard[x][y] = currentPlayer.mark;

                        const eval = minimax(simulatedBoard, 1000, false);

                        if (eval > maxEval) {
                            maxEval = eval;
                            bestMove = { x, y };
                        }
                    }
                }
            }

            move(bestMove.x, bestMove.y, currentPlayer.mark);
        }

        function minimax(board, depth, maximizingPlayer) {
            const roundResult = checkGameOver(board);

            if (depth === 0) {
                return roundResult;
            }

            if (roundResult) {
                const roundResultMapping = {
                    x: -1,
                    '/': 0,
                    o: 1,
                };

                return roundResultMapping[roundResult];
            }

            if (maximizingPlayer) {
                let maxEval = -Infinity;

                for (let x = 0; x < board.length; x++) {
                    for (let y = 0; y < board[x].length; y++) {
                        if (isValidMove(x, y, board)) {
                            const simulatedBoard = deepClone2DArray(board);
                            simulatedBoard[x][y] = 'o';

                            const eval = minimax(simulatedBoard, depth - 1, false);

                            maxEval = Math.max(maxEval, eval);
                        }
                    }
                }

                return maxEval;
            } else {
                let minEval = Infinity;

                for (let x = 0; x < board.length; x++) {
                    for (let y = 0; y < board[x].length; y++) {
                        if (isValidMove(x, y, board)) {
                            const simulatedBoard = deepClone2DArray(board);
                            simulatedBoard[x][y] = 'x';

                            const eval = minimax(simulatedBoard, depth - 1, true);

                            minEval = Math.min(minEval, eval);
                        }
                    }
                }

                return minEval;
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

        Game.setAiGame(aiCheckbox.checked);

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

    const PlayerFactory = (function () {
        function construct(name, mark, isAi = false) {
            if (mark.toLowerCase() !== 'x' && mark.toLowerCase() !== 'o') {
                throw 'Mark must be an X or an O';
            }

            numberOfPlayers++;

            if (numberOfPlayers > MAX_ALLOWED_PLAYERS) throw `Cannot create more than ${MAX_ALLOWED_PLAYERS} Players`;

            return {
                name,
                mark: mark.toLowerCase(),
                isAi,
            };
        }

        function reset() {
            numberOfPlayers = 0;
        }

        let numberOfPlayers = 0;
        const MAX_ALLOWED_PLAYERS = 2;

        return {
            construct,
            reset,
        };
    })();
})();
