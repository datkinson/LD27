var Vector2 = require('./Vector2');
var Line = require('./Line');
var util = require('./util.js');

/**
 * A rectangle.
 * @constructor
 * @param {Number} [width=1] The starting width of the rectangle.
 * @param {Number} [height=1] The starting height of the rectangle.
 * @param {Vector2} [position=[0,0]] The starting position of the rectangle.
 * @example var shape = new Rect(3,3);
 */
var Rect = function( width, height, position ) {

	/** The width of the rectangle. */
	this.width = 1;

	/** The height of the rectangle. */
	this.height = 1;

	/** The position of the rectangle. */
	this.position = null;

	if( height === undefined ) { height = width; }

	if(width) { this.width = parseFloat(width); }

	if(height) { this.height = parseFloat(height); }

	if(position) {

		this.position = position.clone();

	} else {

		this.position = new Vector2();

	}

};

/**
 * @return {Rect} An exact copy of this Rect.
 */
Rect.prototype.clone = function() {

	return new Rect(this.width, this.height, this.position.clone());

};

/**
 * Alter this Rect so that it becomes an exact copy of the passed Rect.
 * @param {Rect} rect A Rect to copy from.
 * @return {Rect} Itself. Useful for chaining.
 */
Rect.prototype.set = function(rect) {

	if(!rect || !(rect instanceof Rect)) { return this; }

	this.width = rect.width;
	this.height = rect.height;
	this.position = rect.position.clone();

	return this;

};

/**
 * @return {Vector2} The center of the rectangle.
 */
Rect.prototype.getCenter = function() {

	return new Vector2(

		this.position.x + this.width / 2,
		this.position.y + this.height / 2

	);

};

/**
 * Move the Rect so that it's center is at the specified point.
 * @param {Vector2} pos The new center for the Rect.
 * @return {Rect} Itself. Useful for chaining.
 */
Rect.prototype.setCenter = function(pos) {

	this.position.x = pos.x - this.width / 2;
	this.position.y = pos.y - this.height / 2;

	return this;

};


/**
 *
 */
Rect.prototype.scale = function(scale) {

	this.width *= scale;
	this.height *= scale;

	return this;

};

/**
 * Expand the Rect so that it has a new width and height, but the same center.
 * @param {Number} scale A factor to multiply the width and height by.
 * @return {Rect} Itself. Useful for chaining.
 */
Rect.prototype.expand = function(scale) {

	// get it first to expand from center
	var center = this.getCenter();

	this.scale(scale);

	this.setCenter(center);

	return this;

};

/**
 * shrink rectangle by a set amount
 * @param amount how much to contract
 */
Rect.prototype.contract = function(amount) {

	this.position.x += amount;
	this.position.y += amount;
	this.width -= 2 * amount;
	this.height -= 2 * amount;

};

/**
 * a random point inside the Rect
 * @return {Vector2} a random point inside in the Rect
 */
Rect.prototype.randomPoint = function() {

	return this.position._add(new Vector2(
		util.random() * this.width,
		util.random() * this.height
	));

};

/**
 * return an array of lines
 * representing the edges of the rectangle edges
 * @return {Array} an array of lines
 */
Rect.prototype.getEdges = function() {

	var v = this.getVertices();

	return [
		new Line(v[0], v[1]),
		new Line(v[1], v[2]),
		new Line(v[2], v[3]),
		new Line(v[3], v[0])
	];

};

Rect.prototype.getVertices = function() {

	var vertices = [
		this.position.clone(),
		this.position.clone(),
		this.position.clone(),
		this.position.clone()
	];

	vertices[1].x += this.width;
	vertices[2].x += this.width;
	vertices[2].y += this.height;
	vertices[3].y += this.height;

	return vertices;
};

Rect.fromArray = function(arr) {

	var pos = new Vector2();

	if(arr.length >= 4) {

		pos.x = parseInt(arr[2]);
		pos.y = parseInt(arr[3]);

	}

	return new Rect(
		parseInt(arr[0]),
		parseInt(arr[1]),
		pos
	);

};

// commonjs export
module.exports = Rect;