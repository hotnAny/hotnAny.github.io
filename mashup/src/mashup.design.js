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
	this._matDesign = new THREE.MeshLambertMaterial({
		color: XAC.COLORNORMAL,
		transparent: true,
		opacity: 0.75
	});
	this._matLoad = new THREE.MeshLambertMaterial({
		color: XAC.COLORHIGHLIGHT,
		transparent: true,
		opacity: 0.75
	});
	this._matClearance = new THREE.MeshLambertMaterial({
		color: XAC.COLORCONTRAST,
		transparent: true,
		opacity: 0.75
	});
	this._matBoundary = new THREE.MeshLambertMaterial({
		color: XAC.COLORCONTRAST,
		transparent: true,
		opacity: 0.75
	});

	// using a medial axis to represent design
	this._medialAxis = new MASHUP.MedialAxis(this._scene, this._camera);
	this._medialAxis.disableEventListeners();
	this._medialAxis._matNode = this._matDesign;
	this._medialAxis._matInflation = this._matDesign.clone();
	// this._medialAxis._matInflation.opacity = 0.5;

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

	this._allElements = []; // visual elements that represent parameters
	this._funcElements = []; // visual elements specifically for functional requirements

	// drawing related visual elements
	this._ink = [];
	this._inkSize = 5;
	this._inkMat = new THREE.MeshBasicMaterial({
		color: 0x000000
	});
}

// editing modes
MASHUP.Design.POINTER = 0;
MASHUP.Design.SKETCH = 1;
MASHUP.Design.EDIT = 2;
MASHUP.Design.LOADPOINT = 3.1;
MASHUP.Design.LOADVECTOR = 3.2;
MASHUP.Design.CLEARANCEAREA = 3.3;
MASHUP.Design.BOUNDARYPOINT = 4;

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

	var hitInfo = XAC.hit(e, this._allElements, this._camera);

	this._maniPlane = new XAC.Maniplane(new THREE.Vector3(), this._scene, this._camera, false, false);

	this._posDown = {
		x: e.clientX,
		y: e.clientY
	};

	switch (this._mode) {
		case MASHUP.Design.POINTER:

			break;
		case MASHUP.Design.SKETCH:
			// attemp to drop the 1st ink
			if (hitInfo != undefined) {
				this._maniPlane.setPosition(hitInfo.object.position);
				this._dropInk(hitInfo.point);
			}
			break;
		case MASHUP.Design.EDIT:
			if (this._selected != undefined) {
				for (var i = this._selected.length - 1; i >= 0; i--) {
					this._selected[i].material.opacity *= 2;
					this._selected[i].material.needsUpdate = true;
				}
			}

			var selected = [];

			var selectedDesign = this._medialAxis._mousedown(e);
			if (selectedDesign != undefined) {
				var edgeInfo = selectedDesign.edgeInfo;
				if (edgeInfo != undefined) {
					for (var i = edgeInfo.inflations.length - 1; i >= 0; i--) {
						selected.push(edgeInfo.inflations[i].m);
					}
				}
				this._edgeInfo = edgeInfo;
			} else {
				funcElm = XAC.hitObject(e, this._funcElements, this._camera);
				if (funcElm != undefined) {
					selected = funcElm.parent instanceof THREE.Scene ?
						[funcElm] : funcElm.parent.children;
				}
				this._funcElm = funcElm;
			}

			this._selectedTemp = selected;

			this._hitPointPrev = this._maniPlane.update(e);
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
				this._funcElements = this._funcElements.concat(this._load.arrow.children);
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
			this._funcElements.push(this._clearance.box);
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
		case MASHUP.Design.POINTER:
			break;
		case MASHUP.Design.SKETCH:
			// BUG: hard code to fix for now
			if (hitPoint == undefined || hitPoint.x == 0 && hitPoint.y == 0 && hitPoint.z == 500) {} else {
				this._dropInk(hitPoint);
			}
			break;
		case MASHUP.Design.EDIT:
			// simply relay the event to medial axis
			if (this._medialAxis._mousemove(e) != undefined) {
				this._updateConstraints(); // update functional specification constrained by some edges
			} else if (this._funcElm != undefined) {
				if (hitPoint != undefined && this._hitPointPrev != undefined) {
					// var vdelta = hitPoint.clone().sub(this._hitPointPrev);
					this._funcElm = this._manipulate(this._funcElm, hitPoint, this._hitPointPrev);
					this._selectedTemp = undefined;
				}
				this._hitPointPrev = hitPoint;
			}
			break;
		case MASHUP.Design.LOADPOINT:
			// dragging to select load points
			var hitElm = XAC.hitObject(e, this._allElements, this._camera);
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

			// compute the dimension of the clearance area
			this._clearance.vector = this._load.vector.clone().multiplyScalar(-1).normalize();
			var vclear = hitPoint.clone().sub(this._clearance.midPoint);
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
		case MASHUP.Design.POINTER:
			break;
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
					this._allElements = this._allElements.concat(edgeInfo.mesh.children);
				}
				// edge only has `inflations' that represent its thickness
				else {
					for (var i = edgeInfo.inflations.length - 1; i >= 0; i--) {
						this._allElements.push(edgeInfo.inflations[i].m);
					}
				}

				this._allElements.push(edgeInfo.v1.mesh);
				this._allElements.push(edgeInfo.v2.mesh);
				this._inkPoints = [];
			}
			break;
		case MASHUP.Design.EDIT:
			// simply relay the event to medial axis
			this._medialAxis._mouseup(e);
			if (this._selectedTemp != undefined) {
				for (var i = this._selectedTemp.length - 1; i >= 0; i--) {
					if (this._selected != undefined && this._selectedTemp[i] == this._selected[i]) {
						this._selectedTemp = [];
						break;
					}
					this._selectedTemp[i].material.opacity *= 0.5;
					this._selectedTemp[i].material.needsUpdate = true;

				}
				this._selected = this._selectedTemp;
			}
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
					this._allElements.push(edgeInfo.inflations[i].m);
				}

				edgeInfo.v1.mesh.material = this._matBoundary;
				edgeInfo.v1.mesh.material.needsUpdate = true;
				edgeInfo.v1.inflation.m.material = this._matBoundary;
				edgeInfo.v1.inflation.m.material.needsUpdate = true;
				this._allElements.push(edgeInfo.v1.inflation.m);

				edgeInfo.v2.mesh.material = this._matBoundary;
				edgeInfo.v2.mesh.material.needsUpdate = true;
				edgeInfo.v2.inflation.m.material = this._matBoundary;
				edgeInfo.v2.inflation.m.material.needsUpdate = true;
				this._allElements.push(edgeInfo.v2.inflation.m);

				this._inkPoints = [];

				this._boundaries.push(this._boundary);
			}
			break;
	}

	this._funcElements = [];
	for (var i = this._loads.length - 1; i >= 0; i--) {
		this._funcElements = this._funcElements.concat(this._loads[i].arrow.children);
	}
	for (var i = this._clearances.length - 1; i >= 0; i--) {
		this._funcElements.push(this._clearances[i].box);
	}
}

//
//	event handler of keyboard operation
//
MASHUP.Design.prototype._keydown = function(e) {
	if (e.keyCode == 27) { // ESC
		switch (this._mode) {
			case MASHUP.Design.SKETCH:
				break;
			case MASHUP.Design.LOADPOINT:
				break;
			case MASHUP.Design.LOADVECTOR:
				// cancel the current operation and forfeit the creation of the load
				this._removeLoad(this._load);
				this._glueState = false;
				this._mode = MASHUP.Design.LOADPOINT;
				break;
			case MASHUP.Design.CLEARANCEAREA:
				this._removeClearance(this._clearance);
				this._glueState = false;
				this._mode = MASHUP.Design.LOADPOINT;
				break;
			case MASHUP.Design.BOUNDARYPOINT:
				break;
			case MASHUP.Design.BOUNDARYAREA:
				break;
		}
	} else if (e.keyCode == 46) { // DEL
		for (var i = this._loads.length - 1; i >= 0; i--) {
			if (this._loads[i].arrow.children.indexOf(this._funcElm) >= 0) {
				this._removeLoad(this._loads[i]);
				return;
			}
		}

		for (var i = this._clearances.length - 1; i >= 0; i--) {
			if (this._clearances[i].box == this._funcElm) {
				this._removeClearance(this._clearances[i]);
				return;
			}
		}

		if (this._edgeInfo != undefined) {
			this._medialAxis._removeEdge(this._edgeInfo);
		}

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

MASHUP.Design.prototype._manipulate = function(elm, ptnow, ptprev) {
	var vdelta = ptnow.clone().sub(ptprev);
	if (vdelta == undefined) {
		return;
	}

	for (var i = this._loads.length - 1; i >= 0; i--) {
		var load = this._loads[i];
		var idx = load.arrow.children.indexOf(elm);
		if (idx >= 0) {
			load.vector.add(vdelta);
			this._scene.remove(load.arrow);
			load.arrow = XAC.addAnArrow(this._scene, load.midPoint, load.vector, load.vector.length(), 3);
			return load.arrow.children[idx];
		}
	}

	for (var i = this._clearances.length - 1; i >= 0; i--) {
		if (this._clearances[i].box == elm) {
			var clearance = this._clearances[i];
			var vnormal = clearance.vector.clone().normalize();
			var dh = vdelta.dot(vnormal);
			clearance.hclear += dh;

			var vnow = ptnow.clone().sub(clearance.midPoint);
			dnow = Math.sqrt(Math.pow(vnow.length(), 2) - Math.pow(vnow.dot(vnormal), 2));
			var vprev = ptprev.clone().sub(clearance.midPoint);
			dprev = Math.sqrt(Math.pow(vprev.length(), 2) - Math.pow(vprev.dot(vnormal), 2));
			clearance.wclear *= 1 + (dnow / dprev - 1) * (dnow / clearance.wclear / 2);

			this._scene.remove(clearance.box);
			clearance.box = new XAC.Box(clearance.wclear, clearance.hclear,
				5, this._matClearance).m;
			XAC.rotateObjTo(clearance.box, clearance.vector);
			clearance.box.position.copy(clearance.midPoint.clone()
				.add(clearance.vector.clone().multiplyScalar(0.5 * clearance.hclear)));
			this._scene.add(clearance.box);
			return clearance.box;
		}
	}
}

MASHUP.Design.prototype._removeLoad = function(load) {
	for (var i = load.area.length - 1; i >= 0; i--) {
		load.area[i].material = this._matDesign;
		load.area[i].material.needsUpdate = true;
	}
	this._scene.remove(load.arrow);
	for (var i = load.arrow.children.length - 1; i >= 0; i--) {
		XAC.removeFromArray(this._funcElements, load.arrow.children[i]);
	}
	XAC.removeFromArray(this._loads, load);
}

MASHUP.Design.prototype._removeClearance = function(clearance) {
	this._scene.remove(clearance.box);
	XAC.removeFromArray(this._funcElements, clearance.box);
	XAC.removeFromArray(this._clearances, clearance);
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