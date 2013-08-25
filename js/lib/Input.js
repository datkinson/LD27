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