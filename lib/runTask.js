/*jshint node:true */

"use strict";

var extend = require('util')._extend;

module.exports = function (task, args, done) {
	var that = this, params, finish, cb, isDone = false, start, r, streamReturn = [];

	finish = function (err, results, runMethod) {
		var hrDuration = process.hrtime(start);

		if (isDone) {
			return;
		}
		isDone = true;

		var duration = hrDuration[0] + (hrDuration[1] / 1e9); // seconds

		done.call(that, err, results, {
			duration: duration, // seconds
			hrDuration: hrDuration, // [seconds,nanoseconds]
			runMethod: runMethod
		});
	};

	cb = function (err, results) {
		finish(err, results, 'callback');
	};

	params = extend([], args);
	params.push(cb);

	try {
		start = process.hrtime();
		r = task.apply(this, params);
	} catch (err) {
		finish(err, null, 'catch');
	}

	if (r && typeof r.done === 'function') {
		// wait for promise to resolve
		// FRAGILE: ASSUME: Promises/A+, see http://promises-aplus.github.io/promises-spec/
		r.done(function (results) {
			finish(null, results, 'promise');
		}, function(err) {
			finish(err, null, 'promise');
		});

	} else if (r && typeof r.on === 'function' && typeof r.once === 'function' && typeof r.end === 'function' && r.pipe) {
		// wait for stream to end
		r.on('data', function (results) {
			// return an array of results because we must listen to all the traffic through the stream
			if (typeof results !== 'undefined') {
				streamReturn.push(results);
			}
		});
		r.once('error', function (err) {
			finish(err, null, 'stream');
		});
		r.once('end', function () {
			finish(null, streamReturn, 'stream');
		});
		// start stream
		if (typeof args !== 'undefined' && args !== null) {
			r.write.apply(that, args);
		}

	} else if (task.length < params.length) {
		// synchronous, function took in args.length parameters, and the callback was extra
		finish(null, r, 'sync');

	//} else {
		// FRAGILE: ASSUME: callback

	}
};
