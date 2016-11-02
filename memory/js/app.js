"use strict";

var cards = [];
var state = {
    startTime: moment(),
    flipped: null,
    flipping: false
};

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
    state.startTime = moment();
    shuffleCards();
    window.setInterval(function() {
        $('#time').html("Time: " + moment().diff(state.startTime, 'seconds'));
    }, 1000);
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
        /* append a new row every four cards */
        if (index % 4 == 0 && index > 0) {
            board.append(row);
            row = $(document.createElement('div'));
            row.attr('role', 'row');
        }

        /* create new face-down card as a button */
        var button = $(document.createElement('button'));
        button.attr({
            role: 'gridcell',
            'aria-label': 'Card'
        });
        button.addClass('face-down');
        button.width($(window).width() / 6);
        button.height(button.width());
        button.data('card', card);

        /* content (card number) that can be read to users for accessibility */
        var content = $(document.createElement('span'));
        content.addClass("sr-only sr-only-focusable");
        content.html(card.cardIndex);
        content.attr('aria-live', 'polite');
        button.append(content);
        
        row.append(button);
    });
    board.append(row);
    $('#board button').click(flipCard);
    console.log(duplicatedCards);
}

function flipCard() {
    if ($(event.target).hasClass('face-down') && !state.flipping) {
        if (state.flipped != null) { // if second flip
            var curr = $(event.target);
            curr.toggleClass('face-down');
            curr.css('background-image', 'url(' + curr.data('card').src + ')');
            if (state.flipped.data('card').cardIndex != curr.data('card').cardIndex) {
                state.flipping = true;
                window.setTimeout(function() {
                    curr.toggleClass('face-down');
                    state.flipped.toggleClass('face-down');
                    curr.css('background-image', 'url("img/card-back.png"');
                    state.flipped.css('background-image', 'url("img/card-back.png"');
                    state.flipped = null;
                    state.flipping = false;
                }, 1000);
            } else {
                state.flipped = null;
                if (!$('#board button').hasClass('face-down')) {
                    console.log('yas fam');
                }
            }
        } else { // if first flip
            state.flipped = $(event.target);
            state.flipped.toggleClass('face-down');
            state.flipped.css('background-image', 'url(' + state.flipped.data('card').src + ')');
        }
    }
}

$(window).resize(function() {
    $('#board button').width($(window).width() / 6);
    $('#board button').height($(window).width() / 6);
});