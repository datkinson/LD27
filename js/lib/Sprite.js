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