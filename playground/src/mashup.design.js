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
	this._mode = MASHUP.Design.SKETCH;

	this._medialAxis = new MASHUP.MedialAxis(this._scene);

	// storing a list of functional parameters
	this._loads = [];
	this._clearances = [];
	this._boundaries = [];

	// the currently active parameters
	this._load = undefined; // {point, vector, arrow}
	this._clearance = undefined; // {min, max, box}
	this._boundary = undefined; // {min, max, box}

	// TODO: set the camera for a default 2D (XZ-plane based) editing
	//
	document.addEventListener('mousedown', this._mousedown.bind(this), false);
	document.addEventListener('mousemove', this._mousemove.bind(this), false);
	document.addEventListener('mouseup', this._mouseup.bind(this), false);
	document.addEventListener('keydown', this._keydown.bind(this), false);

	this._posDown = undefined;

	this._elements = [];	// visual elements that represent parameters

	// temp visual elements
	this._ink = [];
	this._inkSize = 3;
	var mat = XAC.MATERIALNORMAL.clone();
	mat.opacity = 1.0;
	this._inkMat = mat;
}

// editing modes
MASHUP.Design.SKETCH = 0;

MASHUP.Design.LOADPOINT = 1.1;
MASHUP.Design.LOADVECTOR = 1.2;
MASHUP.Design.CLEARANCEAREA = 1.3;

MASHUP.Design.BOUNDARYPOINT = 2.1;
MASHUP.Design.BOUNDARYAREA = 2.2;

MASHUP.Design.prototype = {
	constructor: MASHUP.Design
};

MASHUP.Design.prototype._mousedown = function(e) {
	if (e.which != XAC.LEFTMOUSE) {
		return;
	}

	var hitInfo = XAC.hit(e, this._elements);
	var hitPoint = (hitInfo == undefined) ? new THREE.Vector3() : hitInfo.point;
	var hitElm = (hitInfo == undefined) ? undefined : hitInfo.object;

	this._maniPlane = new XAC.Maniplane(hitPoint, false, false);

	this._posDown = {
		x: e.clientX,
		y: e.clientY
	};

	switch (this._mode) {
		case MASHUP.Design.SKETCH:
			// var ink = new XAC.Sphere(this._inkSize / 2, this._inkMat).m;
			// var inkPoint = this._maniPlane.update(e);
			// ink.position.copy(inkPoint);
			// this._ink.push(ink);
			// scene.add(ink);
			break;
		case MASHUP.Design.LOADPOINT:
			// TODO: make sure there is a valid selection
			this._mode = MASHUP.Design.LOADVECTOR;
			this._load = {
				point: undefined,
				vector: undefined,
				arrow: undefined
			}
			break;
		case MASHUP.Design.LOADVECTOR:
			// TODO: finalize the creation of a load
			//
			this._loads.push(this._load);
			this._mode = MASHUP.Design.CLEARANCEAREA;
			break;
		case MASHUP.Design.CLEARANCEAREA:
			// TODO: finalize the selection of a clearance area
			//
			this._clearances.push(this._clearance);
			this._mode = MASHUP.Design.SKETCH;
			break;
		case MASHUP.Design.BOUNDARYPOINT:
			// TODO: make sure there is a valid selection
			this._mode = MASHUP.Design.BOUNDARYAREA;
			this._boundary = {
				min: undefined,
				max: undefined,
				box: undefined
			};
			break;
		case MASHUP.Design.BOUNDARYAREA:
			break;
	}
}

MASHUP.Design.prototype._mousemove = function(e) {
	if (e.which != XAC.LEFTMOUSE) {
		return;
	}

	// TODO: filter out non dragging mouse events
	//

	// TODO: if it's dragging, ignore selection of elements
	//

	switch (this._mode) {
		case MASHUP.Design.SKETCH:
			var ink = new XAC.Sphere(this._inkSize / 2, this._inkMat).m;
			var inkPoint = this._maniPlane.update(e);
			ink.position.copy(inkPoint);
			this._ink.push(ink);
			scene.add(ink);
			break;
		case MASHUP.Design.LOADPOINT:
			break;
		case MASHUP.Design.LOADVECTOR:
			// TODO: [one timer] create a spherical widget for specifying direction
			//
			// TODO: [one timer] create an arrow
			//
			// TODO: perspectively map mouse to an arrow and update load vector
			//
			break;
		case MASHUP.Design.CLEARANCEAREA:
			// TODO: [one timer] init the clearance object
			//
			// TODO: [one timer] create a box
			//
			// TODO: perspectively map mouse to the box and its min/max
			//
			break;
		case MASHUP.Design.BOUNDARYPOINT:
			break;
		case MASHUP.Design.BOUNDARYAREA:
			// TODO: [one timer] create a box
			//
			// TODO: perspectively map mouse to the box and its min/max
			//
			break;
	}
}

MASHUP.Design.prototype._mouseup = function(e) {
	if (e.which != XAC.LEFTMOUSE) {
		return;
	}

	this._maniPlane.destruct();

	switch (this._mode) {
		case MASHUP.Design.SKETCH:
			// TODO: create a bezier curve like segment (edge) in medial axis
			//
			// TODO: remove ink
			//
			break;
		case MASHUP.Design.LOADPOINT:
			break;
		case MASHUP.Design.LOADVECTOR:
			break;
		case MASHUP.Design.CLEARANCEAREA:
			break;
		case MASHUP.Design.BOUNDARYPOINT:
			break;
		case MASHUP.Design.BOUNDARYAREA:
			break;
	}

	this._posDown = undefined;
}

MASHUP.Design.prototype._keydown = function(e) {
	if (e.keyCode == 46) { // DEL
		switch (this._mode) {
			case MASHUP.Design.SKETCH:
				// TODO: routine to leave some ink
				//
				break;
			case MASHUP.Design.LOADPOINT:
				break;
			case MASHUP.Design.LOADVECTOR:
				break;
			case MASHUP.Design.CLEARANCEAREA:
				break;
			case MASHUP.Design.BOUNDARYPOINT:
				break;
			case MASHUP.Design.BOUNDARYAREA:
				break;
		}
	} else if (e.keyCode == 27) { // ESC
		// TODO: cancel everything that's in progress
		//
	}
}