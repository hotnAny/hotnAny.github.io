/**
 * methods for generating adaptations onto 3d objects
 * 	
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

"use strict";

var FINGERDIM = 20;

// TODO: link these to the values in the select menu
var WRAPPER = 0;
var HANDLE = 1;
var LEVER = 2;
var ANCHOR = 3;
var GUIDE = 4;
var MECHANISM = 5;
var CLAMP = 51;
var UNIVJOINT = 52;
var CAM = 53;

// the initial values
var FINGERINIT = 2;
var GRIPINIT = 0;
var STRENGTHINT = 1.5;
var SIZEINIT = 1.25;
var TARGETINIT = 0.25;

/*
	base class for a series of adaptation strategies
*/
class xacAdaptation {
	constructor(pc) {
		this._pc = pc; // parts-control pair
		this._as = new Array(); // adaptation mesh
		this._tags = new Array(); // the tags representing the adaptations

		// customization parameters
		this._strengthFactor = STRENGTHINT;
		this._sizeFactor = SIZEINIT;
		this._fingerFactor = FINGERINIT;
		this._gripFactor = GRIPINIT;
		this._targetFactor = TARGETINIT;

		if (this.renderSliders != undefined) {
			this.renderSliders();
		}
	}

	get adaptation() {
		// return the first (and perhaps only) adaptation
		for (var pid in this._pc.parts) {
			return this._as[pid];
		}
	}

	get adaptations() {
		return this._as;
	}

	get obj() {
		return this._pc.obj;
	}

	update(params) {
		if (this._pc == undefined) {
			return;
		}

		if (params != undefined) {
			this._fingerFactor = params.fingerFactor == undefined ? this._fingerFactor : params.fingerFactor;
			this._gripFactor = params.gripFactor == undefined ? this._gripFactor : params.gripFactor;
			this._strengthFactor = params.strengthFactor == undefined ? this._strengthFactor : params.strengthFactor;
			this._sizeFactor = params.sizeFactor == undefined ? this._sizeFactor : params.sizeFactor;
			this._targetFactor = params.targetFactor == undefined ? this._targetFactor : params.targetFactor;
		}

		for (var pid in this._pc.parts) {
			if (this._pc.parts[pid].deleted == true || (this._as[pid] != undefined && this._as[pid].deleted == true)) {
				continue;
			}

			if (this._as[pid] != undefined) {
				scene.remove(this._as[pid]);
			}

			if (this._pc.parts[pid] != undefined) {
				scene.remove(this._pc.parts[pid].display);
			}

			var a = this._update(pid);

			if (a == undefined) {
				continue;
			}

			// clear visual elements from last step
			this._pc.ctrl.clear();

			// cutoff inaccessible part
			a = this._cutOff(a, this._pc);

			// associate to the original object
			a.obj = this._pc.obj;
			a.part = this._pc.parts[pid];

			// keep adaptations in a list
			var awa = this._as[pid] == undefined ? undefined : this._as[pid].awa;
			var attachables = this._as[pid] == undefined ? undefined : this._as[pid].attachables;
			this._as[pid] = a;
			this._as[pid].awa = awa;
			this._as[pid].attachables = attachables;

			scene.add(this._as[pid]);

			if (this._singular) {
				break;
			}
		}

		// assign tag if it's first time created
		if (this._created != true) {
			for (var aid in this._as) {
				var a = this._as[aid];
				gAdaptId += 1;
				var tagName = gAdaptId + ' ' + this._label;
				var tag = lsAdapts.tagit('createTag', tagName); // + String.fromCharCode(charCode));
				this._tags[aid] = tag;

			}
		}
		this._created = true;

		// update the adaptations indexed globally
		for (var aid in this._as) {
			var a = this._as[aid];
			if (a.deleted == true) {
				continue;
			}
			var tagName = $(this._tags[aid][0]).text().slice(0, -1);
			gAdaptationComponents[tagName] = a;
			a.parentAdaptation = this;
			this._tags[aid].removeClass('ui-state-highlight');
			triggerUI2ObjAction(this._tags[aid], FOCUSACTION);
		}

	}


	_extrude(part, ctrl, sizeFactor, fingerFactor) {
		var r = fingerFactor * FINGERDIM;

		//
		//	handling 'press' selection
		//
		if (part.type == 'press') {
			var laoc = undefined;

			if (ctrl != undefined && ctrl.type == PUSHPULLCTRL) {
				var rLarge = r;
				var rSmall = r / 2;

				laoc = new xacCylinder([rLarge, rSmall], part.cylHeight * (sizeFactor - 0.5), MATERIALOVERLAY).m;
				rotateObjTo(laoc, ctrl.type == PUSHPULLCTRL ? ctrl.dirForce : part.normal);
				laoc.position.copy(ctrl.type == PUSHPULLCTRL ? ctrl.pt : part.cylCenter);

				// scaleAroundVector(laoc, sizeFactor, part.normal);
				// 				scaleAlongVector(laoc, sizeFactor / 2, ctrl.type == PUSHPULLCTRL ? ctrl.dirForce : part.normal);
			} else {
				var cylinderSel = new xacCylinder(r / 2, part.cylHeight, MATERIALCONTRAST);
				rotateObjTo(cylinderSel.m, part.normal);
				cylinderSel.m.position.copy(part.cylCenter);

				// select which bounding geometry to use
				var spaceSel = cylinderSel.m;
				var aoc = xacThing.intersect(gettg(part), gettg(spaceSel), part.material);

				var laoc = new THREE.Mesh(aoc.geometry.clone(), aoc.material.clone());
				scaleAlongVector(laoc, Math.pow(10, sizeFactor - 1), part.normal);
				scaleAroundVector(laoc, sizeFactor, part.normal);
				laoc = xacThing.intersect(gettg(laoc), gettg(part.selCyl), part.material);
			}
		}
		//
		//	handling 'wrap' selection
		//
		else if (part.type == 'wrap') {
			var ctrPart = part.ctrSel;
			// bounding cylinder
			var cylinderSel = new xacCylinder(100, r, MATERIALCONTRAST);
			rotateObjTo(cylinderSel.m, part.normal);
			cylinderSel.m.position.copy(ctrPart);

			// select which bounding geometry to use
			var spaceSel = cylinderSel.m;
			var aoc = xacThing.intersect(gettg(part), gettg(spaceSel), part.material);

			// EXPERIMENTAL: use cylindrical structure
			var aocBcyl = getBoundingCylinder(aoc, part.normal);
			var laoc;
			// if (aocBcyl.radius < FINGERDIM * 2) {
			aoc = new xacCylinder(aocBcyl.radius, aocBcyl.height, MATERIALOVERLAY).m;
			// }

			rotateObjTo(aoc, part.normal);
			aoc.position.copy(ctrPart);
			laoc = aoc.clone();
			laoc.radius = aocBcyl.radius;
			scaleAroundVector(laoc, sizeFactor, part.normal);

			// finally need to cut it in half
			laoc.material.side = THREE.DoubleSide;

			// find an optimal cutting plane
			var n = 36;
			var dirCut = 0;
			var minDist = 1000;
			for (var i = 0; i < n; i++) {
				var theta = Math.PI * 2 * i / n;
				var dir = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta));
				rotateVectorTo(dir, part.normal);
				// addALine(ctrPart, ctrPart.clone().add(dir.clone().multiplyScalar(100)));

				var rayCaster = new THREE.Raycaster();
				rayCaster.ray.set(ctrPart, dir.normalize());
				var ints = rayCaster.intersectObjects([laoc]);
				// addABall(ints[0].point);

				if (ints[0] != undefined) {
					var dist = ints[0].point.distanceTo(ctrPart);
					if (dist < minDist) {
						minDist = dist;
						dirCut = dir;
					}
				}
			}

		}
		return laoc;
	}

	// TODO: vForceToExert
	_optimizeGrip(a, ctrl, gripFactor, vMotionAgainst, vForceToExert) {
		// EXPERIMENTAL: don't bother if the grip factor is too small
		if (gripFactor < 0.2) {
			return a;
		}

		var aGrippable = a;

		a.material.side = THREE.DoubleSide;

		// EXPERIMENTAL
		var ag = gettg(a);

		ag.computeFaceNormals();

		var ctr = getBoundingBoxHelperCenter(a); //getBoundingBoxCenter(a);
		// showBoundingBox(a);
		// 		addABall(ctr)

		var nRays = 72;

		// TODO: make this programatic - should be a function of the object's size
		var rParticle = Math.pow(getBoundingBoxVolume(a), 1.0 / 3) / 15;
		// TODO: make this programatic
		var spacing = rParticle * (2 + 9 * (1 - gripFactor));
		var gripPoints = [];

		var rays = [];
		for (var i = 0; i < nRays; i++) {
			var phi = Math.PI * 2 * i / nRays;
			var xRay = Math.cos(phi);
			var zRay = Math.sin(phi);
			rays.push(new THREE.Vector3(xRay, 0, zRay));
		}

		if (vMotionAgainst != undefined) {
			var endPoints = getEndPointsAlong(a, vMotionAgainst);

			// var ddir = endPoints[1].clone().sub(endPoints[0]).multiplyScalar(1.0 / n);
			var axis = endPoints[1].clone().sub(endPoints[0]);

			endPoints[0].add(axis.clone().normalize().multiplyScalar(rParticle * 2));
			endPoints[1].sub(axis.clone().normalize().multiplyScalar(rParticle * 2));

			var ddir = axis.clone().normalize().multiplyScalar(spacing);
			var nAxis = axis.length() / spacing;

			var gripPoints = [];
			for (var j = 1; j < nAxis - 1; j += 1) {

				var ctrj = endPoints[0].clone().add(ddir.clone().multiplyScalar(j))
					// addABall(ctrj, 0x44ee55);

				var gripPointsPerRound = [];
				for (var i = rays.length - 1; i >= 0; i--) {
					var dirCast = rays[i].clone();
					rotateVectorTo(dirCast, vMotionAgainst);
					var ctrj2 = ctrj.clone().add(dirCast.clone().normalize().multiplyScalar(1000));


					var rayCaster = new THREE.Raycaster();
					rayCaster.ray.set(ctrj2, dirCast.clone().multiplyScalar(-1).normalize());
					var ints = rayCaster.intersectObjects([a]);
					if (ints.length > 0) {
						var thisPoint = ints[0].point.sub(dirCast.normalize().multiplyScalar(rParticle * 0.5));

						var lastPoint = gripPointsPerRound[gripPointsPerRound.length - 1];
						if (lastPoint != undefined && lastPoint.distanceTo(thisPoint) <= spacing) {
							continue;
						}

						var firstPoint = gripPointsPerRound[0];

						if (firstPoint != undefined && firstPoint.distanceTo(thisPoint) <= spacing / 2) {
							// addALine(ctrj, ctrj2, 0x0000ff);
							break;
						}

						gripPointsPerRound.push(thisPoint);
					}
				}

				gripPoints = gripPoints.concat(gripPointsPerRound);
			}

			var sphereSet = undefined;
			var parentPos = undefined;
			for (var i = gripPoints.length - 1; i >= 0; i--) {
				var sphere = new xacSphere(rParticle, MATERIALCONTRAST);

				if (sphereSet == undefined) {
					sphere.m.position.copy(gripPoints[i]);
					sphereSet = sphere.m;
					parentPos = sphere.m.position;
				} else {
					// sphereSet = xacThing.union(sphere.gt, sphereSet.geometry, MATERIALCONTRAST);
					sphere.m.position.copy(gripPoints[i].clone().sub(parentPos));
					THREE.GeometryUtils.merge(sphereSet.geometry, sphere.m);
				}
			}

			if (sphereSet != undefined) {
				var tmpObj = new THREE.Mesh(gettg(sphereSet), sphereSet.material);
				scene.remove(a);

				// approach #1: make dents
				// aGrippable = xacThing.subtract(ag, gettg(sphereSet), MATERIALOVERLAY);
				// approach #2: make bumps
				aGrippable = xacThing.union(ag, gettg(sphereSet), MATERIALOVERLAY);
			}

		} else if (vForceToExert != undefined) {

		}

		return aGrippable;
	}

	/*
		cut off inaccessible part
	*/
	_cutOff(a, pc) {
		if (pc.obj.accessibleBoundaries == undefined) {
			return a;
		}

		var aCutOff = a;

		var aDims = getBoundingBoxDimensions(a);

		var stubCutOff = getBoundingBoxMesh(a);
		// scene.add(stubCutOff)

		// [minx, maxx, miny, maxy, minz, maxz]
		for (var i = 0; i < pc.obj.accessibleBoundaries.length; i++) {

			var idx = float2int(i / 2);
			// no boundaries on this side
			if (pc.obj.accessibleBoundaries[i] == undefined) {
				continue;
			}

			var stub = stubCutOff.clone();
			var offsetStub = [stub.position.x, stub.position.y, stub.position.z];
			offsetStub[idx] = pc.obj.accessibleBoundaries[i] + Math.pow(-1, i + 1) * aDims[idx] / 2;
			stub.position.copy(new THREE.Vector3(offsetStub[0], offsetStub[1], offsetStub[2]));
			// scene.add(stub)
			aCutOff = xacThing.subtract(gettg(aCutOff), gettg(stub), MATERIALOVERLAY);
		}

		return aCutOff;
	}

	_genSlider(id, label, min, max, value, parent) {
		var sldrRow = $('<tr></tr>');
		var sldrCell = $('<td><label class="ui-widget">' + label + '</label></td><td width="200px"></td>');
		var sldr = $('<div id="' + id + '"></div>');
		sldrCell.append(sldr);
		sldrRow.append(sldrCell);

		sldr.slider({
			max: max,
			min: min,
			range: 'max'
		});

		sldr.slider('value', value);

		parent.append(sldrRow);
		sldr.row = sldrRow;
		return sldr;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	WRAPPER: something wrapped around an existing object or and extension that lengthens it.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class xacWrapper extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Wrapper';

		this._update = function(pid) {

			var l = this._sldrLength.tv();
			var g = this._sldrGrip.tv();
			var f = this._sldrFriction.tv();

			var a = this._extrude(this._pc.parts[pid], this._pc.ctrl, g, l);
			a = this._optimizeGrip(a, this._pc.ctrl, f, new THREE.Vector3(0, -1, 0), undefined);

			// // to or not to cut in half for wraps
			// if (this._cutPlane != undefined) {
			// 	// a = xacThing.subtract(gettg(a), gettg(this._cutPlane.m), a.material);
			// }

			a = xacThing.subtract(gettg(a), gettg(this._pc.obj), a.material);
			return a;
		}

		this.update();
	}

	renderSliders() {
		var panel = tblSldrAdjust;

		for (var i = panel.children().length - 1; i >= 0; i--) {
			panel.children()[i].remove();
		}

		if (this._sldrLength == undefined) {
			this._sldrLength = this._genSlider('sldrLength', 'Length', 5, 70, 40, panel);
			this._sldrLength.tv = function() {
				var value = this.slider('value');
				return value * value / 1000;
			};
		} else {
			panel.append(this._sldrLength.row);
		}

		if (this._sldrGrip == undefined) {
			this._sldrGrip = this._genSlider('sldrGrip', 'Grip', 0, 100, 25, panel);
			this._sldrGrip.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return 1 + (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrGrip.row);
		}

		if (this._sldrFriction == undefined) {
			this._sldrFriction = this._genSlider('sldrFriction', 'Friction', 0, 100, 0, panel);
			this._sldrFriction.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrFriction.row);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HANDLE: an add-on grippable part attached to an existing object, by which the object is easier to hold, carry or control
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class xacHandle extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Handle';

		this._update = function(pid) {
			var a = this._makeHandle(this._pc.parts[pid]);
			return a;
		}

		this.update();
	}

	_makeHandle(part) {
		if (this._pt == undefined) {
			this._pt = part.pt;
		}

		if (this._nml == undefined) {
			this._nml = part.nmlPt;
		}

		var s = this._sldrSize.tv();
		var g = this._sldrGrip.tv();
		var c = this._sldrCurvature.tv();

		//
		//	0. compute upright direction
		//
		var dirUp = undefined;
		if (part.type == 'press') {
			// find an optimal up direction
		} else if (part.type == 'wrap') {
			// already given
			dirUp = part.normal;
		}

		//
		//	1. extrude as the connector btwn handle & obj
		//
		// assume a cylindrical wrap is okay
		var extrusion = this._extrude(part, undefined, 1.0, 1);

		// see if only need basicly small wrapper
		if (extrusion.radius > FINGERDIM * 2) {
			extrusion = new THREE.Mesh(part.display.geometry.clone(), part.display.material.clone());
			scaleAlongVector(extrusion, 1.5, part.nmlPt);
			scaleAroundVector(extrusion, 1.1, part.nmlPt);
		}
		// scene.remove(this._base);
		// scene.add(extrusion);

		//
		//	2. get a bbox of the extrusion, use it to determine to size and position of the torus handle
		//
		var bbox = getBoundingBoxMesh(extrusion);

		//
		//	3. install the handle and merge with extrusion
		//
		// var ri = FINGERDIM * 0.05 * (1 + this._fingerFactor);
		var ri = FINGERDIM * 0.5 * g * s;
		// var ro = FINGERDIM * 0.5 * this._fingerFactor + ri * 2;
		var ro = FINGERDIM * 0.5 * s + ri * 2;
		this._handle = new xacTorus(ro, ri, 2 * Math.PI, MATERIALOVERLAY).m;

		// resizing the handle
		// var ratioScale = 1 + 2 * (this._sizeFactor - SIZEINIT);
		var ratioScale = c * 0.75 + 0.25; // 1 + 2 * (c - SIZEINIT);

		//addAVector(this._pt, this._nml);
		this._handle.geometry.rotateX(Math.PI / 2);
		scaleAlongVector(this._handle, ratioScale, this._nml);

		// position
		var ctrHandle = this._pt.clone().add(this._nml.clone().normalize().multiplyScalar(ro * ratioScale));

		// if it's grasping, then up direction matters
		if (dirUp != undefined) {
			rotateObjTo(this._handle, this._nml.clone().cross(dirUp));
		}
		// otherwise it doesn't
		else {
			rotateObjTo(this._handle, this._nml);
		}
		this._handle.position.copy(ctrHandle);
		// scene.add(handle);

		// TODO: allowing users to flip
		if (this._toFlip == true) {
			this._handle.rotateOnAxis(this._nml, Math.PI / 2);
		}

		//
		// TODO: 4. combine or remove extra parts
		//
		var a = xacThing.union(gettg(this._handle), gettg(extrusion), MATERIALOVERLAY);

		return a;
	}

	mousedown(e) {
		if (this._handle != undefined) {
			var intersects = rayCast(e.clientX, e.clientY, [this._handle]);
			if (intersects[0] != undefined && intersects[0].object == this._handle) {
				if (this._handle != undefined) {
					this._toFlip = this._toFlip == true ? false : true;
					this.update();
				}
			}
		}

		var arrParts = [];
		for (var idx in this._pc.parts) {
			arrParts.push(this._pc.parts[idx].display);
		}

		var intersects = rayCast(e.clientX, e.clientY, arrParts);

		if (intersects.length == 0) {
			intersects = rayCast(e.clientX, e.clientY, [this._pc.obj]);
		}

		if (intersects[0] != undefined) {
			this._pt = intersects[0].point;
			this._nml = intersects[0].face.normal;

			this.update();
		}
	}

	renderSliders() {
		var panel = tblSldrAdjust;

		for (var i = panel.children().length - 1; i >= 0; i--) {
			panel.children()[i].remove();
		}

		if (this._sldrSize == undefined) {
			this._sldrSize = this._genSlider('sldrSize', 'Size', 5, 70, 40, panel);
			this._sldrSize.tv = function() {
				var value = this.slider('value');
				return value * value / 1000;
			};
		} else {
			panel.append(this._sldrSize.row);
		}

		if (this._sldrGrip == undefined) {
			this._sldrGrip = this._genSlider('sldrGrip', 'Grip', 0, 100, 25, panel);
			this._sldrGrip.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return (1 + (value - minValue) * 1.0 / (maxValue - minValue)) * 0.1;
			};
		} else {
			panel.append(this._sldrGrip.row);
		}

		if (this._sldrCurvature == undefined) {
			this._sldrCurvature = this._genSlider('sldrCurvature', 'Curvature', 0, 100, 100, panel);
			this._sldrCurvature.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrCurvature.row);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	LEVER: an add-on part that makes the existing object easier to be turned or rotated. 
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class xacLever extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Lever';

		this._update = function(pid) {
			var ctrPart = getCenter(this._pc.parts[pid]);
			var g = this._sldrGrip.tv();
			var extrusion = this._extrude(this._pc.parts[pid], this._pc.ctrl, 1, Math.max(0.5, g));
			var lever = this._makeLever(extrusion, pid);
			return lever;
		}

		this.update();
	}

	_makeLever(extrusion, pid) {
		var s = this._sldrStrength.tv();

		var dirLever;

		// lever applies to both rotation and clutching
		if (this._pc.ctrl.type == ROTATECTRL) {
			dirLever = this._pc.ctrl.dirLever.clone().normalize();
		} else if (this._pc.ctrl.type == CLUTCHCTRL) {
			dirLever = this._pc.ctrl.partArms[pid].clone();
		} else {
			return extrusion;
		}

		dirLever.normalize();

		var bcylParams = getBoundingCylinder(extrusion, dirLever);
		var lever = new xacCylinder([bcylParams.radius], bcylParams.height * Math.pow(5, s), MATERIALOVERLAY).m;
		rotateObjTo(lever, dirLever);
		// var l = getDimAlong(lever, dirLever);
		var offsetLever = getDimAlong(lever, dirLever) * 0.3; // * (this._pc.ctrl.type == CLUTCHCTRL ? 1 : -1);
		lever.position.copy(getBoundingBoxCenter(extrusion).add(dirLever.clone().multiplyScalar(offsetLever)));

		return lever;
	}

	renderSliders() {
		var panel = tblSldrAdjust;

		for (var i = panel.children().length - 1; i >= 0; i--) {
			panel.children()[i].remove();
		}

		if (this._sldrStrength == undefined) {
			this._sldrStrength = this._genSlider('sldrStrength', 'Strength', 0, 100, 50, panel);
			this._sldrStrength.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return 1 + (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrStrength.row);
		}

		if (this._sldrGrip == undefined) {
			this._sldrGrip = this._genSlider('sldrGrip', 'Grip', 5, 70, 40, panel);
			this._sldrGrip.tv = function() {
				var value = this.slider('value');
				return value * value / 1000;
			};
		} else {
			panel.append(this._sldrGrip.row);
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	ANCHOR/STAND: a structure with which an existing object can be stably situated or affixed to the environment.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class xacAnchor extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Anchor';

		this._update = function() {
			if (this._partAnchor == undefined) {
				return;
			}

			// extrude
			var c = this._sldrContact.tv();
			var extrusion = this._extrude(this._partAnchor, undefined, 1, c);

			// make anchor
			var a = this._makeAnchor(extrusion);
			return a;
		}

		this._singular = true;
	}

	_makeAnchor(extrusion) {
		var c = this._sldrContact.tv();
		var h = this._sldrHeight.tv();
		var s = this._sldrStability.tv();

		//
		//	1. make a cube of the extrusion's bounding box
		//
		// 		scene.add(extrusion);
		var ctrExtrusion = getBoundingBoxCenter(extrusion);
		var bboxDim = getDimAlong(extrusion, this._partAnchor.normal);

		//
		//	2. compute anchor params
		//
		var bboxObj = getBoundingBoxMesh(this._pc.obj);
		bboxObj.material.side = THREE.DoubleSide;
		scene.add(bboxObj);

		var rayCaster = new THREE.Raycaster();
		rayCaster.ray.set(ctrExtrusion, this._partAnchor.normal);
		// addAVector(ctrExtrusion, this._partAnchor.normal);

		var ints = rayCaster.intersectObjects([bboxObj]);

		var heightAnchor = 0; //getDimAlong(bboxObj, this._partAnchor.normal); // overly large
		if (ints[0] != undefined) {
			heightAnchor = ctrExtrusion.distanceTo(ints[0].point) * 2 * h;
		}

		//
		//	3. make the anchor stand
		//

		var bcylParams = getBoundingCylinder(extrusion, this._partAnchor.normal);
		var bcylObj = getBoundingCylinder(this._pc.obj, this._partAnchor.normal);
		heightAnchor = Math.max(heightAnchor, bcylParams.radius * 0.25) * h;

		var ctrAnchorStand;

		if (c < 2) {
			ctrAnchorStand = ctrExtrusion.clone().add(this._partAnchor.normal.clone().multiplyScalar(heightAnchor / 2));
		} else {
			var amntRaised = Math.min(heightAnchor / 2, bcylObj.height / 10 * h);
			ctrAnchorStand = ctrExtrusion.clone().sub(this._partAnchor.normal.clone().multiplyScalar(amntRaised));
		}

		// BEFORE
		// var rBtmStand = bcylParams.radius * 1.25 * this._sizeFactor;
		// var rTopStand = rBtmStand / 2;
		// NOW
		var rTopStand = bcylParams.radius * 1.25 * s / 2;
		var rBtmStand = bcylObj.radius * (s - 1) + rTopStand;

		var anchorStand = new xacCylinder([rBtmStand, rTopStand], heightAnchor, MATERIALOVERLAY).m;
		rotateObjTo(anchorStand, this._partAnchor.normal);
		anchorStand.position.copy(ctrAnchorStand);
		// scene.add(anchorStand);

		//
		//	4. connect it to a platform for clamping
		//
		var paramsPlatform = {
			l: rBtmStand * 2 + 20,
			w: rBtmStand * 2 + 10,
			h: Math.max(5, rBtmStand * 0.1)
		};
		var ctrAnchorPlatform = ctrAnchorStand.clone().add(this._partAnchor.normal.clone().multiplyScalar((heightAnchor + paramsPlatform.h) / 2));
		var anchorPlatform = new xacRectPrism(paramsPlatform.l, paramsPlatform.h, paramsPlatform.w, MATERIALOVERLAY).m;
		rotateObjTo(anchorPlatform, this._partAnchor.normal);
		anchorPlatform.position.copy(ctrAnchorPlatform);
		// scene.add(anchorPlatform);

		scene.remove(bboxObj);

		this._anchor = xacThing.union(gettg(anchorStand), gettg(anchorPlatform), MATERIALOVERLAY);

		return this._anchor;
	}

	mousedown(e, obj, pt, fnml) {
		//
		// only consider object
		//
		if (this._pc.obj == undefined) {
			this._pc.obj = objects[0];
		}

		intersects = rayCast(e.clientX, e.clientY, [this._pc.obj]);

		if (intersects[0] != undefined) {
			var obj = (this._pc == undefined || this._pc.object == undefined) ? objects[0] : this._pc.obj;
			if (intersects[0].object == obj) {
				gPartSel.clear();
				gPartSel.press(intersects[0].object, intersects[0].point, intersects[0].face.normal);
				this._partAnchor = gPartSel.part;
				scene.remove(gPartSel.part.display);
			}
		}

		if (Object.keys(this._pc.parts).length == 0) {
			this._pc.parts['Part ' + gPartSerial] = this._partAnchor;
		}

		this.update();
	}

	renderSliders() {
		var panel = tblSldrAdjust;

		for (var i = panel.children().length - 1; i >= 0; i--) {
			panel.children()[i].remove();
		}

		if (this._sldrContact == undefined) {
			this._sldrContact = this._genSlider('sldrContact', 'Contact', 5, 70, 40, panel);
			this._sldrContact.tv = function() {
				var value = this.slider('value');
				return value * value / 1000;
			};
		} else {
			panel.append(this._sldrContact.row);
		}

		if (this._sldrHeight == undefined) {
			this._sldrHeight = this._genSlider('sldrHeight', 'Height', 0, 100, 50, panel);
			this._sldrHeight.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return 1 + (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrHeight.row);
		}

		if (this._sldrStability == undefined) {
			this._sldrStability = this._genSlider('sldrStability', 'Stability', 0, 100, 50, panel);
			this._sldrStability.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return 1 + (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrStability.row);
		}
	}
}

class xacGuide extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Guide';

		this._update = function(pid) {
			var a = this._makeGuide(this._pc);
			return a;
		}

		this.update();
	}

	_makeGuide(pc) {
		var s = this._sldrSpace.tv();
		var l = this._sldrLength.tv();
		var o = this._sldrOpening.tv();

		var ctrl = pc.ctrl;

		//
		// 0. compute the bounding space
		//
		var bcylMobile = getBoundingCylinder(ctrl.mobile, ctrl.dir);
		var bcylStatic = getBoundingCylinder(ctrl.static, ctrl.dir);

		var lenMobile = bcylMobile.height;
		var lenStatic = bcylStatic.height;

		var ctrStatic = getBoundingBoxCenter(ctrl.static);

		var margin = 0.1;

		// decide which one to use: bounding cylinder or bounding box
		var bboxDimsMobile = getBoundingBoxDimensions(ctrl.mobile);
		var maxDimMobile = getMax(bboxDimsMobile);
		var useBbox = false;

		var boundMobile;
		if (useBbox) {
			boundMobile = getBoundingBoxMesh(ctrl.mobile);
			boundMobile.scale.set(1 + margin, 1 + margin, 1 + margin);
			rotateObjTo(boundMobile, ctrl.dirMobile, true);
			boundMobile.r = bcylMobile.radius * (1 + margin);
		} else {
			var rMobile = bcylMobile.radius * (1 + margin);
			boundMobile = new xacCylinder(rMobile * s, lenMobile, MATERIALOVERLAY).m;
			boundMobile.r = rMobile;
		}

		rotateObjTo(boundMobile, ctrl.dir);
		var posBoundMobile = ctrStatic.clone().add(ctrl.dir.clone().normalize().multiplyScalar((lenMobile + lenStatic) * 0.45));
		boundMobile.position.copy(posBoundMobile);
		// scene.add(boundMobile);

		//
		// 1. make the tunnel body
		//
		var rGuide = boundMobile.r * (s + margin);
		var lenGuide = lenMobile * 0.25 * l; // + lenStatic * 0.5;
		var posGuide = ctrStatic.clone().add(ctrl.dir.clone().normalize().multiplyScalar(lenGuide * 0.45));
		var guideBody = new xacCylinder(rGuide, lenGuide, MATERIALOVERLAY);
		rotateObjTo(guideBody.m, ctrl.dir);
		guideBody.m.position.copy(posGuide);
		// guideBody.m.position.copy(boundMobile.position);
		// scene.add(guideBody.m);

		//
		// 2. make the tunnel's finishing part
		//
		var guideEnd = xacThing.subtract(gettg(guideBody.m), gettg(boundMobile), MATERIALOVERLAY);

		//
		// 3. make the tunnel's openning
		//
		var lenOpen = lenGuide * (s - 0.5);
		var rOpen = rGuide * o;
		var guideOpen = new xacCylinder([rOpen, rGuide], lenOpen, MATERIALOVERLAY);
		var stubOpen = new xacCylinder([boundMobile.r * s * rOpen / rGuide, boundMobile.r * s], lenOpen, MATERIALOVERLAY);
		var guideOpenCut = xacThing.subtract(gettg(guideOpen.m), gettg(stubOpen.m), MATERIALOVERLAY);
		rotateObjTo(guideOpenCut, ctrl.dir);
		guideOpenCut.position.copy(posGuide.clone().add(ctrl.dir.clone().normalize().multiplyScalar((lenGuide + lenOpen) * 0.5)));

		var guide = xacThing.union(gettg(guideEnd), gettg(guideOpenCut), MATERIALOVERLAY);
		// 	scene.add(guide)

		//
		// 4. cut the tunnel in half
		//
		var cutHalfStub = new xacRectPrism(rOpen * 3, lenOpen + lenGuide + lenStatic / 2, rOpen * 3).m;
		rotateObjTo(cutHalfStub, ctrl.dir);

		// find cutting direction
		boundMobile.updateMatrixWorld();
		var bcylMobileNew = getBoundingCylinder(ctrl.mobile, ctrl.dir);
		var dirOffsetCut = bcylMobileNew.dirRadius.clone().normalize();
		// prefer upright
		if (dirOffsetCut.angleTo(new THREE.Vector3(0, 1, 0)) > Math.PI / 2) {
			dirOffsetCut.multiplyScalar(-1);
		}
		cutHalfStub.position.copy(getBoundingBoxCenter(guide).clone().add(dirOffsetCut.multiplyScalar(rOpen * 3 / 2)));
		// addAVector(ctrStatic, dirOffsetCut, 0x0000ff);
		// addABall(getBoundingBoxCenter(guide), 0x0000ff, 5);
		// scene.add(cutHalfStub);

		guide = xacThing.subtract(gettg(guide), gettg(cutHalfStub), MATERIALOVERLAY);

		return guide;
	}

	renderSliders() {
		var panel = tblSldrAdjust;

		for (var i = panel.children().length - 1; i >= 0; i--) {
			panel.children()[i].remove();
		}

		if (this._sldrSpace == undefined) {
			this._sldrSpace = this._genSlider('sldrSpace', 'Space', 0, 100, 50, panel);
			this._sldrSpace.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return 1 + (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrSpace.row);
		}

		if (this._sldrLength == undefined) {
			this._sldrLength = this._genSlider('sldrLength', 'Length', 0, 100, 50, panel);
			this._sldrLength.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return 1 + (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrLength.row);
		}

		if (this._sldrOpening == undefined) {
			this._sldrOpening = this._genSlider('sldrOpening', 'Opening', 0, 100, 50, panel);
			this._sldrOpening.tv = function() {
				var value = this.slider('value');
				var minValue = this.slider("option", "min");
				var maxValue = this.slider("option", "max");
				return 1 + (value - minValue) * 1.0 / (maxValue - minValue);
			};
		} else {
			panel.append(this._sldrOpening.row);
		}
	}
}