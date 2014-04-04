var myProb = {};
var theirProb = {};
var moves = 0;
var results = [];

function Board() {
    this.state;
    this.grid = {};
    this.moves = [];
}

// For use when evaluating rows/columns/diagonals
Board.prototype.updateState = function(newState) {
    // Update if we previously thought we were playing
    if (this.state === states.playing) {
        this.state = newState;
    }
    // If we thought one person had won and the new state contradicts that, throw exception
    if (this.state !== states.playing && newState !== states.playing && this.state !== newState) {
        throw "Board is in impossible state, where both players have won.";
    }
}

Board.prototype.isFull = function() {
    // Check if any squares are unplayed
    for (var i = 0; i < 9; i++) {
        if (this.grid[i].score === null) {
            return false;
        }
    }

    // All squares have been played
    return true;
}


Board.prototype.ownedByMax = function(i) {
    if (this.grid[i].score === scores.Unplayed) {
        return false;
    }
    return (this.grid[i].score <= 3);
}

// N.B. This is needed because !ownedByMax != ownedByMin (because of unowned)
Board.prototype.ownedByMin = function(i) {
    if (this.grid[i].score === scores.Unplayed) {
        return false;
    }
    return (this.grid[i].score >= 4);
}

Board.prototype.scoredByMax = function(i) {
    if (this.grid[i].score === scores.Unplayed) {
        return false;
    }
    return (this.grid[i].score <= 2);
}

Board.prototype.scoredByMin = function(i) {
    if (this.grid[i].score === scores.Unplayed) {
        return false;
    }
    return (this.grid[i].score >= 5);
}

Board.prototype.evalThree = function(a, b, c) {
    var state;
    if (this.scoredByMax(a) && this.scoredByMax(b) && this.scoredByMax(c))
        state = states.won;
    else if (this.scoredByMin(a) && this.scoredByMin(b) && this.scoredByMin(c))
        state = states.lost;
    else
        state = states.playing;

    return state;
}

Board.prototype.eval = function() {
    this.state = states.playing;

    // Rows
    this.updateState(this.evalThree(0, 1, 2));
    this.updateState(this.evalThree(3, 4, 5));
    this.updateState(this.evalThree(6, 7, 8));

    // Columns
    this.updateState(this.evalThree(0, 3, 6));
    this.updateState(this.evalThree(1, 4, 7));
    this.updateState(this.evalThree(2, 5, 8));

    // Diagonals
    this.updateState(this.evalThree(0, 4, 8));
    this.updateState(this.evalThree(2, 4, 6));

    // If no one has won and board is full, it's a draw
    // TODO: this ignores the possibility of stealing once it's full. a minor complication
    if (this.state === states.playing && this.isFull()) {
        this.state = states.draw;
    }
}

Board.prototype.loadForm = function() {
    var form = $('form').serializeArray();
    var sum = 0;
    for (var i = 0; i < 7; i++) {
        var p = parseInt(form[i].value) / 100;
        myProb[i] = p;
        sum += p;
    }
    myProb[7] = sum / 7;
    sum = 0;
    for (var i = 0; i < 7; i++) {
        var p = parseInt(form[i + 7].value) / 100;
        theirProb[i] = p;
        sum += p;
    }
    theirProb[7] = sum / 7;
    for (var i = 0; i < 9; i++) {
        this.grid[i] = {};
        this.grid[i].category = categories[form[i + 14].value];
    }
    for (var i = 0; i < 9; i++) {
        this.grid[i].score = scores[form[i + 23].value];
    }
}

Board.prototype.move = function(square, score) {
    this.moves.push({square: square, prev: this.grid[square].score});
    this.grid[square].score = score;
    moves++;
}

Board.prototype.restore = function() {
    var move = this.moves.pop();
    if (!move) {
        throw "You messed up, there are no moves left!";
    }
    this.grid[move.square].score = move.prev;
}

Board.prototype.print = function() {
    boardStr = [];
    boardStr.push("----------------------\n");
    for (var i = 0; i < 9; i += 3) {
        boardStr.push("|");
        for (var j = 0; j < 3; j++) {
            if (this.grid[i + j].score == null) {
                boardStr.push("  --  |");
            }
            else {
                boardStr.push("   " + this.grid[i + j].score + "  |");
            }
        }
        boardStr.push("\n----------------------\n");
    }
    console.log(boardStr.join(""));
}

Board.prototype.alphabeta = function(depth, alpha, beta, maximizing) {
    this.eval();
    //console.log('depth', depth);
    //this.print();

    // return value of node
    if (this.state !== states.playing) {
        return this.state;
    }

    if (maximizing) {
        // Check all squares
        for (var i = 0; i < 9; i++) {
            if (depth === 0) {
                alpha = -Infinity;
                beta = Infinity;
            }
            var value = null;
            // If square is owned by opponent (not ***) or unplayed, we can play here
            if (this.ownedByMin(i) && this.grid[i].score !== scores["Them ***"]) {
                // Stealing from minimizing player
                var p = stealingProb(myProb[this.grid[i].category], this.grid[i].score);

                this.move(i, scores["Me ***"]);
                value = p * this.alphabeta(depth + 1, alpha, beta, !maximizing);
                this.restore();

                this.move(i, scores["Them ***"]);
                value += (1 - p) * this.alphabeta(depth + 1, alpha, beta, !maximizing);
                this.restore();
            }
            else if (this.grid[i].score === scores.Unplayed) {
                // Playing unclaimed square
                value = 0;
                for (var j = 0; j <= 3; j++) {
                    var p = playingProb(myProb[this.grid[i].category], j);

                    this.move(i, starsToScore(j, maximizing));
                    value += p * this.alphabeta(depth + 1, alpha, beta, !maximizing);
                    this.restore();
                }
            }
            if (value !== null) {
                //console.log('value', value, 'alpha', alpha);
                alpha = Math.max(value, alpha);
                console.log('alpha', alpha, 'beta', beta);

                if (depth === 0) {
                    console.log('----square', i, ':', value);
                    results[i] = alpha;
                    displayResults();
                }

                if (beta <= alpha) {
                    //console.log('max pruning at ', alpha, beta);
                    break;
                }
            }
        }

        return alpha;
    }
    else {
        // Check all squares
        for (var i = 0; i < 9; i++) {
            var value = null;
            // If square is owned by me (not ***) or unplayed, opponent can play here
            if (this.ownedByMax(i) && this.grid[i].score !== scores["Me ***"]) {
                // Stealing from maximizing player
                var p = stealingProb(theirProb[this.grid[i].category], this.grid[i].score);

                this.move(i, scores["Them ***"]);
                value = p * this.alphabeta(depth + 1, alpha, beta, !maximizing);
                this.restore();

                this.move(i, scores["Me ***"]);
                value += (1 - p) * this.alphabeta(depth + 1, alpha, beta, !maximizing);
                this.restore();
            }
            else if (this.grid[i].score === scores.Unplayed) {
                // Playing unclaimed square
                var value = 0;
                for (var j = 0; j <= 3; j++) {
                    var p = playingProb(theirProb[this.grid[i].category], j);

                    this.move(i, starsToScore(j, maximizing));
                    value += p * this.alphabeta(depth + 1, alpha, beta, !maximizing);
                    this.restore();
                }
            }
            if (value !== null) {
                //console.log('value', value, 'beta', beta);
                beta = Math.min(value, beta);
                //console.log('alpha', alpha, 'beta', beta);
                if (beta <= alpha) {
                    //console.log('min pruning at ', alpha, beta);
                    break;
                }
            }
        }

        return beta;
    }
}

Board.prototype.minimax = function(depth, maximizing) {
    this.eval();
    //console.log('depth', depth);

    // return value of node
    if (this.state !== states.playing) {
        return this.state;
    }

    if (maximizing) {
        var bestValue = -Infinity;

        // Check all squares
        for (var i = 0; i < 9; i++) {
            var value = null;
            // If square is owned by opponent (not ***) or unplayed, we can play here
            if (this.ownedByMin(i) && this.grid[i].score !== scores["Them ***"]) {
                // Stealing from minimizing player
                var p = stealingProb(myProb[this.grid[i].category], this.grid[i].score);

                this.move(i, scores["Me ***"]);
                value = p * this.minimax(depth + 1, !maximizing);
                this.restore();

                this.move(i, scores["Them ***"]);
                value += (1 - p) * this.minimax(depth + 1, !maximizing);
                this.restore();
            }
            else if (this.grid[i].score === scores.Unplayed) {
                // Playing unclaimed square
                value = 0;
                for (var j = 0; j <= 3; j++) {
                    var p = playingProb(myProb[this.grid[i].category], j);

                    this.move(i, starsToScore(j, maximizing));
                    value += p * this.minimax(depth + 1, !maximizing);
                    this.restore();
                }
            }
            if (depth === 0 && value !== null) {
                console.log('square', i, ':', value);
                results[i] = value;
                displayResults();
            }
            if (value !== null) {
                bestValue = Math.max(value, bestValue);
            }
        }

        return bestValue;
    }
    else {
        var bestValue = Infinity;

        // Check all squares
        for (var i = 0; i < 9; i++) {
            var value = null;
            // If square is owned by me (not ***) or unplayed, opponent can play here
            if (this.ownedByMax(i) && this.grid[i].score !== scores["Me ***"]) {
                // Stealing from maximizing player
                var p = stealingProb(theirProb[this.grid[i].category], this.grid[i].score);

                this.move(i, scores["Them ***"]);
                value = p * this.minimax(depth + 1, !maximizing);
                this.restore();

                this.move(i, scores["Me ***"]);
                value += (1 - p) * this.minimax(depth + 1, !maximizing);
                this.restore();
            }
            else if (this.grid[i].score === scores.Unplayed) {
                // Playing unclaimed square
                var value = 0;
                for (var j = 0; j <= 3; j++) {
                    var p = playingProb(theirProb[this.grid[i].category], j);

                    this.move(i, starsToScore(j, maximizing));
                    value += p * this.minimax(depth + 1, !maximizing);
                    this.restore();
                }
            }
            if (value !== null) {
                bestValue = Math.min(value, bestValue);
            }
        }

        return bestValue;
    }
}

function saveFormData()
{
    localStorage['formData'] = JSON.stringify($('form').serializeArray());
}

function retrieveFormData()
{
    var formData = JSON.parse(localStorage['formData']);
    formData.forEach(function(entry) {
        $('#' + entry.name).val(entry.value);
    });
}

function displayResults()
{
    for (var i = 0; i < 9; i++) {
        $('#option' + i).html((results[i] != undefined) ? results[i].toFixed(3) : '--');
    }
}


var board;

$(document).ready(function () {
    retrieveFormData();
    board = new Board();
    board.loadForm();
    board.eval();
});

$('#form').submit(function() {
    board = new Board();
    moves = 0;
    results = [];
    saveFormData();
    board.loadForm();
    board.eval();

    console.log(myProb);
    console.log(theirProb);

    board.minimax(0, true);
    //board.alphabeta(0, -Infinity, Infinity, true);
    console.log('moves', moves);
    return false;
});
