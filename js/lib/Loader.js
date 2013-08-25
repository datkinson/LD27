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