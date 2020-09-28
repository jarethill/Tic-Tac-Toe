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
        }

        function endGame(winner) {
            console.log(`${winner.name} has won the game!`);
        }

        function move(x, y, playerMark) {
            if (isValidMove(x, y)) {
                board[x][y] = playerMark;
                update();

                checkGameOver();
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

            move(x, y, 'x');
        }

        // Public Methods
        function initialize(playersArray) {
            if (isInitialized === true) throw 'GameBoard is already initialized';
            if (playersArray.length > 2) throw 'Maximum of Two Players allowed';

            // Initialize players
            playersArray.forEach((player, index) => {
                if (index === 0) player.readyToMove = true;

                players.push(player);
            });

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
            isInitialized = true;

            boardElement.addEventListener('mousedown', (e) => handleMousedown(e));
        }

        // Private Variables
        const boardElement = document.getElementById('board');
        const players = [];
        let isInitialized = false;
        let allTileTextElements;

        const board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];

        return {
            initialize,
            players,
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
                readyToMove: false,
            };
        }

        let numberOfPlayers = 0;
        const MAX_ALLOWED_PLAYERS = 2;

        return {
            construct,
        };
    })();

    const playerOne = PlayerFactory.construct('Player 1', 'x');
    const playerTwo = PlayerFactory.construct('Player 2', 'o');

    GameBoard.initialize([playerOne, playerTwo]);
})();
