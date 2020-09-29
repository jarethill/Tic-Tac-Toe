(() => {
    const GameBoard = (function () {
        // Private Methods
        function isValidMove(x, y) {
            if (x > 2 || y > 2 || x < 0 || y < 0) throw 'Invalid move, index out of bounds';

            return !board[x][y] ? true : false;
        }

        function checkGameOver() {
            const playerOneMark = players[0].mark;
            const playerTwoMark = players[1].mark;

            // Check rows
            for (let x = 0; x < board.length; x++) {
                const rowResults = [];

                for (let y = 0; y < board[x].length; y++) {
                    rowResults.push(board[x][y]);
                }

                if (rowResults.length > 0 && rowResults.every((result) => result === playerOneMark)) {
                    return endGame(players[0]);
                } else if (rowResults.length > 0 && rowResults.every((result) => result === playerTwoMark)) {
                    return endGame(players[1]);
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

                if (result.length > 0 && result.every((r) => r === playerOneMark)) {
                    return endGame(players[0]);
                } else if (result.length > 0 && result.every((r) => r === playerTwoMark)) {
                    return endGame(players[1]);
                }
            }

            //Check diagonals
            let diagonalResults = [];

            // Top left diagonal
            for (let x = 0; x < board.length; x++) {
                let y = x;

                diagonalResults.push(board[x][y]);
            }

            if (diagonalResults.length > 0 && diagonalResults.every((result) => result === playerOneMark)) {
                return endGame(players[0]);
            } else if (diagonalResults.length > 0 && diagonalResults.every((result) => result === playerTwoMark)) {
                return endGame(players[1]);
            }

            // Reset results array to empty to check for last diagonal
            diagonalResults = [];

            // Bottom left diagonal
            let j = 0;
            for (let i = board.length - 1; i >= 0; i--) {
                diagonalResults.push(board[i][j]);
                j++;
            }

            if (diagonalResults.length > 0 && diagonalResults.every((result) => result === playerOneMark)) {
                return endGame(players[0]);
            } else if (diagonalResults.length > 0 && diagonalResults.every((result) => result === playerTwoMark)) {
                return endGame(players[1]);
            }

            // Check for tie
            if (board.flat().every((tile) => tile)) {
                return endGame('tie');
            }
        }

        function endGame(winner) {
            if (winner === 'tie') {
                winnerTitleElement.textContent = `Game is a tie!`;
            } else {
                winnerTitleElement.textContent = `${winner.name} has won the game!`;
            }

            winnerTitleElement.classList.remove('invisible');
            playAgainBtn.classList.remove('invisible');

            Game.setInProgress(false);
        }

        function swapCurrentPlayer() {
            currentPlayer = players.find((player) => player.name !== currentPlayer.name);
        }

        function move(x, y, playerMark) {
            if (isValidMove(x, y) && Game.getInProgress()) {
                board[x][y] = playerMark;
                update();

                checkGameOver();
                swapCurrentPlayer();
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
            board = defaultBoard.map((arr) => arr.slice());

            playAgainBtn.classList.add('invisible');
            winnerTitleElement.classList.add('invisible');
        }

        // Public Methods
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

        // Private Variables
        const boardElement = document.getElementById('board');
        let players = [];
        let isInitialized = false;

        let currentPlayer;
        let allTileTextElements;
        let winnerTitleElement;
        let playAgainBtn;

        const defaultBoard = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];

        let board = defaultBoard.map((arr) => arr.slice());

        return {
            initialize,
            boardElement,
            reset,
        };
    })();

    const PlayerFactory = (function () {
        function construct(name, mark) {
            if (mark.toLowerCase() !== 'x' && mark.toLowerCase() !== 'o') {
                throw 'Mark must be an X or an O';
            }

            numberOfPlayers++;

            if (numberOfPlayers > MAX_ALLOWED_PLAYERS) throw `Cannot create more than ${MAX_ALLOWED_PLAYERS} Players`;

            return {
                name,
                mark: mark.toLowerCase(),
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
            const playerTwo = PlayerFactory.construct(playerTwoName, 'o');

            GameBoard.initialize([playerOne, playerTwo]);

            menu.classList.add('invisible');
            GameBoard.boardElement.classList.remove('invisible');

            isInProgress = true;
        }

        function reset() {
            isInProgress = false;
            menu.classList.remove('invisible');
            GameBoard.boardElement.classList.add('invisible');
        }

        function getInProgress() {
            return isInProgress;
        }

        function setInProgress(bool) {
            isInProgress = bool;
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

        return {
            reset,
            getInProgress,
            setInProgress,
        };
    })();
})();
