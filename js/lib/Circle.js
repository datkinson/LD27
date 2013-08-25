var Vector2 = require('./Vector2.js');
var Rect = require('./Rect.js');
var util = require('./util.js');

/**
 * a circle
 * @constructor
 * @param {Number} [radius=1] the radius of the circle
 * @param {Vector2} [position=new Vector2] the radius of the circle
 */
var Circle = function(radius, position) {

	this.radius = radius || 1;
	this.position = position || new Vector2();

};

Circle.prototype.getCenter = function() {

	return this.position;

};

Circle.prototype.setCenter = function(position) {

	this.position = position;

	return this;

};


/**
 * creates and returns a copy of the circle
 * @returns {Circle} a copy of the original circle
 */
Circle.prototype.clone = function() {

	return new Circle( this.radius, this.position.clone() );

};


/**
 * creates and returns a rect which exactly contains the circle
 * @returns {Rect} a Rect which encompasses the circle
 */
Circle.prototype.toRect = function() {

	var size = this.radius * 2;
	var pos = this.position.clone().subtract( new Vector2( this.radius, this.radius ) );

	return new Rect( size, size, pos );

};

Circle.prototype.randomPoint = function() {

    var angle = util.random() * Math.PI * 2;
    var r = Math.sqrt( util.random() ) * this.radius;

	return new Vector2(
		this.position.x + (r * Math.cos(angle)),
		this.position.y + (r * Math.sin(angle))
	);

};

// commonjs export
module.exports = Circle;