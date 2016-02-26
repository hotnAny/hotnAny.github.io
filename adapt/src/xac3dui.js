"use strict";

/*
	a visualization that shows where the user selects on an object as control point/area
	there are two selection methods:
		1) casting ...
		2) wrapping ...
*/
class PartSelection {
	constructor() {
		this.FINGER = 10;
		this.HAND = 50;

		this._obj = undefined;

		this.isEngaged = false;
		this.MINWRAPMOUSEOFFSET = 10;
		// this.WRAPTHICKNESS = 20;
		this.isWrapping = false;

		this._strokePoints = [];
	}

	get part() {
		// return this._part == undefined ? undefined : this._part.clone();
		return this._part;
	}

	get obj() {
		return this._obj;
	}

	clear() {
		this._part = undefined;
		this._strokePoints = [];
	}

	/*
		casting a finger or hand print on the object by single clicks
	*/
	cast(obj, pt, nml, size) {
		this.clear();
		this._obj = obj;

		//
		//	1. sample a set of 'finger points'
		//
		nml = nml.normalize();
		var nmlOpp = nml.clone().multiplyScalar(-1);

		var rPartSelection = size;
		var distAbove = size * 2; // hyperthetical dist between finger(s) and the ctrl point

		var yUp = new THREE.Vector3(0, 1, 0);
		var angleToRotate = yUp.angleTo(nml);
		var axisToRotate = new THREE.Vector3().crossVectors(yUp, nml).normalize();

		// find the max distance to cast the shadow
		var ctrlPts = [];
		var tess = 32;
		var rayCaster = new THREE.Raycaster();
		var maxDist2PartSelection = distAbove;
		for (var i = 0; i < tess; i++) {
			var x = rPartSelection * Math.sin(i * 2 * Math.PI / tess);
			var z = rPartSelection * Math.cos(i * 2 * Math.PI / tess);
			var p = new THREE.Vector3(x, distAbove, z);
			p.applyAxisAngle(axisToRotate, angleToRotate);
			p.add(pt);

			rayCaster.ray.set(p, nmlOpp);
			var ints = rayCaster.intersectObjects([obj]);

			if (ints[0] != undefined) {
				maxDist2PartSelection = Math.max(ints[0].distance, maxDist2PartSelection);
			}
		}

		maxDist2PartSelection += 1;


		//
		//	2. create a normal-orthogonal cylinder
		//
		var cylPartSelection = new xacCylinder(rPartSelection, maxDist2PartSelection);

		var midPt = pt.clone().add(nml.clone().multiplyScalar(distAbove - maxDist2PartSelection * 0.5));

		// option 1: set position
		// addALine(cylPartSelection.m.position.clone(), midPt)

		// option 2: do translate on axis
		var vOffset = midPt.clone().sub(cylPartSelection.m.position.clone());
		cylPartSelection.m.translateOnAxis(vOffset.clone().normalize(), vOffset.length());

		cylPartSelection.m.rotateOnAxis(axisToRotate, angleToRotate);
		// scene.add(cylPartSelection.m);

		//
		//	3. intersect it with the object to obtain ctrl area
		//

		// the part where the shadow casting cylinder eats in the object
		var cylPartSelectionIn = xacThing.intersect(cylPartSelection.gt, obj, MATERIALCONTRAST);
		// scene.add(cylPartSelectionIn);

		// the part of the shadow casting cylinder that's outside the object
		var cylPartSelectionOut = xacThing.subtract(cylPartSelection.gt, cylPartSelectionIn.geometry, MATERIALCONTRAST);
		// scene.add(cylPartSelectionOut);

		// let it eat in the object an epsilon to get the minimal intersection
		var vEatIn = pt.clone().sub(cylPartSelection.m.position);
		var dEatIn = 0.01;
		cylPartSelectionOut.translateOnAxis(vEatIn.clone().normalize(), dEatIn);

		// get the geometric representation of the shadow
		this._part = xacThing.intersect(obj, getTransformedGeometry(cylPartSelectionOut), MATERIALCONTRAST);
		// eat out a little for better display
		this._part.translateOnAxis(vEatIn.clone().normalize().multiplyScalar(-1), 2 * dEatIn);
		scene.add(this._part);

		// scene.remove(cylPartSelection.m);

		// remove original objects for better visibility
		// scene.remove(obj);


		//
		//	4. removing excessive faces
		//
		var clrTrans = new THREE.Color("#ff0000");
		var facesToRemove = [];
		for (var i = this._part.geometry.faces.length - 1; i >= 0; i--) {
			var f = this._part.geometry.faces[i];
			var bendAngle = size == this.FINGER ? Math.PI / 4 : Math.PI / 2;
			if (f.normal.angleTo(nml) > bendAngle) {
				facesToRemove.push(f);
			}
		}

		for (var i = facesToRemove.length - 1; i >= 0; i--) {
			removeFromArray(this._part.geometry.faces, facesToRemove[i]);
		}
	}

	/*
		wrapping an object by drawing a stroke on it
	*/
	wrap(obj, pt, size, done) {
		if (done) {
			// removeBalls();

			//
			//	1. find points surrounding the cross section
			//
			var ptsWrap = []; // points sampled to rep the wrap
			var maxDistAbove = 0; // max signed distances to the cross section
			var maxDistBelow = 0;

			// bounding box of the stroke
			var min = new THREE.Vector3(INFINITY, INFINITY, INFINITY);
			var max = new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY);


			log(this._strokePoints.length);

			for (var i = 0; i < this._strokePoints.length; i++) {
				var p = this._strokePoints[i];

				min.x = Math.min(min.x, p.x);
				min.y = Math.min(min.y, p.y);
				min.z = Math.min(min.z, p.z);

				max.x = Math.max(max.x, p.x);
				max.y = Math.max(max.y, p.y);
				max.z = Math.max(max.z, p.z);
			}

			var scale = min.distanceTo(max);
			var ctr = new THREE.Vector3().addVectors(min, max).divideScalar(2);

			// calculate intersection plane
			var planeParams = findPlaneToFitPoints(this._strokePoints);
			var a = planeParams.A;
			var b = planeParams.B;
			var c = planeParams.C;
			var d = planeParams.D;

			// find intersecting triangles
			// ref: http://mathworld.wolfram.com/Point-PlaneDistance.html
			var obj = this._obj;
			for (var i = 0; i < obj.geometry.faces.length; i++) {
				var f = obj.geometry.faces[i];

				var indices = [f.a, f.b, f.c];
				var vertices = [];
				var faceInRange = true;
				for (var j = 0; j < indices.length; j++) {
					var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
					vertices.push(v);
					var dist = (a * v.x + b * v.y + c * v.z + d) / Math.sqrt(a * a + b * b + c * c);

					/*
						for faces to be included they need to be
							1) close to the cutting plane
							2) close to the firstly selected points
					*/

					if (Math.abs(dist) < size && v.distanceTo(ctr) < 2 * scale) {
						ptsWrap.push(v);
						maxDistAbove = Math.max(maxDistAbove, dist);
						maxDistBelow = Math.min(maxDistBelow, dist);
					}
				}
			}

			//
			//	2. find a wrapping cylinder
			//
			var ctrWrap = getCenter(ptsWrap);
			var nmlWrap = new THREE.Vector3(a, b, c);
			nmlWrap.normalize();

			var rWrap = 0;
			var ctrWrapProj = getProjection(ctrWrap, a, b, c, d);
			for (var i = ptsWrap.length - 1; i >= 0; i--) {
				var ptProj = getProjection(ptsWrap[i], a, b, c, d);
				rWrap = Math.max(rWrap, ptProj.distanceTo(ctrWrapProj));
			}

			this.cylWrap = new xacCylinder(rWrap, maxDistAbove - maxDistBelow, MATERIALCONTRAST);
			rotateObjTo(this.cylWrap.m, nmlWrap);
			this.cylWrap.m.position = ctrWrap.clone();


			//
			//	3. make wraps
			//
			var gtCylWrap = getTransformedGeometry(this.cylWrap.m);
			this.wrapIn = xacThing.intersect(gtCylWrap, obj, this._part == undefined ? MATERIALCONTRAST : this._part.material);

			if (this._part != undefined) //{
				scene.remove(this._part);
			// this._part = xacThing.union(getTransformedGeometry(this._part), getTransformedGeometry(this.wrapIn), this._part.material);
			// } else {
			this._part = this.wrapIn;
			// }

			var factorInflate = 1.1;
			scaleAroundCenter(this._part, factorInflate);

			// if (contains(scene.children, this._part) == false)
			scene.add(this._part);


			//
			//	4. remove unused faces
			//
			var facesToRemove = [];
			var graspAngle = Math.PI * 0.45;
			this._part.material.needsUpdate = true;
			for (var i = this._part.geometry.faces.length - 1; i >= 0; i--) {
				var f = this._part.geometry.faces[i];
				if (Math.abs(Math.PI / 2 - f.normal.angleTo(nmlWrap)) > graspAngle) {
					facesToRemove.push(f);
				}
			}
			this._part.geometry.colorsNeedUpdate = true;

			for (var i = facesToRemove.length - 1; i >= 0; i--) {
				removeFromArray(this._part.geometry.faces, facesToRemove[i]);
			}

			// scene.remove(obj)

			this.isWrapping = false;

		} else {
			this._obj = obj;
			addABall(pt, colorHighlight, 0.5);
			this._strokePoints.push(pt);
		}
	}
}