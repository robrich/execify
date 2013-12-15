/*jshint node:true */
/*global describe:false, it:false */
"use strict";

var execify = require('../');
var Q = require('q');
var es = require('event-stream');
var should = require('should');
require('mocha');

describe('execify', function() {
	describe('asPromise()', function() {

		it('should run sync task', function(done) {
			var task, a = 0, p;

			// Arrange
			task = function () {
				a++;
			};

			// Act
			p = execify.asPromise(task);
			p.then(function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should run callback task', function(done) {
			var task, a = 0, p;

			// Arrange
			task = function (cb) {
				a++;
				cb(null);
			};

			// Act
			p = execify.asPromise(task);
			p.then(function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should run promise task', function(done) {
			var task, a = 0, p;

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
			p = execify.asPromise(task);
			p.then(function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should run stream task and not write with no args', function(done) {
			var task, a = 0, b = 0, p;

			// Arrange
			task = function () {
				a++;
				return es.map(function (data, cb) {
					should.exist(data);
					b++;
					cb(null, data);
				});
			};

			// Act
			p = execify.asPromise(task);
			p.then(function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				b.should.equal(0); // we didnt write anything
				done();
			});
		});

		it('should run stream task and write with args', function(done) {
			var task, a = 0, b = 0, p, sampleData = {a:123};

			// Arrange
			task = function () {
				a++;
				return es.map(function (data, cb) {
					should.exist(data);
					data.should.equal(sampleData);
					b++;
					cb(null, data);
				});
			};

			// Act
			p = execify.asPromise(task, [sampleData]);
			p.then(function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				b.should.equal(1); // we wrote something
				done();
			});
		});

		it('should return thrown error', function (done) {
			var task, expectedMessage, a = 0, p;

			// Arrange
			expectedMessage = 'test error';
			task = function () {
				a++;
				throw new Error(expectedMessage);
			};

			// Act
			p = execify.asPromise(task);
			p.then(function (/*results*/) {
			}, function (err) {

				// Assert
				should.exist(err);
				err.message.should.equal(expectedMessage);
				a.should.equal(1);
				done();
			});
		});

	});
});
