(() => {
    const GameBoard = (function () {
        // Private Methods
        function isValidMove(x, y) {
            if (x > 2 || y > 2 || x < 0 || y < 0) throw 'Invalid move, index out of bounds';

            return !board[x][y] ? true : false;
        }

        function handleMousedown(e) {
            if (!e.target.classList.contains('tile')) return;

            const { x, y } = e.target.dataset;

            move(x, y, 'x');
        }

        // Public Methods
        function move(x, y, playerMark) {
            if (isValidMove(x, y)) {
                board[x][y] = playerMark;
                update();
            }
        }

        function initialize() {
            if (isInitialized === true) throw 'GameBoard is already initialized';

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

        function update() {
            if (isInitialized === false) throw 'GameBoard must be initialized before using update';

            const flattenedBoard = board.flat();

            allTileTextElements.forEach((element, index) => (element.innerText = flattenedBoard[index]));
        }

        // Private Variables
        const boardElement = document.getElementById('board');
        let isInitialized = false;
        let allTileTextElements;

        // Public Variables
        const board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];

        return {
            board,
            initialize,
        };
    })();

    const Player = function (name, mark) {
        if (mark.toLowerCase() !== 'x' && mark.toLowerCase() !== 'o') {
            throw 'Mark must be an X or an O';
        }

        return {
            name,
            mark: mark.toLowerCase(),
        };
    };

    const playerOne = Player('Player 1', 'x');
    const playerTwo = Player('Player 2', 'o');

    GameBoard.initialize();
})();
