/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	a mashup design, consisting of
 *		- a user-created low-fi model (the geometry)
 *		- a series of functional requirments (the functions)
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var MASHUP = MASHUP || {};

MASHUP.Design = function(scene, camera) {
	this._scene = scene;
	this._camera = camera;

	this._mode = MASHUP.Design.SKETCH;
	$(MASHUP.renderer.domElement).css('cursor', 'crosshair');

	this._medialAxis = new MASHUP.MedialAxis(this._scene, this._camera);
	this._medialAxis.disableEventListeners();
	this._medialAxis._matNode = XAC.MATERIALNORMAL.clone();
	this._medialAxis._matInflation = XAC.MATERIALNORMAL.clone();

	// storing a list of functional parameters
	this._loads = [];
	this._clearances = [];
	this._boundaries = [];

	// the currently interactive parameters
	this._inkPoints = [];
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

	this._elements = []; // visual elements that represent parameters

	// temp visual elements
	this._ink = [];
	this._inkSize = 5;
	var mat = XAC.MATERIALNORMAL.clone();
	mat.opacity = 1.0;
	this._inkMat = mat;
}

// editing modes
MASHUP.Design.SKETCH = 0;

MASHUP.Design.EDIT = 3;

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

	var hitInfo = XAC.hit(e, this._elements, this._camera);

	this._maniPlane = new XAC.Maniplane(new THREE.Vector3(), this._scene, this._camera, false, false);

	this._posDown = {
		x: e.clientX,
		y: e.clientY
	};

	switch (this._mode) {
		case MASHUP.Design.SKETCH:
			if (hitInfo != undefined) {
				this._maniPlane.setPos(hitInfo.object.position);
				this._dropInk(hitInfo.point);
			}
			break;
		case MASHUP.Design.EDIT:
			this._medialAxis._mousedown(e);
			break;
		case MASHUP.Design.LOADPOINT:
			// TODO: make sure there is a valid selection
			if (hitInfo != undefined) {
				this._maniPlane.setPos(hitInfo.object.position);
				this._load = {
					points: [hitInfo.point],
					midpt: undefined,
					vector: undefined,
					area: [], // visual elements showing area of load
					arrow: undefined // visual element showing vector of load
				}
			}
			break;
		case MASHUP.Design.LOADVECTOR:
			// finalize the creation of a load
			if (this._load != undefined) {
				this._loads.push(this._load);
				this._maniPlane.setPos(this._load.midpt);
				this._clearance = {
					min: undefined,
					max: undefined,
					box: undefined
				}
			}
			this._mode = MASHUP.Design.LOADPOINT;
			this._load = undefined;
			this._glueState = false;
			break;
		case MASHUP.Design.CLEARANCEAREA:
			// TODO: finalize the selection of a clearance area
			//
			// this._clearances.push(this._clearance);
			// this._mode = MASHUP.Design.SKETCH;
			// this._glueState = false;
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

	this._posMove = this._posDown;
}

MASHUP.Design.prototype._mousemove = function(e) {
	if (e.which != XAC.LEFTMOUSE && this._glueState != true) {
		return;
	}

	var hitPoint;
	if (this._maniPlane != undefined) {
		hitPoint = this._maniPlane.update(e);
	}

	switch (this._mode) {
		case MASHUP.Design.SKETCH:
			// BUG: hard code to fix for now
			if (hitPoint.x == 0 && hitPoint.y == 0 && hitPoint.z == 500) {} else {
				this._dropInk(hitPoint);
			}
			break;
		case MASHUP.Design.EDIT:
			this._medialAxis._mousemove(e);
			break;
		case MASHUP.Design.LOADPOINT:
			this._load.points.push(hitPoint);
			var hitElm = XAC.hitObject(e, this._elements, this._camera);
			this._load.area.push(hitElm);
			hitElm.material = XAC.MATERIALHIGHLIGHT.clone();
			hitElm.material.needsUpdate = true;
			// this._dropInk(XAC.hitPoint(e, this._elements, this._camera), XAC.MATERIALHIGHLIGHT.clone());
			break;
		case MASHUP.Design.LOADVECTOR:
			// show an arrow indicating the direction and magnititude of load
			this._scene.remove(this._load.arrow);
			this._load.vector = hitPoint.clone().sub(this._load.midpt);
			this._load.arrow = XAC.addAnArrow(this._scene, this._load.midpt,
				this._load.vector, this._load.vector.length(), 3);
			break;
		case MASHUP.Design.CLEARANCEAREA:

			// TODO: [one timer] create a box
			// var hitPoint = this._maniPlane.update(e);
			// var vclear = hitPoint.clone().sub(this._load.point);
			// this._scene.remove(this._clearance.box);

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

	this._posMove = {
		x: e.clientX,
		y: e.clientY
	};
}

MASHUP.Design.prototype._mouseup = function(e) {
	if (e.which != XAC.LEFTMOUSE) {
		return;
	}

	this._maniPlane.destruct();

	switch (this._mode) {
		case MASHUP.Design.SKETCH:
			if (this._ink.length > 0) {
				// remove ink and clean up
				for (var i = this._ink.length - 1; i >= 0; i--) {
					this._scene.remove(this._ink[i]);
				}
				this._ink = [];

				// convert it to topology and store the visual elements
				var edgeInfo = this._medialAxis.addEdge(this._inkPoints);

				// edge has its own topology representation
				if (edgeInfo.mesh.children.length > 0) {
					this._elements = this._elements.concat(edgeInfo.mesh.children);
				}
				// edge only has `inflations' that represent its thickness
				else {
					for (var i = edgeInfo.inflations.length - 1; i >= 0; i--) {
						this._elements.push(edgeInfo.inflations[i].m);
					}
				}

				this._elements.push(edgeInfo.v1.mesh);
				this._elements.push(edgeInfo.v2.mesh);
				this._inkPoints = [];
			}

			break;
		case MASHUP.Design.EDIT:
			this._medialAxis._mouseup(e);
			break;
		case MASHUP.Design.LOADPOINT:
			if (this._load == undefined || this._load.points.length <= 0) {
				break;
			} else {
				if (this._load.points.length <= 2) {
					this._load.midpt = this._load.points[0];
				} else {
					var start = this._load.points[0];
					var end = this._load.points[this._load.points.length - 1];
					var distVarMin = start.distanceTo(end);
					for (var i = this._load.points.length - 2; i >= 1; i--) {
						var distVar = Math.abs(this._load.points[i].distanceTo(start) - this._load.points[i].distanceTo(end));
						if (distVar < distVarMin) {
							distVarMin = distVar;
							this._load.midpt = this._load.points[i];
						}
					}
				}
				this._mode = MASHUP.Design.LOADVECTOR;
				this._glueState = true;
			}
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

	// this._posDown = undefined;
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

//
//	subroutine for drawing - not independent
//
MASHUP.Design.prototype._dropInk = function(inkPoint, mat) {
	var inkJoint = new XAC.Sphere(this._inkSize / 2, this._inkMat).m;
	inkJoint.position.copy(inkPoint);

	this._inkPoints.push(inkPoint);

	this._scene.add(inkJoint);
	if (this._ink.length > 0) {
		var inkStroke = new XAC.ThickLine(this._inkPointPrev, inkPoint,
			this._inkSize / 2, mat == undefined ? this._inkMat : mat).m;
		this._scene.add(inkStroke);
	}

	this._ink.push(inkJoint);
	this._ink.push(inkStroke);

	this._inkPointPrev = inkPoint;
}