/*jshint node:true */
/*global describe:false, it:false */
"use strict";

var execify = require('../');
var Q = require('q');
var es = require('event-stream');
var should = require('should');
require('mocha');

describe('execify', function() {
	describe('asStream()', function() {

		it('should run sync task', function(done) {
			var task, a = 0, s;

			// Arrange
			task = function () {
				a++;
			};

			// Act
			s = execify.asStream(task);
			s.on('end', function () {

				// Assert
				a.should.equal(1);
				done();
			});
			s.write({});
			s.end();
		});

		it('should run callback task', function(done) {
			var task, a = 0, s;

			// Arrange
			task = function (cb) {
				a++;
				cb(null);
			};

			// Act
			s = execify.asStream(task);
			s.on('end', function () {

				// Assert
				a.should.equal(1);
				done();
			});
			s.write();
			s.end();
		});

		it('should run promise task', function(done) {
			var task, a = 0, s;

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
			s = execify.asStream(task);
			s.on('end', function () {

				// Assert
				a.should.equal(1);
				done();
			});
			s.write({});
			s.end();
		});

		/* TODO: why does this terminate process after asStream's runTask's cb calls [].slice.call(arguments) in map-stream's index.js?
		it('should run stream task', function(done) {
			var task, args = {a:'rgs'}, a = 0, s;

			// Arrange
			task = function () {
				a++;
				return es.map(function (data, cb) {
					cb(null, data);
				});
			};

			// Act
			s = execify.asStream(task);
			s.on('end', task, function () {

				// Assert
				a.should.equal(1);
				done();
			});
			s.write(args);
			s.end();
		});
		*/

		it('should return thrown error', function (done) {
			var task, expectedMessage, a = 0, s;

			// Arrange
			expectedMessage = 'test error';
			task = function () {
				a++;
				throw new Error(expectedMessage);
			};

			// Act
			s = execify.asStream(task);

			// Assert
			s.on('error', function (err) {
				a++;

				should.exist(err);
				err.message.should.equal(expectedMessage);
				done();
			});
			s.write();
			s.end();
		});

	});
});
