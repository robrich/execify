/*jshint node:true */

"use strict";

var extend = require('util')._extend;

module.exports = function (task, args, done) {
	var that = this, params, finish, cb, isDone = false, start, r, streamReturn;

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
		r.once('data', function (results) {
			streamReturn = results; // FRAGILE: because stream.on('end' doesn't return results
		});
		r.once('error', function (err) {
			finish(err, null, 'stream');
		});
		r.once('end', function () {
			finish(null, streamReturn, 'stream');
		});
		// start stream
		// FRAGILE: if args is empty, stream.write() sometimes passes undefined as first arg to target function
		r.write.apply(that, args || []);
		r.end();

	} else if (task.length < params.length) {
		// synchronous, function took in args.length parameters, and the callback was extra
		finish(null, r, 'sync');

	//} else {
		// FRAGILE: ASSUME: callback

	}
};
