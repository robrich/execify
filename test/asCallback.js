/*jshint node:true */
/*global describe:false, it:false */
"use strict";

var execify = require('../');
var Q = require('q');
var es = require('event-stream');
var should = require('should');
require('mocha');

describe('execify', function() {
	describe('asCallback()', function() {

		it('should run sync task', function(done) {
			var task, a = 0;

			// Arrange
			task = function () {
				a++;
			};

			// Act
			execify.asCallback(task, function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should run callback task', function(done) {
			var task, a = 0;

			// Arrange
			task = function (cb) {
				a++;
				cb(null);
			};

			// Act
			execify.asCallback(task, function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should run promise task', function(done) {
			var task, a = 0;

			// Arrange
			task = function () {
				var deferred = Q.defer();
				setTimeout(function () {
					a++;
					deferred.resolve();
				},1);
				return deferred.promise;
			};

			// Act
			execify.asCallback(task, function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should run stream task', function(done) {
			var task, a = 0;

			// Arrange
			task = function () {
				a++;
				return es.map(function (cb) {
					cb(null);
				});
			};

			// Act
			execify.asCallback(task, function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should not write undefined to stream or end stream if no args are passed', function(done) {
			var task, actualData, timesWritten = 0, sampleData = {
				abc: 123
			};

			// Arrange
			task = function () {
				return es.readable(function(count, callback) {
					if (count === 1) {
						return this.emit('end');
					}
					this.emit('data', sampleData);
					callback();
				}).pipe(es.map(function(data, cb) {
					timesWritten++;
					actualData = data;
					cb(null, data);
				}));
			};

			// Act
			execify.asCallback(task, function (err, results) {
				timesWritten.should.equal(1);
				should(err).equal(null);
				should(actualData).equal(sampleData);

				// Assert
				done();
			});
		});

		it('should return thrown error', function (done) {
			var task, expectedMessage, a = 0;

			// Arrange
			expectedMessage = 'test error';
			task = function () {
				a++;
				throw new Error(expectedMessage);
			};

			// Act
			execify.asCallback(task, function (err/*, results*/) {

				// Assert
				should.exist(err);
				err.message.should.equal(expectedMessage);
				a.should.equal(1);
				done();
			});
		});

	});
});
