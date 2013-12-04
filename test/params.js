/*jshint node:true */
/*global describe:false, it:false */
"use strict";

var execify = require('../');
var should = require('should');
require('mocha');

describe('execify', function() {
	describe('parameters', function() {

		it('should throw on invalid task', function (done) {
			var task, a = 0;

			// Arrange
			task = null;

			// Act
			try {
				execify.asCallback(task, function (/*err, results*/) {a--;});
			} catch (err) {
				a++;
			}

			// Assert
			a.should.equal(1);
			done();
		});

		it('should pass args', function (done) {
			var task, args, a = 0, i;

			// Arrange
			args = ['array','of','arguments'];
			task = function () {
				arguments.length.should.equal(args.length+1); // last one is callback
				for (i = 0; i < args.length; i++) {
					args[i].should.equal(arguments[i]);
				}
				a++;
			};

			// Act
			execify.asCallback(task, args, function (/*err, results*/) {

				// Assert
				a.should.equal(1);
				done();
			});
		});

		it('should return results', function (done) {
			var task, expectedResults, a = 0;

			// Arrange
			expectedResults = 42;
			task = function () {
				a++;
				return expectedResults;
			};

			// Act
			execify.asCallback(task, function (err, results) {

				// Assert
				should.exist(results);
				results.should.equal(expectedResults);
				a.should.equal(1);
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
