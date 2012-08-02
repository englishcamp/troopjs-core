/*!
 * TroopJS sandbox component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define( [ "./widget", "jquery" ], function SandboxModule(Widget, $) {
	var $ELEMENT = "$element";
	var _$ELEMENT = "_" + $ELEMENT;

	return Widget.extend({
		"sig/initialize" : function onInitialize(signal, deferred) {
			var self = this;

			// Store ref to current $element
			var $element = self[_$ELEMENT] = self[$ELEMENT];

			// Set $element to iframe document element
			self[$ELEMENT] = $($element.get(0).contentDocument);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/start" : function onStart(signal, deferred) {
			// Forward weave
			this.weave(deferred);
		}
	});
});
