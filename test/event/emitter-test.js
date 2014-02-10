/*globals buster:false*/
buster.testCase("troopjs-core/event/emitter", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-core/event/emitter", "when", "when/delay" ] , function (Emitter, when, delay) {

		run({
			"on/emit" : function (done) {
				var arg = "TEST";
				var context = this;

				Emitter()
					.on("test", context, function onTest(test) {
						assert.same(arg, test);
					})
					.emit("test", arg)
					.then(done);
			},

			"on/emit again": function(done) {
				var arg = "TEST";
				var context = this;

				var emitter = Emitter();
				var count = 0;

				emitter
					.on("test", context, function() {
						count++;
					})
					.emit("test", arg)
					.then(function () {
						emitter.emit("test", arg)
							.then(function () {
								assert.equals(count, 2);
							})
							.then(done)
					});
			},

			"on/emit again with different arg": function(done) {
				var emitter = Emitter();
				var context = this;
				var last;

				emitter
					.on("test", context, function(test) {
						last = test;
					})
					.emit("test", "test")
					.then(function () {
						emitter.emit("test", "test2")
							.then(function () {
								assert.equals(last, "test2");
							})
							.then(done);
					});
			},

			"on/emit 2 emitters": function(done) {
				var emitter1 = Emitter();
				var emitter2 = Emitter();

				var context = this;

				emitter1.on("one", context, function(arg) {
					assert.same(arg, "one");
				});

				emitter2.on("two", context, function(arg) {
					assert.same(arg, 2);
				});

				emitter1.emit("one", "one").then(function () {
					emitter2.emit("two", 2).then(done);
				});
			},

			"on/emit single handler shares two context": function(done) {
				var emitter = Emitter();
				var count = 0;
				var ctx1 = {}, ctx2 = {}, handler = function() {
					// Assertion of different context.
					assert.same(++count === 1? ctx1 : ctx2, this);
				};

				emitter.on("one", ctx1, handler);
				emitter.on("one", ctx2, handler);

				emitter.emit("one").then(function () {
					assert.same(2, count);
					done();
				});
			},

			"on/emit async subscribers": function(done) {
				var emitter = Emitter();
				var context = this;

				this.timeout = 1500;
				var count = 0;

				emitter
					.on("one", context, function () {
						return ++count;
					})
					.on("one", context, function () {
						return delay(++count, 500);	// Backwards, but needs to be as both params are numbers
					})
					.on("one", context, function () {
						return delay(++count, 500);	// Backwards, but needs to be as both params are numbers
					})
					.emit("one")
					.spread(function (first, second, third) {
						assert.same(first, 1);
						assert.same(second, 2);
						assert.same(third, 3);
					})
					.then(done);
			},

			"off/emit with context and callback": function(done) {
				var emitter = Emitter();
				var context = this;
				var last;

				var one = function() {
					last = "one";
				};

				var two = function() {
					last = "two";
				};

				emitter
					.on("test", context, one)
					.on("test", context, two)
					.emit("test")
					.then(function () {
						assert.equals(last, "two");

						emitter
							.off("test", context, two)
							.emit("test")
							.then(function () {
								assert.equals(last, "one");
							})
							.then(done);
					});
			},

			"off/emit with context": function(done) {
				var emitter = Emitter();
				var context = this;
				var last;

				var one = function() {
					last = "one";
				};

				var two = function() {
					last = "two";
				};

				emitter
					.on("test", {}, one)
					.on("test", context, two)
					.emit("test")
					.then(function () {
						assert.equals(last, "two");

						emitter
							.off("test", context)
							.emit("test")
							.then(function () {
								assert.equals(last, "one");
							})
							.then(done);
					});
			},

			"off/emit": function(done) {
				var emitter = Emitter();
				var context = this;
				var last;

				var one = function() {
					last = "one";
				};

				var two = function() {
					last = "two";
				};

				emitter
					.on("test", context, one)
					.on("test", context, two)
					.emit("test")
					.then(function () {
						assert.equals(last, "two");

						last = "three";

						emitter
							.off("test")
							.emit("test")
							.then(function () {
								assert.equals(last, "three");
							})
							.then(done);
					});
			},

			"on/emit reject": function (done) {
				var emitter = Emitter();
				var context = this;

				emitter
					.on("test", context, function (pass) {
						return pass
							? when.resolve()
							: when.reject();
					})
					.on("test", context, function (pass) {
						assert.isTrue(pass);
					})
					.emit("test", false)
					.then(function () {
						assert(false);
					}, function() {
						assert(true);
					})
					.ensure(function () {
						emitter
							.emit("test", true)
							.then(function () {
								assert(true);
							}, function() {
								assert(false);
							})
							.ensure(done);
					});
			}
		});
	});
});