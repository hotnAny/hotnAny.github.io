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
			this._as[pid] = a;
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
				var rSmall = r / 2 * (sizeFactor - 1);

				laoc = new xacCylinder([rLarge, rSmall], part.cylHeight * sizeFactor, MATERIALOVERLAY).m;
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
				var aoc = xacThing.intersect(getTransformedGeometry(part), getTransformedGeometry(spaceSel), part.material);

				var laoc = new THREE.Mesh(aoc.geometry.clone(), aoc.material.clone());
				scaleAlongVector(laoc, Math.pow(10, sizeFactor - 1), part.normal);
				scaleAroundVector(laoc, sizeFactor, part.normal);
				laoc = xacThing.intersect(getTransformedGeometry(laoc), getTransformedGeometry(part.selCyl), part.material);
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
			var aoc = xacThing.intersect(getTransformedGeometry(part), getTransformedGeometry(spaceSel), part.material);

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
		var ag = getTransformedGeometry(a);

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
				var tmpObj = new THREE.Mesh(getTransformedGeometry(sphereSet), sphereSet.material);
				scene.remove(a);

				// approach #1: make dents
				// aGrippable = xacThing.subtract(ag, getTransformedGeometry(sphereSet), MATERIALOVERLAY);
				// approach #2: make bumps
				aGrippable = xacThing.union(ag, getTransformedGeometry(sphereSet), MATERIALOVERLAY);
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
			aCutOff = xacThing.subtract(getTransformedGeometry(aCutOff), getTransformedGeometry(stub), MATERIALOVERLAY);
		}

		return aCutOff;
	}
}

class xacAnchor extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Anchor';

		this._update = function() {
			if (this._partAnchor == undefined) {
				return;
			}
			// extrude
			var extrusion = this._extrude(this._partAnchor, undefined, this._sizeFactor, this._fingerFactor);

			// make anchor
			var a = this._makeAnchor(extrusion);
			return a;
		}

		// this.update();
		this._singular = true;
	}

	_makeAnchor(extrusion) {

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

		// BEFORE
		var heightAnchor = 0; //getDimAlong(bboxObj, this._partAnchor.normal); // overly large
		if (ints[0] != undefined) {
			heightAnchor = ctrExtrusion.distanceTo(ints[0].point) * 2 * this._sizeFactor;
		}

		//
		//	3. make the anchor stand
		//

		var bcylParams = getBoundingCylinder(extrusion, this._partAnchor.normal);
		var bcylObj = getBoundingCylinder(this._pc.obj, this._partAnchor.normal);
		heightAnchor = Math.max(heightAnchor, bcylParams.radius * 0.25) * this._sizeFactor;

		var ctrAnchorStand;

		if (this._fingerFactor < 2) {
			ctrAnchorStand = ctrExtrusion.clone().add(this._partAnchor.normal.clone().multiplyScalar(heightAnchor / 2));
		} else {
			var amntRaised = Math.min(heightAnchor / 2, bcylObj.height / 10 * this._sizeFactor);
			ctrAnchorStand = ctrExtrusion.clone().sub(this._partAnchor.normal.clone().multiplyScalar(amntRaised));
		}

		// BEFORE
		// var rBtmStand = bcylParams.radius * 1.25 * this._sizeFactor;
		// var rTopStand = rBtmStand / 2;
		// NOW
		var rTopStand = bcylParams.radius * 1.25 * this._sizeFactor / 2;
		var rBtmStand = bcylObj.radius * (this._sizeFactor - 1) + rTopStand;

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

		this._anchor = xacThing.union(getTransformedGeometry(anchorStand), getTransformedGeometry(anchorPlatform), MATERIALOVERLAY);

		return this._anchor;
	}

	mouseDown(e, obj, pt, fnml) {
		//
		// only consider object
		//
		// if (intersects.length == 0) {
		if (this._pc.obj == undefined) {
			this._pc.obj = objects[0];
		}

		intersects = rayCast(e.clientX, e.clientY, [this._pc.obj]);
		// }

		if (intersects[0] != undefined) {
			var obj = (this._pc == undefined || this._pc.object == undefined) ? objects[0] : this._pc.obj;
			if (intersects[0].object == obj) {
				gPartSel.clear();
				gPartSel.press(intersects[0].object, intersects[0].point, intersects[0].face.normal);
				this._partAnchor = gPartSel.part;
			}
		}

		// scene.remove(this._partAnchor.display);
		// scene.remove(this._partAnchor);

		if (Object.keys(this._pc.parts).length == 0) {
			this._pc.parts['Part ' + gPartSerial] = this._partAnchor;
		}

		this.update();
	}
}

class xacMechanism extends xacAdaptation {
	constructor(type, pc, params) {
		super(pc);

		// TODO: be more specific
		this._label = 'Mechanism';

		this._type = type;

		this._update = function(pid) {
			var a;
			switch (this._type) {
				case CLAMP:
					a = this._makeClamp(this._pc.parts[pid]);
					break;
				case CAM:
					this._axisRadius = 3;
					this._axisLength = 20;
					a = this._makeCam(this._pc);
					break;
				case UNIVJOINT:
					a = this._makeUnivJoint(this._pc.parts[pid]);
					break;
			}

			if (a != undefined) {
				scene.remove(this._a);
				scene.add(a);
				this._a = a;
			}

			return a;

		}

		if (this._type == CAM || this._type == UNIVJOINT) {
			this.update();
		}
	}

	// this version is currently specific to clutching
	// fulcrum - the position of the axis
	// dir axis - the orientation of the axis
	// fixed point - where a wrapper can be attached, and a scaffold can be extended
	_makeCam(pc) {
		var ctrl = pc.ctrl;
		var freeEnd = pc.parts['Part 1'];
		var fixedEnd = pc.parts['Part 2'];
		var nmlRotation = new THREE.Vector3(ctrl.plane.A, ctrl.plane.B, ctrl.plane.C).normalize();

		if (nmlRotation.angleTo(freeEnd.normal) < Math.PI / 2) {
			nmlRotation.multiplyScalar(-1);
		}

		//
		// 1. generate an axis (free end)
		//
		var dirLeverFree = ctrl.pocFree.clone().sub(ctrl.fulcrum);
		var dirToAxis = getVerticalOnPlane(dirLeverFree, ctrl.plane.A, ctrl.plane.B, ctrl.plane.C, ctrl.plane.D); // how to go from free end to the axis
		var rCam = 10 * this._sizeFactor;
		var ctrAxis = ctrl.pocFree.clone().add(dirToAxis.clone().normalize().multiplyScalar(rCam));
		// addABall(ctrAxis, 0xf00fff);

		var camAxis = new xacCylinder(this._axisRadius, this._axisLength, MATERIALOVERLAY).m;
		rotateObjTo(camAxis, nmlRotation);
		camAxis.position.copy(ctrAxis);
		// scene.add(camAxis);

		//
		// 2. generate a wrapper (fixed end)
		//
		var camAnchor = this._extrude(fixedEnd, ctrl, this._sizeFactor, this._fingerFactor);
		var ctrAnchor = getBoundingBoxCenter(camAnchor);
		// scene.add(camAnchor);

		//
		// 3. generate bar 1 (holding the axis)
		//
		var endAxis = ctrAxis.clone().sub(nmlRotation.clone().multiplyScalar(this._axisLength * 0.5));
		addABall(endAxis, 0x0000ff);
		var lenBar = ctrAnchor.distanceTo(endAxis) + this._axisRadius * 2;
		var ctrBar = ctrAnchor.clone().add(endAxis).multiplyScalar(0.5);
		var nmlBar = ctrAnchor.clone().sub(endAxis).normalize();

		var camBar = new xacCylinder(this._axisRadius, lenBar, MATERIALOVERLAY).m;
		rotateObjTo(camBar, nmlBar);
		camBar.position.copy(ctrBar);
		// scene.add(camBar);

		var camStruct = xacThing.union(getTransformedGeometry(camAxis), getTransformedGeometry(camAnchor));
		camStruct = xacThing.union(getTransformedGeometry(camStruct), getTransformedGeometry(camBar), MATERIALOVERLAY);

		//
		// 4. generate bar 2 (holding bar 1)
		// skip this for now

		//
		// 5. put the cam in place
		//
		scene.remove(this._cam);
		this._cam = new THREE.Mesh(gCam.geometry, MATERIALOVERLAY);
		var dimsCam = getBoundingBoxDimensions(this._cam);
		this._cam.scale.set(this._sizeFactor, this._sizeFactor, this._sizeFactor);

		var posCam = ctrAxis.clone().add(nmlRotation.clone().multiplyScalar(this._axisLength * 0.5 + dimsCam[1]));

		// manually align the cam with the axis to make it look better
		posCam.add(dirToAxis.clone().multiplyScalar(dimsCam[0] * 0.5));

		// addABall(posCam, 0x44ee55);
		rotateObjTo(this._cam, nmlRotation);
		this._cam.position.copy(posCam);
		scene.add(this._cam);

		return camStruct;
	}

	// assume the part is a wrapping selection
	_makeClamp(part) {
		//
		//	0. params
		//
		var widthCluth = 50; // the width of the clutch part (how wide to leave an openning for the wrap)
		var depthClampNeck = 15; // the 'depth' of the part that sticks out to be connected to the clutch
		var thicknessClampNeck = 5;

		//	1. make a wrap
		// use the wrap display as wrap

		//
		//	2. add & cut a fixed size extrusion as piple clamp openning material
		//
		var cylParams = getBoundingCylinder(part.display, part.normal);

		// one exit possibility - cross section too small
		if (cylParams.radius < depthClampNeck) {
			return;
		}

		var clampNeck = new xacRectPrism(widthCluth, 0.75 * FINGERDIM, (depthClampNeck + cylParams.radius), MATERIALOVERLAY).m;
		var clampNeckStub = new xacRectPrism(widthCluth - thicknessClampNeck * 2, 2 * FINGERDIM, (depthClampNeck + cylParams.radius), MATERIALOVERLAY).m;

		var ctrNeck = this._pt.clone().sub(this._nml.clone().multiplyScalar((cylParams.radius - depthClampNeck) * 0.5));
		var ctrWrapDisplay = getBoundingBoxCenter(part.display);

		var projctrNeck = ctrNeck.clone();
		projctrNeck.y = 0;
		var projCtrWrapDisplay = ctrWrapDisplay.clone();
		projCtrWrapDisplay.y = 0;

		var dirToCtr = projctrNeck.clone().sub(projCtrWrapDisplay);
		addAVector(ctrNeck, dirToCtr);
		addAVector(new THREE.Vector3(), new THREE.Vector3(1, 0, 0));
		addAVector(new THREE.Vector3(), new THREE.Vector3(0, 0, 1));

		var angleToAlign = new THREE.Vector3(0, 0, 1).angleTo(dirToCtr);
		var axisToRotate = new THREE.Vector3(0, 0, 1).cross(dirToCtr).normalize();
		var matRotate = new THREE.Matrix4();
		matRotate.makeRotationAxis(axisToRotate, angleToAlign);

		rotateObjTo(clampNeck, part.normal);
		clampNeck.applyMatrix(matRotate);
		clampNeck.position.copy(ctrNeck);

		rotateObjTo(clampNeckStub, part.normal);
		clampNeckStub.applyMatrix(matRotate);
		clampNeckStub.position.copy(ctrNeck);

		clampNeck = xacThing.subtract(getTransformedGeometry(clampNeck), getTransformedGeometry(clampNeckStub));
		var clamp = xacThing.union(getTransformedGeometry(part.display), getTransformedGeometry(clampNeck));
		clamp = xacThing.subtract(getTransformedGeometry(clamp), getTransformedGeometry(clampNeckStub));
		clamp = xacThing.subtract(getTransformedGeometry(clamp), getTransformedGeometry(this._pc.obj));

		// scene.remove(this._pc.obj);

		//
		//	3. drill TWO holes for bolts
		//
		var screwStub = new xacCylinder(RADIUSM3, widthCluth * 1.5).m;
		screwStub.geometry.rotateZ(Math.PI / 2);
		// scene.add(screwStub);
		rotateObjTo(screwStub, part.normal);
		screwStub.applyMatrix(matRotate);
		screwStub.position.copy(this._pt.clone()); //.add(this._nml.clone().multiplyScalar(depthClampNeck/10)));
		clamp = xacThing.subtract(getTransformedGeometry(clamp), getTransformedGeometry(screwStub), MATERIALOVERLAY);
		screwStub.position.add(this._nml.clone().multiplyScalar(10));
		clamp = xacThing.subtract(getTransformedGeometry(clamp), getTransformedGeometry(screwStub), MATERIALOVERLAY);

		//
		//	4. connect it with the clutch
		//
		scene.remove(this._clamp);

		var clampCopy = new THREE.Mesh(gClamp.geometry.clone(), gClamp.material.clone());
		rotateObjTo(clampCopy, part.normal);
		clampCopy.applyMatrix(matRotate);
		clampCopy.position.copy(this._pt.clone().add(this._nml.clone().multiplyScalar(50)));
		scene.add(clampCopy);

		this._clamp = clampCopy;

		return clamp;
	}

	_makeUnivJoint(part) {
		var uj = undefined;
		var ctrl = this._pc.ctrl;

		if (ctrl.type != ROTATECTRL) {
			return;
		}

		//	1. extrude a base to situate the yoke
		var base = this._extrude(part, undefined, this._sizeFactor, this._fingerFactor);
		var ctrBase = getBoundingBoxCenter(base);
		//	2. situate one of the two yokes
		var yoke1 = new THREE.Mesh(gYoke.geometry.clone(), gYoke.material.clone());
		var dimsYoke = getBoundingBoxDimensions(yoke1);

		scene.remove(gYoke);
		var ctrYoke1 = ctrBase.clone().add(part.normal.clone().multiplyScalar(dimsYoke[1] * 0.5));
		rotateObjTo(yoke1, part.normal);
		yoke1.position.copy(ctrYoke1);

		//	3. display the other yoke and cross
		scene.remove(gYokeCross);
		var yoke2cross = new THREE.Mesh(gYokeCross.geometry.clone(), gYokeCross.material.clone());
		rotateObjTo(yoke2cross, part.normal);
		var dimsYokeCross = getBoundingBoxDimensions(yoke2cross);
		yoke2cross.position.copy(ctrYoke1.clone().add(part.normal.clone().multiplyScalar((dimsYoke[1] + dimsYokeCross[1]) * 0.5)));

		scene.remove(this._yoke2cross);
		scene.add(yoke2cross);
		this._yoke2cross = yoke2cross;

		// uj = xacThing.union(getTransformedGeometry(base), getTransformedGeometry(yoke1), MATERIALOVERLAY);
		uj = yoke1;
		return uj;
	}

	mouseDown(e) {
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

	// params:
	// pc: the parts-ctrl pair
	// - total length: sizeFactor
	// - opening ratio: targetFactor
	// - friction: gripFactor
	_makeGuide(pc) {
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

		// 
		//	abandon using bounding box to make guide
		//
		// for (var i = bboxDimsMobile.length - 1; i >= 0; i--) {
		// 	if (maxDimMobile / bboxDimsMobile[i] > 2) {
		// 		// 				useBbox = true;
		// 		break;
		// 	}
		// }

		var boundMobile;
		if (useBbox) {
			boundMobile = getBoundingBoxMesh(ctrl.mobile);
			boundMobile.scale.set(1 + margin, 1 + margin, 1 + margin);
			rotateObjTo(boundMobile, ctrl.dirMobile, true);
			boundMobile.r = bcylMobile.radius * (1 + margin);
		} else {
			var rMobile = bcylMobile.radius * (1 + margin);
			boundMobile = new xacCylinder(rMobile * this._sizeFactor, lenMobile, MATERIALOVERLAY).m;
			boundMobile.r = rMobile;
		}

		rotateObjTo(boundMobile, ctrl.dir);
		var posBoundMobile = ctrStatic.clone().add(ctrl.dir.clone().normalize().multiplyScalar((lenMobile + lenStatic) * 0.45));
		boundMobile.position.copy(posBoundMobile);
		// scene.add(boundMobile);

		//
		// 1. make the tunnel body
		//
		// BEFORE
		// 		var rGuide = Math.max(boundMobile.r * (this._sizeFactor + margin), bcylStatic.radius);
		// NOW
		var rGuide = boundMobile.r * (this._sizeFactor + margin);
		var lenGuide = lenMobile * 0.25 * this._sizeFactor; // + lenStatic * 0.5;
		var posGuide = ctrStatic.clone().add(ctrl.dir.clone().normalize().multiplyScalar(lenGuide * 0.45));
		var guideBody = new xacCylinder(rGuide, lenGuide, MATERIALOVERLAY);
		rotateObjTo(guideBody.m, ctrl.dir);
		guideBody.m.position.copy(posGuide);
		// guideBody.m.position.copy(boundMobile.position);
		// scene.add(guideBody.m);

		//
		// 2. make the tunnel's finishing part
		//
		var guideEnd = xacThing.subtract(getTransformedGeometry(guideBody.m), getTransformedGeometry(boundMobile), MATERIALOVERLAY);

		//
		// 3. make the tunnel's openning
		//
		var lenOpen = lenGuide * (0.5 + this._sizeFactor);
		var rOpen = rGuide * (1 + this._targetFactor);
		var guideOpen = new xacCylinder([rOpen, rGuide], lenOpen, MATERIALOVERLAY);
		var stubOpen = new xacCylinder([boundMobile.r * this._sizeFactor * rOpen / rGuide, boundMobile.r * this._sizeFactor], lenOpen, MATERIALOVERLAY);
		var guideOpenCut = xacThing.subtract(getTransformedGeometry(guideOpen.m), getTransformedGeometry(stubOpen.m), MATERIALOVERLAY);
		rotateObjTo(guideOpenCut, ctrl.dir);
		guideOpenCut.position.copy(posGuide.clone().add(ctrl.dir.clone().normalize().multiplyScalar((lenGuide + lenOpen) * 0.5)));

		var guide = xacThing.union(getTransformedGeometry(guideEnd), getTransformedGeometry(guideOpenCut), MATERIALOVERLAY);
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

		guide = xacThing.subtract(getTransformedGeometry(guide), getTransformedGeometry(cutHalfStub), MATERIALOVERLAY);

		return guide;
	}
}

class xacLever extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Lever';

		this._update = function(pid) {
			var ctrPart = getCenter(this._pc.parts[pid]);
			var extrusion = this._extrude(this._pc.parts[pid], this._pc.ctrl, Math.sqrt(this._sizeFactor), this._fingerFactor, undefined);
			var lever = this._makeLever(extrusion, pid);
			return lever;
		}

		this.update();
	}

	_makeLever(a, pid) {
		var dirLever;

		// lever applies to both rotation and clutching
		if (this._pc.ctrl.type == ROTATECTRL) {
			dirLever = this._pc.ctrl.dirLever.clone().normalize();
		} else if (this._pc.ctrl.type == CLUTCHCTRL) {
			dirLever = this._pc.ctrl.partArms[pid].clone();
		} else {
			return a;
		}

		dirLever.normalize();

		// BEFORE: based on extrusion
		// var aNew = new THREE.Mesh(a.geometry.clone(), a.material);
		// scaleAlongVector(aNew, Math.pow(3, this._strengthFactor), dirLever);
		// var l = getDimAlong(aNew, dirLever);
		// // TODO: make 0.3 programmatic
		// aNew.translateOnAxis(dirLever, l * 0.3);

		// NOW: use bounding cylinder
		var bcylParams = getBoundingCylinder(a, dirLever);
		var lever = new xacCylinder([bcylParams.radius], bcylParams.height * Math.pow(3, this._strengthFactor), MATERIALOVERLAY).m;
		rotateObjTo(lever, dirLever);
		var l = getDimAlong(lever, dirLever);
		var offsetLever = l * 0.3; // * (this._pc.ctrl.type == CLUTCHCTRL ? 1 : -1);
		lever.position.copy(getBoundingBoxCenter(a).add(dirLever.clone().multiplyScalar(offsetLever)));

		// var aNew = lever;

		return lever;
	}
}

class xacWrapper extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Wrapper';

		this._update = function(pid) {
			var a = this._extrude(this._pc.parts[pid], this._pc.ctrl, this._sizeFactor, this._fingerFactor, this._targetFactor);
			a = this._optimizeGrip(a, this._pc.ctrl, this._gripFactor, new THREE.Vector3(0, -1, 0), undefined);

			// to or not to cut in half for wraps
			if (this._cutPlane != undefined) {
				// a = xacThing.subtract(getTransformedGeometry(a), getTransformedGeometry(this._cutPlane.m), a.material);
			}

			a = xacThing.subtract(getTransformedGeometry(a), getTransformedGeometry(this._pc.obj), a.material);
			return a;
		}

		this.update();
	}
}

class xacHandle extends xacAdaptation {
	constructor(pc, params) {
		super(pc);
		this._label = 'Handle';

		this._update = function(pid) {
			var a = this._makeHandle(this._pc.parts[pid]);
			return a;
		}

		// require mouse input
		// this.update();
	}

	_makeHandle(part) {
		//
		//	0. compute upright direction
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
			extrusion = part.display;
		}
		scene.remove(this._base);
		// scene.add(extrusion);

		//
		//	2. get a bbox of the extrusion, use it to determine to size and position of the torus handle
		//
		var bbox = getBoundingBoxMesh(extrusion);

		//
		//	3. install the handle and merge with extrusion
		//
		var ri = FINGERDIM * 0.05 * (1 + this._fingerFactor);
		var ro = FINGERDIM * 0.5 * this._fingerFactor + ri * 2;
		this._handle = new xacTorus(ro, ri, 2 * Math.PI, MATERIALOVERLAY).m;

		// resizing the handle
		var ratioScale = 1 + 2 * (this._sizeFactor - SIZEINIT);
		scaleAlongVector(this._handle, ratioScale, this._nml);
		addAVector(this._pt, this._nml);
		this._handle.geometry.rotateX(Math.PI / 2);

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
		var a = xacThing.union(getTransformedGeometry(this._handle), getTransformedGeometry(extrusion), MATERIALOVERLAY);

		return a;
	}

	mouseDown(e) {
		if (this._handle != undefined) {
			var intersects = rayCast(e.clientX, e.clientY, [this._handle]);
			if (intersects[0] != undefined && intersects[0].object == this._handle) {
				if (this._handle != undefined) {
					this._toFlip = this._toFlip == false ? true : false;
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

			// this._makeHandle(intersects[0].object);
			this.update();
		}
	}
}