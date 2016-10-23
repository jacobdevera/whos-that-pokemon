'use strict';

/* Your script goes here */
var _EMOTIONS = {
	"positive": [],
	"negative": [],
	"anger": [],
	"anticipation": [],
	"disgust": [],
	"fear": [],
	"joy": [],
	"sadness": [],
	"surprise": [],
	"trust": []
}

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
	var result = {};
	_EMOTIONS.forEach(function(emotion) {
		var wordsWithEmotion = words.filter(function(word) {
			if (_SENTIMENTS[word] != undefined) 
				return _SENTIMENTS[word][emotion] != undefined;
		});
		emotion = wordsWithEmotion;
	});
	return result;
}