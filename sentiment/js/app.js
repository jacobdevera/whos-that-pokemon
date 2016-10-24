'use strict';

/* Your script goes here */
var _EMOTIONS = [
	"positive",
	"negative",
	"anger",
	"anticipation",
	"disgust",
	"fear",
	"joy",
	"sadness",
	"surprise",
	"trust"
];

function extractWords(tweet) {
	var str = tweet.text;
	str = str.toLowerCase();
	var words = str.split(/\W+/);
	words = words.filter(function(word) {
		return word.length >= 2;
	});
	return words;
}

function findSentimentWords(words) {
	var emotions = {};
	_EMOTIONS.forEach(function(emotion) {
		var wordsWithEmotion = words.filter(function(word) {
			if (_SENTIMENTS[word] != undefined) 
				return _SENTIMENTS[word][emotion] != undefined;
			return false;
		});
		emotions[emotion] = wordsWithEmotion;
	});
	return emotions;
}

function analyzeTweets(tweets) {
	var result = {};
	/* create words array and word sentiment object as new properties of each tweet */
	tweets.forEach(function(tweet) {
		tweet["words"] = extractWords(tweet);
		tweet["emotions"] = findSentimentWords(tweet["words"]);
	});

	/* sum words of all tweets */
	var sumAllWords = tweets.reduce(function(total, tweet) {
		return total + tweet["words"].length;
	}, 0);

	/* use list of emotions as new properties of result, initialize word lists, and calculate emotion percentage */
	_EMOTIONS.forEach(function(emotion) {
		result[emotion] = {};
		result[emotion]["words"] = {};
		var sumEmotion = tweets.reduce(function(total, tweet) {
			total += tweet["emotions"][emotion].length;
			return total;
		}, 0);
		result[emotion]["percent"] = ((sumEmotion / sumAllWords) * 100) + "%";
	});

	/* make list of words as a property for each emotion and calculate word frequency */ 
	tweets.forEach(function(tweet) {
		_EMOTIONS.forEach(function(emotion) {
			tweet["emotions"][emotion].forEach(function(word) {
				if (result[emotion]["words"][word] != undefined) {
					result[emotion]["words"][word]["count"]++;
				} else { // initialize count for new words
					result[emotion]["words"][word] = {};
					result[emotion]["words"][word]["count"] = 1;
				}
			});
		});
	});
	
	_EMOTIONS.forEach(function(emotion) {
		var sortedWords = Object.keys(result[emotion]["words"]);
		sortedWords.sort(function(a, b) {
			if (result[emotion]["words"][a].count > result[emotion]["words"][b].count) {
				return -1;
			} else if (result[emotion]["words"][a].count < result[emotion]["words"][b].count) {
				return 1;
			} else {
				return 0;
			}
		});
		result[emotion]["sortedWords"] = sortedWords;
		console.log(result);
	});
}