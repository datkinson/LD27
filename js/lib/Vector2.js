/**
 * a two dimensional vector
 * where appropriate all methods return this, so that methematical operations can be chained
 * @constructor
 * @param {number} x a coordinate on the x axis
 * @param {number} y a coordinate on the y axis
 */
var Vector2 = function(x,y) {

	this.x = x || 0;
	this.y = y || 0;

};

/**
 * set the vector, either using x and y, or another vector
 */
Vector2.prototype.set = function(x, y) {

	if(x instanceof Vector2) {

		this.x = x.x || 0;
		this.y = x.y || 0;

	} else {

		this.x = x || 0;
		this.y = y || 0;

	}

	return this;

};

/**
 * adds another vector to this one
 * @example new Vector(2,1).add(new Vector(3,1) // [5,2]
 * @param {Vector2} v the vector to add
 * @return {Vector2} the modified original vector
 */
Vector2.prototype.add = function(v) {

	this.x += v.x;
	this.y += v.y;

	return this;

};

/**
 * subtracts another vector from this one
 * for example: [1,3] - [2,2] = [-1,1]
 * @return {Vector2} the modified original vector
 */
Vector2.prototype.subtract = function(v) {

	this.x -= v.x;
	this.y -= v.y;

	return this;

};

/**
 * multiplies this vector by a given amount
 * for example: [1,2] * 3 = [3,6]
 * @return {Vector2} the modified original vector
 */
Vector2.prototype.multiply = function(amount) {

	this.x *= amount;
	this.y *= amount;

	return this;

};

/**
 * divides this vector by a given amount
 * for example: [2,6] / 2 = [1,3]
 * @return {Vector2} the modified original vector
 */
Vector2.prototype.divide = function(scalar) {

	this.x /= scalar;
	this.y /= scalar;

	return this;

};

/**
 * alters the vector so that its length is 1, but it retains the same direction
 * for example: [0,10].normalize() = [0,1]
 * @return {Vector2} the modified original vector
 */
Vector2.prototype.normalize = function() {

	if(!this.isZero()) {

		var m = this.magnitude();
		this.x /= m;
		this.y /= m;

	}

	return this;

};

Vector2.prototype.floor = function() {

	this.x = Math.floor(this.x);
	this.y = Math.floor(this.y);

	return this;

};

Vector2.prototype.round = function() {

	this.x = Math.round(this.x);
	this.y = Math.round(this.y);

	return this;

};

/**
 * absolute (non negative) version of the vector
 */
Vector2.prototype.abs = function() {

	this.x = Math.abs(this.x);
	this.y = Math.abs(this.y);

	return this;

};

/**
 * dot product of this vector and another
 */
Vector2.prototype.dot = function(v) {

	return (this.x * v.x + this.y * v.y);

};

/**
 * alters the length of the vector without changing the direction
 * for example: [0,5].setMagnitude(2) = [0,2]
 * @return {Vector2} the modified original vector
 */
Vector2.prototype.setMagnitude = function(m) {

	return this.normalize().multiply(m);

};

/**
 * test if a given vector is identical to this one
 * @return {boolean} true if the vectors are identical, false otherwise
 */
Vector2.prototype.equals = function(v) {

	return (this.x == v.x && this.y == v.y);

};

Vector2.prototype.near = function(v, threshold) {

	if(!threshold) { threshold = Vector2.NEAR_THRESHOLD; }

	return this.distanceTo(v) < threshold;

}

/**
 * calculates the length of the vector
 * @return {number} the length of the vector
 */
Vector2.prototype.magnitude = function() {

	return Math.sqrt((this.x * this.x) + (this.y * this.y));

};

/**
 * 
 */
Vector2.prototype.rotate = function(a) {

	var cos = Math.cos(a),
		sin = Math.sin(a),
		x = (cos * this.x) - (sin * this.y),
		y = (sin * this.x) + (cos * this.y);

	this.x = x;
	this.y = y;

	return this;
};


/**
 * snaps to a cardinal direction
 * 
 */
Vector2.prototype.toCardinal = function() {

	if(!this.isZero()) {

		if(Math.abs(this.x) > Math.abs(this.y)) {

			if(this.x > 0) { this.x = 1; }
			else { this.x = -1; }

			this.y = 0;

		} else {

			if(this.y > 0) { this.y = 1; }
			else { this.y = -1; }

			this.x = 0;

		}

	}

	return this;

};

/**
 * perpendicular vector, for normals etc
 * @return {Vector2} the vector perpendicular to this one
 */
Vector2.prototype.perp = function() {

	var tmp = this.x;

	this.x = this.y;
	this.y = -tmp;

	return this;

};

/**
 * project this vector onto an axis
 * 
 */
Vector2.prototype.project = function(axis) {

	var dot = this.dot(axis);
	var scalar = dot / ((axis.x * axis.x) + (axis.y * axis.y));

	return new Vector2(
		axis.x * scalar,
		axis.y * scalar
	);
	
};

/**
 *
 * v - 2 * vector . normal * normal
 */
Vector2.prototype.reflect = function(normal) {

	var d2 = this.dot(normal) * 2;

	this.x -= d2 * normal.x;
    this.y -= d2 * normal.y;

	return this;

};

/**
 * creates a copy of the current vector
 * @return {Vector2} a copy of this vector
 */
Vector2.prototype.clone = function() {

	return new Vector2(this.x, this.y);

};

/**
 * makes this a copy of the passed vector
 * @return {Vector2} self
 */
Vector2.prototype.copy = function(vec) {

	this.x = vec.x;
	this.y = vec.y;

	return this;

};

/**
 * 
 * the opposite of the vector
 */
Vector2.prototype.invert = function() {

	this.x = -this.x;
	this.y = -this.y;

	return this;

};


/**
 * 
 */
Vector2.prototype.snap = function( near ) {

	this.divide(near).floor().multiply(near);

	return this;

};


/** not really a cross product, but useful for something */
Vector2.prototype.cross = function( v ) {

	return ( this.x * v.y ) - ( this.y * v.x );

};


/**
 * a readable version of the vector for debugging purposes
 * @example new Vector2(3,5).toString() // [3,5]
 * @return {string} a representation of the vector
 */
Vector2.prototype.toString = function() {

	return '[' + this.x + ',' + this.y + ']';

};


/**
 * 
 */
Vector2.prototype.zero = function() {

	this.x = 0; this.y = 0; return this;

};


/**
 * 
 */
Vector2.prototype.isZero = function() {

	return (this.x === 0 && this.y === 0);

};

/**
 * 
 */
Vector2.prototype.distanceTo = function(vector) {

	return this._subtract(vector).magnitude();

};

Vector2.prototype.toRadians = function() {

  return Math.atan2(this.y, this.x);

};

Vector2.prototype.toJSON = function() {

	return { x : this.x, y : this.y };

};

// functions which return copies of the vector instead of affecting this
Vector2.prototype._add = function(v) { return this.clone().add(v); };
Vector2.prototype._subtract = function(v) { return this.clone().subtract(v); };
Vector2.prototype._multiply = function(scalar) { return this.clone().multiply(scalar); };
Vector2.prototype._divide = function(scalar) { return this.clone().divide(scalar); };
Vector2.prototype._normalize = function() { return this.clone().normalize(); };
Vector2.prototype._floor = function() { return this.clone().floor(); };
Vector2.prototype._round = function() { return this.clone().round(); };
Vector2.prototype._rotate = function(a) { return this.clone().rotate(a); };
Vector2.prototype._invert = function(a) { return this.clone().invert(a); };
Vector2.prototype._snap = function(n) { return this.clone().snap(n); };
Vector2.prototype._reflect = function(v) { return this.clone().reflect(v); };
Vector2.prototype._cross = function(v) { return this.clone().cross(v); };
Vector2.prototype._perp = function() { return this.clone().perp(); };

Vector2.NEAR_THRESHOLD = 1;

/**
 * isometric extensions to the Vector2 class
 */
Vector2.prototype.toScreen = function() {

	var x = this.x - this.y;
	var y = (this.x + this.y) / 2;

	this.x = x * Vector2.ISO_RATIO;
	this.y = y * Vector2.ISO_RATIO;

	return this;
};

Vector2.prototype.toIso = function() {

	var x = (this.x / 2) + this.y;
	var y = this.y - (this.x / 2);

	this.x = x / Vector2.ISO_RATIO;
	this.y = y / Vector2.ISO_RATIO;

	return this;
};

// top down to iso ratio (10 pixels top down = 16 pixel iso tile width)
Vector2.ISO_RATIO = 1.6;

Vector2.prototype._toScreen = function() { return this.clone().toScreen(); };
Vector2.prototype._toIso = function() { return this.clone().toIso(); };

Vector2.zero = new Vector2();

/**
 * @static
 * return a vector from an array
 * eg: [5,5]
 */
Vector2.fromArray = function(arr) {

	return new Vector2(
		parseInt(arr[0]),
		parseInt(arr[1])
	);

};

// commonjs export
module.exports = Vector2;