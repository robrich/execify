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

		it('should run stream task that writes multiple times', function(done) {
			var task, a = 0, args = {a:'rgs'}, a0 = {i:0}, a1 = {i:1}, timeout = 50;

			// Arrange
			task = function () {
				a++;
				var s = es.map(function (inargs, cb) {
					cb(null, inargs);
				});
				setTimeout(function () {
					s.write(a0);
					s.write(a1);
					s.end();
				}, timeout);
				return s;
			};

			// Act
			execify.asCallback(task, [args], function (err, results) {

				// Assert
				a.should.equal(1);
				should.exist(results);
				results.length.should.equal(3);
				results[0].should.equal(args);
				results[1].should.equal(a0);
				results[2].should.equal(a1);
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
