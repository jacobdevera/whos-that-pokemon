'use strict';

/* Your script goes here */
var _EMOTIONS = [
	"positive",
	"trust",
	"anticipation",
	"joy",
	"surprise",
	"negative",
	"sadness",
	"disgust",
	"fear",
	"anger"
];

showStatistics(analyzeTweets(_SAMPLE_TWEETS));

function extractWords(text) {
	text = text.toLowerCase();
	var words = text.split(/\W+/);
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
		tweet["words"] = extractWords(tweet.text);
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
		result[emotion]["percent"] = ((sumEmotion / sumAllWords));
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
	
	/* sort list of words for each emotion */
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
	});

	/* get hashtags for each emotion */
	_EMOTIONS.forEach(function(emotion) {
		result[emotion]["hashtags"] = getHashtags(tweets, emotion);
		/* count hashtags */
		result[emotion]["hashtags"].forEach(function(hashtag) {
			hashtag["count"] = 0;
			if (hashtag["count"] != undefined) {
				hashtag["count"]++;
			}
		});
		/* sort hashtags */
		result[emotion]["hashtags"].sort(function(a, b) {
			if (a["count"] > b["count"]) {
				return -1;
			} else if (a["count"] < b["count"]) {
				return 1;
			} else {
				return 0;
			}
		});
	});
	return result;
}

/* takes in tweet and an emotion, returns hashtags */
function getHashtags(tweets, emotion) {
	/* filter for tweets that have the emotion */
	var filterEmotion = Object.keys(tweets).filter(function(tweetIndex) {
		return tweets[tweetIndex]["emotions"][emotion].length > 0;
	});
	/* map out hashtags */
	var hashtagMap = filterEmotion.map(function(tweetIndex) {
		return tweets[tweetIndex]["entities"]["hashtags"];
	});
	var hashtagList = [];
	hashtagMap.forEach(function(tweet) {
		tweet.forEach(function(hashtag) {
			hashtagList.push(hashtag);
		});
	});
	return hashtagList;
}

function showStatistics(tweets) {
	$('tbody').remove();
	$('table').append('<tbody></tbody');
	var tableEnd = $('#sentiment-table > tbody:last-child');
	_EMOTIONS.forEach(function(emotion) {
		var exampleWords = tweets[emotion]["sortedWords"].slice(0,3).join(', ');
		var hashtagList = [];
		tweets[emotion]["hashtags"].forEach(function(hashtag) {
			hashtagList.push("#" + hashtag.text);
		});
		var topHashtags = hashtagList.slice(0,3).join(', ');
		tableEnd
			.append($('<tr>' +
				'<td>' + emotion + '</td>' +
				'<td>' + numeral(tweets[emotion].percent).format('0.00%') + '</td>' +
				'<td>' + exampleWords + '</td>' +
				'<td>' + topHashtags + '</td> </tr>'
			));
	});
}

function loadTweets(url) {
	fetch(url)
		.then(function(response) {
			return response.json();
		})
		.then(function(data){
			showStatistics(analyzeTweets(data));
		})
}
