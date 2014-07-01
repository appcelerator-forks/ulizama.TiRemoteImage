var _ = require('/lib/underscore');

/*
 * Wrapper for Titanium UI components.  This wrapper provides a few pieces of critical
 * functionality, currently missing from Titanium UI objects:
 * - The ability to safely extend components with new members
 * - Rudimentary resource management and object lifecycle handling
 *
 * Caveat Number One:
 * Not all Titanium UI objects are perfectly wrappable.  Some still need to be used directly,
 * notably TableViews and TableViewRows, since they contain LOTS of magic - like purple, sparkly
 * unicorn magic.  If you need a TableView, it's best to have it as a child of a Component-ized
 * view, and work with the TableView directly.
 *
 * Caveat Number Two:
 * This is not an Appcelerator-supported API - this is one approach to accomplishing the goals of
 * best-practice UI development.  This Component wrapper can be considered an advanced use of the
 * Titanium API, and should only be used by developers who are already knowledgeable about the core
 * Titanium JavaScript APIs.
 *
 */

function Component(/*Titanium Proxy Object*/ tiView) {
  this.viewProxy = tiView;
}

//Wrappers for common Titanium view construction functions
Component.prototype.add = function(tiChildView) {
	var v = tiChildView.viewProxy||tiChildView;
	this.viewProxy.add(v);
};

Component.prototype.remove = function(tiChildView) {
	var v = tiChildView.viewProxy||tiChildView;
	this.viewProxy.remove(v);
};

Component.prototype.open = function(args) {
	if (this.viewProxy.open) {
		this.viewProxy.open(args||{animated:false});
	}
};

Component.prototype.close = function(args) {
	if (this.viewProxy.close) {
		this.viewProxy.close(args||{animated:false});
	}
};

Component.prototype.animate = function(args,callback) {
	this.viewProxy.animate(args,callback||function(){});
};

//Getter/Setter for the wrapped Titanium view proxy object
Component.prototype.get = function(key) {
	return this.viewProxy[key];
};

Component.prototype.set = function(key,value) {
	this.viewProxy[key] = value;
};

//Event Handling
Component.prototype.addEventListener = function(event,callback) {
	switch (event) {
		case 'location':
			this.globalHandlers.location = callback;
			Ti.Geolocation.addEventListener('location', this.globalHandlers.location);
			break;
		case 'orientationchange':
			this.globalHandlers.orientationchange = callback;
			Ti.Gesture.addEventListener('orientationchange', this.globalHandlers.orientationchange);
			break;
		default:
			this.viewProxy.addEventListener(event,callback);
			break;
	}
};

Component.prototype.removeEventListener = function(event,callback) {
	switch (event) {
		case 'location':
			this.globalHandlers.location = callback;
			Ti.Geolocation.removeEventListener('location', this.globalHandlers.location);
			break;
		case 'orientationchange':
			this.globalHandlers.orientationchange = callback;
			Ti.Gesture.removeEventListener('orientationchange', this.globalHandlers.orientationchange);
			break;
		default:
			this.viewProxy.removeEventListener(event,callback);
			break;
	}
};

Component.prototype.fireEvent = function(event,data) {
  this.viewProxy.fireEvent(event,data||{});
};

//This should be overridden by any Components which wish to execute custom
//clean up logic, to release their child components, etc.
Component.prototype.onDestroy = function() {};

//Clean up resources used by this Component
Component.prototype.release = function() {
	//force cleanup on proxy
	this.viewProxy = null;

	//run custom cleanup logic
	this.onDestroy();
};

//adding to public interface
module.exports = Component;