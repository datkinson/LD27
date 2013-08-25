var util = {

	requestAnimationFrame : function(callback) {

		var fn = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};

		fn.call(window, callback);

	},

	sortByDistanceTo : function(target) {

		return function(a,b) {

			var distanceA = a.position.distanceTo(target);
			var distanceB = b.position.distanceTo(target);

			return distanceA - distanceB;

		}

	},

	ready : function(callback) {

		window.addEventListener('load', function() { callback(); } );

	},

	sortByZ : function(a,b) {

		return a.position.y - b.position.y;

	},

	extend : function( base, extra, existingOnly ) {
	
		if(typeof existingOnly === 'undefined') { existingOnly = false; }

		for ( var prop in extra ) {
				
			if(existingOnly && typeof base[prop] === 'undefined') { continue; }
			
			base[prop] = extra[prop];
			
		}
	
	},

	/**
	 * generate a random number between 0 and 1
	 * @todo replacve with custom RNG
	 */
	random : Math.random,

	/**
	 * generate a random number between min and max
	 */
	randomBetween : function(min, max) {

		return this.random() * (max - min) + min;

	},

	/**
	 * generate a random integer between min and max
	 */
	randomIntBetween : function(min, max) {

		return Math.floor( this.randomBetween(min, max) );

	}

};

// commonjs export
module.exports = util;