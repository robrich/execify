/*jshint node:true */

"use strict";

var Q = require('q');
var map = require('map-stream');
var validateTask = require('./lib/validateTask');
var runTask = require('./lib/runTask');

var asCallback = function (task, args, callback) {
	if (!callback) {
		callback = args;
		args = undefined;
	}
	validateTask(task, args);
	runTask(task, args, callback);
};
var asPromise = function (task, args) {
	var deferred = Q.defer();
	validateTask(task, args);
	runTask(task, args, function (err, results, meta) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(results, meta);
		}
	});
	return deferred.promise;
};
// FRAGILE: if task is a stream task this is incredibly inefficient
var asStream = function (task) {
	validateTask(task);
	return map(function (/*data, cb*/) {
		// compensate for s.write() (no args) or s.write(a,b,c) (many args)
		var args = Array.prototype.slice.call(arguments);
		var cb = args.pop();
		runTask(task, args, function (err, results/*, meta*/) {
			cb(err, results);
		});
	});
};

module.exports = {
	asCallback: asCallback,
	asPromise: asPromise,
	asStream: asStream
};
