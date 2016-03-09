"use strict";

// TODO: link these to the values in the select menu
var ENLARGEMENT = 0;
var HANDLE = 1;
var LEVER = 2;
var ANCHOR = 3;
var GUIDE = 4;
var MECHANISM = 5;
var HANDHELDCLAMP = 5.1;
var UNIVJOINT = 5.2;
var CAM = 5.3;

var FINGERINIT = 2;
var GRIPINIT = 0;
var STRENGTHINT = 1.5;
var SIZEINIT = 1.75;
var COORDINIT = 0.25;

class xacAdaptation {
	constructor(pc) {
		this._pc = pc;
		this._as = new Array(); // adaptation mesh
		this._strengthFactor = STRENGTHINT;
		this._sizeFactor = SIZEINIT;
		this._fingerFactor = FINGERINIT;
		this._gripFactor = GRIPINIT;
		this._coordFactor = COORDINIT;
	}

	get adaptation() {
		// TODO: merge them!
		for (var pid in this._pc.parts) {
			return this._as[pid];
		}
	}

	update(params) {
		// this._update(params);

		if (params != undefined) {
			this._fingerFactor = params.fingerFactor == undefined ? this._fingerFactor : params.fingerFactor;
			this._gripFactor = params.gripFactor == undefined ? this._gripFactor : params.gripFactor;
			this._strengthFactor = params.strengthFactor == undefined ? this._strengthFactor : params.strengthFactor;
			this._sizeFactor = params.sizeFactor == undefined ? this._sizeFactor : params.sizeFactor;
			this._coordFactor = params.coordFactor == undefined ? this._coordFactor : params.coordFactor;
		}

		for (var pid in this._pc.parts) {
			if (this._pc.parts[pid].deleted == true) {
				continue;
			}

			if (this._as[pid] != undefined) {
				scene.remove(this._as[pid]);
			}

			if (this._pc.parts[pid] != undefined) {
				scene.remove(this._pc.parts[pid]);
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

			// keep adaptations in a list
			this._as[pid] = a;
			scene.add(this._as[pid]);
		}
	}

	_extrude(part, sizeFactor, fingerFactor) {
		var r0 = 20; // temp: finger size
		var r = fingerFactor * r0;

		//	handling 'press' selection
		if (part.type == 'press') {
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
		//	handling 'wrap' selection
		else if (part.type == 'wrap') {
			var ctrPart = part.ctrSel;
			if (D == true) addABall(ctrPart);

			// bounding cylinder
			var cylinderSel = new xacCylinder(100, r, MATERIALCONTRAST);
			rotateObjTo(cylinderSel.m, part.normal);
			cylinderSel.m.position.copy(ctrPart);

			// select which bounding geometry to use
			var spaceSel = cylinderSel.m;
			var aoc = xacThing.intersect(getTransformedGeometry(part), getTransformedGeometry(spaceSel), part.material);

			var laoc = aoc.clone();
			scaleAroundVector(laoc, sizeFactor, part.normal);

			// finally need to cut it in half
			laoc.material.side = THREE.DoubleSide;

			// find an optimal cutting plane
			var n = 36;
			var dirCut = 0;
			var minDist = 1000;
			// addABall(ctrPart);
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

			// addALine(ctrPart, ctrPart.clone().add(dirCut.clone().multiplyScalar(100)));
			var cutPlane = new xacRectPrism(1000, 2, 1000, MATERIALCONTRAST);
			var nmlPlane = new THREE.Vector3().crossVectors(part.normal, dirCut).normalize();
			rotateObjTo(cutPlane.m, nmlPlane);
			cutPlane.m.position.copy(ctrPart);
			// scene.add(cutPlane.m);

			laoc = xacThing.subtract(getTransformedGeometry(laoc), getTransformedGeometry(cutPlane.m), laoc.material);
		}
		return laoc;
	}

	// TODO: vForceToExert
	_optimizeGrip(a, ctrl, gripFactor, vMotionAgainst, vForceToExert) {
		var aGrippable = a;

		a.material.side = THREE.DoubleSide;
		var ag = a.geometry;
		ag.computeFaceNormals();

		var ctr = getBoundingBoxCenter(a);

		// var aspectRatios = getAspectRatios(a);
		// log(aspectRatios);
		var n = 72;
		// // log("n: " + n);

		// TODO: make this programatic - should be a function of the object's size
		var rHole = Math.pow(getBoundingBoxVolume(a), 1.0 / 3) / 10;
		// TODO: make this programatic
		var spacing = rHole * (2 + 9 * (1 - gripFactor));
		var gripPoints = [];

		var rays = [];
		for (var i = 0; i < float2int(n); i++) {
			var phi = Math.PI * 2 * i / n;
			var xRay = Math.cos(phi);
			var zRay = Math.sin(phi);
			rays.push(new THREE.Vector3(xRay, 0, zRay));
		}

		if (vMotionAgainst != undefined) {
			var endPoints = getEndPointsAlong(a, vMotionAgainst);
			// var ddir = endPoints[1].clone().sub(endPoints[0]).multiplyScalar(1.0 / n);
			var axis = endPoints[1].clone().sub(endPoints[0]);
			var ddir = axis.clone().normalize().multiplyScalar(spacing);
			var n = axis.length() / spacing;
			log("n: " + n);
			for (var j = 0; j < n; j += 1) {

				var ctrj = endPoints[0].clone().add(ddir.clone().multiplyScalar(j))
					// addABall(ctrj, 0x44ee55);

				for (var i = rays.length - 1; i >= 0; i--) {
					var dirCast = rays[i].clone();
					rotateVectorTo(dirCast, vMotionAgainst);
					var ctrj2 = ctrj.clone().add(dirCast.clone().normalize().multiplyScalar(1000));
					// addALine(ctrj, ctrj2);

					var rayCaster = new THREE.Raycaster();
					rayCaster.ray.set(ctrj2, dirCast.clone().multiplyScalar(-1).normalize());
					var ints = rayCaster.intersectObjects([a]);
					if (ints.length > 0) {
						var thisPoint = ints[0].point; //.add(dirCast.normalize().multiplyScalar(rHole * 0.5));
						var lastPoint = gripPoints.slice(-1)[0];
						if (lastPoint == undefined || lastPoint.distanceTo(thisPoint) > spacing) {
							gripPoints.push(thisPoint);
							// addABall(thisPoint);
						}
					}
				}
			}

			// log("making " + gripPoints.length + " dents");

			var sphereSet = undefined;
			var parentPos = undefined;
			for (var i = gripPoints.length - 1; i >= 0; i--) {
				var sphere = new xacSphere(rHole, MATERIALCONTRAST);

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
				aGrippable = xacThing.subtract(ag, getTransformedGeometry(sphereSet), MATERIALHIGHLIGHT);
			}

		} else if (vForceToExert != undefined) {

		}

		return aGrippable;
	}

	/*
		cut off inaccessible part
	*/
	_cutOff(a, pc) {
		if(pc.obj.accessibleBoundaries == undefined) {
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
	// - opening ratio: coordFactor
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
		var lenOpen = lenGuide * this._coordFactor;
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

			var a1 = this._extrude(this._pc.parts[pid], Math.sqrt(this._sizeFactor), this._fingerFactor, undefined);
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

class xacEnlargement extends xacAdaptation {
	constructor(pc, params) {
		super(pc);

		this._update = function(pid) {
			var a = this._extrude(this._pc.parts[pid], this._sizeFactor, this._fingerFactor, undefined);
			a = this._optimizeGrip(a, this._pc.ctrl, this._gripFactor, new THREE.Vector3(0, -1, 0), undefined);
			a = xacThing.subtract(getTransformedGeometry(a), getTransformedGeometry(this._pc.obj), a.material);
			return a;
		}

		this.update();
	}
}