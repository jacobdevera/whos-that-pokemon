var cards = [];
function createGrid() {
    for (var i = 0; i < 32; i++) {
        cards.push({
            cardIndex: i + 1,
            src: 'img/card' + (i + 1) + '.jpg'
        });
    }
}

createGrid(); // initialize grid before starting game

$('#start').click(startGame);

function startGame() {
    shuffleCards();
    
}

function shuffleCards() {
    var shuffledCards = _.shuffle(cards); // shuffle cards
    var selectedCards = shuffledCards.slice(0,8); // select the first 8 from the deck
    /* create new array for duplicated card pairs */
    var duplicatedCards = [];
    _.forEach(selectedCards, function(card) {
        duplicatedCards.push(_.clone(card));
        duplicatedCards.push(_.clone(card));
    });
    duplicatedCards = _.shuffle(duplicatedCards); // shuffle once more to separate pairs

    var board = $('#board');
    board.empty();
    var row = $(document.createElement('div'));
    row.attr('role', 'row');

    _.forEach(duplicatedCards, function(card, index) {
        if (index % 4 == 0 && index > 0) {
            board.append(row);
            row = $(document.createElement('div'));
            row.attr('role', 'row');
        }
        var button = $(document.createElement('button'));
        button.attr({
            role: 'gridcell',
            'aria-label': 'Card' + index
        });
        button.addClass('face-down');
        row.append(button);
    });
    board.append(row);
}