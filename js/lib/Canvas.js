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