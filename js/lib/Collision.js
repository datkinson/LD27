var CollisionResponse = require('./CollisionResponse.js');
var Circle = require('./Circle.js');
var Rect = require('./Rect.js');
var Vector2 = require('./Vector2.js');

/**
 * @namespace
 * Assorted collision functions
 * covers collision between point, line, polygon, rect, circle
 * @todo make every one return a standard collision response object
 * @todo add sanity checks to all functions
 * @todo check gaps, ie can every object collide wth every other
 * @todo add reverse versions? ie rectCircle > circleRect
 */
var Collision = {

	/**
	 * calculate collisions between a point and a Circle
	 * @param  {[type]} point  [description]
	 * @param  {[type]} circle [description]
	 * @return {[type]}        [description]
	 */
	pointCircle : function(point, circle) {

		var dx = Math.abs(circle.position.x - point.x),
			dy = Math.abs(circle.position.y - point.y);

		return (dx * dx) + (dy * dy) < (circle.radius * circle.radius);

	},

	/**
	 * calculate collisions between a point and a Rect
	 * @param  {[type]} point [description]
	 * @param  {[type]} rect  [description]
	 * @return {[type]}       [description]
	 */
	pointRect : function(point, rect) {

		if(!point || !rect) { return false; }

		return  point.x >= rect.position.x &&
				point.x < rect.position.x + rect.width &&
				point.y >= rect.position.y &&
				point.y < rect.position.y + rect.height;
	},

	/**
	 * check if a point is on one side of an infinite line
	 * @param {Vector2} point A Vector2 representing a point in 2d space
	 * @param {Line} line a line representing a halfspace
	 * @return {Boolean}
	 */
	pointHalfspace : function(point, line) {

		var end = line.end._subtract(line.start),
			start = point._subtract(line.start),
			normal = end._perp(),
			dot = start.dot(normal);

			if(dot > 0) { return false; }
			return true;
	},

	/**
	 * check collision between a point and a polygon
	 * @param  {[type]} point   [description]
	 * @param  {[type]} polygon [description]
	 * @return {[type]}         [description]
	 */
	pointPolygon : function(point, polygon) {

		// quick test of bounding box
		if(!this.pointRect(point, polygon.bounds)) { return false; }

		// get a reference point definitely outside the polygon
		var outside = polygon.bounds.position._subtract(new Vector2(1,1));
		var ray = new Line(point, outside);

		var intersections = 0,
			edges = polygon.getEdges();

		for (var i = 0, len = edges.length; i < len; i++) {

			if (this.lineLine(ray, edges[i])) {

				intersections++;

			}
		}

		return (intersections % 2);

	},

	/**
	 * check collision between a point and a polygon
	 * only works on convex polygons
	 * @param  {[type]} point   [description]
	 * @param  {[type]} polygon [description]
	 * @return {[type]}         [description]
	 */
	pointPolygonConvex : function(point, polygon) {

		var edges = polygon.getEdges();

		for (var i = 0, len = edges.length; i < len; i++) {

			// drop out as soon as it is outside
			if (!this.pointHalfspace(point, edges[i])) {

				return false;

			}
		}

		return true;

	},

	/**
	 * check collision between two lines
	 * @param  {[type]} line1 [description]
	 * @param  {[type]} line2 [description]
	 * @return {[type]}       [description]
	 */
	lineLine : function( line1, line2 ) {

		return (
			this.counterClockwise(line1.start, line2.start, line2.end) != this.ccw(line1.end, line2.start, line2.end) &&
			this.counterClockwise(line1.start, line1.end, line2.start) != this.ccw(line1.start, line1.end, line2.end)
		);

	},

	/**
	 * Check collision between a line and a circle
	 * @param line
	 * @param circle
	 * @return {Boolean}
	 */
	lineCircle : function( line, circle ) {

		var point = this.closestPointLine(circle.position, line);
		var distance = point.distanceTo(circle.position);

		if(distance <= circle.radius) {

			var response = new CollisionResponse(
				point,
				circle.position._subtract(point).normalize(),
				circle.radius - distance
			);

			return response;

		}

		return false;
	},

	/**
	 * Check collision between a line and a rectangle
	 * @param  {[type]} line [description]
	 * @param  {[type]} rect [description]
	 * @return {[type]}      [description]
	 */
	lineRect : function(line, rect) {

		var lines = rect.getEdges();

		return (
			this.lineLine(line, lines[0]) &&
			this.lineLine(line, lines[1]) &&
			this.lineLine(line, lines[2]) &&
			this.lineLine(line, lines[3])
		);

	},

	/**
	 * Check collision between two Rects
	 * @param  {[type]} r1 [description]
	 * @param  {[type]} r2 [description]
	 * @return {[type]}    [description]
	 */
	rectRect : function ( r1, r2 ) {

		// work out the half widths and half heights
		var hw1 = r1.width / 2;
		var hw2 = r2.width / 2;
		var hh1 = r1.height / 2;
		var hh2 = r2.height / 2;

		// calculate the centers of the two rects
		var c1 = r1.getCenter();
		var c2 = r2.getCenter();

		// the distances between the two centers
		var distance = c1._subtract(c2).abs();

		// the total widths and heights
		var totalWidth = hw1 + hw2;
		var totalHeight = hh1 + hh2;

		if(totalWidth <= distance.x) { return false; }
		if(totalHeight <= distance.y) { return false; }

		var v = new Vector2();
		var x = totalWidth - distance.x;
		var y = totalHeight - distance.y;

		if(Math.abs(x) < Math.abs(y)) {

			if(c1.x - c2.x < 0) { v.x = -x; }
			else { v.x = x; }

		} else {

			if(c1.y - c2.y < 0) { v.y = -y; }
			else { v.y = y; }

		}

		//@todo calculate properly
		var point = new Vector2();
		var normal = v._normalize();
		var depth = v.magnitude();

		return new CollisionResponse(point, normal, depth);

	},

	/**
	 * Check collision between two Circles
	 * @param  {[type]} c1       [description]
	 * @param  {[type]} c2       [description]
	 * @param  {[type]} response [description]
	 * @return {[type]}          [description]
	 */
	circleCircle : function (c1, c2, response) {

		var dx = Math.abs(c1.position.x - c2.position.x);
		var dy = Math.abs(c1.position.y - c2.position.y);
		var dr = c1.radius + c2.radius;

		if(((dx * dx) + (dy * dy)) < (dr * dr)) {

			if(response !== true) { return true; }

			var distance = c1.position._subtract(c2.position);
			var normal = distance._normalize();
			var depth = (c1.radius + c2.radius) - distance.magnitude();
			var mtd = normal._multiply(depth);

			return {
				distance : distance,
				normal : normal,
				//@todo point : near,
				depth : depth,
				mtd : mtd

			};
		}

		return false;
	},

	/**
	 * Check collision between a Circle and a Rect
	 * @param  {[type]} circle   [description]
	 * @param  {[type]} rect     [description]
	 * @param  {[type]} response [description]
	 * @return {[type]}          [description]
	 */
	circleRect : function ( circle, rect ) {

		var near = this.closestPointRect( circle.position, rect );

		if ( this.pointCircle( near, circle ) ) {

			var distance = circle.position.distanceTo( near );
			var normal = circle.position._subtract(near).normalize();
			var depth = circle.radius - distance;

			return new CollisionResponse(near, normal, depth);

		}

		return false;
	},

	/**
	 * find the closest point on a line to a reference point
	 * @param {Vector2} point a point in space
	 * @param {Line} line a line
	 * @return {Vector2} the closest point on the line to the point
	 */
	closestPointLine : function( point, line ) {

		var v1 = line.end._subtract(line.start);
		var v2 = line.start._subtract(point);
		var v3 = line.start._subtract(line.end);
		var v4 = line.end._subtract(point);

		var dot1 = v2.dot(v1);
		var dot2 = v1.dot(v1);
		var dot3 = v4.dot(v3);
		var dot4 = v3.dot(v3);

		var t1 = -1 * dot1/dot2;
		var t2 = -1 * dot3/dot4;

		// beyond the bounds of the line, so the end points are the closest
		if( t1 < 0 ) { return line.start.clone(); }
		if( t2 < 0 ) { return line.end.clone(); }

		// actual point on line
		return new Vector2(line.start.x + v1.x * t1, line.start.y + v1.y * t1);

	},

	/**
	 * Determine the closest point on a circle to a reference point
	 * @param {Vector2} point a point in space
	 * @param {Circle} circle a circle
	 * @return {Vector2} the closest point on the circle to the point
	 */
	closestPointCircle : function( point , circle ) {

		var v = point._subtract(circle.position);
		v.setMagnitude(circle.radius);

		return circle.position._add(v);

	},

	/**
	 * Determine the closest point on a rect to another point
	 * @param  {[type]} point [description]
	 * @param  {[type]} rect  [description]
	 * @return {[type]}       [description]
	 */
	closestPointRect : function( point, rect) {

		var closest = point.clone();

		if( point.x < rect.position.x ) {

			closest.x = rect.position.x;

		} else if ( point.x > rect.position.x + rect.width ) {

			closest.x = rect.position.x + rect.width;

		}

		if( point.y < rect.position.y ) {

			closest.y = rect.position.y;

		} else if ( point.y > rect.position.y + rect.height ) {

			closest.y = rect.position.y + rect.height;

		}

		return closest;
	},

	/**
	 * Determine if three points are in a counter clockwise order
	 * @param  {[type]} a [description]
	 * @param  {[type]} b [description]
	 * @param  {[type]} c [description]
	 * @return {[type]}   [description]
	 */
	counterClockwise : function(a, b, c) {

		return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);

	},

	rectCircle : function(rect, circle) { return this.circleRect(circle, rect); },

	/**
	 * general purpose collision resolution wrapper
	 * at the moment, handles rects and circles
	 * @todo extend to other shapes
	 * @param  {[type]} shape1
	 * @param  {[type]} shape2
	 * @return {[type]}
	 */
	resolve : function(shape1, shape2) {

		if(shape1 instanceof Rect) {

			if(shape2 instanceof Rect) {

				return this.rectRect(shape1, shape2);

			} else if(shape2 instanceof Circle) {

				return this.rectCircle(shape1, shape2);

			}

		} else if(shape1 instanceof Circle) {

			if(shape2 instanceof Rect) {

				return this.circleRect(shape1, shape2);

			} else if(shape2 instanceof Circle) {

				return this.circleCircle(shape1, shape2);

			}

		}

	},

};

// commonjs export
module.exports = Collision;