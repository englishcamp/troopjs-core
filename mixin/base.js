/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-composer/mixin/factory",
	"troopjs-logging/logger"
], function ObjectBaseModule(Factory, logger) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	/**
	 * Base object with instance count.
	 * @class core.mixin.base
	 * @implement composer.mixin
	 * @mixin logging.logger
	 */

	/**
	 * Creates a new component instance
	 * @method constructor
	 */
	return Factory(function ObjectBase() {
		// Update instance count
		this[INSTANCE_COUNT] = ++INSTANCE_COUNTER;
	}, logger, {
		/**
		 * Instance counter
		 * @private
		 * @readonly
		 * @property {Number}
		 */
		"instanceCount" : INSTANCE_COUNTER,

		/**
		 * The hierarchical namespace for this component that indicates it's functionality.
		 * @private
		 * @readonly
		 * @property {String}
		 */
		"displayName" : "core/mixin/base",

		/**
		 * Gives string representation of this component instance.
		 * @returns {String} {@link #displayName}`@`{@link #instanceCount}
		 * @protected
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});
