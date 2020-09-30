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

export default PlayerFactory;
