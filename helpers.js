var categories = {
    Geography : 0,
    Science : 1,
    Trivia : 2,
    Sport : 3,
    Music : 4,
    History : 5,
    Entertainment : 6,
    Quizcross : 7
};

var scores = {
    "Unplayed" : null,
    "Me ***" : 0,
    "Me **" : 1,
    "Me *" : 2,
    "Me 0" : 3,
    "Them 0" : 4,
    "Them *" : 5,
    "Them **" : 6,
    "Them ***" : 7
};

var states = {
    playing : null,
    won : 1,
    lost : -1,
    draw : 0
};

function fact(num) {
    var rval = 1;
    for (var i = 2; i <= num; i++) {
        rval = rval * i;
    }
    return rval;
}

// Yes, this is pointless since I'm only calculating (3 choose k) but yay math
function binom(n, k) {
    return fact(n) / (fact(k) * fact(n -k));
}

function playingProb(p, stars) {
    return binom(3, stars) * Math.pow(p, stars) * Math.pow(1 - p, 3 - stars);
}

// Returns the number of stars associated with a score
function scoreToStars(score) {
    return (score <= 3) ? 3 - score : score - 4;
}

function starsToScore(stars, maximizing) {
    return (maximizing) ? 3 - stars : 4 + stars;
}

function stealingProb(p, score) {
    var stars = scoreToStars(score);
    if (stars === 3) {
        throw "Can't steal this square with three stars";
    }
    var probs = [];
    var totalProb = 0;
    for (var i = 0; i <= 3; i++) {
        probs[i] = playingProb(p, i);

        // Tiebreaker if we get the same number
        probs[i] *= (i === stars) ? p : 1;

        // Sum probabilities
        totalProb += (i >= stars) ? probs[i] : 0;
    }
    return totalProb;
}
