import GameBoard from './GameBoard.js';
import PlayerFactory from './PlayerFactory.js';

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

    const aiCheckbox = document.getElementById('ai-checkbox');

    playerOneInput.addEventListener('input', (e) => (playerOneName = e.target.value));
    playerTwoInput.addEventListener('input', (e) => (playerTwoName = e.target.value));

    // Start game on form submit
    menuForm.addEventListener('submit', (e) => start(e));

    let playerOneName = playerOneInput.value;
    let playerTwoName = playerTwoInput.value;

    let isInProgress = false;
    let isAiGame = false;

    setAiGame(aiCheckbox.checked);

    return {
        reset,
        getInProgress,
        setInProgress,
        setAiGame,
    };
})();

export default Game;
