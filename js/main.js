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