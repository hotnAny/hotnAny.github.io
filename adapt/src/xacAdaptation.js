"use strict";

// TODO: link these to the values in the select menu
var WRAPPER = 0;
var HANDLE = 1;
var LEVER = 2;
var ANCHOR = 3;
var GUIDE = 4;
var MECHANISM = 5;
var HANDHELDCLAMP = 51;
var UNIVJOINT = 52;
var CAM = 53;

// the initial values
var FINGERINIT = 2;
var GRIPINIT = 0;
var STRENGTHINT = 1.5;
var SIZEINIT = 1.25;
var TARGETINIT = 0.25;

class xacAdaptation {
	constructor(pc) {
		this._pc = pc;
		this._as = new Array(); // adaptation mesh
		this._strengthFactor = STRENGTHINT;
		this._sizeFactor = SIZEINIT;
		this._fingerFactor = FINGERINIT;
		this._gripFactor = GRIPINIT;
		this._targetFactor = TARGETINIT;
	}

	get adaptation() {
		// TODO: merge them!
		for (var pid in this._pc.parts) {
			return this._as[pid];
		}
	}

	update(params) {
		if (params != undefined) {
			this._fingerFactor = params.fingerFactor == undefined ? this._fingerFactor : params.fingerFactor;
			this._gripFactor = params.gripFactor == undefined ? this._gripFactor : params.gripFactor;
			this._strengthFactor = params.strengthFactor == undefined ? this._strengthFactor : params.strengthFactor;
			this._sizeFactor = params.sizeFactor == undefined ? this._sizeFactor : params.sizeFactor;
			this._targetFactor = params.targetFactor == undefined ? this._targetFactor : params.targetFactor;
		}

		for (var pid in this._pc.parts) {
			if (this._pc.parts[pid].deleted == true) {
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
		}
	}

	_extrude(part, ctrl, sizeFactor, fingerFactor) {
		var r0 = 20; // temp: finger size
		var r = fingerFactor * r0;
		// targetFactor = targetFactor == undefined ? 0 : targetFactor;
		//
		//	handling 'press' selection
		//
		if (part.type == 'press') {
			var laoc = undefined;

			if (ctrl != undefined && ctrl.type == PUSHPULLCTRL) {
				var rLarge = r;
				var rSmall = r / 2 * (sizeFactor - 1);

				laoc = new xacCylinder([rLarge, rSmall], part.cylHeight, MATERIALHIGHLIGHT).m;
				rotateObjTo(laoc, part.normal);
				laoc.position.copy(part.cylCenter);

				// scaleAroundVector(laoc, sizeFactor, part.normal);
				scaleAlongVector(laoc, sizeFactor / 2, part.normal);
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

			// EXPERIMENTAL
			var aocBcyl = getBoundingCylinder(aoc, part.normal);
			aoc = new xacCylinder(aocBcyl.radius, aocBcyl.height, MATERIALHIGHLIGHT).m;
			rotateObjTo(aoc, part.normal);
			aoc.position.copy(ctrPart);

			var laoc = aoc.clone();
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

			var cutPlane = new xacRectPrism(1000, 2, 1000, MATERIALCONTRAST);
			var nmlPlane = new THREE.Vector3().crossVectors(part.normal, dirCut).normalize();
			rotateObjTo(cutPlane.m, nmlPlane);
			cutPlane.m.position.copy(ctrPart);
			// scene.add(cutPlane.m);

			this._cutPlane = cutPlane;
			// delay execution - here simply remember the cutting plane
			// laoc = xacThing.subtract(getTransformedGeometry(laoc), getTransformedGeometry(cutPlane.m), laoc.material);
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

		var ctr = getBoundingBoxCenter(a);

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
			for (var j = 0; j < nAxis; j += 1) {

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
						if (firstPoint != undefined && firstPoint.distanceTo(thisPoint) <= spacing) {
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
				// aGrippable = xacThing.subtract(ag, getTransformedGeometry(sphereSet), MATERIALHIGHLIGHT);
				// approach #2: make bumps
				aGrippable = xacThing.union(ag, getTransformedGeometry(sphereSet), MATERIALHIGHLIGHT);
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
			aCutOff = xacThing.subtract(getTransformedGeometry(aCutOff), getTransformedGeometry(stub), MATERIALHIGHLIGHT);
		}

		return aCutOff;
	}
}

class xacAnchor extends xacAdaptation {
	constructor(pc, params) {
		super(pc);

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
	}

	_makeAnchor(extrusion) {

		//	1. make a cube of the extrusion's bounding box
		// var bbox = getBoundingBoxMesh(extrusion);
		// scene.add(bbox);
		var ctrExtrusion = getBoundingBoxCenter(extrusion);
		var bboxDim = getDimAlong(extrusion, this._partAnchor.normal);
		// scaleAlongVector(bbox, this._partAnchor.normal, )


		//	2. compute anchor params
		var bboxObj = getBoundingBoxMesh(this._pc.obj);
		bboxObj.material.side = THREE.DoubleSide;
		scene.add(bboxObj);

		var rayCaster = new THREE.Raycaster();

		// addAVector(bbox.position, this._partAnchor.normal);
		rayCaster.ray.set(ctrExtrusion, this._partAnchor.normal);

		var ints = rayCaster.intersectObjects([bboxObj]);
		var heightAnchor = getDimAlong(bboxObj, this._partAnchor.normal); // overly large
		if (ints[0] != undefined) {
			heightAnchor = ctrExtrusion.distanceTo(ints[0].point) * 1.5;
			// addALine(bbox.position, ints[0].point);
		}

		//	3. make the anchor stand
		var ctrAnchorStand = ctrExtrusion.clone().add(this._partAnchor.normal.clone().multiplyScalar((heightAnchor + bboxDim) / 2));
		var bcylParams = getBoundingCylinder(extrusion, this._partAnchor.normal);
		var anchorStand = new xacCylinder([bcylParams.radius, bcylParams.radius / 2], heightAnchor, MATERIALHIGHLIGHT).m;
		rotateObjTo(anchorStand, this._partAnchor.normal);
		anchorStand.position.copy(ctrAnchorStand);
		// scene.add(anchorStand);
		// log(heightAnchor/(bboxDim/2))

		//	4. connect it to a platform for clamping
		var paramsPlatform = {
			l: 50,
			w: 30,
			h: 5
		};
		var ctrAnchorPlatform = ctrAnchorStand.clone().add(this._partAnchor.normal.clone().multiplyScalar((heightAnchor + paramsPlatform.h) / 2));
		var anchorPlatform = new xacRectPrism(paramsPlatform.l, paramsPlatform.h, paramsPlatform.w, MATERIALHIGHLIGHT).m;
		rotateObjTo(anchorPlatform, this._partAnchor.normal);
		anchorPlatform.position.copy(ctrAnchorPlatform);
		// scene.add(anchorPlatform);

		scene.remove(bboxObj);

		this._anchor = xacThing.union(getTransformedGeometry(anchorStand), getTransformedGeometry(anchorPlatform), MATERIALHIGHLIGHT);

		return this._anchor;
	}

	mouseDown(e, obj, pt, fnml) {

		// var arrParts = [];
		// for (var idx in this._pc.parts) {
		// 	arrParts.push(this._pc.parts[idx].display);
		// }
		// var intersects = rayCast(e.clientX, e.clientY, arrParts);

		// if (intersects.length == 0) {
		intersects = rayCast(e.clientX, e.clientY, [this._pc.obj]);
		// }

		if (intersects[0] != undefined) {
			// addABall(intersects[0].point);

			if (intersects[0].object == this._pc.obj) {
				// log("obj!")
				gPartSel.clear();
				gPartSel.press(intersects[0].object, intersects[0].point, intersects[0].face.normal, true);
				this._partAnchor = gPartSel.part;
			} else {
				// log("part");
				this._partAnchor = intersects[0].object.parentPart;
			}

		}

		scene.remove(this._partAnchor.display);
		// scene.remove(this._partAnchor);
		this.update(this._partAnchor);
	}
}

class xacMechanism extends xacAdaptation {
	constructor(type, pc, params) {
		super(pc);

		this._type = type;

		this._update = function() {
			var a;
			switch (this._type) {
				case HANDHELDCLAMP:
					break;
				case CAM:
					this._axisRadius = 3;
					this._axisLength = 20;
					a = this._makeCam(this._pc);
					break;
				case UNIVJOINT:
					break;
			}

			if (a != undefined) {
				scene.remove(this._a);
				scene.add(a);
				this._a = a;
			}

		}

		this.update();
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

		// 1. generate an axis (free end)
		var dirLeverFree = ctrl.pocFree.clone().sub(ctrl.fulcrum);
		var dirToAxis = getVerticalOnPlane(dirLeverFree, ctrl.plane.A, ctrl.plane.B, ctrl.plane.C, ctrl.plane.D); // how to go from free end to the axis
		var rCam = 10 * this._sizeFactor;
		var ctrAxis = ctrl.pocFree.clone().add(dirToAxis.clone().normalize().multiplyScalar(rCam));
		// addABall(ctrAxis, 0xf00fff);

		var camAxis = new xacCylinder(this._axisRadius, this._axisLength, MATERIALHIGHLIGHT).m;
		rotateObjTo(camAxis, nmlRotation);
		camAxis.position.copy(ctrAxis);
		// scene.add(camAxis);

		// 2. generate a wrapper (fixed end)
		var camAnchor = this._extrude(fixedEnd, ctrl, this._sizeFactor, this._fingerFactor);
		var ctrAnchor = getBoundingBoxCenter(camAnchor);
		// scene.add(camAnchor);

		// 3. generate bar 1 (holding the axis)
		var endAxis = ctrAxis.clone().sub(nmlRotation.clone().multiplyScalar(this._axisLength * 0.5));
		addABall(endAxis, 0x0000ff);
		var lenBar = ctrAnchor.distanceTo(endAxis) + this._axisRadius * 2;
		var ctrBar = ctrAnchor.clone().add(endAxis).multiplyScalar(0.5);
		var nmlBar = ctrAnchor.clone().sub(endAxis).normalize();

		var camBar = new xacCylinder(this._axisRadius, lenBar, MATERIALHIGHLIGHT).m;
		rotateObjTo(camBar, nmlBar);
		camBar.position.copy(ctrBar);
		// scene.add(camBar);

		var camStruct = xacThing.union(getTransformedGeometry(camAxis), getTransformedGeometry(camAnchor));
		camStruct = xacThing.union(getTransformedGeometry(camStruct), getTransformedGeometry(camBar), MATERIALHIGHLIGHT);

		// 4. generate bar 2 (holding bar 1)
		// skip this for now

		// 5. put the cam in place
		scene.remove(this._cam);
		this._cam = new THREE.Mesh(gCam.geometry, MATERIALHIGHLIGHT);
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
}

class xacGuide extends xacAdaptation {
	constructor(pc, params) {
		super(pc);

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
		// 0. compute the bounding cylinder
		//
		var bcylMobile = getBoundingCylinder(ctrl.mobile, ctrl.dir);
		var bcylStatic = getBoundingCylinder(ctrl.static, ctrl.dir);

		var lenMobile = bcylMobile.height;
		var lenStatic = bcylStatic.height;

		var ctrStatic = getBoundingBoxCenter(ctrl.static);

		var margin = 0.1;

		var rMobile = bcylMobile.radius * (1 + margin);
		var cylMobile = new xacCylinder(rMobile, lenMobile, MATERIALHIGHLIGHT);
		rotateObjTo(cylMobile.m, ctrl.dir);
		var posCylMobile = ctrStatic.clone().add(ctrl.dir.clone().normalize().multiplyScalar((lenMobile + lenStatic) * 0.5));
		cylMobile.m.position.copy(posCylMobile);
		// scene.add(cylMobile.m);

		//
		// 1. make the tunnel body
		//
		var rGuide = Math.max(bcylMobile.radius * (1 + margin) * this._sizeFactor, bcylStatic.radius);
		var lenGuide = lenMobile * 0.25 + lenStatic * 0.5;
		var posGuide = ctrStatic.clone().add(ctrl.dir.clone().normalize().multiplyScalar(lenGuide * 0.5));

		var guideBody = new xacCylinder(rGuide, lenGuide, MATERIALHIGHLIGHT);
		rotateObjTo(guideBody.m, ctrl.dir);
		guideBody.m.position.copy(posGuide);
		// scene.add(guideBody.m);

		//
		// 2. make the tunnel's finishing part
		//
		var guideEnd = xacThing.subtract(getTransformedGeometry(guideBody.m), getTransformedGeometry(cylMobile.m), MATERIALHIGHLIGHT);

		//
		// 3. make the tunnel's openning
		//
		var lenOpen = lenGuide * this._targetFactor;
		var rOpen = rGuide * (0.5 + this._sizeFactor);
		var guideOpen = new xacCylinder([rOpen, rGuide], lenOpen, MATERIALHIGHLIGHT);
		var stubOpen = new xacCylinder([rMobile * rOpen / rGuide, rMobile], lenOpen, MATERIALHIGHLIGHT);
		var guideOpenCut = xacThing.subtract(getTransformedGeometry(guideOpen.m), getTransformedGeometry(stubOpen.m), MATERIALHIGHLIGHT);
		rotateObjTo(guideOpenCut, ctrl.dir);
		guideOpenCut.position.copy(posGuide.clone().add(ctrl.dir.clone().normalize().multiplyScalar((lenGuide + lenOpen) * 0.5)));

		var guide = xacThing.union(getTransformedGeometry(guideEnd), getTransformedGeometry(guideOpenCut), MATERIALHIGHLIGHT);

		//
		// 4. cut the tunnel in half
		//
		var cutHalfStub = new xacRectPrism(rOpen, lenOpen + lenGuide + lenStatic / 2, rOpen * 2);
		cutHalfStub.m.position.set(ctrStatic.x - rOpen / 2, posGuide.y + lenOpen / 2, ctrStatic.z);
		// scene.add(cutHalfStub.m);

		guide = xacThing.subtract(getTransformedGeometry(guide), getTransformedGeometry(cutHalfStub.m), MATERIALHIGHLIGHT);

		return guide;
	}
}

class xacLever extends xacAdaptation {
	constructor(pc, params) {
		super(pc);

		this._update = function(pid) {
			var ctrPart = getCenter(this._pc.parts[pid]);

			var a1 = this._extrude(this._pc.parts[pid], this._pc.ctrl, Math.sqrt(this._sizeFactor), this._fingerFactor, undefined);
			// scene.add(a1);
			var a2 = this._makeLever(a1);
			return a2;
		}

		this.update();
	}

	_makeLever(a) {
		var dirLever = this._pc.ctrl.dirLever.clone().normalize();
		var aNew = new THREE.Mesh(a.geometry.clone(), a.material);
		scaleAlongVector(aNew, Math.pow(3, this._strengthFactor), dirLever);

		var l = getDimAlong(aNew, dirLever);

		// TODO: make 0.3 programmatic
		aNew.translateOnAxis(dirLever, l * 0.3);

		return aNew;
	}
}

class xacWrapper extends xacAdaptation {
	constructor(pc, params) {
		super(pc);

		this._update = function(pid) {
			var a = this._extrude(this._pc.parts[pid], this._pc.ctrl, this._sizeFactor, this._fingerFactor, this._targetFactor);
			a = this._optimizeGrip(a, this._pc.ctrl, this._gripFactor, new THREE.Vector3(0, -1, 0), undefined);

			// need to cut in half for wraps
			if (this._cutPlane != undefined) {
				a = xacThing.subtract(getTransformedGeometry(a), getTransformedGeometry(this._cutPlane.m), a.material);
			}

			a = xacThing.subtract(getTransformedGeometry(a), getTransformedGeometry(this._pc.obj), a.material);
			return a;
		}

		this.update();
	}
}