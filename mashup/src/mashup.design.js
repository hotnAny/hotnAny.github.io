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

	// color scheme
	this._matDesign = new THREE.MeshPhongMaterial({
		color: XAC.COLORNORMAL,
		transparent: true,
		opacity: 0.95
	});
	this._matLoad = new THREE.MeshPhongMaterial({
		color: XAC.COLORHIGHLIGHT,
		transparent: true,
		opacity: 0.75
	});
	this._matClearance = new THREE.MeshPhongMaterial({
		color: XAC.COLORCONTRAST,
		transparent: true,
		opacity: 0.75
	});
	this._matBoundary = new THREE.MeshPhongMaterial({
		color: XAC.COLORCONTRAST,
		transparent: true,
		opacity: 0.75
	});

	// using a medial axis to represent design
	this._medialAxis = new MASHUP.MedialAxis(this._scene, this._camera);
	this._medialAxis.disableEventListeners();
	this._medialAxis._matNode = this._matDesign; //XAC.MATERIALNORMAL.clone();
	this._medialAxis._matInflation = this._matDesign; // XAC.MATERIALNORMAL.clone();

	// storing a list of functional parameters
	this._loads = [];
	this._clearances = [];
	this._boundaries = [];

	// the currently interactive parameters
	this._inkPoints = [];
	this._load = undefined; // {point, vector, arrow}
	this._clearance = undefined; // {min, max, box}
	this._boundary = undefined; // {min, max, box}

	// input event handlers
	document.addEventListener('mousedown', this._mousedown.bind(this), false);
	document.addEventListener('mousemove', this._mousemove.bind(this), false);
	document.addEventListener('mouseup', this._mouseup.bind(this), false);
	document.addEventListener('keydown', this._keydown.bind(this), false);

	this._posDown = undefined;

	this._elements = []; // visual elements that represent parameters

	// drawing related visual elements
	this._ink = [];
	this._inkSize = 5;
	this._inkMat = new THREE.MeshBasicMaterial({
		color: 0x000000
	});
}

// editing modes
MASHUP.Design.SKETCH = 0;
MASHUP.Design.EDIT = 3;
MASHUP.Design.LOADPOINT = 1.1;
MASHUP.Design.LOADVECTOR = 1.2;
MASHUP.Design.CLEARANCEAREA = 1.3;
MASHUP.Design.BOUNDARYPOINT = 2.1;

MASHUP.Design.prototype = {
	constructor: MASHUP.Design
};

//
//	event handler for mouse down
//
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
			// attemp to drop the 1st ink
			if (hitInfo != undefined) {
				this._maniPlane.setPosition(hitInfo.object.position);
				this._dropInk(hitInfo.point);
			}
			break;
		case MASHUP.Design.EDIT:
			// simply relay the event to the medial axis
			this._medialAxis._mousedown(e);
			break;
		case MASHUP.Design.LOADPOINT:
			if (hitInfo != undefined) {
				// use the selected point to initialize the load object
				this._maniPlane.setPosition(hitInfo.object.position);
				this._load = {
					points: [hitInfo.point],
					midPoint: hitInfo.point,
					vector: undefined,
					edgeInfo: this._medialAxis.getEdgeInfo(hitInfo.object), // associated edge
					vrel: undefined, // direction relative to the associated edge
					area: [], // visual elements showing area of load
					arrow: undefined // visual element showing vector of load
				}
			}
			break;
		case MASHUP.Design.LOADVECTOR:
			// finalize the creation of a load and init the clearance object immediately
			if (this._load != undefined) {
				this._loads.push(this._load);
				this._maniPlane.setPosition(this._load.midPoint);
				this._clearance = {
					min: undefined,
					max: undefined,
					box: undefined,
					midPoint: this._load.midPoint,
					edgeInfo: this._load.edgeInfo // associated edge
				}
			}
			break;
		case MASHUP.Design.CLEARANCEAREA:
			// finalize the selection of a clearance area
			this._clearances.push(this._clearance);
			break;
		case MASHUP.Design.BOUNDARYPOINT:
			// init the boundary object
			if (hitInfo != undefined) {
				this._maniPlane.setPosition(hitInfo.object.position);
			}
			this._boundary = {
				points: [],
				edgeInfo: undefined
			};
			break;
	}

	this._posMove = this._posDown;
}

//
//	event handler of mouse move
//
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
			if (hitPoint == undefined || hitPoint.x == 0 && hitPoint.y == 0 && hitPoint.z == 500) {} else {
				this._dropInk(hitPoint);
			}
			break;
		case MASHUP.Design.EDIT:
			// simply relay the event to medial axis
			this._medialAxis._mousemove(e);
			this._updateConstraints(); // update functional specification constrained by some edges
			break;
		case MASHUP.Design.LOADPOINT:
			// dragging to select load points
			var hitElm = XAC.hitObject(e, this._elements, this._camera);
			if (hitElm != undefined) {
				this._load.points.push(hitElm.position);
				this._load.area.push(hitElm);
				hitElm.material = this._matLoad;
				hitElm.material.needsUpdate = true;
			}
			break;
		case MASHUP.Design.LOADVECTOR:
			// show an arrow indicating the direction and magnititude of load
			this._scene.remove(this._load.arrow);
			this._load.vector = hitPoint.clone().sub(this._load.midPoint);
			this._load.vedge = new THREE.Vector3().subVectors(this._load.edgeInfo.points.slice(-1)[0],
				this._load.edgeInfo.points[0]);
			this._load.arrow = XAC.addAnArrow(this._scene, this._load.midPoint,
				this._load.vector, this._load.vector.length(), 3);
			break;
		case MASHUP.Design.CLEARANCEAREA:
			// moving the mouse to specify the area of clearance
			// var hitPoint = this._maniPlane.update(e);
			this._scene.remove(this._clearance.box);

			//
			//	TODO: what if there's no load?
			//
			// compute the dimension of the clearance area
			this._clearance.vector = this._load.vector.clone().multiplyScalar(-1).normalize();
			var vclear = hitPoint.clone().sub(this._load.midPoint);
			this._clearance.hclear = vclear.dot(this._clearance.vector);
			this._clearance.wclear = Math.sqrt(Math.pow(vclear.length(), 2) - Math.pow(this._clearance.hclear, 2)) * 2;

			// create a mesh representation clearance
			this._clearance.box = new XAC.Box(this._clearance.wclear, this._clearance.hclear,
				5, this._matClearance).m;
			XAC.rotateObjTo(this._clearance.box, this._clearance.vector);
			this._clearance.box.position.copy(this._load.midPoint.clone()
				.add(this._clearance.vector.clone().multiplyScalar(0.5 * this._clearance.hclear)));

			this._clearance.vedge = new THREE.Vector3().subVectors(this._clearance.edgeInfo.points.slice(-1)[0],
				this._clearance.edgeInfo.points[0]);

			this._scene.add(this._clearance.box);
			break;
		case MASHUP.Design.BOUNDARYPOINT:
			// BUG: hard code to fix for now
			if (hitPoint == undefined || hitPoint.x == 0 && hitPoint.y == 0 && hitPoint.z == 500) {} else {
				this._dropInk(hitPoint);
			}
			break;
	}

	this._posMove = {
		x: e.clientX,
		y: e.clientY
	};
}

//
//	event handler of mouse up
//
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
			// simply relay the event to medial axis
			this._medialAxis._mouseup(e);
			break;
		case MASHUP.Design.LOADPOINT:
			if (this._load == undefined || this._load.points.length <= 0) {
				break;
			} else {
				if (this._load.points.length <= 2) {
					this._load.midPoint = this._load.points[0];
				} else {
					var start = this._load.points[0];
					var end = this._load.points[this._load.points.length - 1];
					var distVarMin = start.distanceTo(end);
					for (var i = this._load.points.length - 2; i >= 1; i--) {
						var distVar = Math.abs(this._load.points[i].distanceTo(start) - this._load.points[i].distanceTo(end));
						if (distVar < distVarMin) {
							distVarMin = distVar;
							this._load.midPoint = this._load.points[i];
						}
					}
				}
				this._mode = MASHUP.Design.LOADVECTOR;
				this._glueState = true;
			}
			break;
		case MASHUP.Design.LOADVECTOR:
			// this._load.edgeInfo.mesh.add(this._load.arrow);
			this._mode = MASHUP.Design.CLEARANCEAREA;
			break;
		case MASHUP.Design.CLEARANCEAREA:
			this._mode = MASHUP.Design.LOADPOINT;
			this._glueState = false;
			break;
		case MASHUP.Design.BOUNDARYPOINT:
			if (this._ink.length > 0) {
				// remove ink and clean up
				for (var i = this._ink.length - 1; i >= 0; i--) {
					this._scene.remove(this._ink[i]);
				}
				this._ink = [];

				// convert it to topology and store the visual elements
				var edgeInfo = this._medialAxis.addEdge(this._inkPoints);
				this._boundary.edgeInfo = edgeInfo;

				// redraw the boundary
				for (var i = edgeInfo.inflations.length - 1; i >= 0; i--) {
					edgeInfo.inflations[i].m.material = this._matBoundary;
					edgeInfo.inflations[i].m.needsUpdate = true;
					this._elements.push(edgeInfo.inflations[i].m);
				}

				edgeInfo.v1.mesh.material = this._matBoundary;
				edgeInfo.v1.mesh.material.needsUpdate = true;
				edgeInfo.v1.inflation.m.material = this._matBoundary;
				edgeInfo.v1.inflation.m.material.needsUpdate = true;
				this._elements.push(edgeInfo.v1.inflation.m);

				edgeInfo.v2.mesh.material = this._matBoundary;
				edgeInfo.v2.mesh.material.needsUpdate = true;
				edgeInfo.v2.inflation.m.material = this._matBoundary;
				edgeInfo.v2.inflation.m.material.needsUpdate = true;
				this._elements.push(edgeInfo.v2.inflation.m);

				this._inkPoints = [];

				this._boundaries.push(this._boundary);
			}
			break;
	}
}

//
//	event handler of keyboard operation
//
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

//
//	subroutine for updating constraints between visual elements (and the info they represent)
//
MASHUP.Design.prototype._updateConstraints = function() {
	//
	//	loads
	//
	for (var i = this._loads.length - 1; i >= 0; i--) {
		var load = this._loads[i];
		var edgeInfo = load.edgeInfo;
		var vedge = new THREE.Vector3().subVectors(edgeInfo.points.slice(-1)[0],
			edgeInfo.points[0]);

		var axis = new THREE.Vector3().crossVectors(load.vedge, vedge).normalize();
		var angle = load.vedge.angleTo(vedge);
		load.vector.applyAxisAngle(axis, angle);
		load.vedge = vedge;

		this._scene.remove(load.arrow);
		load.arrow = XAC.addAnArrow(this._scene, load.midPoint, load.vector, load.vector.length(), 3);
	}

	//
	//	clearances
	//
	for (var i = this._clearances.length - 1; i >= 0; i--) {
		var clearance = this._clearances[i];
		var edgeInfo = clearance.edgeInfo;
		var vedge = new THREE.Vector3().subVectors(edgeInfo.points.slice(-1)[0],
			edgeInfo.points[0]);

		var axis = new THREE.Vector3().crossVectors(clearance.vedge, vedge).normalize();
		var angle = clearance.vedge.angleTo(vedge);
		clearance.vector.applyAxisAngle(axis, angle);

		var scaled = vedge.length() / clearance.vedge.length();
		clearance.wclear *= scaled;

		clearance.vedge = vedge;

		this._scene.remove(clearance.box);
		clearance.box = new XAC.Box(clearance.wclear, clearance.hclear,
			5, this._matClearance).m;
		XAC.rotateObjTo(clearance.box, clearance.vector);
		clearance.box.position.copy(clearance.midPoint.clone()
			.add(clearance.vector.clone().multiplyScalar(0.5 * clearance.hclear)));
		this._scene.add(clearance.box);
	}
}

//
//	extend medial axis to retrieve edge info from its representatin (mesh)
//
MASHUP.MedialAxis.prototype.getEdgeInfo = function(mesh) {
	for (var i = this._edgesInfo.length - 1; i >= 0; i--) {
		for (var j = this._edgesInfo[i].inflations.length - 1; j >= 0; j--) {
			if (this._edgesInfo[i].inflations[j].m == mesh) {
				return this._edgesInfo[i];
			}
		}
	}
}