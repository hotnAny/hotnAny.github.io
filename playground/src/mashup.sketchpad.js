/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Sketch pad - for sketching initial design, 
 *				including specifying loads and boundaries
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var MASHUP = MASHUP || {};

// check dependencies
if (XAC.Thing == undefined || XAC.Utilities == undefined || XAC.Const == undefined) {
	err('missing dependency!');
}

MASHUP.Sketchpad = function(container, w, h) {
	this.DEFAULT = 0;
	this.LOAD = 1;
	this.BOUNDARY = 2;
	this.ERASER = 3;
	this._mode = this.DEFAULT;

	this._container = container;
	this._renderUI(w, h);
};

MASHUP.Sketchpad.prototype = {
	constructor: MASHUP.Sketchpad
};

MASHUP.Sketchpad.prototype.open = function() {
	this._container.prepend(this._pad);
}

MASHUP.Sketchpad.prototype.close = function() {
	this._container.remove(this._pad);
}

MASHUP.Sketchpad.prototype.getBitmap = function() {

}

//
//	render the sketchable canvas and controls
//	@param	container - the parent ui component that contains the sketch pad
//
MASHUP.Sketchpad.prototype._renderUI = function(w, h) {
	this._pad = $('<div></div>');
	this._pad.css('width', w + 'px');
	this._pad.css('height', h + 'px');
	this._pad.css('position', 'absolute');
	this._pad.css('zIndex', '8888');
	this._pad.css('background-color', 'rgba(0, 0, 0, 0.5)');
	this._pad.css('display', 'flex');

	var tblPad = $('<table></table>');
	tblPad.css('margin', 'auto');
	tblPad.css('position', 'relative');

	this._pad.append(tblPad);
	var trPad = $('<tr></tr>');
	tblPad.append(trPad);

	var tdCtrl = $('<td></td>');
	trPad.append(tdCtrl);
	var btnSketch = $('<div></div>');
	var btnLoad = $('<div></div>');
	var btnBoundary = $('<div></div>');
	var btnEraser = $('<div></div>');

	var tdCanvas = $('<td></td>');
	trPad.append(tdCanvas);
	this._canvas = $('<canvas width="' + w * 0.9 + '" height="' + h * 0.9 + '"></canvas>');
	this._canvas.css('background-color', 'rgba(255, 255, 255, 0.75)');
	tdCanvas.append(this._canvas);

	// TEST
	var ctx = this._canvas[0].getContext('2d');
	ctx.beginPath();
	ctx.rect(20, 20, 150, 100);
	ctx.fillStyle = "red";
	ctx.fill();
}

MASHUP.Sketchpad.prototype._mousedown = function(e) {

}

MASHUP.MedialAxis.prototype._mousemove = function(e) {

}

MASHUP.MedialAxis.prototype._mouseup = function(e) {

}