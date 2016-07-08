/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	a mashup design, consisting of
 *		- a user-created low-fi model (the geometry)
 *		- a series of functional requirments (the functions)
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var MASHUP = MASHUP || {};

MASHUP.Design = function(scene) {
	this._scene = scene;
	this._medialAxis = new MASHUP.MedialAxis(this._scene);
}

MASHUP.Design.prototype = {
	constructor: MASHUP.Design
};