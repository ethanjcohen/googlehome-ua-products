'use strict';

var RADIX   = 36;
var MAX_LEN = 3;

function encodeId(_ids) {
	var ids = Array.isArray(_ids) ? _ids : [_ids];

	return ids
		.map(parseIdPath)
		.sort(function (a, b) {
			return a - b; })
		.map(encodeNum)
		.join('');
}

// NOTE: Decoding is quite a bit slower than encoding since it
// involves multiple parses as well as building a variable length
// array that ultimately needs to be reversed. This is acceptable
// because while you may need to encode many things at once, typically
// you will only need to decode a single string.
function decodeId(s) {
	// Offset is packed into modulus so we need to move
	// right to left.
	for (var i = s.length, ids = [], l; i > 0; i -= l) {
		l = parseInt(s[i - 1], RADIX) % MAX_LEN + 1;
		ids.push(decodeNum(s.substring(i - l, i)));
	}

	return ids.reverse();
}

module.exports = {
	encodeId  : encodeId,
	decodeId  : decodeId,
	encodeNum : encodeNum,
	decodeNum : decodeNum,
	MIN       : 0,
	MAX       : Math.pow(RADIX, MAX_LEN) / MAX_LEN
};

function parseIdPath(id) {
	return typeof id === 'number'
		? id : id.substring(id.lastIndexOf('.') + 1);
}

function encodeNum(_id) {
	var id = _id * MAX_LEN,
		l  = Math.ceil(Math.log(id + 1) / Math.log(RADIX));

	return (id && id + l - 1).toString(RADIX);
}

function decodeNum(s) {
	var id = parseInt(s, RADIX);

	return (id - id % MAX_LEN) / MAX_LEN;
}
