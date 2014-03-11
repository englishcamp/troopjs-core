/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../event/emitter",
	"../event/runner/sequence",
	"troopjs/version",
	"troopjs-utils/merge",
	"troopjs-composer/decorator/before",
	"troopjs-composer/decorator/around",
	"when",
	"poly/array"
], function ComponentModule(Emitter, sequence, version, merge, before, around, when) {
	"use strict";

	/**
	 * Imagine component as an object that has predefined life-cycle, with the following phases:
	 *
	 *   1. initialize
	 *   1. start
	 *   1. started
	 *   1. stop
	 *   1. finalize
	 *   1. finalized
	 *
	 * Calls on {@link #start} or {@link #stop} method of the component will trigger any defined signal
	 * handlers declared.
	 *
	 * 	var app = Component.extend({
	 * 		"displayName": "my/component/app",
	 *
	 * 		// Signal handler for "start" phase
	 * 		"sig/start": function start() {
	 * 			// bind resize handler.
	 * 			$(window).on('resize.app', $.proxy(this.onResize, this));
	 * 		},
	 *
	 * 		// Signal handler for "finalize" phase
	 * 		"sig/finalize": function finalize() {
	 * 			// cleanup the handler.
	 * 			$(window).off('resize.app');
	 * 		},
	 *
	 * 		"onResize": function onResize(argument) {
	 * 			// window resized.
	 * 		}
	 * 	});
	 *
	 * 	$.ready(function on_load() {
	 * 		app.start();
	 * 	});
	 *
	 * 	$(window).unload(function on_unload (argument) {\
	 * 	  app.end();
	 * 	});
	 *
	 * @class core.component.base
	 * @extends core.event.emitter
	 */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var EMITTER_CREATEHANDLERS = Emitter.createHandlers;
	var CONFIGURATION = "configuration";
	var RUNNER = "runner";
	var HANDLERS = "handlers";
	var HEAD = "head";
	var CONTEXT = "context";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var PHASE = "phase";
	var STOP = "stop";
	var INITIALIZE = "initialize";
	var STARTED = "started";
	var FINALIZED = "finalized";
	var FINISHED = "finished";
	var SIG = "sig";
	var SIG_SETUP = SIG + "/setup";
	var SIG_TEARDOWN = SIG + "/teardown";
	var ON = "on";
	var EVENT_TYPE_SIG = new RegExp("^" + SIG + "/(.+)");

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend(function Component() {
		var me = this;
		var specials = me.constructor.specials[SIG] || ARRAY_PROTO;

		// Iterate specials
		specials.forEach(function (special) {
			me.on(special[NAME], special[VALUE]);
		});

		/**
		 * Configuration for this component, access via {@link #configure}
		 * @private
		 * @readonly
		 * @property {Object} configuration
		 */
		me[CONFIGURATION] = {};
	}, {
		/**
		 * Current lifecycle phase
		 * @readonly
		 * @protected
		 * @property {"initialized"|"started"|"stopped"|"finalized"} phase
		 */

		/**
		 * The exact semantic version that reflects the version defined in bower.json file of troopjs package.
		 * @readonly
		 * @since 3.0
		 * @property {String}
		 */
		"version" : version,

		"displayName" : "core/component/base",

		/**
		 * Initialize signal
		 * @event sig/initialize
		 * @localdoc Triggered when this component enters the initialize phase
		 * @param {...*} [args] Initialize arguments
		 */

		/**
		 * Start signal
		 * @event sig/start
		 * @localdoc Triggered when this component enters the start phase
		 * @param {...*} [args] Initialize arguments
		 */

		/**
		 * Stop signal
		 * @localdoc Triggered when this component enters the stop phase
		 * @event sig/stop
		 * @param {...*} [args] Stop arguments
		 */

		/**
		 * Finalize signal
		 * @event sig/finalize
		 * @localdoc Triggered when this component enters the finalize phase
		 * @param {...*} [args] Finalize arguments
		 */

		/**
		 * Setup signal
		 * @event sig/setup
		 * @localdoc Triggered when the first event handler of a particular type is added via {@link #method-on}.
		 * @since 3.0
		 * @param {String} type
		 * @param {Object} handlers
		 */

		/**
		 * Teardown signal
		 * @event sig/teardown
		 * @localdoc Triggered when the last event handler of type is removed for a particular type via {@link #method-off}.
		 * @since 3.0
		 * @param {String} type
		 * @param {Object} handlers
		 */

		/**
		 * Task signal
		 * @event sig/task
		 * @localdoc Triggered when this component starts a {@link #method-task}.
		 * @param {Promise} task Task
		 * @param {Object} task.context Task context
		 * @param {Date} task.started Task start date
		 * @param {String} task.name Task name
		 * @return {Promise}
		 */

		/**
		 * Handles the component initialization.
		 * @inheritdoc #event-sig/initialize
		 * @localdoc Registers event handlers declared ON specials
		 * @handler
		 * @return {Promise}
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[ON] || ARRAY_PROTO, function (special) {
				return me.on(special[TYPE], special[VALUE]);
			});
		},

		/**
		 * Handles the component finalization.
		 * @inheritdoc #event-sig/finalize
		 * @localdoc Un-registers all handlers
		 * @handler
		 * @return {Promise}
		 */
		"sig/finalize" : function onFinalize() {
			var me = this;

			return when.map(me[HANDLERS].reverse(), function (handlers) {
				return me.off(handlers[TYPE]);
			});
		},

		/**
		 * Handles the component start
		 * @handler sig/start
		 * @inheritdoc #event-sig/start
		 * @template
		 * @return {Promise}
		 */

		/**
		 * Handles the component stop
		 * @handler sig/stop
		 * @inheritdoc #event-sig/stop
		 * @template
		 * @return {Promise}
		 */

		/**
		 * Handles an event setup
		 * @handler sig/setup
		 * @inheritdoc #event-sig/setup
		 * @template
		 * @return {Promise}
		 */

		/**
		 * Handles an event teardown
		 * @handler sig/teardown
		 * @inheritdoc #event-sig/teardown
		 * @template
		 * @return {Promise}
		 */

		/**
		 * Handles a component task
		 * @handler sig/task
		 * @inheritdoc #event-sig/task
		 * @template
		 * @return {Promise}
		 */

		/**
		 * Add to the component {@link #configuration configuration}, possibly {@link utils.merge merge} with the existing one.
		 *
		 * 		var List = Component.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the List.
		 * 				this.configure({
		 * 					"type": "list",
		 * 					"cls": ["list"]
		 * 				});
		 * 			}
		 * 		});
		 * 		var Dropdown = List.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the Dropdown.
		 * 				this.configure({
		 * 					"type": "dropdown",
		 * 					"cls": ["dropdown"],
		 * 					"shadow": true
		 * 				});
		 * 			}
		 * 		});
		 *
		 * 		var dropdown = new Dropdown();
		 *
		 * 		// Overwritten: "dropdown"
		 * 		print(dropdown.configuration.id);
		 * 		// Augmented: ["list","dropdown"]
		 * 		print(dropdown.configuration.cls);
		 * 		// Added: true
		 * 		print(dropdown.configuration.shadow);
		 *
		 * @param {...Object} [config] Config(s) to add.
		 * @returns {Object} The new configuration.
		 */
		"configure" : function configure(config) {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 * @param {String} type The event type to subscribe to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 */
		"on": before(function on(event, callback, data) {
			var me = this;
			var type = event;
			var all = me[HANDLERS];
			var handlers = all[type];

			// Initialize the handlers for this type of event on first subscription only.
			if (handlers === UNDEFINED) {
				handlers = EMITTER_CREATEHANDLERS.call(all, type);
			}

			// If this event is NOT a signal, send out a signal to allow setting up handlers.
			if (!(HEAD in handlers) && !EVENT_TYPE_SIG.test(type)) {
				event = {};
				event[TYPE] = SIG_SETUP;
				event[RUNNER] = sequence;
				me.emit(event, type, handlers);
			}

			// context will always be this widget.
			return [ type, me, callback, data ];
		}),

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 * @param {String} type The event type subscribed to
		 * @param {Function} [callback] The event listener function to remove
		 */
		"off": around(function(fn) {
			return function off(event, callback) {
				var me = this;
				var type = event;

				// context will always be this widget.
				fn.call(me, type, me, callback);

				var all = me[HANDLERS];
				var handlers = all[type];

				// Initialize the handlers for this type of event on first subscription only.
				if (handlers === UNDEFINED) {
					handlers = EMITTER_CREATEHANDLERS.call(all, type);
				}

				// If this event is NOT a signal, send out a signal to allow finalize handlers.
				if (!(HEAD in handlers) && !EVENT_TYPE_SIG.test(type)) {
					event = {};
					event[TYPE] = SIG_TEARDOWN;
					event[RUNNER] = sequence;
					me.emit(event, type, handlers);
				}

				return me;
			};
		}),

		/**
		 * Signals the component
		 * @param {String} _signal Signal
		 * @param {...*} [args] signal arguments
		 * @return {Promise}
		 */
		"signal": function signal(_signal, args) {
			var me = this;

			// Modify first argument
			arguments[0] = "sig/" + _signal;

			// Emit
			return me.emit.apply(me, arguments);
		},

		/**
		 * Start the component life-cycle, sends out {@link #event-sig/initialize} and then {@link #event-sig/start}.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 * @fires sig/initialize
		 * @fires sig/start
		 */
		"start" : function start(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== UNDEFINED && phase !== FINALIZED) {
				throw new Error("Can't transition phase from '" + phase + "' to '" + INITIALIZE + "'");
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = INITIALIZE ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function initialized(_initialized) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "start";

				return signal.apply(me, args).then(function started(_started) {
					// Update phase
					me[PHASE] = STARTED;

					// Return concatenated result
					return ARRAY_PROTO.concat(_initialized, _started);
				});
			});
		},

		/**
		 * Stops the component life-cycle.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 * @fires sig/stop
		 * @fires sig/finalize
		 */
		"stop" : function stop(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== STARTED) {
				throw new Error("Can't transition phase from '" + phase + "' to '" + STOP + "'");
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = STOP ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function stopped(_stopped) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "finalize";

				return signal.apply(me, args).then(function finalized(_finalized) {
					// Update phase
					me[PHASE] = FINALIZED;

					// Return concatenated result
					return ARRAY_PROTO.concat(_stopped, _finalized);
				});
			});
		},

		/**
		 * Schedule a new promise that runs on this component, sends a {@link #event-sig/task} once finished.
		 *
		 * **Note:** It's recommended to use **this method instead of an ad-hoc promise** to do async lift on this component,
		 * since in additional to an ordinary promise, it also helps to track the context of any running promise,
		 * including it's name, completion time and a given ID.
		 *
		 * 	var widget = Widget.create({
		 * 		"sig/task" : function(promise) {
		 * 			print('task %s started at: %s, finished at: %s', promise.name, promise.started);
		 * 		}
		 * 	});
		 *
		 * 	widget.task(function(resolve) {
		 * 		$(this.$element).fadeOut(resolve);
		 * 	}, 'animate');
		 *
		 * @param {Function} resolver The task resolver function.
		 * @param {Function} resolver.resolve Resolve the task.
		 * @param {Function} resolver.reject Reject the task.
		 * @param {Function} resolver.notify Notify the progress of this task.
		 * @param {String} [name]
		 * @returns {Promise}
		 * @fires sig/task
		 */
		"task" : function task(resolver, name) {
			var me = this;

			var promise = when
				.promise(resolver)
				.ensure(function () {
					promise[FINISHED] = new Date();
				});

			promise[CONTEXT] = me;
			promise[STARTED] = new Date();
			promise[NAME] = name;

			return me.signal("task", promise).yield(promise);
		}
	});
});
