"use strict";

var SIZEINIT = 1.75;
var FINGERINIT = 2;
var GRIPINIT = 0.1;

class xacAdaptation {
	constructor(pc) {
		this._pc = pc;
		this._as = new Array(); // adaptation mesh
		this._sizeFactor = SIZEINIT;
		this._fingerFactor = FINGERINIT;
		this._gripFactor = GRIPINIT;
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
			this._sizeFactor = params.sizeFactor == undefined ? this._sizeFactor : params.sizeFactor;
			this._fingerFactor = params.fingerFactor == undefined ? this._fingerFactor : params.fingerFactor;
			this._gripFactor = params.gripFactor == undefined ? this._gripFactor : params.gripFactor;
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

			this._as[pid] = this._update(pid);

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

			log("making " + gripPoints.length + " dents");

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
				// scene.add(sphereSet);
				var tmpObj = new THREE.Mesh(getTransformedGeometry(sphereSet), sphereSet.material);
				// scene.add(tmpObj)
				scene.remove(a);
				aGrippable = xacThing.subtract(ag, getTransformedGeometry(sphereSet), MATERIALHIGHLIGHT);
				// scene.add(aDented);
				// scene.remove(tmpObj)
			}

		} else if (vForceToExert != undefined) {

		}

		return aGrippable;
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
		scaleAlongVector(aNew, this._strengthFactor, dirLever);

		var l = getDimAlong(aNew, dirLever);

		aNew.translateOnAxis(dirLever, l * 0.4);

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