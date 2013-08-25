/**
 * a generic collision response object to hold information about a collision
 * @constructor
 */
var CollisionResponse = function(point, normal, depth) {

	this.point = point;
	this.normal = normal;
	this.depth = depth;

	this.mtd = normal._multiply(depth);

};

// commonjs export
module.exports = CollisionResponse;