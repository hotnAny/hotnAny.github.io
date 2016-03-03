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

		// TODO: rehink how to compute this parameter
		this.HAND = 150;

		this._obj = undefined;

		this.isEngaged = false;
		this.MINWRAPMOUSEOFFSET = 5;
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
	press(obj, pt, nml, size) {
		this.clear();
		this._obj = obj;

		//
		//	1. sample a set of 'finger points'
		//
		nml = nml.normalize();
		var nmlOpp = nml.clone().multiplyScalar(-1);

		var rPartSelection = this.HAND;
		var distAbove = this.HAND * 2; // hyperthetical dist between finger(s) and the ctrl point

		var yUp = new THREE.Vector3(0, 1, 0);
		var angleToRotate = yUp.angleTo(nml);
		var axisToRotate = new THREE.Vector3().crossVectors(yUp, nml).normalize();

		// find the max distance to press the shadow
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
		var cylPartSelection = new xacCylinder(rPartSelection, maxDist2PartSelection + 1);

		var midPt = pt.clone().add(nml.clone().multiplyScalar(distAbove - maxDist2PartSelection * 0.5));

		var vOffset = midPt.clone().sub(cylPartSelection.m.position.clone());
		cylPartSelection.m.translateOnAxis(vOffset.clone().normalize(), vOffset.length());
		cylPartSelection.m.rotateOnAxis(axisToRotate, angleToRotate);
		// scene.add(cylPartSelection.m);

		//
		//	3. intersect it with the object to obtain ctrl area
		//
		var vEatIn = pt.clone().sub(midPt).normalize();
		var dEatIn = 5;
		var cylEatIn = cylPartSelection.m.clone();
		cylEatIn.position.copy(cylEatIn.position.clone().add(vEatIn.multiplyScalar(dEatIn)));
		var cylPartSelectionIn = xacThing.intersect(getTransformedGeometry(cylEatIn), obj, MATERIALCONTRAST);

		var cylPartSelectionOut = xacThing.subtract(cylPartSelection.gt, cylPartSelectionIn.geometry, MATERIALCONTRAST);
		// scene.add(cylPartSelectionOut);

		// get the geometric representation of the shadow
		this._part = cylPartSelectionIn;

		// eat out a little for better display
		this._part.translateOnAxis(vEatIn.clone().normalize().multiplyScalar(-1), 1);
		scene.add(this._part);
		
		//
		//	5. wrap up
		//
		this._part.type = 'press';
		this._part.normal = nml;
		this._part.center = pt;
		this._part.cylCenter = cylPartSelection.m.position;
		this._part.cylHeight = maxDist2PartSelection;
		this._part.selCyl = cylPartSelectionOut;//xacThing.intersect(cylPartSelection.gt, obj, MATERIALCONTRAST);
	}

	/*
		wrapping an object by drawing a stroke on it
	*/
	wrap(obj, pt, size, done) {
		if (done) {
			//
			//	1. find points surrounding the cross section
			//
			var ptsWrap = []; // points sampled to rep the wrap
			var maxDistAbove = 0; // max signed distances to the cross section
			var maxDistBelow = 0;

			// bounding box of the stroke
			var min = new THREE.Vector3(INFINITY, INFINITY, INFINITY);
			var max = new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY);

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

			// this.cylWrap = new xacCylinder(rWrap, maxDistAbove - maxDistBelow, MATERIALCONTRAST);
			this.cylWrap = new xacCylinder(rWrap, this.HAND, MATERIALCONTRAST);
			rotateObjTo(this.cylWrap.m, nmlWrap);
			this.cylWrap.m.position.copy(ctrWrap.clone());

			// flash a cylinder to show selection volume
			scene.add(this.cylWrap.m);
			setTimeout(function(m) {
				scene.remove(m);
			}, 1000, this.cylWrap.m);

			//
			//	3. make wraps
			//
			var gtCylWrap = getTransformedGeometry(this.cylWrap.m);
			this.wrapIn = xacThing.intersect(gtCylWrap, obj, this._part == undefined ? MATERIALCONTRAST : this._part.material);

			if (this._part != undefined)
				scene.remove(this._part);
			this._part = this.wrapIn;

			var factorInflate = 1.1;
			scaleAroundCenter(this._part, factorInflate);

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

			this._part.center = getCenter(this._part.geometry.vertices);
			this._part.normal = nmlWrap;

			// scene.remove(obj);

			//
			//	5. finishing up
			//
			this._part.type = 'wrap';
			this._part.ctrSel = getProjection(ctrWrap, a, b, c, d);
			this.isWrapping = false;

		} else {
			this._obj = obj;
			addABall(pt, colorHighlight, 0.5);
			this._strokePoints.push(pt);
		}
	}
}