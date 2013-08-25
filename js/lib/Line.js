var util = require('./util.js');

/**
 * A line, represented by start and end points
 * @constructor
 * @param  {Vector2} start the start of the line
 * @param  {Vector2} end the end of the line
 */
var Line = function(start, end) {

	this.start = start;
	this.end = end;

};

/**
 * get the length of lines
 * @return {Number} the length
 */
Line.prototype.length = function() {

	return this.end._subtract(this.start).magnitude();

};

/**
 * get a random point along the line
 * @return {Vector2} the point
 */
Line.prototype.randomPoint = function() {

	var len = util.random();
	var offset = this.end._subtract(this.start);

	return this.start._add(offset._multiply(len));

};

/**
 * get the center of the line
 * @return {Vector2} the center
 */
Line.prototype.getCenter = function() {

	var offset = this.end._subtract(this.start);

	return this.start._add(offset._divide(2));

};

/**
 * get the normal of the line
 * @return {Vector2} the normal
 */
Line.prototype.getNormal = function() {

	return this.end._subtract(this.start).perp().normalize();

};

// commonjs export
module.exports = Line;