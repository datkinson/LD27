;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Rect = require('./Rect');
var Vector2 = require('./Vector2');

/**
 * @constructor
 * mostly chainable wrappers around existing canvas functions
 * also adds convenience functions which take other classes as arguments
 * such as Vector2's and Rects
 * @todo add fixed position drawing (top left etc)
 * @todo add scaling for different screen sizes (css3?)
 */
Canvas = function ( width, height ) {

	this.width = width || 320;
	this.height = height || 240;

	this.rect = new Rect(this.width, this.height);

	this.element = document.createElement('canvas');
	this.context = this.element.getContext('2d');

	// fixes weird canvas bug
	this.element.setAttribute('tabindex', 0);

	this.element.style.outline = 'none';
	this.element.width = this.width;
	this.element.height = this.height;

	// allows pixelated scaling, YAY!
	this.context.imageSmoothingEnabled = this.context.webkitImageSmoothingEnabled = this.context.mozImageSmoothingEnabled = false;

	// not sure?
	this.context.textBaseline = 'top';

	this.backgroundColor = null;
	this.fontFamily = 'Arial';
	this.fontSize = 12;
	this.fontColor = '#000000';

	this.shifted = false;

};

/**
 * translates the canvas drawing context
 * @param {Vector2} v a vector desribing the translation
 */
Canvas.prototype.translate = function(v) {

	this.context.translate(v.x, v.y);

	return this;

};

/**
 * rotates the canvas drawing context
 * @param {Number} r amout in radians to rotate by
 */
Canvas.prototype.rotate = function(r) {

	this.context.rotate(r);

	return this;

};

/**
 * rotates the canvas drawing context around a point
 * @param {Vector2} point to rotate around
 * @param {Number} r amout in radians to rotate by
 */
Canvas.prototype.rotateAround = function(point, r) {

	this.translate(point);
	this.context.rotate(r);
	this.translate(point._invert());

	return this;

};


/**
 * save the current canvas state
 */
Canvas.prototype.save = function() {

	this.context.save();

	return this;

};

/**
 * restore the canvas to the state is was when it was last saved
 */
Canvas.prototype.restore = function() {

	this.context.restore();

	return this;

};


/**
 * quick method for shifting over half a pixel
 * for smooth line drawing
 */
Canvas.prototype.shift = function() {

	if(!this.shifted) {
		this.context.translate(0.5, 0.5);
		this.shifted = true;
	}

	return this;

};

/**
 * undo a previous shift
 */
Canvas.prototype.unshift = function() {

	if(this.shifted) {
		this.context.translate(-0.5, -0.5);
		this.shifted = false;
	}

	return this;

};

/**
 * attach the canvas element to the DOM
 */
Canvas.prototype.appendTo = function(target) {

	if(target && this.element) {
		target.appendChild(this.element);
	}

	return this;

};


Canvas.prototype.clear = function (color) {

	var background = null;

	if(color) {
		// use the passed in color
		background = color;
	} else if(this.backgroundColor) {
		// otherwise, use the default
		background = this.backgroundColor;
	}

	// otherwise, clear to transparent
	if(!background) {

		this.context.clearRect(0,0,this.width, this.height);

	} else {

		// maintains existing fill style
		this.save();

		this.setFillStyle(background);
		this.fillRect(this.rect);

		this.restore();

	}

	return this;

};

Canvas.prototype.setOpacity = function( opacity ) {

	this.context.globalAlpha = opacity;

	return this;

};

Canvas.prototype.setGlobalCompositeOperation = function( operation ) {

	this.context.globalCompositeOperation = operation;

	return this;

};

Canvas.prototype.focus = function() {

	this.element.focus();

	return this;

};

Canvas.prototype.scale = function(v) {

	if(typeof v == 'number') { v = new Vector2(v,v); }

	this.context.scale(v.x, v.y);

	return this;

};

Canvas.prototype.setFillStyle = function( style ) {

	this.context.fillStyle = style;

	return this;

};

Canvas.prototype.setStrokeStyle = function( style ) {

	this.context.strokeStyle = style;

	return this;

};

Canvas.prototype.resize = function ( width, height ) {

	this.element.width = width;
	this.element.height = height;

	this.width = width;
	this.height = height;

	return this;

};

/**
 * draw a single pixel
 */
Canvas.prototype.drawPoint = function(point) {

	this.context.fillRect(
		point.x,
		point.y,
		1,1
	);

	return this;

};

/**
 * draws a Sprite object to the specified location
 */
Canvas.prototype.drawSprite = function ( sprite, location ) {

	if(!location) { location = Vector2.zero; }

	var destination = sprite.source.clone();

	destination.position = location.clone();

	if(sprite.origin) {

		destination.position.subtract(sprite.origin);

	}

	this.drawImage(
		sprite.image,
		sprite.source,
		destination
	);

	return this;

};

Canvas.prototype.drawImage = function( image, source, destination) {

	this.context.drawImage(
		image,
		source.position.x,
		source.position.y,
		source.width,
		source.height,
		destination.position.x,
		destination.position.y,
		destination.width,
		destination.height
	);

	return this;

};


Canvas.prototype.drawBuffer = function( buffer, position ) {

	if(!position) { position = Vector2.zero; }

	if(buffer.element) { buffer = buffer.element; }

	this.context.drawImage( buffer, position.x, position.y );

	return this;

};


/**
 * quickly set both family and size
 * calls setFontFamily and setFontSize
 */
Canvas.prototype.setFont = function( family, size ) {

	this.setFontFamily(family);
	this.setFontSize(size);

	return this;

};

/**
 * change canvas font family
 * creates css property and passes through to canvas
 */
Canvas.prototype.setFontFamily = function( family ) {

	this.fontFamily = family;

	this.font = this.fontSize + 'px ' + this.fontFamily;

	this.context.font = this.font;

	return this;

};

/**
 * change canvas font size
 * creates css property and passes through to canvas
 */
Canvas.prototype.setFontSize = function( size ) {

	this.fontSize = size;

	this.font = this.fontSize + 'px ' + this.fontFamily;

	this.context.font = this.font;

	return this;

};

/**
 * draw some text to the canvas
 * @param  {[type]} text     [description]
 * @param  {[type]} position [description]
 * @return {[type]}          [description]
 */
Canvas.prototype.drawText = function( text, position ) {

	if(!position) { position = Vector2,zero; }

	this.context.save();
	this.context.fillStyle = this.fontColor;
	this.context.fillText(text, position.x, position.y);
	this.context.restore();

	return this;

};

/**
 * draw a line on the canvas
 * @param  {[type]} start [description]
 * @param  {[type]} end   [description]
 * @return {[type]}       [description]
 */
Canvas.prototype.drawLine = function( line ) {

	this.context.beginPath();
	this.context.moveTo( line.start.x, line.start.y );
	this.context.lineTo( line.end.x, line.end.y );
	this.context.closePath();
	this.context.stroke();

	return this;

};


/**
 * draw a filled Circle
 * @param  {[type]} circle   [description]
 * @param  {[type]} position [description]
 * @return {[type]}          [description]
 */
Canvas.prototype.fillCircle = function( circle, position ) {

	if(!position) { position = circle.position; }

	this.context.beginPath();
	this.context.arc( position.x, position.y, circle.radius, 0, Math.PI * 2, true);
	this.context.closePath();
	this.context.fill();

	return this;

};

/**
 * draw a stroked Circle
 * @param  {[type]} circle   [description]
 * @param  {[type]} position [description]
 * @return {[type]}          [description]
 */
Canvas.prototype.strokeCircle = function( circle, position ) {

	if(!position) { position = circle.position; }

	this.context.beginPath();
	this.context.arc( position.x, position.y, circle.radius, 0, Math.PI * 2, true);
	this.context.closePath();
	this.context.stroke();

	return this;

};

/**
 * draw a Rect to the canvas using the current fillStyle
 * @param {Rect} rect a Rect to draw to the canvas
 * @param {Vector2} [position] where to draw the Rect. If ommited, uses rect.position
 */
Canvas.prototype.fillRect = function( rect, position ) {

	if( position === undefined ) { position = rect.position; }

	this.context.fillRect( position.x, position.y, rect.width, rect.height );

	return this;

};

Canvas.prototype.strokeRect = function( rect, position ) {

	if( position === undefined ) { position = rect.position; }

	this.context.strokeRect( position.x, position.y, rect.width, rect.height );

	return this;

};


Canvas.prototype.strokePolygon = function(polygon) {

	this.pathPolygon(polygon);
	this.context.stroke();

	return this;

};

Canvas.prototype.fillPolygon = function(polygon) {

	this.pathPolygon(polygon);
	this.context.fill();

	return this;

};

/**
 * draw a path using a Polygon
 * used to fill or stroke a polygon
 * @param  {[type]} polygon [description]
 * @return {[type]}         [description]
 */
Canvas.prototype.pathPolygon = function(polygon) {

	var vertex = polygon.vertices[0];

	this.context.beginPath();

	this.context.moveTo(vertex.x, vertex.y);

	for(var i = 1, len = polygon.vertices.length; i < len; i++) {

		vertex = polygon.vertices[i];

		this.context.lineTo(vertex.x, vertex.y);

	}

	this.context.closePath();

	return this;

};

Canvas.prototype.getRect = function() {

	return new Rect(this.width, this.height);

};

// commonjs export
module.exports = Canvas;
},{"./Rect":8,"./Vector2":10}],2:[function(require,module,exports){
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
},{"./Rect.js":8,"./Vector2.js":10,"./util.js":11}],3:[function(require,module,exports){
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
},{"./Circle.js":2,"./CollisionResponse.js":4,"./Rect.js":8,"./Vector2.js":10}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var Vector2 = require('./Vector2');

/**
 * Input
 * @constructor
 */
var Input = function() {

	this.down = {};
	this.pressed = {};
	this.mouse = {};
	this.listeners = {};
	this.lastKey = null;

};

/**
 * bind keyboard events to the given DOM element
 * @param  {HTMLElement} target the element to bind events to
 * @return {boolean} [description]
 */
Input.prototype.bindKeyboard = function(target) {

	if(!target) { return false; }

	var scope = this;

	target.addEventListener('keydown', function(e) { return scope.keyDownHandler(e); }, false);
	target.addEventListener('keyup', function(e) { return scope.keyUpHandler(e); }, false);

	return true;

};

Input.prototype.bindMouse = function(target) {

	if(!target) { return false; }

	this.target = target;

	var rect = target.getBoundingClientRect();

	this.targetPosition = new Vector2(rect.left, rect.top);
	this.mouse.position = new Vector2();

	var scope = this;

	target.addEventListener('mouseup', function(e) { return scope.mouseUpHandler(e); }, false);
	target.addEventListener('mousedown', function(e) { return scope.mouseDownHandler(e); }, false);
	target.addEventListener('mousemove', function(e) { return scope.mouseMoveHandler(e); }, false);
	target.addEventListener('mouseover', function(e) { scope.mouse.over = true; return false; }, false);
	target.addEventListener('mouseout', function(e) { scope.mouse.over = false; return false; }, false);
	target.addEventListener('touchstart', function(e) { scope.mouseMoveHandler(e); }, false);
	target.addEventListener('contextmenu', function(e) { e.preventDefault(); e.stopPropagation(); return false; }, false);

};



Input.prototype.keyDownHandler = function(e) {

	var code = e.keyCode;
	this.down[code] = true;
	this.lastKey = code;

	if(this.listeners[code]) {
		this.listeners[code](e);
	}

	if(this.listeners[Input.KEYBOARD_DOWN]) {
		this.listeners[code](e);
	}

	return false;

};

Input.prototype.keysDown = function() {

	return Object.keys(this.down).length;

};

Input.prototype.keyUpHandler = function(e) {

	var code = e.keyCode;
	delete this.down[code];

	if(this.listeners[code]) {
		this.listeners[code](e);
	}

	if(this.listeners[Input.KEYBOARD_UP]) {
		this.listeners[code](e);
	}

	return false;

};

Input.prototype.mouseMoveHandler = function(e) {

	this.mouse.position.x = e.clientX - this.targetPosition.x;
	this.mouse.position.y = e.clientY - this.targetPosition.y;

};

Input.prototype.mouseDownHandler = function(e) {

	var code = e.button;

	this.down[1000 + code] = true;

	listener = this.listeners[2000 + code];
	if(listener) { listener(this.mouse, e); }

};

Input.prototype.mouseUpHandler = function(e) {

	var listener,
		code = e.button;

	this.down[1000 + code] = false;

	listener = this.listeners[3000 + code];
	if(listener) { listener(this.mouse, e); }

};



Input.prototype.listen = function(event, fn, scope) {

	this.listeners[event] = function(arg) { fn.call(scope, arg); };

};

Input.prototype.on = Input.prototype.listen;

Input.prototype.clear = function() {

	this.pressed = {};

};

Input.prototype.isDown = function(key) {

	return this.down[key] == true;

};

/**
 * a list of keycodes used for input
 */
Input.KEY_BACKSPACE = 8;
Input.KEY_TAB = 9;
Input.KEY_ENTER = 13;
Input.KEY_PAUSE = 19;
Input.KEY_CAPS = 20;
Input.KEY_ESC = 27;
Input.KEY_SPACE = 32;
Input.KEY_PAGE_UP = 33;
Input.KEY_PAGE_DOWN = 34;
Input.KEY_END = 35;
Input.KEY_HOME = 36;
Input.KEY_ARROW_LEFT = 37;
Input.KEY_ARROW_UP = 38;
Input.KEY_ARROW_RIGHT = 39;
Input.KEY_ARROW_DOWN = 40;
Input.KEY_INSERT = 45;
Input.KEY_DELETE = 46;
Input.KEY_0 = 48;
Input.KEY_1 = 49;
Input.KEY_2 = 50;
Input.KEY_3 = 51;
Input.KEY_4 = 52;
Input.KEY_5 = 53;
Input.KEY_6 = 54;
Input.KEY_7 = 55;
Input.KEY_8 = 56;
Input.KEY_9 = 57;
Input.KEY_A = 65;
Input.KEY_B = 66;
Input.KEY_C = 67;
Input.KEY_D = 68;
Input.KEY_E = 69;
Input.KEY_F = 70;
Input.KEY_G = 71;
Input.KEY_H = 72;
Input.KEY_I = 73;
Input.KEY_J = 74;
Input.KEY_K = 75;
Input.KEY_L = 76;
Input.KEY_M = 77;
Input.KEY_N = 78;
Input.KEY_O = 79;
Input.KEY_P = 80;
Input.KEY_Q = 81;
Input.KEY_R = 82;
Input.KEY_S = 83;
Input.KEY_T = 84;
Input.KEY_U = 85;
Input.KEY_V = 86;
Input.KEY_W = 87;
Input.KEY_X = 88;
Input.KEY_Y = 89;
Input.KEY_Z = 90;
Input.KEY_NUM_0 = 96;
Input.KEY_NUM_1 = 97;
Input.KEY_NUM_2 = 98;
Input.KEY_NUM_3 = 99;
Input.KEY_NUM_4 = 100;
Input.KEY_NUM_5 = 101;
Input.KEY_NUM_6 = 102;
Input.KEY_NUM_7 = 103;
Input.KEY_NUM_8 = 104;
Input.KEY_NUM_9 = 105;
Input.KEY_MULTIPLY = 106;
Input.KEY_NUM_PLUS = 107;
Input.KEY_NUM_MINUS = 109;
Input.KEY_DECIMAL = 110;
Input.KEY_DIVIDE = 111;
Input.KEY_F1 = 112;
Input.KEY_F2 = 113;
Input.KEY_F3 = 114;
Input.KEY_F4 = 115;
Input.KEY_F5 = 116;
Input.KEY_F6 = 117;
Input.KEY_F7 = 118;
Input.KEY_F8 = 119;
Input.KEY_F9 = 120;
Input.KEY_F10 = 121;
Input.KEY_F11 = 122;
Input.KEY_F12 = 123;
Input.KEY_SHIFT = 16;
Input.KEY_CTRL = 17;
Input.KEY_ALT = 18;
Input.KEY_PLUS = 187;
Input.KEY_COMMA = 188;
Input.KEY_MINUS = 189;
Input.KEY_PERIOD = 190;

/** mouse events */
Input.MOUSE_LEFT = 1000;
Input.MOUSE_LEFT_DOWN = 2000;
Input.MOUSE_LEFT_UP = 3000;
Input.MOUSE_LEFT_CLICK = 4000;
Input.MOUSE_MIDDLE = 1001;
Input.MOUSE_MIDDLE_DOWN = 2001;
Input.MOUSE_MIDDLE_UP = 3001;
Input.MOUSE_MIDDLE_CLICK = 4001;
Input.MOUSE_RIGHT = 1002;
Input.MOUSE_RIGHT_DOWN = 2002;
Input.MOUSE_RIGHT_UP = 3002;
Input.MOUSE_RIGHT_CLICK = 4002;
Input.KEYBOARD_DOWN = 1005;
Input.KEYBOARD_UP = 1006;

// commonjs export
module.exports = Input;
},{"./Vector2":10}],6:[function(require,module,exports){
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
},{"./util.js":11}],7:[function(require,module,exports){
/**
 * A Loader takes care of loading assets into your game.
 * @constructor
 * @param {Array} [assets] a list of assets to load
 */
var Loader = function(assets) {

	this.queue = [];
	this.assets = {};
	this.total = 0;
	this.done = 0;
	this.onComplete = null;

	if(assets) {
		this.add(assets);
	}

};


/**
 * load the next asset
 * if there isn't one, end
 */
Loader.prototype.loadNext = function() {

	var next = this.queue.shift();

	if(next) {

		this.loadAsset(next);

	}

	return this;

};

/**
 * load the passed in asset
 * and attach all events
 */
Loader.prototype.loadAsset = function(src) {

	var type = this.getFileType(src),
		asset,
		eventTarget,
		loadEvent,
		scope = this;

	switch(type) {

		case 'jpg' :
		case 'gif' :
		case 'png' :
			asset = new Image();
			asset.src = src;
			eventTarget = asset;
			loadEvent = 'load';
			break;

		case 'ogg' :
		case 'mp3' :
		case 'wav' :
			asset = new Audio(src);
			eventTarget = asset.audio;
			loadEvent = 'loadeddata';
			break;

		case 'json' :
			this.ajaxLoad(src, function(data, e) { scope.assetLoaded(data, src, e); });
			eventTarget = null;
			break;

		default:
			console.error('unknown file format');
			eventTarget = null;
			break;

	}

	if(eventTarget) {
		eventTarget.addEventListener(loadEvent, function(e) { scope.assetLoaded(asset, src, e); });
		eventTarget.addEventListener('error', function(e) { scope.assetNotLoaded(asset, src, e); });
	}

	return this.loadNext();

};

Loader.prototype.ajaxLoad = function(src, callback) {

	var request = new XMLHttpRequest();

	request.onreadystatechange = function(e) {

		if ((e.currentTarget.readyState === 4) && (e.currentTarget.status === 200 || e.currentTarget.status === 0)) {

			var data = JSON.parse(e.currentTarget.responseText);
			callback(data, src, e);

		}
	};

	request.open('GET', src, true);
	request.send(null);

};

/**
 * called every time an asset loads succesfully
 */
Loader.prototype.assetLoaded = function(asset, src, event) {

	this.assets[src] = asset;

	if(++this.done >= this.total) { this.complete(); }

};

/**
 * called every time an asset does not load
 */
Loader.prototype.assetNotLoaded = function(asset, src, event) {

	if(++this.done == this.total) { this.complete(); }

};

/**
 * called once everything has loaded
 */
Loader.prototype.complete = function() {

	// reset everything
	this.queue = [];
	this.total = 0;
	this.done = 0;

	if(typeof this.onComplete == 'function') { this.onComplete(this.assets); }

};

Loader.prototype.getFileType = function( src ) {

	var ext = src.split('.').pop();

	if(ext == src) { return false; }

	return ext;

};


/**
 * percentage complete
 */
Loader.prototype.progress = function() {

	return ( 100 / this.total ) * this.done;

};


/**
 * add an asset or assets to the queue
 * @param {String|Array} assets one or more urls
 */
Loader.prototype.add = function(assets) {

	if(typeof assets != 'object') { assets = [assets]; }

	for(var i = 0, len = assets.length; i < len; i++) {

		this.queue.push(assets[i]);

		// placeholder until loaded
		assets[assets[i]] = false;

		this.total++;

	}

	return this;

};

Loader.prototype.setOnLoad = function(callback) {

	this.onComplete = callback;

	return this;

};

/**
 * start loading
 */
Loader.prototype.load = function(assets, callback) {

    if(assets) {

		this.add(assets);

	}

    if(callback) {

		this.onComplete = callback;

    }

	if(!this.queue.length) {

		return this.complete();

	}

	return this.loadNext();

};

// commonjs export
module.exports = Loader;
},{}],8:[function(require,module,exports){
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
},{"./Line":6,"./Vector2":10,"./util.js":11}],9:[function(require,module,exports){
var Rect = require('./Rect');
var Vector2 = require('./Vector2');

/**
 * Sprite
 * @constructor
 * @param  {Image} an image
 * @param  {Rect} the sub area of the image which constitutes the sprite
 */
var Sprite = function(image, source) {

	if(!image) { image = Sprite.defaultImage; }

	if(!source) {
		source = new Rect(image.width, image.height);
	}

	this.image = image;

	// the sub region of the image to draw
	this.source = source;

	// default to top left drawing origin
	this.origin = new Vector2();

};

/**
 * sets the origin, which is the point the sprtie is drawn around
 * default behaviour is top left corner
 */
Sprite.prototype.setOrigin = function ( origin ) {

	// allow specific origin
	if (origin instanceof Vector2) {

		this.origin = origin;

	} else if(origin == Sprite.ORIGIN_BOTTOM_CENTER) {

		this.origin = new Vector2( this.source.width / 2, this.source.height ).floor();

	} else if(origin == Sprite.ORIGIN_CENTER) {

		this.origin = new Vector2( this.source.width / 2, this.source.height / 2 ).floor();

	} else if(origin == Sprite.TOP_LEFT) {

		this.origin = new Vector2();

	}

	return this;

};

/**
 * static defines for this class
 */
Sprite.ORIGIN_TOP_LEFT = 0;
Sprite.ORIGIN_BOTTOM_CENTER = 1;
Sprite.ORIGIN_CENTER = 2;

/**
 * Slice an image up into smaller sprites
 * @static
 * @param  {Image} image the image to slice up
 * @param  {Number} width the width of each sprite
 * @param  {Number} height the height of each sprite
 * @return {Sprite[]} an array of sprites
 */
Sprite.slice = function(image, width, height, origin) {

	// handle a list of rects
	if(typeof width == 'object') {

		var rects = width, sprites = {};

		rects.forEach(function(data){

			var name = data[0];
			var source = Rect.fromArray(data.slice(1,5));
			var sprite = new Sprite(image, source);

			if(data[5] != undefined && data[6] != undefined) {

				sprite.setOrigin( Vector2.fromArray(data.slice(5,7)) );

			}

			sprites[name] = sprite;

		}, this);

	// or just slice it up on a grid
	} else {

		var x, y, position, source, sprite, sprites = [];

		for(y = 0; y < image.height; y += height) {

			for(x = 0; x < image.width; x += width) {

				position = new Vector2(x, y);
				source = new Rect(width, height, position);
				sprite = new Sprite(image, source);

				if(origin) {
					sprite.setOrigin(origin);
				}

				sprites.push(sprite);

			}

		}

	}

	return sprites;

};

Sprite.solidColor = function(color, width, height) {

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	canvas.width = width || 1;
	canvas.height = height || 1;

	ctx.fillStyle = color;
	ctx.fillRect(0,0,1,1);

	return new Sprite(canvas);

};

/**
 * small transparent gif to use as a default
 * @static
 * @type {Image}
 */
Sprite.defaultImage = new Image();
Sprite.defaultImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// commonjs export
module.exports = Sprite;
},{"./Rect":8,"./Vector2":10}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
var Loader = require('./lib/Loader.js');
var Sprite = require('./lib/Sprite.js');
var Canvas = require('./lib/Canvas.js');
var Input = require('./lib/Input.js');
var Vector2 = require('./lib/Vector2.js');
var util = require('./lib/util.js');
var Circle = require('./lib/Circle.js');
var Collision = require('./lib/Collision.js');

game = {

	bootstrap : function() {

		var element = document.getElementById('game');
		var self = this;

		this.canvas = new Canvas(384,640);
		this.canvas.appendTo(element).focus();

		this.input = new Input();
		this.input.bindMouse(element);

		this.loader = new Loader();
		this.loader.load( [
			'/img/dishwasher_bg.png',
			'/img/plate.png'
		], function(assets) { self.init(assets); });

	},

	init : function(assets) {

		this.background = new Sprite(assets['/img/dishwasher_bg.png']);

		var plateSprite = new Sprite(assets['/img/plate.png']);
		plateSprite.setOrigin(Sprite.ORIGIN_CENTER);

		this.plate = {
			sprite : plateSprite,
			shape : new Circle(50, new Vector2(100,300))
		};

		this.input.on(Input.MOUSE_LEFT_DOWN, function(mouse) {

			if(Collision.pointCircle(mouse.position, this.plate.shape)) {
				this.dragging = this.plate;
				this.dragOffset = mouse.position._subtract(this.plate.shape.position);
			}

		}, this);

		this.input.on(Input.MOUSE_LEFT_UP, function(mouse) {
			
			this.dragging = null;

		}, this);

		util.requestAnimationFrame(this.draw.bind(this));
		setInterval(this.update.bind(this), 20);
	},

	update : function() {

		if(this.dragging) {
			
			var pos = this.input.mouse.position._subtract(this.dragOffset);		
			this.plate.shape.position.set(pos);

		}

	},

	draw : function() {

		this.canvas.drawSprite(this.background);
		this.canvas.drawSprite(this.plate.sprite, this.plate.shape.position);
		//this.canvas.fillCircle(this.plate.shape);

		util.requestAnimationFrame(this.draw.bind(this));
	}

};

window.addEventListener('load', function() { game.bootstrap() });
},{"./lib/Canvas.js":1,"./lib/Circle.js":2,"./lib/Collision.js":3,"./lib/Input.js":5,"./lib/Loader.js":7,"./lib/Sprite.js":9,"./lib/Vector2.js":10,"./lib/util.js":11}]},{},[12])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJjOlxcVXNlcnNcXFN0dWFydFxcRG9jdW1lbnRzXFxNeSBEcm9wYm94XFxQcm9qZWN0c1xcTEQ0OFxcMjdcXHJlcG9cXGpzXFxsaWJcXENhbnZhcy5qcyIsImM6XFxVc2Vyc1xcU3R1YXJ0XFxEb2N1bWVudHNcXE15IERyb3Bib3hcXFByb2plY3RzXFxMRDQ4XFwyN1xccmVwb1xcanNcXGxpYlxcQ2lyY2xlLmpzIiwiYzpcXFVzZXJzXFxTdHVhcnRcXERvY3VtZW50c1xcTXkgRHJvcGJveFxcUHJvamVjdHNcXExENDhcXDI3XFxyZXBvXFxqc1xcbGliXFxDb2xsaXNpb24uanMiLCJjOlxcVXNlcnNcXFN0dWFydFxcRG9jdW1lbnRzXFxNeSBEcm9wYm94XFxQcm9qZWN0c1xcTEQ0OFxcMjdcXHJlcG9cXGpzXFxsaWJcXENvbGxpc2lvblJlc3BvbnNlLmpzIiwiYzpcXFVzZXJzXFxTdHVhcnRcXERvY3VtZW50c1xcTXkgRHJvcGJveFxcUHJvamVjdHNcXExENDhcXDI3XFxyZXBvXFxqc1xcbGliXFxJbnB1dC5qcyIsImM6XFxVc2Vyc1xcU3R1YXJ0XFxEb2N1bWVudHNcXE15IERyb3Bib3hcXFByb2plY3RzXFxMRDQ4XFwyN1xccmVwb1xcanNcXGxpYlxcTGluZS5qcyIsImM6XFxVc2Vyc1xcU3R1YXJ0XFxEb2N1bWVudHNcXE15IERyb3Bib3hcXFByb2plY3RzXFxMRDQ4XFwyN1xccmVwb1xcanNcXGxpYlxcTG9hZGVyLmpzIiwiYzpcXFVzZXJzXFxTdHVhcnRcXERvY3VtZW50c1xcTXkgRHJvcGJveFxcUHJvamVjdHNcXExENDhcXDI3XFxyZXBvXFxqc1xcbGliXFxSZWN0LmpzIiwiYzpcXFVzZXJzXFxTdHVhcnRcXERvY3VtZW50c1xcTXkgRHJvcGJveFxcUHJvamVjdHNcXExENDhcXDI3XFxyZXBvXFxqc1xcbGliXFxTcHJpdGUuanMiLCJjOlxcVXNlcnNcXFN0dWFydFxcRG9jdW1lbnRzXFxNeSBEcm9wYm94XFxQcm9qZWN0c1xcTEQ0OFxcMjdcXHJlcG9cXGpzXFxsaWJcXFZlY3RvcjIuanMiLCJjOlxcVXNlcnNcXFN0dWFydFxcRG9jdW1lbnRzXFxNeSBEcm9wYm94XFxQcm9qZWN0c1xcTEQ0OFxcMjdcXHJlcG9cXGpzXFxsaWJcXHV0aWwuanMiLCJjOlxcVXNlcnNcXFN0dWFydFxcRG9jdW1lbnRzXFxNeSBEcm9wYm94XFxQcm9qZWN0c1xcTEQ0OFxcMjdcXHJlcG9cXGpzXFxtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBSZWN0ID0gcmVxdWlyZSgnLi9SZWN0Jyk7XHJcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi9WZWN0b3IyJyk7XHJcblxyXG4vKipcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIG1vc3RseSBjaGFpbmFibGUgd3JhcHBlcnMgYXJvdW5kIGV4aXN0aW5nIGNhbnZhcyBmdW5jdGlvbnNcclxuICogYWxzbyBhZGRzIGNvbnZlbmllbmNlIGZ1bmN0aW9ucyB3aGljaCB0YWtlIG90aGVyIGNsYXNzZXMgYXMgYXJndW1lbnRzXHJcbiAqIHN1Y2ggYXMgVmVjdG9yMidzIGFuZCBSZWN0c1xyXG4gKiBAdG9kbyBhZGQgZml4ZWQgcG9zaXRpb24gZHJhd2luZyAodG9wIGxlZnQgZXRjKVxyXG4gKiBAdG9kbyBhZGQgc2NhbGluZyBmb3IgZGlmZmVyZW50IHNjcmVlbiBzaXplcyAoY3NzMz8pXHJcbiAqL1xyXG5DYW52YXMgPSBmdW5jdGlvbiAoIHdpZHRoLCBoZWlnaHQgKSB7XHJcblxyXG5cdHRoaXMud2lkdGggPSB3aWR0aCB8fCAzMjA7XHJcblx0dGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMjQwO1xyXG5cclxuXHR0aGlzLnJlY3QgPSBuZXcgUmVjdCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcblxyXG5cdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG5cdHRoaXMuY29udGV4dCA9IHRoaXMuZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuXHQvLyBmaXhlcyB3ZWlyZCBjYW52YXMgYnVnXHJcblx0dGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAwKTtcclxuXHJcblx0dGhpcy5lbGVtZW50LnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XHJcblx0dGhpcy5lbGVtZW50LndpZHRoID0gdGhpcy53aWR0aDtcclxuXHR0aGlzLmVsZW1lbnQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcblxyXG5cdC8vIGFsbG93cyBwaXhlbGF0ZWQgc2NhbGluZywgWUFZIVxyXG5cdHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSB0aGlzLmNvbnRleHQud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gdGhpcy5jb250ZXh0Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuXHQvLyBub3Qgc3VyZT9cclxuXHR0aGlzLmNvbnRleHQudGV4dEJhc2VsaW5lID0gJ3RvcCc7XHJcblxyXG5cdHRoaXMuYmFja2dyb3VuZENvbG9yID0gbnVsbDtcclxuXHR0aGlzLmZvbnRGYW1pbHkgPSAnQXJpYWwnO1xyXG5cdHRoaXMuZm9udFNpemUgPSAxMjtcclxuXHR0aGlzLmZvbnRDb2xvciA9ICcjMDAwMDAwJztcclxuXHJcblx0dGhpcy5zaGlmdGVkID0gZmFsc2U7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHRyYW5zbGF0ZXMgdGhlIGNhbnZhcyBkcmF3aW5nIGNvbnRleHRcclxuICogQHBhcmFtIHtWZWN0b3IyfSB2IGEgdmVjdG9yIGRlc3JpYmluZyB0aGUgdHJhbnNsYXRpb25cclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUudHJhbnNsYXRlID0gZnVuY3Rpb24odikge1xyXG5cclxuXHR0aGlzLmNvbnRleHQudHJhbnNsYXRlKHYueCwgdi55KTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHJvdGF0ZXMgdGhlIGNhbnZhcyBkcmF3aW5nIGNvbnRleHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHIgYW1vdXQgaW4gcmFkaWFucyB0byByb3RhdGUgYnlcclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24ocikge1xyXG5cclxuXHR0aGlzLmNvbnRleHQucm90YXRlKHIpO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogcm90YXRlcyB0aGUgY2FudmFzIGRyYXdpbmcgY29udGV4dCBhcm91bmQgYSBwb2ludFxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IHRvIHJvdGF0ZSBhcm91bmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHIgYW1vdXQgaW4gcmFkaWFucyB0byByb3RhdGUgYnlcclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUucm90YXRlQXJvdW5kID0gZnVuY3Rpb24ocG9pbnQsIHIpIHtcclxuXHJcblx0dGhpcy50cmFuc2xhdGUocG9pbnQpO1xyXG5cdHRoaXMuY29udGV4dC5yb3RhdGUocik7XHJcblx0dGhpcy50cmFuc2xhdGUocG9pbnQuX2ludmVydCgpKTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBzYXZlIHRoZSBjdXJyZW50IGNhbnZhcyBzdGF0ZVxyXG4gKi9cclxuQ2FudmFzLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHRoaXMuY29udGV4dC5zYXZlKCk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiByZXN0b3JlIHRoZSBjYW52YXMgdG8gdGhlIHN0YXRlIGlzIHdhcyB3aGVuIGl0IHdhcyBsYXN0IHNhdmVkXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0dGhpcy5jb250ZXh0LnJlc3RvcmUoKTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBxdWljayBtZXRob2QgZm9yIHNoaWZ0aW5nIG92ZXIgaGFsZiBhIHBpeGVsXHJcbiAqIGZvciBzbW9vdGggbGluZSBkcmF3aW5nXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLnNoaWZ0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdGlmKCF0aGlzLnNoaWZ0ZWQpIHtcclxuXHRcdHRoaXMuY29udGV4dC50cmFuc2xhdGUoMC41LCAwLjUpO1xyXG5cdFx0dGhpcy5zaGlmdGVkID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiB1bmRvIGEgcHJldmlvdXMgc2hpZnRcclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRpZih0aGlzLnNoaWZ0ZWQpIHtcclxuXHRcdHRoaXMuY29udGV4dC50cmFuc2xhdGUoLTAuNSwgLTAuNSk7XHJcblx0XHR0aGlzLnNoaWZ0ZWQgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhdHRhY2ggdGhlIGNhbnZhcyBlbGVtZW50IHRvIHRoZSBET01cclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbih0YXJnZXQpIHtcclxuXHJcblx0aWYodGFyZ2V0ICYmIHRoaXMuZWxlbWVudCkge1xyXG5cdFx0dGFyZ2V0LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIChjb2xvcikge1xyXG5cclxuXHR2YXIgYmFja2dyb3VuZCA9IG51bGw7XHJcblxyXG5cdGlmKGNvbG9yKSB7XHJcblx0XHQvLyB1c2UgdGhlIHBhc3NlZCBpbiBjb2xvclxyXG5cdFx0YmFja2dyb3VuZCA9IGNvbG9yO1xyXG5cdH0gZWxzZSBpZih0aGlzLmJhY2tncm91bmRDb2xvcikge1xyXG5cdFx0Ly8gb3RoZXJ3aXNlLCB1c2UgdGhlIGRlZmF1bHRcclxuXHRcdGJhY2tncm91bmQgPSB0aGlzLmJhY2tncm91bmRDb2xvcjtcclxuXHR9XHJcblxyXG5cdC8vIG90aGVyd2lzZSwgY2xlYXIgdG8gdHJhbnNwYXJlbnRcclxuXHRpZighYmFja2dyb3VuZCkge1xyXG5cclxuXHRcdHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwwLHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcblx0fSBlbHNlIHtcclxuXHJcblx0XHQvLyBtYWludGFpbnMgZXhpc3RpbmcgZmlsbCBzdHlsZVxyXG5cdFx0dGhpcy5zYXZlKCk7XHJcblxyXG5cdFx0dGhpcy5zZXRGaWxsU3R5bGUoYmFja2dyb3VuZCk7XHJcblx0XHR0aGlzLmZpbGxSZWN0KHRoaXMucmVjdCk7XHJcblxyXG5cdFx0dGhpcy5yZXN0b3JlKCk7XHJcblxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5zZXRPcGFjaXR5ID0gZnVuY3Rpb24oIG9wYWNpdHkgKSB7XHJcblxyXG5cdHRoaXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IG9wYWNpdHk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbkNhbnZhcy5wcm90b3R5cGUuc2V0R2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gZnVuY3Rpb24oIG9wZXJhdGlvbiApIHtcclxuXHJcblx0dGhpcy5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IG9wZXJhdGlvbjtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5mb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR0aGlzLmVsZW1lbnQuZm9jdXMoKTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uKHYpIHtcclxuXHJcblx0aWYodHlwZW9mIHYgPT0gJ251bWJlcicpIHsgdiA9IG5ldyBWZWN0b3IyKHYsdik7IH1cclxuXHJcblx0dGhpcy5jb250ZXh0LnNjYWxlKHYueCwgdi55KTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5zZXRGaWxsU3R5bGUgPSBmdW5jdGlvbiggc3R5bGUgKSB7XHJcblxyXG5cdHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBzdHlsZTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5zZXRTdHJva2VTdHlsZSA9IGZ1bmN0aW9uKCBzdHlsZSApIHtcclxuXHJcblx0dGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gc3R5bGU7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbkNhbnZhcy5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCB3aWR0aCwgaGVpZ2h0ICkge1xyXG5cclxuXHR0aGlzLmVsZW1lbnQud2lkdGggPSB3aWR0aDtcclxuXHR0aGlzLmVsZW1lbnQuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuXHR0aGlzLndpZHRoID0gd2lkdGg7XHJcblx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBkcmF3IGEgc2luZ2xlIHBpeGVsXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLmRyYXdQb2ludCA9IGZ1bmN0aW9uKHBvaW50KSB7XHJcblxyXG5cdHRoaXMuY29udGV4dC5maWxsUmVjdChcclxuXHRcdHBvaW50LngsXHJcblx0XHRwb2ludC55LFxyXG5cdFx0MSwxXHJcblx0KTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGRyYXdzIGEgU3ByaXRlIG9iamVjdCB0byB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLmRyYXdTcHJpdGUgPSBmdW5jdGlvbiAoIHNwcml0ZSwgbG9jYXRpb24gKSB7XHJcblxyXG5cdGlmKCFsb2NhdGlvbikgeyBsb2NhdGlvbiA9IFZlY3RvcjIuemVybzsgfVxyXG5cclxuXHR2YXIgZGVzdGluYXRpb24gPSBzcHJpdGUuc291cmNlLmNsb25lKCk7XHJcblxyXG5cdGRlc3RpbmF0aW9uLnBvc2l0aW9uID0gbG9jYXRpb24uY2xvbmUoKTtcclxuXHJcblx0aWYoc3ByaXRlLm9yaWdpbikge1xyXG5cclxuXHRcdGRlc3RpbmF0aW9uLnBvc2l0aW9uLnN1YnRyYWN0KHNwcml0ZS5vcmlnaW4pO1xyXG5cclxuXHR9XHJcblxyXG5cdHRoaXMuZHJhd0ltYWdlKFxyXG5cdFx0c3ByaXRlLmltYWdlLFxyXG5cdFx0c3ByaXRlLnNvdXJjZSxcclxuXHRcdGRlc3RpbmF0aW9uXHJcblx0KTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5kcmF3SW1hZ2UgPSBmdW5jdGlvbiggaW1hZ2UsIHNvdXJjZSwgZGVzdGluYXRpb24pIHtcclxuXHJcblx0dGhpcy5jb250ZXh0LmRyYXdJbWFnZShcclxuXHRcdGltYWdlLFxyXG5cdFx0c291cmNlLnBvc2l0aW9uLngsXHJcblx0XHRzb3VyY2UucG9zaXRpb24ueSxcclxuXHRcdHNvdXJjZS53aWR0aCxcclxuXHRcdHNvdXJjZS5oZWlnaHQsXHJcblx0XHRkZXN0aW5hdGlvbi5wb3NpdGlvbi54LFxyXG5cdFx0ZGVzdGluYXRpb24ucG9zaXRpb24ueSxcclxuXHRcdGRlc3RpbmF0aW9uLndpZHRoLFxyXG5cdFx0ZGVzdGluYXRpb24uaGVpZ2h0XHJcblx0KTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuXHJcbkNhbnZhcy5wcm90b3R5cGUuZHJhd0J1ZmZlciA9IGZ1bmN0aW9uKCBidWZmZXIsIHBvc2l0aW9uICkge1xyXG5cclxuXHRpZighcG9zaXRpb24pIHsgcG9zaXRpb24gPSBWZWN0b3IyLnplcm87IH1cclxuXHJcblx0aWYoYnVmZmVyLmVsZW1lbnQpIHsgYnVmZmVyID0gYnVmZmVyLmVsZW1lbnQ7IH1cclxuXHJcblx0dGhpcy5jb250ZXh0LmRyYXdJbWFnZSggYnVmZmVyLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55ICk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcblxyXG4vKipcclxuICogcXVpY2tseSBzZXQgYm90aCBmYW1pbHkgYW5kIHNpemVcclxuICogY2FsbHMgc2V0Rm9udEZhbWlseSBhbmQgc2V0Rm9udFNpemVcclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUuc2V0Rm9udCA9IGZ1bmN0aW9uKCBmYW1pbHksIHNpemUgKSB7XHJcblxyXG5cdHRoaXMuc2V0Rm9udEZhbWlseShmYW1pbHkpO1xyXG5cdHRoaXMuc2V0Rm9udFNpemUoc2l6ZSk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBjaGFuZ2UgY2FudmFzIGZvbnQgZmFtaWx5XHJcbiAqIGNyZWF0ZXMgY3NzIHByb3BlcnR5IGFuZCBwYXNzZXMgdGhyb3VnaCB0byBjYW52YXNcclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUuc2V0Rm9udEZhbWlseSA9IGZ1bmN0aW9uKCBmYW1pbHkgKSB7XHJcblxyXG5cdHRoaXMuZm9udEZhbWlseSA9IGZhbWlseTtcclxuXHJcblx0dGhpcy5mb250ID0gdGhpcy5mb250U2l6ZSArICdweCAnICsgdGhpcy5mb250RmFtaWx5O1xyXG5cclxuXHR0aGlzLmNvbnRleHQuZm9udCA9IHRoaXMuZm9udDtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNoYW5nZSBjYW52YXMgZm9udCBzaXplXHJcbiAqIGNyZWF0ZXMgY3NzIHByb3BlcnR5IGFuZCBwYXNzZXMgdGhyb3VnaCB0byBjYW52YXNcclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUuc2V0Rm9udFNpemUgPSBmdW5jdGlvbiggc2l6ZSApIHtcclxuXHJcblx0dGhpcy5mb250U2l6ZSA9IHNpemU7XHJcblxyXG5cdHRoaXMuZm9udCA9IHRoaXMuZm9udFNpemUgKyAncHggJyArIHRoaXMuZm9udEZhbWlseTtcclxuXHJcblx0dGhpcy5jb250ZXh0LmZvbnQgPSB0aGlzLmZvbnQ7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBkcmF3IHNvbWUgdGV4dCB0byB0aGUgY2FudmFzXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gdGV4dCAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IHBvc2l0aW9uIFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLmRyYXdUZXh0ID0gZnVuY3Rpb24oIHRleHQsIHBvc2l0aW9uICkge1xyXG5cclxuXHRpZighcG9zaXRpb24pIHsgcG9zaXRpb24gPSBWZWN0b3IyLHplcm87IH1cclxuXHJcblx0dGhpcy5jb250ZXh0LnNhdmUoKTtcclxuXHR0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5mb250Q29sb3I7XHJcblx0dGhpcy5jb250ZXh0LmZpbGxUZXh0KHRleHQsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xyXG5cdHRoaXMuY29udGV4dC5yZXN0b3JlKCk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBkcmF3IGEgbGluZSBvbiB0aGUgY2FudmFzXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gc3RhcnQgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IGVuZCAgIFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLmRyYXdMaW5lID0gZnVuY3Rpb24oIGxpbmUgKSB7XHJcblxyXG5cdHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcclxuXHR0aGlzLmNvbnRleHQubW92ZVRvKCBsaW5lLnN0YXJ0LngsIGxpbmUuc3RhcnQueSApO1xyXG5cdHRoaXMuY29udGV4dC5saW5lVG8oIGxpbmUuZW5kLngsIGxpbmUuZW5kLnkgKTtcclxuXHR0aGlzLmNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0dGhpcy5jb250ZXh0LnN0cm9rZSgpO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIGRyYXcgYSBmaWxsZWQgQ2lyY2xlXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gY2lyY2xlICAgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IHBvc2l0aW9uIFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLmZpbGxDaXJjbGUgPSBmdW5jdGlvbiggY2lyY2xlLCBwb3NpdGlvbiApIHtcclxuXHJcblx0aWYoIXBvc2l0aW9uKSB7IHBvc2l0aW9uID0gY2lyY2xlLnBvc2l0aW9uOyB9XHJcblxyXG5cdHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcclxuXHR0aGlzLmNvbnRleHQuYXJjKCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBjaXJjbGUucmFkaXVzLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcblx0dGhpcy5jb250ZXh0LmNsb3NlUGF0aCgpO1xyXG5cdHRoaXMuY29udGV4dC5maWxsKCk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBkcmF3IGEgc3Ryb2tlZCBDaXJjbGVcclxuICogQHBhcmFtICB7W3R5cGVdfSBjaXJjbGUgICBbZGVzY3JpcHRpb25dXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gcG9zaXRpb24gW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbkNhbnZhcy5wcm90b3R5cGUuc3Ryb2tlQ2lyY2xlID0gZnVuY3Rpb24oIGNpcmNsZSwgcG9zaXRpb24gKSB7XHJcblxyXG5cdGlmKCFwb3NpdGlvbikgeyBwb3NpdGlvbiA9IGNpcmNsZS5wb3NpdGlvbjsgfVxyXG5cclxuXHR0aGlzLmNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0dGhpcy5jb250ZXh0LmFyYyggcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgY2lyY2xlLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xyXG5cdHRoaXMuY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHR0aGlzLmNvbnRleHQuc3Ryb2tlKCk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBkcmF3IGEgUmVjdCB0byB0aGUgY2FudmFzIHVzaW5nIHRoZSBjdXJyZW50IGZpbGxTdHlsZVxyXG4gKiBAcGFyYW0ge1JlY3R9IHJlY3QgYSBSZWN0IHRvIGRyYXcgdG8gdGhlIGNhbnZhc1xyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IFtwb3NpdGlvbl0gd2hlcmUgdG8gZHJhdyB0aGUgUmVjdC4gSWYgb21taXRlZCwgdXNlcyByZWN0LnBvc2l0aW9uXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLmZpbGxSZWN0ID0gZnVuY3Rpb24oIHJlY3QsIHBvc2l0aW9uICkge1xyXG5cclxuXHRpZiggcG9zaXRpb24gPT09IHVuZGVmaW5lZCApIHsgcG9zaXRpb24gPSByZWN0LnBvc2l0aW9uOyB9XHJcblxyXG5cdHRoaXMuY29udGV4dC5maWxsUmVjdCggcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcmVjdC53aWR0aCwgcmVjdC5oZWlnaHQgKTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5zdHJva2VSZWN0ID0gZnVuY3Rpb24oIHJlY3QsIHBvc2l0aW9uICkge1xyXG5cclxuXHRpZiggcG9zaXRpb24gPT09IHVuZGVmaW5lZCApIHsgcG9zaXRpb24gPSByZWN0LnBvc2l0aW9uOyB9XHJcblxyXG5cdHRoaXMuY29udGV4dC5zdHJva2VSZWN0KCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCByZWN0LndpZHRoLCByZWN0LmhlaWdodCApO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5zdHJva2VQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbikge1xyXG5cclxuXHR0aGlzLnBhdGhQb2x5Z29uKHBvbHlnb24pO1xyXG5cdHRoaXMuY29udGV4dC5zdHJva2UoKTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuQ2FudmFzLnByb3RvdHlwZS5maWxsUG9seWdvbiA9IGZ1bmN0aW9uKHBvbHlnb24pIHtcclxuXHJcblx0dGhpcy5wYXRoUG9seWdvbihwb2x5Z29uKTtcclxuXHR0aGlzLmNvbnRleHQuZmlsbCgpO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogZHJhdyBhIHBhdGggdXNpbmcgYSBQb2x5Z29uXHJcbiAqIHVzZWQgdG8gZmlsbCBvciBzdHJva2UgYSBwb2x5Z29uXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gcG9seWdvbiBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5DYW52YXMucHJvdG90eXBlLnBhdGhQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbikge1xyXG5cclxuXHR2YXIgdmVydGV4ID0gcG9seWdvbi52ZXJ0aWNlc1swXTtcclxuXHJcblx0dGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cclxuXHR0aGlzLmNvbnRleHQubW92ZVRvKHZlcnRleC54LCB2ZXJ0ZXgueSk7XHJcblxyXG5cdGZvcih2YXIgaSA9IDEsIGxlbiA9IHBvbHlnb24udmVydGljZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHJcblx0XHR2ZXJ0ZXggPSBwb2x5Z29uLnZlcnRpY2VzW2ldO1xyXG5cclxuXHRcdHRoaXMuY29udGV4dC5saW5lVG8odmVydGV4LngsIHZlcnRleC55KTtcclxuXHJcblx0fVxyXG5cclxuXHR0aGlzLmNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbkNhbnZhcy5wcm90b3R5cGUuZ2V0UmVjdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRyZXR1cm4gbmV3IFJlY3QodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG5cclxufTtcclxuXHJcbi8vIGNvbW1vbmpzIGV4cG9ydFxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhczsiLCJ2YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vVmVjdG9yMi5qcycpO1xyXG52YXIgUmVjdCA9IHJlcXVpcmUoJy4vUmVjdC5qcycpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xyXG5cclxuLyoqXHJcbiAqIGEgY2lyY2xlXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge051bWJlcn0gW3JhZGl1cz0xXSB0aGUgcmFkaXVzIG9mIHRoZSBjaXJjbGVcclxuICogQHBhcmFtIHtWZWN0b3IyfSBbcG9zaXRpb249bmV3IFZlY3RvcjJdIHRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZVxyXG4gKi9cclxudmFyIENpcmNsZSA9IGZ1bmN0aW9uKHJhZGl1cywgcG9zaXRpb24pIHtcclxuXHJcblx0dGhpcy5yYWRpdXMgPSByYWRpdXMgfHwgMTtcclxuXHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb24gfHwgbmV3IFZlY3RvcjIoKTtcclxuXHJcbn07XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLmdldENlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5wb3NpdGlvbjtcclxuXHJcbn07XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XHJcblxyXG5cdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBjcmVhdGVzIGFuZCByZXR1cm5zIGEgY29weSBvZiB0aGUgY2lyY2xlXHJcbiAqIEByZXR1cm5zIHtDaXJjbGV9IGEgY29weSBvZiB0aGUgb3JpZ2luYWwgY2lyY2xlXHJcbiAqL1xyXG5DaXJjbGUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHJldHVybiBuZXcgQ2lyY2xlKCB0aGlzLnJhZGl1cywgdGhpcy5wb3NpdGlvbi5jbG9uZSgpICk7XHJcblxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBjcmVhdGVzIGFuZCByZXR1cm5zIGEgcmVjdCB3aGljaCBleGFjdGx5IGNvbnRhaW5zIHRoZSBjaXJjbGVcclxuICogQHJldHVybnMge1JlY3R9IGEgUmVjdCB3aGljaCBlbmNvbXBhc3NlcyB0aGUgY2lyY2xlXHJcbiAqL1xyXG5DaXJjbGUucHJvdG90eXBlLnRvUmVjdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR2YXIgc2l6ZSA9IHRoaXMucmFkaXVzICogMjtcclxuXHR2YXIgcG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpLnN1YnRyYWN0KCBuZXcgVmVjdG9yMiggdGhpcy5yYWRpdXMsIHRoaXMucmFkaXVzICkgKTtcclxuXHJcblx0cmV0dXJuIG5ldyBSZWN0KCBzaXplLCBzaXplLCBwb3MgKTtcclxuXHJcbn07XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLnJhbmRvbVBvaW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGFuZ2xlID0gdXRpbC5yYW5kb20oKSAqIE1hdGguUEkgKiAyO1xyXG4gICAgdmFyIHIgPSBNYXRoLnNxcnQoIHV0aWwucmFuZG9tKCkgKSAqIHRoaXMucmFkaXVzO1xyXG5cclxuXHRyZXR1cm4gbmV3IFZlY3RvcjIoXHJcblx0XHR0aGlzLnBvc2l0aW9uLnggKyAociAqIE1hdGguY29zKGFuZ2xlKSksXHJcblx0XHR0aGlzLnBvc2l0aW9uLnkgKyAociAqIE1hdGguc2luKGFuZ2xlKSlcclxuXHQpO1xyXG5cclxufTtcclxuXHJcbi8vIGNvbW1vbmpzIGV4cG9ydFxyXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJ2YXIgQ29sbGlzaW9uUmVzcG9uc2UgPSByZXF1aXJlKCcuL0NvbGxpc2lvblJlc3BvbnNlLmpzJyk7XHJcbnZhciBDaXJjbGUgPSByZXF1aXJlKCcuL0NpcmNsZS5qcycpO1xyXG52YXIgUmVjdCA9IHJlcXVpcmUoJy4vUmVjdC5qcycpO1xyXG52YXIgVmVjdG9yMiA9IHJlcXVpcmUoJy4vVmVjdG9yMi5qcycpO1xyXG5cclxuLyoqXHJcbiAqIEBuYW1lc3BhY2VcclxuICogQXNzb3J0ZWQgY29sbGlzaW9uIGZ1bmN0aW9uc1xyXG4gKiBjb3ZlcnMgY29sbGlzaW9uIGJldHdlZW4gcG9pbnQsIGxpbmUsIHBvbHlnb24sIHJlY3QsIGNpcmNsZVxyXG4gKiBAdG9kbyBtYWtlIGV2ZXJ5IG9uZSByZXR1cm4gYSBzdGFuZGFyZCBjb2xsaXNpb24gcmVzcG9uc2Ugb2JqZWN0XHJcbiAqIEB0b2RvIGFkZCBzYW5pdHkgY2hlY2tzIHRvIGFsbCBmdW5jdGlvbnNcclxuICogQHRvZG8gY2hlY2sgZ2FwcywgaWUgY2FuIGV2ZXJ5IG9iamVjdCBjb2xsaWRlIHd0aCBldmVyeSBvdGhlclxyXG4gKiBAdG9kbyBhZGQgcmV2ZXJzZSB2ZXJzaW9ucz8gaWUgcmVjdENpcmNsZSA+IGNpcmNsZVJlY3RcclxuICovXHJcbnZhciBDb2xsaXNpb24gPSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIGNhbGN1bGF0ZSBjb2xsaXNpb25zIGJldHdlZW4gYSBwb2ludCBhbmQgYSBDaXJjbGVcclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHBvaW50ICBbZGVzY3JpcHRpb25dXHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSBjaXJjbGUgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRwb2ludENpcmNsZSA6IGZ1bmN0aW9uKHBvaW50LCBjaXJjbGUpIHtcclxuXHJcblx0XHR2YXIgZHggPSBNYXRoLmFicyhjaXJjbGUucG9zaXRpb24ueCAtIHBvaW50LngpLFxyXG5cdFx0XHRkeSA9IE1hdGguYWJzKGNpcmNsZS5wb3NpdGlvbi55IC0gcG9pbnQueSk7XHJcblxyXG5cdFx0cmV0dXJuIChkeCAqIGR4KSArIChkeSAqIGR5KSA8IChjaXJjbGUucmFkaXVzICogY2lyY2xlLnJhZGl1cyk7XHJcblxyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIGNhbGN1bGF0ZSBjb2xsaXNpb25zIGJldHdlZW4gYSBwb2ludCBhbmQgYSBSZWN0XHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSBwb2ludCBbZGVzY3JpcHRpb25dXHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSByZWN0ICBbZGVzY3JpcHRpb25dXHJcblx0ICogQHJldHVybiB7W3R5cGVdfSAgICAgICBbZGVzY3JpcHRpb25dXHJcblx0ICovXHJcblx0cG9pbnRSZWN0IDogZnVuY3Rpb24ocG9pbnQsIHJlY3QpIHtcclxuXHJcblx0XHRpZighcG9pbnQgfHwgIXJlY3QpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG5cdFx0cmV0dXJuICBwb2ludC54ID49IHJlY3QucG9zaXRpb24ueCAmJlxyXG5cdFx0XHRcdHBvaW50LnggPCByZWN0LnBvc2l0aW9uLnggKyByZWN0LndpZHRoICYmXHJcblx0XHRcdFx0cG9pbnQueSA+PSByZWN0LnBvc2l0aW9uLnkgJiZcclxuXHRcdFx0XHRwb2ludC55IDwgcmVjdC5wb3NpdGlvbi55ICsgcmVjdC5oZWlnaHQ7XHJcblx0fSxcclxuXHJcblx0LyoqXHJcblx0ICogY2hlY2sgaWYgYSBwb2ludCBpcyBvbiBvbmUgc2lkZSBvZiBhbiBpbmZpbml0ZSBsaW5lXHJcblx0ICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludCBBIFZlY3RvcjIgcmVwcmVzZW50aW5nIGEgcG9pbnQgaW4gMmQgc3BhY2VcclxuXHQgKiBAcGFyYW0ge0xpbmV9IGxpbmUgYSBsaW5lIHJlcHJlc2VudGluZyBhIGhhbGZzcGFjZVxyXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59XHJcblx0ICovXHJcblx0cG9pbnRIYWxmc3BhY2UgOiBmdW5jdGlvbihwb2ludCwgbGluZSkge1xyXG5cclxuXHRcdHZhciBlbmQgPSBsaW5lLmVuZC5fc3VidHJhY3QobGluZS5zdGFydCksXHJcblx0XHRcdHN0YXJ0ID0gcG9pbnQuX3N1YnRyYWN0KGxpbmUuc3RhcnQpLFxyXG5cdFx0XHRub3JtYWwgPSBlbmQuX3BlcnAoKSxcclxuXHRcdFx0ZG90ID0gc3RhcnQuZG90KG5vcm1hbCk7XHJcblxyXG5cdFx0XHRpZihkb3QgPiAwKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBhIHBvaW50IGFuZCBhIHBvbHlnb25cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHBvaW50ICAgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqIEBwYXJhbSAge1t0eXBlXX0gcG9seWdvbiBbZGVzY3JpcHRpb25dXHJcblx0ICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRwb2ludFBvbHlnb24gOiBmdW5jdGlvbihwb2ludCwgcG9seWdvbikge1xyXG5cclxuXHRcdC8vIHF1aWNrIHRlc3Qgb2YgYm91bmRpbmcgYm94XHJcblx0XHRpZighdGhpcy5wb2ludFJlY3QocG9pbnQsIHBvbHlnb24uYm91bmRzKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcblx0XHQvLyBnZXQgYSByZWZlcmVuY2UgcG9pbnQgZGVmaW5pdGVseSBvdXRzaWRlIHRoZSBwb2x5Z29uXHJcblx0XHR2YXIgb3V0c2lkZSA9IHBvbHlnb24uYm91bmRzLnBvc2l0aW9uLl9zdWJ0cmFjdChuZXcgVmVjdG9yMigxLDEpKTtcclxuXHRcdHZhciByYXkgPSBuZXcgTGluZShwb2ludCwgb3V0c2lkZSk7XHJcblxyXG5cdFx0dmFyIGludGVyc2VjdGlvbnMgPSAwLFxyXG5cdFx0XHRlZGdlcyA9IHBvbHlnb24uZ2V0RWRnZXMoKTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZWRnZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHJcblx0XHRcdGlmICh0aGlzLmxpbmVMaW5lKHJheSwgZWRnZXNbaV0pKSB7XHJcblxyXG5cdFx0XHRcdGludGVyc2VjdGlvbnMrKztcclxuXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gKGludGVyc2VjdGlvbnMgJSAyKTtcclxuXHJcblx0fSxcclxuXHJcblx0LyoqXHJcblx0ICogY2hlY2sgY29sbGlzaW9uIGJldHdlZW4gYSBwb2ludCBhbmQgYSBwb2x5Z29uXHJcblx0ICogb25seSB3b3JrcyBvbiBjb252ZXggcG9seWdvbnNcclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHBvaW50ICAgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqIEBwYXJhbSAge1t0eXBlXX0gcG9seWdvbiBbZGVzY3JpcHRpb25dXHJcblx0ICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRwb2ludFBvbHlnb25Db252ZXggOiBmdW5jdGlvbihwb2ludCwgcG9seWdvbikge1xyXG5cclxuXHRcdHZhciBlZGdlcyA9IHBvbHlnb24uZ2V0RWRnZXMoKTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZWRnZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHJcblx0XHRcdC8vIGRyb3Agb3V0IGFzIHNvb24gYXMgaXQgaXMgb3V0c2lkZVxyXG5cdFx0XHRpZiAoIXRoaXMucG9pbnRIYWxmc3BhY2UocG9pbnQsIGVkZ2VzW2ldKSkge1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblxyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIGNoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHR3byBsaW5lc1xyXG5cdCAqIEBwYXJhbSAge1t0eXBlXX0gbGluZTEgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqIEBwYXJhbSAge1t0eXBlXX0gbGluZTIgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqL1xyXG5cdGxpbmVMaW5lIDogZnVuY3Rpb24oIGxpbmUxLCBsaW5lMiApIHtcclxuXHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHR0aGlzLmNvdW50ZXJDbG9ja3dpc2UobGluZTEuc3RhcnQsIGxpbmUyLnN0YXJ0LCBsaW5lMi5lbmQpICE9IHRoaXMuY2N3KGxpbmUxLmVuZCwgbGluZTIuc3RhcnQsIGxpbmUyLmVuZCkgJiZcclxuXHRcdFx0dGhpcy5jb3VudGVyQ2xvY2t3aXNlKGxpbmUxLnN0YXJ0LCBsaW5lMS5lbmQsIGxpbmUyLnN0YXJ0KSAhPSB0aGlzLmNjdyhsaW5lMS5zdGFydCwgbGluZTEuZW5kLCBsaW5lMi5lbmQpXHJcblx0XHQpO1xyXG5cclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBjb2xsaXNpb24gYmV0d2VlbiBhIGxpbmUgYW5kIGEgY2lyY2xlXHJcblx0ICogQHBhcmFtIGxpbmVcclxuXHQgKiBAcGFyYW0gY2lyY2xlXHJcblx0ICogQHJldHVybiB7Qm9vbGVhbn1cclxuXHQgKi9cclxuXHRsaW5lQ2lyY2xlIDogZnVuY3Rpb24oIGxpbmUsIGNpcmNsZSApIHtcclxuXHJcblx0XHR2YXIgcG9pbnQgPSB0aGlzLmNsb3Nlc3RQb2ludExpbmUoY2lyY2xlLnBvc2l0aW9uLCBsaW5lKTtcclxuXHRcdHZhciBkaXN0YW5jZSA9IHBvaW50LmRpc3RhbmNlVG8oY2lyY2xlLnBvc2l0aW9uKTtcclxuXHJcblx0XHRpZihkaXN0YW5jZSA8PSBjaXJjbGUucmFkaXVzKSB7XHJcblxyXG5cdFx0XHR2YXIgcmVzcG9uc2UgPSBuZXcgQ29sbGlzaW9uUmVzcG9uc2UoXHJcblx0XHRcdFx0cG9pbnQsXHJcblx0XHRcdFx0Y2lyY2xlLnBvc2l0aW9uLl9zdWJ0cmFjdChwb2ludCkubm9ybWFsaXplKCksXHJcblx0XHRcdFx0Y2lyY2xlLnJhZGl1cyAtIGRpc3RhbmNlXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2U7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBjb2xsaXNpb24gYmV0d2VlbiBhIGxpbmUgYW5kIGEgcmVjdGFuZ2xlXHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSBsaW5lIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHJlY3QgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqIEByZXR1cm4ge1t0eXBlXX0gICAgICBbZGVzY3JpcHRpb25dXHJcblx0ICovXHJcblx0bGluZVJlY3QgOiBmdW5jdGlvbihsaW5lLCByZWN0KSB7XHJcblxyXG5cdFx0dmFyIGxpbmVzID0gcmVjdC5nZXRFZGdlcygpO1xyXG5cclxuXHRcdHJldHVybiAoXHJcblx0XHRcdHRoaXMubGluZUxpbmUobGluZSwgbGluZXNbMF0pICYmXHJcblx0XHRcdHRoaXMubGluZUxpbmUobGluZSwgbGluZXNbMV0pICYmXHJcblx0XHRcdHRoaXMubGluZUxpbmUobGluZSwgbGluZXNbMl0pICYmXHJcblx0XHRcdHRoaXMubGluZUxpbmUobGluZSwgbGluZXNbM10pXHJcblx0XHQpO1xyXG5cclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBjb2xsaXNpb24gYmV0d2VlbiB0d28gUmVjdHNcclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHIxIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHIyIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcmV0dXJuIHtbdHlwZV19ICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRyZWN0UmVjdCA6IGZ1bmN0aW9uICggcjEsIHIyICkge1xyXG5cclxuXHRcdC8vIHdvcmsgb3V0IHRoZSBoYWxmIHdpZHRocyBhbmQgaGFsZiBoZWlnaHRzXHJcblx0XHR2YXIgaHcxID0gcjEud2lkdGggLyAyO1xyXG5cdFx0dmFyIGh3MiA9IHIyLndpZHRoIC8gMjtcclxuXHRcdHZhciBoaDEgPSByMS5oZWlnaHQgLyAyO1xyXG5cdFx0dmFyIGhoMiA9IHIyLmhlaWdodCAvIDI7XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIHRoZSBjZW50ZXJzIG9mIHRoZSB0d28gcmVjdHNcclxuXHRcdHZhciBjMSA9IHIxLmdldENlbnRlcigpO1xyXG5cdFx0dmFyIGMyID0gcjIuZ2V0Q2VudGVyKCk7XHJcblxyXG5cdFx0Ly8gdGhlIGRpc3RhbmNlcyBiZXR3ZWVuIHRoZSB0d28gY2VudGVyc1xyXG5cdFx0dmFyIGRpc3RhbmNlID0gYzEuX3N1YnRyYWN0KGMyKS5hYnMoKTtcclxuXHJcblx0XHQvLyB0aGUgdG90YWwgd2lkdGhzIGFuZCBoZWlnaHRzXHJcblx0XHR2YXIgdG90YWxXaWR0aCA9IGh3MSArIGh3MjtcclxuXHRcdHZhciB0b3RhbEhlaWdodCA9IGhoMSArIGhoMjtcclxuXHJcblx0XHRpZih0b3RhbFdpZHRoIDw9IGRpc3RhbmNlLngpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0XHRpZih0b3RhbEhlaWdodCA8PSBkaXN0YW5jZS55KSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHRcdHZhciB2ID0gbmV3IFZlY3RvcjIoKTtcclxuXHRcdHZhciB4ID0gdG90YWxXaWR0aCAtIGRpc3RhbmNlLng7XHJcblx0XHR2YXIgeSA9IHRvdGFsSGVpZ2h0IC0gZGlzdGFuY2UueTtcclxuXHJcblx0XHRpZihNYXRoLmFicyh4KSA8IE1hdGguYWJzKHkpKSB7XHJcblxyXG5cdFx0XHRpZihjMS54IC0gYzIueCA8IDApIHsgdi54ID0gLXg7IH1cclxuXHRcdFx0ZWxzZSB7IHYueCA9IHg7IH1cclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0aWYoYzEueSAtIGMyLnkgPCAwKSB7IHYueSA9IC15OyB9XHJcblx0XHRcdGVsc2UgeyB2LnkgPSB5OyB9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vQHRvZG8gY2FsY3VsYXRlIHByb3Blcmx5XHJcblx0XHR2YXIgcG9pbnQgPSBuZXcgVmVjdG9yMigpO1xyXG5cdFx0dmFyIG5vcm1hbCA9IHYuX25vcm1hbGl6ZSgpO1xyXG5cdFx0dmFyIGRlcHRoID0gdi5tYWduaXR1ZGUoKTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IENvbGxpc2lvblJlc3BvbnNlKHBvaW50LCBub3JtYWwsIGRlcHRoKTtcclxuXHJcblx0fSxcclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgY29sbGlzaW9uIGJldHdlZW4gdHdvIENpcmNsZXNcclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IGMxICAgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IGMyICAgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHJlc3BvbnNlIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRjaXJjbGVDaXJjbGUgOiBmdW5jdGlvbiAoYzEsIGMyLCByZXNwb25zZSkge1xyXG5cclxuXHRcdHZhciBkeCA9IE1hdGguYWJzKGMxLnBvc2l0aW9uLnggLSBjMi5wb3NpdGlvbi54KTtcclxuXHRcdHZhciBkeSA9IE1hdGguYWJzKGMxLnBvc2l0aW9uLnkgLSBjMi5wb3NpdGlvbi55KTtcclxuXHRcdHZhciBkciA9IGMxLnJhZGl1cyArIGMyLnJhZGl1cztcclxuXHJcblx0XHRpZigoKGR4ICogZHgpICsgKGR5ICogZHkpKSA8IChkciAqIGRyKSkge1xyXG5cclxuXHRcdFx0aWYocmVzcG9uc2UgIT09IHRydWUpIHsgcmV0dXJuIHRydWU7IH1cclxuXHJcblx0XHRcdHZhciBkaXN0YW5jZSA9IGMxLnBvc2l0aW9uLl9zdWJ0cmFjdChjMi5wb3NpdGlvbik7XHJcblx0XHRcdHZhciBub3JtYWwgPSBkaXN0YW5jZS5fbm9ybWFsaXplKCk7XHJcblx0XHRcdHZhciBkZXB0aCA9IChjMS5yYWRpdXMgKyBjMi5yYWRpdXMpIC0gZGlzdGFuY2UubWFnbml0dWRlKCk7XHJcblx0XHRcdHZhciBtdGQgPSBub3JtYWwuX211bHRpcGx5KGRlcHRoKTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0ZGlzdGFuY2UgOiBkaXN0YW5jZSxcclxuXHRcdFx0XHRub3JtYWwgOiBub3JtYWwsXHJcblx0XHRcdFx0Ly9AdG9kbyBwb2ludCA6IG5lYXIsXHJcblx0XHRcdFx0ZGVwdGggOiBkZXB0aCxcclxuXHRcdFx0XHRtdGQgOiBtdGRcclxuXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIGEgQ2lyY2xlIGFuZCBhIFJlY3RcclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IGNpcmNsZSAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHJlY3QgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHJlc3BvbnNlIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRjaXJjbGVSZWN0IDogZnVuY3Rpb24gKCBjaXJjbGUsIHJlY3QgKSB7XHJcblxyXG5cdFx0dmFyIG5lYXIgPSB0aGlzLmNsb3Nlc3RQb2ludFJlY3QoIGNpcmNsZS5wb3NpdGlvbiwgcmVjdCApO1xyXG5cclxuXHRcdGlmICggdGhpcy5wb2ludENpcmNsZSggbmVhciwgY2lyY2xlICkgKSB7XHJcblxyXG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBjaXJjbGUucG9zaXRpb24uZGlzdGFuY2VUbyggbmVhciApO1xyXG5cdFx0XHR2YXIgbm9ybWFsID0gY2lyY2xlLnBvc2l0aW9uLl9zdWJ0cmFjdChuZWFyKS5ub3JtYWxpemUoKTtcclxuXHRcdFx0dmFyIGRlcHRoID0gY2lyY2xlLnJhZGl1cyAtIGRpc3RhbmNlO1xyXG5cclxuXHRcdFx0cmV0dXJuIG5ldyBDb2xsaXNpb25SZXNwb25zZShuZWFyLCBub3JtYWwsIGRlcHRoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIGZpbmQgdGhlIGNsb3Nlc3QgcG9pbnQgb24gYSBsaW5lIHRvIGEgcmVmZXJlbmNlIHBvaW50XHJcblx0ICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludCBhIHBvaW50IGluIHNwYWNlXHJcblx0ICogQHBhcmFtIHtMaW5lfSBsaW5lIGEgbGluZVxyXG5cdCAqIEByZXR1cm4ge1ZlY3RvcjJ9IHRoZSBjbG9zZXN0IHBvaW50IG9uIHRoZSBsaW5lIHRvIHRoZSBwb2ludFxyXG5cdCAqL1xyXG5cdGNsb3Nlc3RQb2ludExpbmUgOiBmdW5jdGlvbiggcG9pbnQsIGxpbmUgKSB7XHJcblxyXG5cdFx0dmFyIHYxID0gbGluZS5lbmQuX3N1YnRyYWN0KGxpbmUuc3RhcnQpO1xyXG5cdFx0dmFyIHYyID0gbGluZS5zdGFydC5fc3VidHJhY3QocG9pbnQpO1xyXG5cdFx0dmFyIHYzID0gbGluZS5zdGFydC5fc3VidHJhY3QobGluZS5lbmQpO1xyXG5cdFx0dmFyIHY0ID0gbGluZS5lbmQuX3N1YnRyYWN0KHBvaW50KTtcclxuXHJcblx0XHR2YXIgZG90MSA9IHYyLmRvdCh2MSk7XHJcblx0XHR2YXIgZG90MiA9IHYxLmRvdCh2MSk7XHJcblx0XHR2YXIgZG90MyA9IHY0LmRvdCh2Myk7XHJcblx0XHR2YXIgZG90NCA9IHYzLmRvdCh2Myk7XHJcblxyXG5cdFx0dmFyIHQxID0gLTEgKiBkb3QxL2RvdDI7XHJcblx0XHR2YXIgdDIgPSAtMSAqIGRvdDMvZG90NDtcclxuXHJcblx0XHQvLyBiZXlvbmQgdGhlIGJvdW5kcyBvZiB0aGUgbGluZSwgc28gdGhlIGVuZCBwb2ludHMgYXJlIHRoZSBjbG9zZXN0XHJcblx0XHRpZiggdDEgPCAwICkgeyByZXR1cm4gbGluZS5zdGFydC5jbG9uZSgpOyB9XHJcblx0XHRpZiggdDIgPCAwICkgeyByZXR1cm4gbGluZS5lbmQuY2xvbmUoKTsgfVxyXG5cclxuXHRcdC8vIGFjdHVhbCBwb2ludCBvbiBsaW5lXHJcblx0XHRyZXR1cm4gbmV3IFZlY3RvcjIobGluZS5zdGFydC54ICsgdjEueCAqIHQxLCBsaW5lLnN0YXJ0LnkgKyB2MS55ICogdDEpO1xyXG5cclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBEZXRlcm1pbmUgdGhlIGNsb3Nlc3QgcG9pbnQgb24gYSBjaXJjbGUgdG8gYSByZWZlcmVuY2UgcG9pbnRcclxuXHQgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IGEgcG9pbnQgaW4gc3BhY2VcclxuXHQgKiBAcGFyYW0ge0NpcmNsZX0gY2lyY2xlIGEgY2lyY2xlXHJcblx0ICogQHJldHVybiB7VmVjdG9yMn0gdGhlIGNsb3Nlc3QgcG9pbnQgb24gdGhlIGNpcmNsZSB0byB0aGUgcG9pbnRcclxuXHQgKi9cclxuXHRjbG9zZXN0UG9pbnRDaXJjbGUgOiBmdW5jdGlvbiggcG9pbnQgLCBjaXJjbGUgKSB7XHJcblxyXG5cdFx0dmFyIHYgPSBwb2ludC5fc3VidHJhY3QoY2lyY2xlLnBvc2l0aW9uKTtcclxuXHRcdHYuc2V0TWFnbml0dWRlKGNpcmNsZS5yYWRpdXMpO1xyXG5cclxuXHRcdHJldHVybiBjaXJjbGUucG9zaXRpb24uX2FkZCh2KTtcclxuXHJcblx0fSxcclxuXHJcblx0LyoqXHJcblx0ICogRGV0ZXJtaW5lIHRoZSBjbG9zZXN0IHBvaW50IG9uIGEgcmVjdCB0byBhbm90aGVyIHBvaW50XHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSBwb2ludCBbZGVzY3JpcHRpb25dXHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSByZWN0ICBbZGVzY3JpcHRpb25dXHJcblx0ICogQHJldHVybiB7W3R5cGVdfSAgICAgICBbZGVzY3JpcHRpb25dXHJcblx0ICovXHJcblx0Y2xvc2VzdFBvaW50UmVjdCA6IGZ1bmN0aW9uKCBwb2ludCwgcmVjdCkge1xyXG5cclxuXHRcdHZhciBjbG9zZXN0ID0gcG9pbnQuY2xvbmUoKTtcclxuXHJcblx0XHRpZiggcG9pbnQueCA8IHJlY3QucG9zaXRpb24ueCApIHtcclxuXHJcblx0XHRcdGNsb3Nlc3QueCA9IHJlY3QucG9zaXRpb24ueDtcclxuXHJcblx0XHR9IGVsc2UgaWYgKCBwb2ludC54ID4gcmVjdC5wb3NpdGlvbi54ICsgcmVjdC53aWR0aCApIHtcclxuXHJcblx0XHRcdGNsb3Nlc3QueCA9IHJlY3QucG9zaXRpb24ueCArIHJlY3Qud2lkdGg7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmKCBwb2ludC55IDwgcmVjdC5wb3NpdGlvbi55ICkge1xyXG5cclxuXHRcdFx0Y2xvc2VzdC55ID0gcmVjdC5wb3NpdGlvbi55O1xyXG5cclxuXHRcdH0gZWxzZSBpZiAoIHBvaW50LnkgPiByZWN0LnBvc2l0aW9uLnkgKyByZWN0LmhlaWdodCApIHtcclxuXHJcblx0XHRcdGNsb3Nlc3QueSA9IHJlY3QucG9zaXRpb24ueSArIHJlY3QuaGVpZ2h0O1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY2xvc2VzdDtcclxuXHR9LFxyXG5cclxuXHQvKipcclxuXHQgKiBEZXRlcm1pbmUgaWYgdGhyZWUgcG9pbnRzIGFyZSBpbiBhIGNvdW50ZXIgY2xvY2t3aXNlIG9yZGVyXHJcblx0ICogQHBhcmFtICB7W3R5cGVdfSBhIFtkZXNjcmlwdGlvbl1cclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IGIgW2Rlc2NyaXB0aW9uXVxyXG5cdCAqIEBwYXJhbSAge1t0eXBlXX0gYyBbZGVzY3JpcHRpb25dXHJcblx0ICogQHJldHVybiB7W3R5cGVdfSAgIFtkZXNjcmlwdGlvbl1cclxuXHQgKi9cclxuXHRjb3VudGVyQ2xvY2t3aXNlIDogZnVuY3Rpb24oYSwgYiwgYykge1xyXG5cclxuXHRcdHJldHVybiAoYy55IC0gYS55KSAqIChiLnggLSBhLngpID4gKGIueSAtIGEueSkgKiAoYy54IC0gYS54KTtcclxuXHJcblx0fSxcclxuXHJcblx0cmVjdENpcmNsZSA6IGZ1bmN0aW9uKHJlY3QsIGNpcmNsZSkgeyByZXR1cm4gdGhpcy5jaXJjbGVSZWN0KGNpcmNsZSwgcmVjdCk7IH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIGdlbmVyYWwgcHVycG9zZSBjb2xsaXNpb24gcmVzb2x1dGlvbiB3cmFwcGVyXHJcblx0ICogYXQgdGhlIG1vbWVudCwgaGFuZGxlcyByZWN0cyBhbmQgY2lyY2xlc1xyXG5cdCAqIEB0b2RvIGV4dGVuZCB0byBvdGhlciBzaGFwZXNcclxuXHQgKiBAcGFyYW0gIHtbdHlwZV19IHNoYXBlMVxyXG5cdCAqIEBwYXJhbSAge1t0eXBlXX0gc2hhcGUyXHJcblx0ICogQHJldHVybiB7W3R5cGVdfVxyXG5cdCAqL1xyXG5cdHJlc29sdmUgOiBmdW5jdGlvbihzaGFwZTEsIHNoYXBlMikge1xyXG5cclxuXHRcdGlmKHNoYXBlMSBpbnN0YW5jZW9mIFJlY3QpIHtcclxuXHJcblx0XHRcdGlmKHNoYXBlMiBpbnN0YW5jZW9mIFJlY3QpIHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHRoaXMucmVjdFJlY3Qoc2hhcGUxLCBzaGFwZTIpO1xyXG5cclxuXHRcdFx0fSBlbHNlIGlmKHNoYXBlMiBpbnN0YW5jZW9mIENpcmNsZSkge1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZWN0Q2lyY2xlKHNoYXBlMSwgc2hhcGUyKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2UgaWYoc2hhcGUxIGluc3RhbmNlb2YgQ2lyY2xlKSB7XHJcblxyXG5cdFx0XHRpZihzaGFwZTIgaW5zdGFuY2VvZiBSZWN0KSB7XHJcblxyXG5cdFx0XHRcdHJldHVybiB0aGlzLmNpcmNsZVJlY3Qoc2hhcGUxLCBzaGFwZTIpO1xyXG5cclxuXHRcdFx0fSBlbHNlIGlmKHNoYXBlMiBpbnN0YW5jZW9mIENpcmNsZSkge1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaXJjbGVDaXJjbGUoc2hhcGUxLCBzaGFwZTIpO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0fSxcclxuXHJcbn07XHJcblxyXG4vLyBjb21tb25qcyBleHBvcnRcclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247IiwiLyoqXHJcbiAqIGEgZ2VuZXJpYyBjb2xsaXNpb24gcmVzcG9uc2Ugb2JqZWN0IHRvIGhvbGQgaW5mb3JtYXRpb24gYWJvdXQgYSBjb2xsaXNpb25cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgQ29sbGlzaW9uUmVzcG9uc2UgPSBmdW5jdGlvbihwb2ludCwgbm9ybWFsLCBkZXB0aCkge1xyXG5cclxuXHR0aGlzLnBvaW50ID0gcG9pbnQ7XHJcblx0dGhpcy5ub3JtYWwgPSBub3JtYWw7XHJcblx0dGhpcy5kZXB0aCA9IGRlcHRoO1xyXG5cclxuXHR0aGlzLm10ZCA9IG5vcm1hbC5fbXVsdGlwbHkoZGVwdGgpO1xyXG5cclxufTtcclxuXHJcbi8vIGNvbW1vbmpzIGV4cG9ydFxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvblJlc3BvbnNlOyIsInZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi9WZWN0b3IyJyk7XHJcblxyXG4vKipcclxuICogSW5wdXRcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgSW5wdXQgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0dGhpcy5kb3duID0ge307XHJcblx0dGhpcy5wcmVzc2VkID0ge307XHJcblx0dGhpcy5tb3VzZSA9IHt9O1xyXG5cdHRoaXMubGlzdGVuZXJzID0ge307XHJcblx0dGhpcy5sYXN0S2V5ID0gbnVsbDtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogYmluZCBrZXlib2FyZCBldmVudHMgdG8gdGhlIGdpdmVuIERPTSBlbGVtZW50XHJcbiAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgdGhlIGVsZW1lbnQgdG8gYmluZCBldmVudHMgdG9cclxuICogQHJldHVybiB7Ym9vbGVhbn0gW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuSW5wdXQucHJvdG90eXBlLmJpbmRLZXlib2FyZCA9IGZ1bmN0aW9uKHRhcmdldCkge1xyXG5cclxuXHRpZighdGFyZ2V0KSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHR2YXIgc2NvcGUgPSB0aGlzO1xyXG5cclxuXHR0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHsgcmV0dXJuIHNjb3BlLmtleURvd25IYW5kbGVyKGUpOyB9LCBmYWxzZSk7XHJcblx0dGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkgeyByZXR1cm4gc2NvcGUua2V5VXBIYW5kbGVyKGUpOyB9LCBmYWxzZSk7XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG5cclxufTtcclxuXHJcbklucHV0LnByb3RvdHlwZS5iaW5kTW91c2UgPSBmdW5jdGlvbih0YXJnZXQpIHtcclxuXHJcblx0aWYoIXRhcmdldCkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcblx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcblxyXG5cdHZhciByZWN0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHR0aGlzLnRhcmdldFBvc2l0aW9uID0gbmV3IFZlY3RvcjIocmVjdC5sZWZ0LCByZWN0LnRvcCk7XHJcblx0dGhpcy5tb3VzZS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCk7XHJcblxyXG5cdHZhciBzY29wZSA9IHRoaXM7XHJcblxyXG5cdHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSkgeyByZXR1cm4gc2NvcGUubW91c2VVcEhhbmRsZXIoZSk7IH0sIGZhbHNlKTtcclxuXHR0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkgeyByZXR1cm4gc2NvcGUubW91c2VEb3duSGFuZGxlcihlKTsgfSwgZmFsc2UpO1xyXG5cdHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7IHJldHVybiBzY29wZS5tb3VzZU1vdmVIYW5kbGVyKGUpOyB9LCBmYWxzZSk7XHJcblx0dGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKGUpIHsgc2NvcGUubW91c2Uub3ZlciA9IHRydWU7IHJldHVybiBmYWxzZTsgfSwgZmFsc2UpO1xyXG5cdHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uKGUpIHsgc2NvcGUubW91c2Uub3ZlciA9IGZhbHNlOyByZXR1cm4gZmFsc2U7IH0sIGZhbHNlKTtcclxuXHR0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHsgc2NvcGUubW91c2VNb3ZlSGFuZGxlcihlKTsgfSwgZmFsc2UpO1xyXG5cdHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBlLnN0b3BQcm9wYWdhdGlvbigpOyByZXR1cm4gZmFsc2U7IH0sIGZhbHNlKTtcclxuXHJcbn07XHJcblxyXG5cclxuXHJcbklucHV0LnByb3RvdHlwZS5rZXlEb3duSGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcclxuXHJcblx0dmFyIGNvZGUgPSBlLmtleUNvZGU7XHJcblx0dGhpcy5kb3duW2NvZGVdID0gdHJ1ZTtcclxuXHR0aGlzLmxhc3RLZXkgPSBjb2RlO1xyXG5cclxuXHRpZih0aGlzLmxpc3RlbmVyc1tjb2RlXSkge1xyXG5cdFx0dGhpcy5saXN0ZW5lcnNbY29kZV0oZSk7XHJcblx0fVxyXG5cclxuXHRpZih0aGlzLmxpc3RlbmVyc1tJbnB1dC5LRVlCT0FSRF9ET1dOXSkge1xyXG5cdFx0dGhpcy5saXN0ZW5lcnNbY29kZV0oZSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZmFsc2U7XHJcblxyXG59O1xyXG5cclxuSW5wdXQucHJvdG90eXBlLmtleXNEb3duID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmRvd24pLmxlbmd0aDtcclxuXHJcbn07XHJcblxyXG5JbnB1dC5wcm90b3R5cGUua2V5VXBIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xyXG5cclxuXHR2YXIgY29kZSA9IGUua2V5Q29kZTtcclxuXHRkZWxldGUgdGhpcy5kb3duW2NvZGVdO1xyXG5cclxuXHRpZih0aGlzLmxpc3RlbmVyc1tjb2RlXSkge1xyXG5cdFx0dGhpcy5saXN0ZW5lcnNbY29kZV0oZSk7XHJcblx0fVxyXG5cclxuXHRpZih0aGlzLmxpc3RlbmVyc1tJbnB1dC5LRVlCT0FSRF9VUF0pIHtcclxuXHRcdHRoaXMubGlzdGVuZXJzW2NvZGVdKGUpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGZhbHNlO1xyXG5cclxufTtcclxuXHJcbklucHV0LnByb3RvdHlwZS5tb3VzZU1vdmVIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xyXG5cclxuXHR0aGlzLm1vdXNlLnBvc2l0aW9uLnggPSBlLmNsaWVudFggLSB0aGlzLnRhcmdldFBvc2l0aW9uLng7XHJcblx0dGhpcy5tb3VzZS5wb3NpdGlvbi55ID0gZS5jbGllbnRZIC0gdGhpcy50YXJnZXRQb3NpdGlvbi55O1xyXG5cclxufTtcclxuXHJcbklucHV0LnByb3RvdHlwZS5tb3VzZURvd25IYW5kbGVyID0gZnVuY3Rpb24oZSkge1xyXG5cclxuXHR2YXIgY29kZSA9IGUuYnV0dG9uO1xyXG5cclxuXHR0aGlzLmRvd25bMTAwMCArIGNvZGVdID0gdHJ1ZTtcclxuXHJcblx0bGlzdGVuZXIgPSB0aGlzLmxpc3RlbmVyc1syMDAwICsgY29kZV07XHJcblx0aWYobGlzdGVuZXIpIHsgbGlzdGVuZXIodGhpcy5tb3VzZSwgZSk7IH1cclxuXHJcbn07XHJcblxyXG5JbnB1dC5wcm90b3R5cGUubW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XHJcblxyXG5cdHZhciBsaXN0ZW5lcixcclxuXHRcdGNvZGUgPSBlLmJ1dHRvbjtcclxuXHJcblx0dGhpcy5kb3duWzEwMDAgKyBjb2RlXSA9IGZhbHNlO1xyXG5cclxuXHRsaXN0ZW5lciA9IHRoaXMubGlzdGVuZXJzWzMwMDAgKyBjb2RlXTtcclxuXHRpZihsaXN0ZW5lcikgeyBsaXN0ZW5lcih0aGlzLm1vdXNlLCBlKTsgfVxyXG5cclxufTtcclxuXHJcblxyXG5cclxuSW5wdXQucHJvdG90eXBlLmxpc3RlbiA9IGZ1bmN0aW9uKGV2ZW50LCBmbiwgc2NvcGUpIHtcclxuXHJcblx0dGhpcy5saXN0ZW5lcnNbZXZlbnRdID0gZnVuY3Rpb24oYXJnKSB7IGZuLmNhbGwoc2NvcGUsIGFyZyk7IH07XHJcblxyXG59O1xyXG5cclxuSW5wdXQucHJvdG90eXBlLm9uID0gSW5wdXQucHJvdG90eXBlLmxpc3RlbjtcclxuXHJcbklucHV0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR0aGlzLnByZXNzZWQgPSB7fTtcclxuXHJcbn07XHJcblxyXG5JbnB1dC5wcm90b3R5cGUuaXNEb3duID0gZnVuY3Rpb24oa2V5KSB7XHJcblxyXG5cdHJldHVybiB0aGlzLmRvd25ba2V5XSA9PSB0cnVlO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhIGxpc3Qgb2Yga2V5Y29kZXMgdXNlZCBmb3IgaW5wdXRcclxuICovXHJcbklucHV0LktFWV9CQUNLU1BBQ0UgPSA4O1xyXG5JbnB1dC5LRVlfVEFCID0gOTtcclxuSW5wdXQuS0VZX0VOVEVSID0gMTM7XHJcbklucHV0LktFWV9QQVVTRSA9IDE5O1xyXG5JbnB1dC5LRVlfQ0FQUyA9IDIwO1xyXG5JbnB1dC5LRVlfRVNDID0gMjc7XHJcbklucHV0LktFWV9TUEFDRSA9IDMyO1xyXG5JbnB1dC5LRVlfUEFHRV9VUCA9IDMzO1xyXG5JbnB1dC5LRVlfUEFHRV9ET1dOID0gMzQ7XHJcbklucHV0LktFWV9FTkQgPSAzNTtcclxuSW5wdXQuS0VZX0hPTUUgPSAzNjtcclxuSW5wdXQuS0VZX0FSUk9XX0xFRlQgPSAzNztcclxuSW5wdXQuS0VZX0FSUk9XX1VQID0gMzg7XHJcbklucHV0LktFWV9BUlJPV19SSUdIVCA9IDM5O1xyXG5JbnB1dC5LRVlfQVJST1dfRE9XTiA9IDQwO1xyXG5JbnB1dC5LRVlfSU5TRVJUID0gNDU7XHJcbklucHV0LktFWV9ERUxFVEUgPSA0NjtcclxuSW5wdXQuS0VZXzAgPSA0ODtcclxuSW5wdXQuS0VZXzEgPSA0OTtcclxuSW5wdXQuS0VZXzIgPSA1MDtcclxuSW5wdXQuS0VZXzMgPSA1MTtcclxuSW5wdXQuS0VZXzQgPSA1MjtcclxuSW5wdXQuS0VZXzUgPSA1MztcclxuSW5wdXQuS0VZXzYgPSA1NDtcclxuSW5wdXQuS0VZXzcgPSA1NTtcclxuSW5wdXQuS0VZXzggPSA1NjtcclxuSW5wdXQuS0VZXzkgPSA1NztcclxuSW5wdXQuS0VZX0EgPSA2NTtcclxuSW5wdXQuS0VZX0IgPSA2NjtcclxuSW5wdXQuS0VZX0MgPSA2NztcclxuSW5wdXQuS0VZX0QgPSA2ODtcclxuSW5wdXQuS0VZX0UgPSA2OTtcclxuSW5wdXQuS0VZX0YgPSA3MDtcclxuSW5wdXQuS0VZX0cgPSA3MTtcclxuSW5wdXQuS0VZX0ggPSA3MjtcclxuSW5wdXQuS0VZX0kgPSA3MztcclxuSW5wdXQuS0VZX0ogPSA3NDtcclxuSW5wdXQuS0VZX0sgPSA3NTtcclxuSW5wdXQuS0VZX0wgPSA3NjtcclxuSW5wdXQuS0VZX00gPSA3NztcclxuSW5wdXQuS0VZX04gPSA3ODtcclxuSW5wdXQuS0VZX08gPSA3OTtcclxuSW5wdXQuS0VZX1AgPSA4MDtcclxuSW5wdXQuS0VZX1EgPSA4MTtcclxuSW5wdXQuS0VZX1IgPSA4MjtcclxuSW5wdXQuS0VZX1MgPSA4MztcclxuSW5wdXQuS0VZX1QgPSA4NDtcclxuSW5wdXQuS0VZX1UgPSA4NTtcclxuSW5wdXQuS0VZX1YgPSA4NjtcclxuSW5wdXQuS0VZX1cgPSA4NztcclxuSW5wdXQuS0VZX1ggPSA4ODtcclxuSW5wdXQuS0VZX1kgPSA4OTtcclxuSW5wdXQuS0VZX1ogPSA5MDtcclxuSW5wdXQuS0VZX05VTV8wID0gOTY7XHJcbklucHV0LktFWV9OVU1fMSA9IDk3O1xyXG5JbnB1dC5LRVlfTlVNXzIgPSA5ODtcclxuSW5wdXQuS0VZX05VTV8zID0gOTk7XHJcbklucHV0LktFWV9OVU1fNCA9IDEwMDtcclxuSW5wdXQuS0VZX05VTV81ID0gMTAxO1xyXG5JbnB1dC5LRVlfTlVNXzYgPSAxMDI7XHJcbklucHV0LktFWV9OVU1fNyA9IDEwMztcclxuSW5wdXQuS0VZX05VTV84ID0gMTA0O1xyXG5JbnB1dC5LRVlfTlVNXzkgPSAxMDU7XHJcbklucHV0LktFWV9NVUxUSVBMWSA9IDEwNjtcclxuSW5wdXQuS0VZX05VTV9QTFVTID0gMTA3O1xyXG5JbnB1dC5LRVlfTlVNX01JTlVTID0gMTA5O1xyXG5JbnB1dC5LRVlfREVDSU1BTCA9IDExMDtcclxuSW5wdXQuS0VZX0RJVklERSA9IDExMTtcclxuSW5wdXQuS0VZX0YxID0gMTEyO1xyXG5JbnB1dC5LRVlfRjIgPSAxMTM7XHJcbklucHV0LktFWV9GMyA9IDExNDtcclxuSW5wdXQuS0VZX0Y0ID0gMTE1O1xyXG5JbnB1dC5LRVlfRjUgPSAxMTY7XHJcbklucHV0LktFWV9GNiA9IDExNztcclxuSW5wdXQuS0VZX0Y3ID0gMTE4O1xyXG5JbnB1dC5LRVlfRjggPSAxMTk7XHJcbklucHV0LktFWV9GOSA9IDEyMDtcclxuSW5wdXQuS0VZX0YxMCA9IDEyMTtcclxuSW5wdXQuS0VZX0YxMSA9IDEyMjtcclxuSW5wdXQuS0VZX0YxMiA9IDEyMztcclxuSW5wdXQuS0VZX1NISUZUID0gMTY7XHJcbklucHV0LktFWV9DVFJMID0gMTc7XHJcbklucHV0LktFWV9BTFQgPSAxODtcclxuSW5wdXQuS0VZX1BMVVMgPSAxODc7XHJcbklucHV0LktFWV9DT01NQSA9IDE4ODtcclxuSW5wdXQuS0VZX01JTlVTID0gMTg5O1xyXG5JbnB1dC5LRVlfUEVSSU9EID0gMTkwO1xyXG5cclxuLyoqIG1vdXNlIGV2ZW50cyAqL1xyXG5JbnB1dC5NT1VTRV9MRUZUID0gMTAwMDtcclxuSW5wdXQuTU9VU0VfTEVGVF9ET1dOID0gMjAwMDtcclxuSW5wdXQuTU9VU0VfTEVGVF9VUCA9IDMwMDA7XHJcbklucHV0Lk1PVVNFX0xFRlRfQ0xJQ0sgPSA0MDAwO1xyXG5JbnB1dC5NT1VTRV9NSURETEUgPSAxMDAxO1xyXG5JbnB1dC5NT1VTRV9NSURETEVfRE9XTiA9IDIwMDE7XHJcbklucHV0Lk1PVVNFX01JRERMRV9VUCA9IDMwMDE7XHJcbklucHV0Lk1PVVNFX01JRERMRV9DTElDSyA9IDQwMDE7XHJcbklucHV0Lk1PVVNFX1JJR0hUID0gMTAwMjtcclxuSW5wdXQuTU9VU0VfUklHSFRfRE9XTiA9IDIwMDI7XHJcbklucHV0Lk1PVVNFX1JJR0hUX1VQID0gMzAwMjtcclxuSW5wdXQuTU9VU0VfUklHSFRfQ0xJQ0sgPSA0MDAyO1xyXG5JbnB1dC5LRVlCT0FSRF9ET1dOID0gMTAwNTtcclxuSW5wdXQuS0VZQk9BUkRfVVAgPSAxMDA2O1xyXG5cclxuLy8gY29tbW9uanMgZXhwb3J0XHJcbm1vZHVsZS5leHBvcnRzID0gSW5wdXQ7IiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcclxuXHJcbi8qKlxyXG4gKiBBIGxpbmUsIHJlcHJlc2VudGVkIGJ5IHN0YXJ0IGFuZCBlbmQgcG9pbnRzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0gIHtWZWN0b3IyfSBzdGFydCB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcclxuICogQHBhcmFtICB7VmVjdG9yMn0gZW5kIHRoZSBlbmQgb2YgdGhlIGxpbmVcclxuICovXHJcbnZhciBMaW5lID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xyXG5cclxuXHR0aGlzLnN0YXJ0ID0gc3RhcnQ7XHJcblx0dGhpcy5lbmQgPSBlbmQ7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGdldCB0aGUgbGVuZ3RoIG9mIGxpbmVzXHJcbiAqIEByZXR1cm4ge051bWJlcn0gdGhlIGxlbmd0aFxyXG4gKi9cclxuTGluZS5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHJldHVybiB0aGlzLmVuZC5fc3VidHJhY3QodGhpcy5zdGFydCkubWFnbml0dWRlKCk7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGdldCBhIHJhbmRvbSBwb2ludCBhbG9uZyB0aGUgbGluZVxyXG4gKiBAcmV0dXJuIHtWZWN0b3IyfSB0aGUgcG9pbnRcclxuICovXHJcbkxpbmUucHJvdG90eXBlLnJhbmRvbVBvaW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHZhciBsZW4gPSB1dGlsLnJhbmRvbSgpO1xyXG5cdHZhciBvZmZzZXQgPSB0aGlzLmVuZC5fc3VidHJhY3QodGhpcy5zdGFydCk7XHJcblxyXG5cdHJldHVybiB0aGlzLnN0YXJ0Ll9hZGQob2Zmc2V0Ll9tdWx0aXBseShsZW4pKTtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0IHRoZSBjZW50ZXIgb2YgdGhlIGxpbmVcclxuICogQHJldHVybiB7VmVjdG9yMn0gdGhlIGNlbnRlclxyXG4gKi9cclxuTGluZS5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHZhciBvZmZzZXQgPSB0aGlzLmVuZC5fc3VidHJhY3QodGhpcy5zdGFydCk7XHJcblxyXG5cdHJldHVybiB0aGlzLnN0YXJ0Ll9hZGQob2Zmc2V0Ll9kaXZpZGUoMikpO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBnZXQgdGhlIG5vcm1hbCBvZiB0aGUgbGluZVxyXG4gKiBAcmV0dXJuIHtWZWN0b3IyfSB0aGUgbm9ybWFsXHJcbiAqL1xyXG5MaW5lLnByb3RvdHlwZS5nZXROb3JtYWwgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0cmV0dXJuIHRoaXMuZW5kLl9zdWJ0cmFjdCh0aGlzLnN0YXJ0KS5wZXJwKCkubm9ybWFsaXplKCk7XHJcblxyXG59O1xyXG5cclxuLy8gY29tbW9uanMgZXhwb3J0XHJcbm1vZHVsZS5leHBvcnRzID0gTGluZTsiLCIvKipcclxuICogQSBMb2FkZXIgdGFrZXMgY2FyZSBvZiBsb2FkaW5nIGFzc2V0cyBpbnRvIHlvdXIgZ2FtZS5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7QXJyYXl9IFthc3NldHNdIGEgbGlzdCBvZiBhc3NldHMgdG8gbG9hZFxyXG4gKi9cclxudmFyIExvYWRlciA9IGZ1bmN0aW9uKGFzc2V0cykge1xyXG5cclxuXHR0aGlzLnF1ZXVlID0gW107XHJcblx0dGhpcy5hc3NldHMgPSB7fTtcclxuXHR0aGlzLnRvdGFsID0gMDtcclxuXHR0aGlzLmRvbmUgPSAwO1xyXG5cdHRoaXMub25Db21wbGV0ZSA9IG51bGw7XHJcblxyXG5cdGlmKGFzc2V0cykge1xyXG5cdFx0dGhpcy5hZGQoYXNzZXRzKTtcclxuXHR9XHJcblxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBsb2FkIHRoZSBuZXh0IGFzc2V0XHJcbiAqIGlmIHRoZXJlIGlzbid0IG9uZSwgZW5kXHJcbiAqL1xyXG5Mb2FkZXIucHJvdG90eXBlLmxvYWROZXh0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHZhciBuZXh0ID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG5cclxuXHRpZihuZXh0KSB7XHJcblxyXG5cdFx0dGhpcy5sb2FkQXNzZXQobmV4dCk7XHJcblxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGxvYWQgdGhlIHBhc3NlZCBpbiBhc3NldFxyXG4gKiBhbmQgYXR0YWNoIGFsbCBldmVudHNcclxuICovXHJcbkxvYWRlci5wcm90b3R5cGUubG9hZEFzc2V0ID0gZnVuY3Rpb24oc3JjKSB7XHJcblxyXG5cdHZhciB0eXBlID0gdGhpcy5nZXRGaWxlVHlwZShzcmMpLFxyXG5cdFx0YXNzZXQsXHJcblx0XHRldmVudFRhcmdldCxcclxuXHRcdGxvYWRFdmVudCxcclxuXHRcdHNjb3BlID0gdGhpcztcclxuXHJcblx0c3dpdGNoKHR5cGUpIHtcclxuXHJcblx0XHRjYXNlICdqcGcnIDpcclxuXHRcdGNhc2UgJ2dpZicgOlxyXG5cdFx0Y2FzZSAncG5nJyA6XHJcblx0XHRcdGFzc2V0ID0gbmV3IEltYWdlKCk7XHJcblx0XHRcdGFzc2V0LnNyYyA9IHNyYztcclxuXHRcdFx0ZXZlbnRUYXJnZXQgPSBhc3NldDtcclxuXHRcdFx0bG9hZEV2ZW50ID0gJ2xvYWQnO1xyXG5cdFx0XHRicmVhaztcclxuXHJcblx0XHRjYXNlICdvZ2cnIDpcclxuXHRcdGNhc2UgJ21wMycgOlxyXG5cdFx0Y2FzZSAnd2F2JyA6XHJcblx0XHRcdGFzc2V0ID0gbmV3IEF1ZGlvKHNyYyk7XHJcblx0XHRcdGV2ZW50VGFyZ2V0ID0gYXNzZXQuYXVkaW87XHJcblx0XHRcdGxvYWRFdmVudCA9ICdsb2FkZWRkYXRhJztcclxuXHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0Y2FzZSAnanNvbicgOlxyXG5cdFx0XHR0aGlzLmFqYXhMb2FkKHNyYywgZnVuY3Rpb24oZGF0YSwgZSkgeyBzY29wZS5hc3NldExvYWRlZChkYXRhLCBzcmMsIGUpOyB9KTtcclxuXHRcdFx0ZXZlbnRUYXJnZXQgPSBudWxsO1xyXG5cdFx0XHRicmVhaztcclxuXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHRjb25zb2xlLmVycm9yKCd1bmtub3duIGZpbGUgZm9ybWF0Jyk7XHJcblx0XHRcdGV2ZW50VGFyZ2V0ID0gbnVsbDtcclxuXHRcdFx0YnJlYWs7XHJcblxyXG5cdH1cclxuXHJcblx0aWYoZXZlbnRUYXJnZXQpIHtcclxuXHRcdGV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIobG9hZEV2ZW50LCBmdW5jdGlvbihlKSB7IHNjb3BlLmFzc2V0TG9hZGVkKGFzc2V0LCBzcmMsIGUpOyB9KTtcclxuXHRcdGV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oZSkgeyBzY29wZS5hc3NldE5vdExvYWRlZChhc3NldCwgc3JjLCBlKTsgfSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdGhpcy5sb2FkTmV4dCgpO1xyXG5cclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUuYWpheExvYWQgPSBmdW5jdGlvbihzcmMsIGNhbGxiYWNrKSB7XHJcblxyXG5cdHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblxyXG5cdHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oZSkge1xyXG5cclxuXHRcdGlmICgoZS5jdXJyZW50VGFyZ2V0LnJlYWR5U3RhdGUgPT09IDQpICYmIChlLmN1cnJlbnRUYXJnZXQuc3RhdHVzID09PSAyMDAgfHwgZS5jdXJyZW50VGFyZ2V0LnN0YXR1cyA9PT0gMCkpIHtcclxuXHJcblx0XHRcdHZhciBkYXRhID0gSlNPTi5wYXJzZShlLmN1cnJlbnRUYXJnZXQucmVzcG9uc2VUZXh0KTtcclxuXHRcdFx0Y2FsbGJhY2soZGF0YSwgc3JjLCBlKTtcclxuXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0cmVxdWVzdC5vcGVuKCdHRVQnLCBzcmMsIHRydWUpO1xyXG5cdHJlcXVlc3Quc2VuZChudWxsKTtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogY2FsbGVkIGV2ZXJ5IHRpbWUgYW4gYXNzZXQgbG9hZHMgc3VjY2VzZnVsbHlcclxuICovXHJcbkxvYWRlci5wcm90b3R5cGUuYXNzZXRMb2FkZWQgPSBmdW5jdGlvbihhc3NldCwgc3JjLCBldmVudCkge1xyXG5cclxuXHR0aGlzLmFzc2V0c1tzcmNdID0gYXNzZXQ7XHJcblxyXG5cdGlmKCsrdGhpcy5kb25lID49IHRoaXMudG90YWwpIHsgdGhpcy5jb21wbGV0ZSgpOyB9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNhbGxlZCBldmVyeSB0aW1lIGFuIGFzc2V0IGRvZXMgbm90IGxvYWRcclxuICovXHJcbkxvYWRlci5wcm90b3R5cGUuYXNzZXROb3RMb2FkZWQgPSBmdW5jdGlvbihhc3NldCwgc3JjLCBldmVudCkge1xyXG5cclxuXHRpZigrK3RoaXMuZG9uZSA9PSB0aGlzLnRvdGFsKSB7IHRoaXMuY29tcGxldGUoKTsgfVxyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBjYWxsZWQgb25jZSBldmVyeXRoaW5nIGhhcyBsb2FkZWRcclxuICovXHJcbkxvYWRlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0Ly8gcmVzZXQgZXZlcnl0aGluZ1xyXG5cdHRoaXMucXVldWUgPSBbXTtcclxuXHR0aGlzLnRvdGFsID0gMDtcclxuXHR0aGlzLmRvbmUgPSAwO1xyXG5cclxuXHRpZih0eXBlb2YgdGhpcy5vbkNvbXBsZXRlID09ICdmdW5jdGlvbicpIHsgdGhpcy5vbkNvbXBsZXRlKHRoaXMuYXNzZXRzKTsgfVxyXG5cclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUuZ2V0RmlsZVR5cGUgPSBmdW5jdGlvbiggc3JjICkge1xyXG5cclxuXHR2YXIgZXh0ID0gc3JjLnNwbGl0KCcuJykucG9wKCk7XHJcblxyXG5cdGlmKGV4dCA9PSBzcmMpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG5cdHJldHVybiBleHQ7XHJcblxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBwZXJjZW50YWdlIGNvbXBsZXRlXHJcbiAqL1xyXG5Mb2FkZXIucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHJldHVybiAoIDEwMCAvIHRoaXMudG90YWwgKSAqIHRoaXMuZG9uZTtcclxuXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIGFkZCBhbiBhc3NldCBvciBhc3NldHMgdG8gdGhlIHF1ZXVlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBhc3NldHMgb25lIG9yIG1vcmUgdXJsc1xyXG4gKi9cclxuTG9hZGVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihhc3NldHMpIHtcclxuXHJcblx0aWYodHlwZW9mIGFzc2V0cyAhPSAnb2JqZWN0JykgeyBhc3NldHMgPSBbYXNzZXRzXTsgfVxyXG5cclxuXHRmb3IodmFyIGkgPSAwLCBsZW4gPSBhc3NldHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHJcblx0XHR0aGlzLnF1ZXVlLnB1c2goYXNzZXRzW2ldKTtcclxuXHJcblx0XHQvLyBwbGFjZWhvbGRlciB1bnRpbCBsb2FkZWRcclxuXHRcdGFzc2V0c1thc3NldHNbaV1dID0gZmFsc2U7XHJcblxyXG5cdFx0dGhpcy50b3RhbCsrO1xyXG5cclxuXHR9XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUuc2V0T25Mb2FkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcblx0dGhpcy5vbkNvbXBsZXRlID0gY2FsbGJhY2s7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBzdGFydCBsb2FkaW5nXHJcbiAqL1xyXG5Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihhc3NldHMsIGNhbGxiYWNrKSB7XHJcblxyXG4gICAgaWYoYXNzZXRzKSB7XHJcblxyXG5cdFx0dGhpcy5hZGQoYXNzZXRzKTtcclxuXHJcblx0fVxyXG5cclxuICAgIGlmKGNhbGxiYWNrKSB7XHJcblxyXG5cdFx0dGhpcy5vbkNvbXBsZXRlID0gY2FsbGJhY2s7XHJcblxyXG4gICAgfVxyXG5cclxuXHRpZighdGhpcy5xdWV1ZS5sZW5ndGgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5jb21wbGV0ZSgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHJldHVybiB0aGlzLmxvYWROZXh0KCk7XHJcblxyXG59O1xyXG5cclxuLy8gY29tbW9uanMgZXhwb3J0XHJcbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyOyIsInZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi9WZWN0b3IyJyk7XHJcbnZhciBMaW5lID0gcmVxdWlyZSgnLi9MaW5lJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XHJcblxyXG4vKipcclxuICogQSByZWN0YW5nbGUuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge051bWJlcn0gW3dpZHRoPTFdIFRoZSBzdGFydGluZyB3aWR0aCBvZiB0aGUgcmVjdGFuZ2xlLlxyXG4gKiBAcGFyYW0ge051bWJlcn0gW2hlaWdodD0xXSBUaGUgc3RhcnRpbmcgaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUuXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gW3Bvc2l0aW9uPVswLDBdXSBUaGUgc3RhcnRpbmcgcG9zaXRpb24gb2YgdGhlIHJlY3RhbmdsZS5cclxuICogQGV4YW1wbGUgdmFyIHNoYXBlID0gbmV3IFJlY3QoMywzKTtcclxuICovXHJcbnZhciBSZWN0ID0gZnVuY3Rpb24oIHdpZHRoLCBoZWlnaHQsIHBvc2l0aW9uICkge1xyXG5cclxuXHQvKiogVGhlIHdpZHRoIG9mIHRoZSByZWN0YW5nbGUuICovXHJcblx0dGhpcy53aWR0aCA9IDE7XHJcblxyXG5cdC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUuICovXHJcblx0dGhpcy5oZWlnaHQgPSAxO1xyXG5cclxuXHQvKiogVGhlIHBvc2l0aW9uIG9mIHRoZSByZWN0YW5nbGUuICovXHJcblx0dGhpcy5wb3NpdGlvbiA9IG51bGw7XHJcblxyXG5cdGlmKCBoZWlnaHQgPT09IHVuZGVmaW5lZCApIHsgaGVpZ2h0ID0gd2lkdGg7IH1cclxuXHJcblx0aWYod2lkdGgpIHsgdGhpcy53aWR0aCA9IHBhcnNlRmxvYXQod2lkdGgpOyB9XHJcblxyXG5cdGlmKGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IHBhcnNlRmxvYXQoaGVpZ2h0KTsgfVxyXG5cclxuXHRpZihwb3NpdGlvbikge1xyXG5cclxuXHRcdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbi5jbG9uZSgpO1xyXG5cclxuXHR9IGVsc2Uge1xyXG5cclxuXHRcdHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yMigpO1xyXG5cclxuXHR9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEByZXR1cm4ge1JlY3R9IEFuIGV4YWN0IGNvcHkgb2YgdGhpcyBSZWN0LlxyXG4gKi9cclxuUmVjdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBSZWN0KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLnBvc2l0aW9uLmNsb25lKCkpO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBBbHRlciB0aGlzIFJlY3Qgc28gdGhhdCBpdCBiZWNvbWVzIGFuIGV4YWN0IGNvcHkgb2YgdGhlIHBhc3NlZCBSZWN0LlxyXG4gKiBAcGFyYW0ge1JlY3R9IHJlY3QgQSBSZWN0IHRvIGNvcHkgZnJvbS5cclxuICogQHJldHVybiB7UmVjdH0gSXRzZWxmLiBVc2VmdWwgZm9yIGNoYWluaW5nLlxyXG4gKi9cclxuUmVjdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24ocmVjdCkge1xyXG5cclxuXHRpZighcmVjdCB8fCAhKHJlY3QgaW5zdGFuY2VvZiBSZWN0KSkgeyByZXR1cm4gdGhpczsgfVxyXG5cclxuXHR0aGlzLndpZHRoID0gcmVjdC53aWR0aDtcclxuXHR0aGlzLmhlaWdodCA9IHJlY3QuaGVpZ2h0O1xyXG5cdHRoaXMucG9zaXRpb24gPSByZWN0LnBvc2l0aW9uLmNsb25lKCk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIHtWZWN0b3IyfSBUaGUgY2VudGVyIG9mIHRoZSByZWN0YW5nbGUuXHJcbiAqL1xyXG5SZWN0LnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBWZWN0b3IyKFxyXG5cclxuXHRcdHRoaXMucG9zaXRpb24ueCArIHRoaXMud2lkdGggLyAyLFxyXG5cdFx0dGhpcy5wb3NpdGlvbi55ICsgdGhpcy5oZWlnaHQgLyAyXHJcblxyXG5cdCk7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1vdmUgdGhlIFJlY3Qgc28gdGhhdCBpdCdzIGNlbnRlciBpcyBhdCB0aGUgc3BlY2lmaWVkIHBvaW50LlxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvcyBUaGUgbmV3IGNlbnRlciBmb3IgdGhlIFJlY3QuXHJcbiAqIEByZXR1cm4ge1JlY3R9IEl0c2VsZi4gVXNlZnVsIGZvciBjaGFpbmluZy5cclxuICovXHJcblJlY3QucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uKHBvcykge1xyXG5cclxuXHR0aGlzLnBvc2l0aW9uLnggPSBwb3MueCAtIHRoaXMud2lkdGggLyAyO1xyXG5cdHRoaXMucG9zaXRpb24ueSA9IHBvcy55IC0gdGhpcy5oZWlnaHQgLyAyO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5SZWN0LnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uKHNjYWxlKSB7XHJcblxyXG5cdHRoaXMud2lkdGggKj0gc2NhbGU7XHJcblx0dGhpcy5oZWlnaHQgKj0gc2NhbGU7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBFeHBhbmQgdGhlIFJlY3Qgc28gdGhhdCBpdCBoYXMgYSBuZXcgd2lkdGggYW5kIGhlaWdodCwgYnV0IHRoZSBzYW1lIGNlbnRlci5cclxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIEEgZmFjdG9yIHRvIG11bHRpcGx5IHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGJ5LlxyXG4gKiBAcmV0dXJuIHtSZWN0fSBJdHNlbGYuIFVzZWZ1bCBmb3IgY2hhaW5pbmcuXHJcbiAqL1xyXG5SZWN0LnByb3RvdHlwZS5leHBhbmQgPSBmdW5jdGlvbihzY2FsZSkge1xyXG5cclxuXHQvLyBnZXQgaXQgZmlyc3QgdG8gZXhwYW5kIGZyb20gY2VudGVyXHJcblx0dmFyIGNlbnRlciA9IHRoaXMuZ2V0Q2VudGVyKCk7XHJcblxyXG5cdHRoaXMuc2NhbGUoc2NhbGUpO1xyXG5cclxuXHR0aGlzLnNldENlbnRlcihjZW50ZXIpO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogc2hyaW5rIHJlY3RhbmdsZSBieSBhIHNldCBhbW91bnRcclxuICogQHBhcmFtIGFtb3VudCBob3cgbXVjaCB0byBjb250cmFjdFxyXG4gKi9cclxuUmVjdC5wcm90b3R5cGUuY29udHJhY3QgPSBmdW5jdGlvbihhbW91bnQpIHtcclxuXHJcblx0dGhpcy5wb3NpdGlvbi54ICs9IGFtb3VudDtcclxuXHR0aGlzLnBvc2l0aW9uLnkgKz0gYW1vdW50O1xyXG5cdHRoaXMud2lkdGggLT0gMiAqIGFtb3VudDtcclxuXHR0aGlzLmhlaWdodCAtPSAyICogYW1vdW50O1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhIHJhbmRvbSBwb2ludCBpbnNpZGUgdGhlIFJlY3RcclxuICogQHJldHVybiB7VmVjdG9yMn0gYSByYW5kb20gcG9pbnQgaW5zaWRlIGluIHRoZSBSZWN0XHJcbiAqL1xyXG5SZWN0LnByb3RvdHlwZS5yYW5kb21Qb2ludCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5wb3NpdGlvbi5fYWRkKG5ldyBWZWN0b3IyKFxyXG5cdFx0dXRpbC5yYW5kb20oKSAqIHRoaXMud2lkdGgsXHJcblx0XHR1dGlsLnJhbmRvbSgpICogdGhpcy5oZWlnaHRcclxuXHQpKTtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogcmV0dXJuIGFuIGFycmF5IG9mIGxpbmVzXHJcbiAqIHJlcHJlc2VudGluZyB0aGUgZWRnZXMgb2YgdGhlIHJlY3RhbmdsZSBlZGdlc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgb2YgbGluZXNcclxuICovXHJcblJlY3QucHJvdG90eXBlLmdldEVkZ2VzID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHZhciB2ID0gdGhpcy5nZXRWZXJ0aWNlcygpO1xyXG5cclxuXHRyZXR1cm4gW1xyXG5cdFx0bmV3IExpbmUodlswXSwgdlsxXSksXHJcblx0XHRuZXcgTGluZSh2WzFdLCB2WzJdKSxcclxuXHRcdG5ldyBMaW5lKHZbMl0sIHZbM10pLFxyXG5cdFx0bmV3IExpbmUodlszXSwgdlswXSlcclxuXHRdO1xyXG5cclxufTtcclxuXHJcblJlY3QucHJvdG90eXBlLmdldFZlcnRpY2VzID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHZhciB2ZXJ0aWNlcyA9IFtcclxuXHRcdHRoaXMucG9zaXRpb24uY2xvbmUoKSxcclxuXHRcdHRoaXMucG9zaXRpb24uY2xvbmUoKSxcclxuXHRcdHRoaXMucG9zaXRpb24uY2xvbmUoKSxcclxuXHRcdHRoaXMucG9zaXRpb24uY2xvbmUoKVxyXG5cdF07XHJcblxyXG5cdHZlcnRpY2VzWzFdLnggKz0gdGhpcy53aWR0aDtcclxuXHR2ZXJ0aWNlc1syXS54ICs9IHRoaXMud2lkdGg7XHJcblx0dmVydGljZXNbMl0ueSArPSB0aGlzLmhlaWdodDtcclxuXHR2ZXJ0aWNlc1szXS55ICs9IHRoaXMuaGVpZ2h0O1xyXG5cclxuXHRyZXR1cm4gdmVydGljZXM7XHJcbn07XHJcblxyXG5SZWN0LmZyb21BcnJheSA9IGZ1bmN0aW9uKGFycikge1xyXG5cclxuXHR2YXIgcG9zID0gbmV3IFZlY3RvcjIoKTtcclxuXHJcblx0aWYoYXJyLmxlbmd0aCA+PSA0KSB7XHJcblxyXG5cdFx0cG9zLnggPSBwYXJzZUludChhcnJbMl0pO1xyXG5cdFx0cG9zLnkgPSBwYXJzZUludChhcnJbM10pO1xyXG5cclxuXHR9XHJcblxyXG5cdHJldHVybiBuZXcgUmVjdChcclxuXHRcdHBhcnNlSW50KGFyclswXSksXHJcblx0XHRwYXJzZUludChhcnJbMV0pLFxyXG5cdFx0cG9zXHJcblx0KTtcclxuXHJcbn07XHJcblxyXG4vLyBjb21tb25qcyBleHBvcnRcclxubW9kdWxlLmV4cG9ydHMgPSBSZWN0OyIsInZhciBSZWN0ID0gcmVxdWlyZSgnLi9SZWN0Jyk7XHJcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi9WZWN0b3IyJyk7XHJcblxyXG4vKipcclxuICogU3ByaXRlXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0gIHtJbWFnZX0gYW4gaW1hZ2VcclxuICogQHBhcmFtICB7UmVjdH0gdGhlIHN1YiBhcmVhIG9mIHRoZSBpbWFnZSB3aGljaCBjb25zdGl0dXRlcyB0aGUgc3ByaXRlXHJcbiAqL1xyXG52YXIgU3ByaXRlID0gZnVuY3Rpb24oaW1hZ2UsIHNvdXJjZSkge1xyXG5cclxuXHRpZighaW1hZ2UpIHsgaW1hZ2UgPSBTcHJpdGUuZGVmYXVsdEltYWdlOyB9XHJcblxyXG5cdGlmKCFzb3VyY2UpIHtcclxuXHRcdHNvdXJjZSA9IG5ldyBSZWN0KGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpO1xyXG5cdH1cclxuXHJcblx0dGhpcy5pbWFnZSA9IGltYWdlO1xyXG5cclxuXHQvLyB0aGUgc3ViIHJlZ2lvbiBvZiB0aGUgaW1hZ2UgdG8gZHJhd1xyXG5cdHRoaXMuc291cmNlID0gc291cmNlO1xyXG5cclxuXHQvLyBkZWZhdWx0IHRvIHRvcCBsZWZ0IGRyYXdpbmcgb3JpZ2luXHJcblx0dGhpcy5vcmlnaW4gPSBuZXcgVmVjdG9yMigpO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBzZXRzIHRoZSBvcmlnaW4sIHdoaWNoIGlzIHRoZSBwb2ludCB0aGUgc3BydGllIGlzIGRyYXduIGFyb3VuZFxyXG4gKiBkZWZhdWx0IGJlaGF2aW91ciBpcyB0b3AgbGVmdCBjb3JuZXJcclxuICovXHJcblNwcml0ZS5wcm90b3R5cGUuc2V0T3JpZ2luID0gZnVuY3Rpb24gKCBvcmlnaW4gKSB7XHJcblxyXG5cdC8vIGFsbG93IHNwZWNpZmljIG9yaWdpblxyXG5cdGlmIChvcmlnaW4gaW5zdGFuY2VvZiBWZWN0b3IyKSB7XHJcblxyXG5cdFx0dGhpcy5vcmlnaW4gPSBvcmlnaW47XHJcblxyXG5cdH0gZWxzZSBpZihvcmlnaW4gPT0gU3ByaXRlLk9SSUdJTl9CT1RUT01fQ0VOVEVSKSB7XHJcblxyXG5cdFx0dGhpcy5vcmlnaW4gPSBuZXcgVmVjdG9yMiggdGhpcy5zb3VyY2Uud2lkdGggLyAyLCB0aGlzLnNvdXJjZS5oZWlnaHQgKS5mbG9vcigpO1xyXG5cclxuXHR9IGVsc2UgaWYob3JpZ2luID09IFNwcml0ZS5PUklHSU5fQ0VOVEVSKSB7XHJcblxyXG5cdFx0dGhpcy5vcmlnaW4gPSBuZXcgVmVjdG9yMiggdGhpcy5zb3VyY2Uud2lkdGggLyAyLCB0aGlzLnNvdXJjZS5oZWlnaHQgLyAyICkuZmxvb3IoKTtcclxuXHJcblx0fSBlbHNlIGlmKG9yaWdpbiA9PSBTcHJpdGUuVE9QX0xFRlQpIHtcclxuXHJcblx0XHR0aGlzLm9yaWdpbiA9IG5ldyBWZWN0b3IyKCk7XHJcblxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHN0YXRpYyBkZWZpbmVzIGZvciB0aGlzIGNsYXNzXHJcbiAqL1xyXG5TcHJpdGUuT1JJR0lOX1RPUF9MRUZUID0gMDtcclxuU3ByaXRlLk9SSUdJTl9CT1RUT01fQ0VOVEVSID0gMTtcclxuU3ByaXRlLk9SSUdJTl9DRU5URVIgPSAyO1xyXG5cclxuLyoqXHJcbiAqIFNsaWNlIGFuIGltYWdlIHVwIGludG8gc21hbGxlciBzcHJpdGVzXHJcbiAqIEBzdGF0aWNcclxuICogQHBhcmFtICB7SW1hZ2V9IGltYWdlIHRoZSBpbWFnZSB0byBzbGljZSB1cFxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHdpZHRoIHRoZSB3aWR0aCBvZiBlYWNoIHNwcml0ZVxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGhlaWdodCB0aGUgaGVpZ2h0IG9mIGVhY2ggc3ByaXRlXHJcbiAqIEByZXR1cm4ge1Nwcml0ZVtdfSBhbiBhcnJheSBvZiBzcHJpdGVzXHJcbiAqL1xyXG5TcHJpdGUuc2xpY2UgPSBmdW5jdGlvbihpbWFnZSwgd2lkdGgsIGhlaWdodCwgb3JpZ2luKSB7XHJcblxyXG5cdC8vIGhhbmRsZSBhIGxpc3Qgb2YgcmVjdHNcclxuXHRpZih0eXBlb2Ygd2lkdGggPT0gJ29iamVjdCcpIHtcclxuXHJcblx0XHR2YXIgcmVjdHMgPSB3aWR0aCwgc3ByaXRlcyA9IHt9O1xyXG5cclxuXHRcdHJlY3RzLmZvckVhY2goZnVuY3Rpb24oZGF0YSl7XHJcblxyXG5cdFx0XHR2YXIgbmFtZSA9IGRhdGFbMF07XHJcblx0XHRcdHZhciBzb3VyY2UgPSBSZWN0LmZyb21BcnJheShkYXRhLnNsaWNlKDEsNSkpO1xyXG5cdFx0XHR2YXIgc3ByaXRlID0gbmV3IFNwcml0ZShpbWFnZSwgc291cmNlKTtcclxuXHJcblx0XHRcdGlmKGRhdGFbNV0gIT0gdW5kZWZpbmVkICYmIGRhdGFbNl0gIT0gdW5kZWZpbmVkKSB7XHJcblxyXG5cdFx0XHRcdHNwcml0ZS5zZXRPcmlnaW4oIFZlY3RvcjIuZnJvbUFycmF5KGRhdGEuc2xpY2UoNSw3KSkgKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHNwcml0ZXNbbmFtZV0gPSBzcHJpdGU7XHJcblxyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdC8vIG9yIGp1c3Qgc2xpY2UgaXQgdXAgb24gYSBncmlkXHJcblx0fSBlbHNlIHtcclxuXHJcblx0XHR2YXIgeCwgeSwgcG9zaXRpb24sIHNvdXJjZSwgc3ByaXRlLCBzcHJpdGVzID0gW107XHJcblxyXG5cdFx0Zm9yKHkgPSAwOyB5IDwgaW1hZ2UuaGVpZ2h0OyB5ICs9IGhlaWdodCkge1xyXG5cclxuXHRcdFx0Zm9yKHggPSAwOyB4IDwgaW1hZ2Uud2lkdGg7IHggKz0gd2lkdGgpIHtcclxuXHJcblx0XHRcdFx0cG9zaXRpb24gPSBuZXcgVmVjdG9yMih4LCB5KTtcclxuXHRcdFx0XHRzb3VyY2UgPSBuZXcgUmVjdCh3aWR0aCwgaGVpZ2h0LCBwb3NpdGlvbik7XHJcblx0XHRcdFx0c3ByaXRlID0gbmV3IFNwcml0ZShpbWFnZSwgc291cmNlKTtcclxuXHJcblx0XHRcdFx0aWYob3JpZ2luKSB7XHJcblx0XHRcdFx0XHRzcHJpdGUuc2V0T3JpZ2luKG9yaWdpbik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRzcHJpdGVzLnB1c2goc3ByaXRlKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHNwcml0ZXM7XHJcblxyXG59O1xyXG5cclxuU3ByaXRlLnNvbGlkQ29sb3IgPSBmdW5jdGlvbihjb2xvciwgd2lkdGgsIGhlaWdodCkge1xyXG5cclxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcblx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuXHRjYW52YXMud2lkdGggPSB3aWR0aCB8fCAxO1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgfHwgMTtcclxuXHJcblx0Y3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG5cdGN0eC5maWxsUmVjdCgwLDAsMSwxKTtcclxuXHJcblx0cmV0dXJuIG5ldyBTcHJpdGUoY2FudmFzKTtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogc21hbGwgdHJhbnNwYXJlbnQgZ2lmIHRvIHVzZSBhcyBhIGRlZmF1bHRcclxuICogQHN0YXRpY1xyXG4gKiBAdHlwZSB7SW1hZ2V9XHJcbiAqL1xyXG5TcHJpdGUuZGVmYXVsdEltYWdlID0gbmV3IEltYWdlKCk7XHJcblNwcml0ZS5kZWZhdWx0SW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBQUFBQUNINUJBRUtBQUVBTEFBQUFBQUJBQUVBQUFJQ1RBRUFPdz09JztcclxuXHJcbi8vIGNvbW1vbmpzIGV4cG9ydFxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZTsiLCIvKipcclxuICogYSB0d28gZGltZW5zaW9uYWwgdmVjdG9yXHJcbiAqIHdoZXJlIGFwcHJvcHJpYXRlIGFsbCBtZXRob2RzIHJldHVybiB0aGlzLCBzbyB0aGF0IG1ldGhlbWF0aWNhbCBvcGVyYXRpb25zIGNhbiBiZSBjaGFpbmVkXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge251bWJlcn0geCBhIGNvb3JkaW5hdGUgb24gdGhlIHggYXhpc1xyXG4gKiBAcGFyYW0ge251bWJlcn0geSBhIGNvb3JkaW5hdGUgb24gdGhlIHkgYXhpc1xyXG4gKi9cclxudmFyIFZlY3RvcjIgPSBmdW5jdGlvbih4LHkpIHtcclxuXHJcblx0dGhpcy54ID0geCB8fCAwO1xyXG5cdHRoaXMueSA9IHkgfHwgMDtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogc2V0IHRoZSB2ZWN0b3IsIGVpdGhlciB1c2luZyB4IGFuZCB5LCBvciBhbm90aGVyIHZlY3RvclxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oeCwgeSkge1xyXG5cclxuXHRpZih4IGluc3RhbmNlb2YgVmVjdG9yMikge1xyXG5cclxuXHRcdHRoaXMueCA9IHgueCB8fCAwO1xyXG5cdFx0dGhpcy55ID0geC55IHx8IDA7XHJcblxyXG5cdH0gZWxzZSB7XHJcblxyXG5cdFx0dGhpcy54ID0geCB8fCAwO1xyXG5cdFx0dGhpcy55ID0geSB8fCAwO1xyXG5cclxuXHR9XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhZGRzIGFub3RoZXIgdmVjdG9yIHRvIHRoaXMgb25lXHJcbiAqIEBleGFtcGxlIG5ldyBWZWN0b3IoMiwxKS5hZGQobmV3IFZlY3RvcigzLDEpIC8vIFs1LDJdXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gdiB0aGUgdmVjdG9yIHRvIGFkZFxyXG4gKiBAcmV0dXJuIHtWZWN0b3IyfSB0aGUgbW9kaWZpZWQgb3JpZ2luYWwgdmVjdG9yXHJcbiAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2KSB7XHJcblxyXG5cdHRoaXMueCArPSB2Lng7XHJcblx0dGhpcy55ICs9IHYueTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHN1YnRyYWN0cyBhbm90aGVyIHZlY3RvciBmcm9tIHRoaXMgb25lXHJcbiAqIGZvciBleGFtcGxlOiBbMSwzXSAtIFsyLDJdID0gWy0xLDFdXHJcbiAqIEByZXR1cm4ge1ZlY3RvcjJ9IHRoZSBtb2RpZmllZCBvcmlnaW5hbCB2ZWN0b3JcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24odikge1xyXG5cclxuXHR0aGlzLnggLT0gdi54O1xyXG5cdHRoaXMueSAtPSB2Lnk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBtdWx0aXBsaWVzIHRoaXMgdmVjdG9yIGJ5IGEgZ2l2ZW4gYW1vdW50XHJcbiAqIGZvciBleGFtcGxlOiBbMSwyXSAqIDMgPSBbMyw2XVxyXG4gKiBAcmV0dXJuIHtWZWN0b3IyfSB0aGUgbW9kaWZpZWQgb3JpZ2luYWwgdmVjdG9yXHJcbiAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uKGFtb3VudCkge1xyXG5cclxuXHR0aGlzLnggKj0gYW1vdW50O1xyXG5cdHRoaXMueSAqPSBhbW91bnQ7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBkaXZpZGVzIHRoaXMgdmVjdG9yIGJ5IGEgZ2l2ZW4gYW1vdW50XHJcbiAqIGZvciBleGFtcGxlOiBbMiw2XSAvIDIgPSBbMSwzXVxyXG4gKiBAcmV0dXJuIHtWZWN0b3IyfSB0aGUgbW9kaWZpZWQgb3JpZ2luYWwgdmVjdG9yXHJcbiAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbihzY2FsYXIpIHtcclxuXHJcblx0dGhpcy54IC89IHNjYWxhcjtcclxuXHR0aGlzLnkgLz0gc2NhbGFyO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogYWx0ZXJzIHRoZSB2ZWN0b3Igc28gdGhhdCBpdHMgbGVuZ3RoIGlzIDEsIGJ1dCBpdCByZXRhaW5zIHRoZSBzYW1lIGRpcmVjdGlvblxyXG4gKiBmb3IgZXhhbXBsZTogWzAsMTBdLm5vcm1hbGl6ZSgpID0gWzAsMV1cclxuICogQHJldHVybiB7VmVjdG9yMn0gdGhlIG1vZGlmaWVkIG9yaWdpbmFsIHZlY3RvclxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdGlmKCF0aGlzLmlzWmVybygpKSB7XHJcblxyXG5cdFx0dmFyIG0gPSB0aGlzLm1hZ25pdHVkZSgpO1xyXG5cdFx0dGhpcy54IC89IG07XHJcblx0XHR0aGlzLnkgLz0gbTtcclxuXHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG5WZWN0b3IyLnByb3RvdHlwZS5mbG9vciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMueCk7XHJcblx0dGhpcy55ID0gTWF0aC5mbG9vcih0aGlzLnkpO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG5WZWN0b3IyLnByb3RvdHlwZS5yb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR0aGlzLnggPSBNYXRoLnJvdW5kKHRoaXMueCk7XHJcblx0dGhpcy55ID0gTWF0aC5yb3VuZCh0aGlzLnkpO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogYWJzb2x1dGUgKG5vbiBuZWdhdGl2ZSkgdmVyc2lvbiBvZiB0aGUgdmVjdG9yXHJcbiAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0dGhpcy54ID0gTWF0aC5hYnModGhpcy54KTtcclxuXHR0aGlzLnkgPSBNYXRoLmFicyh0aGlzLnkpO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogZG90IHByb2R1Y3Qgb2YgdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXJcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKHYpIHtcclxuXHJcblx0cmV0dXJuICh0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkpO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBhbHRlcnMgdGhlIGxlbmd0aCBvZiB0aGUgdmVjdG9yIHdpdGhvdXQgY2hhbmdpbmcgdGhlIGRpcmVjdGlvblxyXG4gKiBmb3IgZXhhbXBsZTogWzAsNV0uc2V0TWFnbml0dWRlKDIpID0gWzAsMl1cclxuICogQHJldHVybiB7VmVjdG9yMn0gdGhlIG1vZGlmaWVkIG9yaWdpbmFsIHZlY3RvclxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUuc2V0TWFnbml0dWRlID0gZnVuY3Rpb24obSkge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5ub3JtYWxpemUoKS5tdWx0aXBseShtKTtcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogdGVzdCBpZiBhIGdpdmVuIHZlY3RvciBpcyBpZGVudGljYWwgdG8gdGhpcyBvbmVcclxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgaWRlbnRpY2FsLCBmYWxzZSBvdGhlcndpc2VcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHYpIHtcclxuXHJcblx0cmV0dXJuICh0aGlzLnggPT0gdi54ICYmIHRoaXMueSA9PSB2LnkpO1xyXG5cclxufTtcclxuXHJcblZlY3RvcjIucHJvdG90eXBlLm5lYXIgPSBmdW5jdGlvbih2LCB0aHJlc2hvbGQpIHtcclxuXHJcblx0aWYoIXRocmVzaG9sZCkgeyB0aHJlc2hvbGQgPSBWZWN0b3IyLk5FQVJfVEhSRVNIT0xEOyB9XHJcblxyXG5cdHJldHVybiB0aGlzLmRpc3RhbmNlVG8odikgPCB0aHJlc2hvbGQ7XHJcblxyXG59XHJcblxyXG4vKipcclxuICogY2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIHRoZSB2ZWN0b3JcclxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgbGVuZ3RoIG9mIHRoZSB2ZWN0b3JcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLm1hZ25pdHVkZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRyZXR1cm4gTWF0aC5zcXJ0KCh0aGlzLnggKiB0aGlzLngpICsgKHRoaXMueSAqIHRoaXMueSkpO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uKGEpIHtcclxuXHJcblx0dmFyIGNvcyA9IE1hdGguY29zKGEpLFxyXG5cdFx0c2luID0gTWF0aC5zaW4oYSksXHJcblx0XHR4ID0gKGNvcyAqIHRoaXMueCkgLSAoc2luICogdGhpcy55KSxcclxuXHRcdHkgPSAoc2luICogdGhpcy54KSArIChjb3MgKiB0aGlzLnkpO1xyXG5cclxuXHR0aGlzLnggPSB4O1xyXG5cdHRoaXMueSA9IHk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBzbmFwcyB0byBhIGNhcmRpbmFsIGRpcmVjdGlvblxyXG4gKiBcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLnRvQ2FyZGluYWwgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0aWYoIXRoaXMuaXNaZXJvKCkpIHtcclxuXHJcblx0XHRpZihNYXRoLmFicyh0aGlzLngpID4gTWF0aC5hYnModGhpcy55KSkge1xyXG5cclxuXHRcdFx0aWYodGhpcy54ID4gMCkgeyB0aGlzLnggPSAxOyB9XHJcblx0XHRcdGVsc2UgeyB0aGlzLnggPSAtMTsgfVxyXG5cclxuXHRcdFx0dGhpcy55ID0gMDtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0aWYodGhpcy55ID4gMCkgeyB0aGlzLnkgPSAxOyB9XHJcblx0XHRcdGVsc2UgeyB0aGlzLnkgPSAtMTsgfVxyXG5cclxuXHRcdFx0dGhpcy54ID0gMDtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHBlcnBlbmRpY3VsYXIgdmVjdG9yLCBmb3Igbm9ybWFscyBldGNcclxuICogQHJldHVybiB7VmVjdG9yMn0gdGhlIHZlY3RvciBwZXJwZW5kaWN1bGFyIHRvIHRoaXMgb25lXHJcbiAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5wZXJwID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHZhciB0bXAgPSB0aGlzLng7XHJcblxyXG5cdHRoaXMueCA9IHRoaXMueTtcclxuXHR0aGlzLnkgPSAtdG1wO1xyXG5cclxuXHRyZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG4vKipcclxuICogcHJvamVjdCB0aGlzIHZlY3RvciBvbnRvIGFuIGF4aXNcclxuICogXHJcbiAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5wcm9qZWN0ID0gZnVuY3Rpb24oYXhpcykge1xyXG5cclxuXHR2YXIgZG90ID0gdGhpcy5kb3QoYXhpcyk7XHJcblx0dmFyIHNjYWxhciA9IGRvdCAvICgoYXhpcy54ICogYXhpcy54KSArIChheGlzLnkgKiBheGlzLnkpKTtcclxuXHJcblx0cmV0dXJuIG5ldyBWZWN0b3IyKFxyXG5cdFx0YXhpcy54ICogc2NhbGFyLFxyXG5cdFx0YXhpcy55ICogc2NhbGFyXHJcblx0KTtcclxuXHRcclxufTtcclxuXHJcbi8qKlxyXG4gKlxyXG4gKiB2IC0gMiAqIHZlY3RvciAuIG5vcm1hbCAqIG5vcm1hbFxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUucmVmbGVjdCA9IGZ1bmN0aW9uKG5vcm1hbCkge1xyXG5cclxuXHR2YXIgZDIgPSB0aGlzLmRvdChub3JtYWwpICogMjtcclxuXHJcblx0dGhpcy54IC09IGQyICogbm9ybWFsLng7XHJcbiAgICB0aGlzLnkgLT0gZDIgKiBub3JtYWwueTtcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNyZWF0ZXMgYSBjb3B5IG9mIHRoZSBjdXJyZW50IHZlY3RvclxyXG4gKiBAcmV0dXJuIHtWZWN0b3IyfSBhIGNvcHkgb2YgdGhpcyB2ZWN0b3JcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHJldHVybiBuZXcgVmVjdG9yMih0aGlzLngsIHRoaXMueSk7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIG1ha2VzIHRoaXMgYSBjb3B5IG9mIHRoZSBwYXNzZWQgdmVjdG9yXHJcbiAqIEByZXR1cm4ge1ZlY3RvcjJ9IHNlbGZcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbih2ZWMpIHtcclxuXHJcblx0dGhpcy54ID0gdmVjLng7XHJcblx0dGhpcy55ID0gdmVjLnk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBcclxuICogdGhlIG9wcG9zaXRlIG9mIHRoZSB2ZWN0b3JcclxuICovXHJcblZlY3RvcjIucHJvdG90eXBlLmludmVydCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR0aGlzLnggPSAtdGhpcy54O1xyXG5cdHRoaXMueSA9IC10aGlzLnk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcblxyXG4vKipcclxuICogXHJcbiAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5zbmFwID0gZnVuY3Rpb24oIG5lYXIgKSB7XHJcblxyXG5cdHRoaXMuZGl2aWRlKG5lYXIpLmZsb29yKCkubXVsdGlwbHkobmVhcik7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG5cclxufTtcclxuXHJcblxyXG4vKiogbm90IHJlYWxseSBhIGNyb3NzIHByb2R1Y3QsIGJ1dCB1c2VmdWwgZm9yIHNvbWV0aGluZyAqL1xyXG5WZWN0b3IyLnByb3RvdHlwZS5jcm9zcyA9IGZ1bmN0aW9uKCB2ICkge1xyXG5cclxuXHRyZXR1cm4gKCB0aGlzLnggKiB2LnkgKSAtICggdGhpcy55ICogdi54ICk7XHJcblxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBhIHJlYWRhYmxlIHZlcnNpb24gb2YgdGhlIHZlY3RvciBmb3IgZGVidWdnaW5nIHB1cnBvc2VzXHJcbiAqIEBleGFtcGxlIG5ldyBWZWN0b3IyKDMsNSkudG9TdHJpbmcoKSAvLyBbMyw1XVxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0cmV0dXJuICdbJyArIHRoaXMueCArICcsJyArIHRoaXMueSArICddJztcclxuXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUuemVybyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR0aGlzLnggPSAwOyB0aGlzLnkgPSAwOyByZXR1cm4gdGhpcztcclxuXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUuaXNaZXJvID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHJldHVybiAodGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMCk7XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFxyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUuZGlzdGFuY2VUbyA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fc3VidHJhY3QodmVjdG9yKS5tYWduaXR1ZGUoKTtcclxuXHJcbn07XHJcblxyXG5WZWN0b3IyLnByb3RvdHlwZS50b1JhZGlhbnMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpO1xyXG5cclxufTtcclxuXHJcblZlY3RvcjIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRyZXR1cm4geyB4IDogdGhpcy54LCB5IDogdGhpcy55IH07XHJcblxyXG59O1xyXG5cclxuLy8gZnVuY3Rpb25zIHdoaWNoIHJldHVybiBjb3BpZXMgb2YgdGhlIHZlY3RvciBpbnN0ZWFkIG9mIGFmZmVjdGluZyB0aGlzXHJcblZlY3RvcjIucHJvdG90eXBlLl9hZGQgPSBmdW5jdGlvbih2KSB7IHJldHVybiB0aGlzLmNsb25lKCkuYWRkKHYpOyB9O1xyXG5WZWN0b3IyLnByb3RvdHlwZS5fc3VidHJhY3QgPSBmdW5jdGlvbih2KSB7IHJldHVybiB0aGlzLmNsb25lKCkuc3VidHJhY3Qodik7IH07XHJcblZlY3RvcjIucHJvdG90eXBlLl9tdWx0aXBseSA9IGZ1bmN0aW9uKHNjYWxhcikgeyByZXR1cm4gdGhpcy5jbG9uZSgpLm11bHRpcGx5KHNjYWxhcik7IH07XHJcblZlY3RvcjIucHJvdG90eXBlLl9kaXZpZGUgPSBmdW5jdGlvbihzY2FsYXIpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5kaXZpZGUoc2NhbGFyKTsgfTtcclxuVmVjdG9yMi5wcm90b3R5cGUuX25vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLm5vcm1hbGl6ZSgpOyB9O1xyXG5WZWN0b3IyLnByb3RvdHlwZS5fZmxvb3IgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5mbG9vcigpOyB9O1xyXG5WZWN0b3IyLnByb3RvdHlwZS5fcm91bmQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5yb3VuZCgpOyB9O1xyXG5WZWN0b3IyLnByb3RvdHlwZS5fcm90YXRlID0gZnVuY3Rpb24oYSkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLnJvdGF0ZShhKTsgfTtcclxuVmVjdG9yMi5wcm90b3R5cGUuX2ludmVydCA9IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5pbnZlcnQoYSk7IH07XHJcblZlY3RvcjIucHJvdG90eXBlLl9zbmFwID0gZnVuY3Rpb24obikgeyByZXR1cm4gdGhpcy5jbG9uZSgpLnNuYXAobik7IH07XHJcblZlY3RvcjIucHJvdG90eXBlLl9yZWZsZWN0ID0gZnVuY3Rpb24odikgeyByZXR1cm4gdGhpcy5jbG9uZSgpLnJlZmxlY3Qodik7IH07XHJcblZlY3RvcjIucHJvdG90eXBlLl9jcm9zcyA9IGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5jcm9zcyh2KTsgfTtcclxuVmVjdG9yMi5wcm90b3R5cGUuX3BlcnAgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5wZXJwKCk7IH07XHJcblxyXG5WZWN0b3IyLk5FQVJfVEhSRVNIT0xEID0gMTtcclxuXHJcbi8qKlxyXG4gKiBpc29tZXRyaWMgZXh0ZW5zaW9ucyB0byB0aGUgVmVjdG9yMiBjbGFzc1xyXG4gKi9cclxuVmVjdG9yMi5wcm90b3R5cGUudG9TY3JlZW4gPSBmdW5jdGlvbigpIHtcclxuXHJcblx0dmFyIHggPSB0aGlzLnggLSB0aGlzLnk7XHJcblx0dmFyIHkgPSAodGhpcy54ICsgdGhpcy55KSAvIDI7XHJcblxyXG5cdHRoaXMueCA9IHggKiBWZWN0b3IyLklTT19SQVRJTztcclxuXHR0aGlzLnkgPSB5ICogVmVjdG9yMi5JU09fUkFUSU87XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuVmVjdG9yMi5wcm90b3R5cGUudG9Jc28gPSBmdW5jdGlvbigpIHtcclxuXHJcblx0dmFyIHggPSAodGhpcy54IC8gMikgKyB0aGlzLnk7XHJcblx0dmFyIHkgPSB0aGlzLnkgLSAodGhpcy54IC8gMik7XHJcblxyXG5cdHRoaXMueCA9IHggLyBWZWN0b3IyLklTT19SQVRJTztcclxuXHR0aGlzLnkgPSB5IC8gVmVjdG9yMi5JU09fUkFUSU87XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLy8gdG9wIGRvd24gdG8gaXNvIHJhdGlvICgxMCBwaXhlbHMgdG9wIGRvd24gPSAxNiBwaXhlbCBpc28gdGlsZSB3aWR0aClcclxuVmVjdG9yMi5JU09fUkFUSU8gPSAxLjY7XHJcblxyXG5WZWN0b3IyLnByb3RvdHlwZS5fdG9TY3JlZW4gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS50b1NjcmVlbigpOyB9O1xyXG5WZWN0b3IyLnByb3RvdHlwZS5fdG9Jc28gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS50b0lzbygpOyB9O1xyXG5cclxuVmVjdG9yMi56ZXJvID0gbmV3IFZlY3RvcjIoKTtcclxuXHJcbi8qKlxyXG4gKiBAc3RhdGljXHJcbiAqIHJldHVybiBhIHZlY3RvciBmcm9tIGFuIGFycmF5XHJcbiAqIGVnOiBbNSw1XVxyXG4gKi9cclxuVmVjdG9yMi5mcm9tQXJyYXkgPSBmdW5jdGlvbihhcnIpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBWZWN0b3IyKFxyXG5cdFx0cGFyc2VJbnQoYXJyWzBdKSxcclxuXHRcdHBhcnNlSW50KGFyclsxXSlcclxuXHQpO1xyXG5cclxufTtcclxuXHJcbi8vIGNvbW1vbmpzIGV4cG9ydFxyXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvcjI7IiwidmFyIHV0aWwgPSB7XHJcblxyXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSA6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG5cdFx0dmFyIGZuID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG5cdFx0XHRcdHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuXHRcdFx0XHR3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcblx0XHRcdFx0ZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHRcdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xyXG5cdFx0XHRcdH07XHJcblxyXG5cdFx0Zm4uY2FsbCh3aW5kb3csIGNhbGxiYWNrKTtcclxuXHJcblx0fSxcclxuXHJcblx0c29ydEJ5RGlzdGFuY2VUbyA6IGZ1bmN0aW9uKHRhcmdldCkge1xyXG5cclxuXHRcdHJldHVybiBmdW5jdGlvbihhLGIpIHtcclxuXHJcblx0XHRcdHZhciBkaXN0YW5jZUEgPSBhLnBvc2l0aW9uLmRpc3RhbmNlVG8odGFyZ2V0KTtcclxuXHRcdFx0dmFyIGRpc3RhbmNlQiA9IGIucG9zaXRpb24uZGlzdGFuY2VUbyh0YXJnZXQpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGRpc3RhbmNlQSAtIGRpc3RhbmNlQjtcclxuXHJcblx0XHR9XHJcblxyXG5cdH0sXHJcblxyXG5cdHJlYWR5IDogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkgeyBjYWxsYmFjaygpOyB9ICk7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNvcnRCeVogOiBmdW5jdGlvbihhLGIpIHtcclxuXHJcblx0XHRyZXR1cm4gYS5wb3NpdGlvbi55IC0gYi5wb3NpdGlvbi55O1xyXG5cclxuXHR9LFxyXG5cclxuXHRleHRlbmQgOiBmdW5jdGlvbiggYmFzZSwgZXh0cmEsIGV4aXN0aW5nT25seSApIHtcclxuXHRcclxuXHRcdGlmKHR5cGVvZiBleGlzdGluZ09ubHkgPT09ICd1bmRlZmluZWQnKSB7IGV4aXN0aW5nT25seSA9IGZhbHNlOyB9XHJcblxyXG5cdFx0Zm9yICggdmFyIHByb3AgaW4gZXh0cmEgKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdGlmKGV4aXN0aW5nT25seSAmJiB0eXBlb2YgYmFzZVtwcm9wXSA9PT0gJ3VuZGVmaW5lZCcpIHsgY29udGludWU7IH1cclxuXHRcdFx0XHJcblx0XHRcdGJhc2VbcHJvcF0gPSBleHRyYVtwcm9wXTtcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0XHJcblx0fSxcclxuXHJcblx0LyoqXHJcblx0ICogZ2VuZXJhdGUgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gMCBhbmQgMVxyXG5cdCAqIEB0b2RvIHJlcGxhY3ZlIHdpdGggY3VzdG9tIFJOR1xyXG5cdCAqL1xyXG5cdHJhbmRvbSA6IE1hdGgucmFuZG9tLFxyXG5cclxuXHQvKipcclxuXHQgKiBnZW5lcmF0ZSBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiBtaW4gYW5kIG1heFxyXG5cdCAqL1xyXG5cdHJhbmRvbUJldHdlZW4gOiBmdW5jdGlvbihtaW4sIG1heCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XHJcblxyXG5cdH0sXHJcblxyXG5cdC8qKlxyXG5cdCAqIGdlbmVyYXRlIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heFxyXG5cdCAqL1xyXG5cdHJhbmRvbUludEJldHdlZW4gOiBmdW5jdGlvbihtaW4sIG1heCkge1xyXG5cclxuXHRcdHJldHVybiBNYXRoLmZsb29yKCB0aGlzLnJhbmRvbUJldHdlZW4obWluLCBtYXgpICk7XHJcblxyXG5cdH1cclxuXHJcbn07XHJcblxyXG4vLyBjb21tb25qcyBleHBvcnRcclxubW9kdWxlLmV4cG9ydHMgPSB1dGlsOyIsInZhciBMb2FkZXIgPSByZXF1aXJlKCcuL2xpYi9Mb2FkZXIuanMnKTtcclxudmFyIFNwcml0ZSA9IHJlcXVpcmUoJy4vbGliL1Nwcml0ZS5qcycpO1xyXG52YXIgQ2FudmFzID0gcmVxdWlyZSgnLi9saWIvQ2FudmFzLmpzJyk7XHJcbnZhciBJbnB1dCA9IHJlcXVpcmUoJy4vbGliL0lucHV0LmpzJyk7XHJcbnZhciBWZWN0b3IyID0gcmVxdWlyZSgnLi9saWIvVmVjdG9yMi5qcycpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vbGliL3V0aWwuanMnKTtcclxudmFyIENpcmNsZSA9IHJlcXVpcmUoJy4vbGliL0NpcmNsZS5qcycpO1xyXG52YXIgQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9saWIvQ29sbGlzaW9uLmpzJyk7XHJcblxyXG5nYW1lID0ge1xyXG5cclxuXHRib290c3RyYXAgOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHR2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lJyk7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0dGhpcy5jYW52YXMgPSBuZXcgQ2FudmFzKDM4NCw2NDApO1xyXG5cdFx0dGhpcy5jYW52YXMuYXBwZW5kVG8oZWxlbWVudCkuZm9jdXMoKTtcclxuXHJcblx0XHR0aGlzLmlucHV0ID0gbmV3IElucHV0KCk7XHJcblx0XHR0aGlzLmlucHV0LmJpbmRNb3VzZShlbGVtZW50KTtcclxuXHJcblx0XHR0aGlzLmxvYWRlciA9IG5ldyBMb2FkZXIoKTtcclxuXHRcdHRoaXMubG9hZGVyLmxvYWQoIFtcclxuXHRcdFx0Jy9pbWcvZGlzaHdhc2hlcl9iZy5wbmcnLFxyXG5cdFx0XHQnL2ltZy9wbGF0ZS5wbmcnXHJcblx0XHRdLCBmdW5jdGlvbihhc3NldHMpIHsgc2VsZi5pbml0KGFzc2V0cyk7IH0pO1xyXG5cclxuXHR9LFxyXG5cclxuXHRpbml0IDogZnVuY3Rpb24oYXNzZXRzKSB7XHJcblxyXG5cdFx0dGhpcy5iYWNrZ3JvdW5kID0gbmV3IFNwcml0ZShhc3NldHNbJy9pbWcvZGlzaHdhc2hlcl9iZy5wbmcnXSk7XHJcblxyXG5cdFx0dmFyIHBsYXRlU3ByaXRlID0gbmV3IFNwcml0ZShhc3NldHNbJy9pbWcvcGxhdGUucG5nJ10pO1xyXG5cdFx0cGxhdGVTcHJpdGUuc2V0T3JpZ2luKFNwcml0ZS5PUklHSU5fQ0VOVEVSKTtcclxuXHJcblx0XHR0aGlzLnBsYXRlID0ge1xyXG5cdFx0XHRzcHJpdGUgOiBwbGF0ZVNwcml0ZSxcclxuXHRcdFx0c2hhcGUgOiBuZXcgQ2lyY2xlKDUwLCBuZXcgVmVjdG9yMigxMDAsMzAwKSlcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5pbnB1dC5vbihJbnB1dC5NT1VTRV9MRUZUX0RPV04sIGZ1bmN0aW9uKG1vdXNlKSB7XHJcblxyXG5cdFx0XHRpZihDb2xsaXNpb24ucG9pbnRDaXJjbGUobW91c2UucG9zaXRpb24sIHRoaXMucGxhdGUuc2hhcGUpKSB7XHJcblx0XHRcdFx0dGhpcy5kcmFnZ2luZyA9IHRoaXMucGxhdGU7XHJcblx0XHRcdFx0dGhpcy5kcmFnT2Zmc2V0ID0gbW91c2UucG9zaXRpb24uX3N1YnRyYWN0KHRoaXMucGxhdGUuc2hhcGUucG9zaXRpb24pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0dGhpcy5pbnB1dC5vbihJbnB1dC5NT1VTRV9MRUZUX1VQLCBmdW5jdGlvbihtb3VzZSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5kcmFnZ2luZyA9IG51bGw7XHJcblxyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdFx0dXRpbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5kcmF3LmJpbmQodGhpcykpO1xyXG5cdFx0c2V0SW50ZXJ2YWwodGhpcy51cGRhdGUuYmluZCh0aGlzKSwgMjApO1xyXG5cdH0sXHJcblxyXG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdGlmKHRoaXMuZHJhZ2dpbmcpIHtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBwb3MgPSB0aGlzLmlucHV0Lm1vdXNlLnBvc2l0aW9uLl9zdWJ0cmFjdCh0aGlzLmRyYWdPZmZzZXQpO1x0XHRcclxuXHRcdFx0dGhpcy5wbGF0ZS5zaGFwZS5wb3NpdGlvbi5zZXQocG9zKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH0sXHJcblxyXG5cdGRyYXcgOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHR0aGlzLmNhbnZhcy5kcmF3U3ByaXRlKHRoaXMuYmFja2dyb3VuZCk7XHJcblx0XHR0aGlzLmNhbnZhcy5kcmF3U3ByaXRlKHRoaXMucGxhdGUuc3ByaXRlLCB0aGlzLnBsYXRlLnNoYXBlLnBvc2l0aW9uKTtcclxuXHRcdC8vdGhpcy5jYW52YXMuZmlsbENpcmNsZSh0aGlzLnBsYXRlLnNoYXBlKTtcclxuXHJcblx0XHR1dGlsLnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmRyYXcuYmluZCh0aGlzKSk7XHJcblx0fVxyXG5cclxufTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7IGdhbWUuYm9vdHN0cmFwKCkgfSk7Il19
;