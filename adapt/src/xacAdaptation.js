"use strict";

class xacAdaptation {
	constructor(pc) {
		this._pc = pc;
		this._as = new Array(); // adaptation mesh
		// a factor that will dampen the growth of the adaptation
		// TODO: make this programmatic
		this._sizeFactor = 1.25;
		this._gripFactor = 2;
		// this._bboxFactor = 1.25;
	}

	update(params) {
		this._update(params);
	}
}

class xacEnlargement extends xacAdaptation {
	constructor(pc, params) {
		super(pc);

		// these parameters the optimize function will manipulate
		// TODO: rehink how to compute this parameter
		this.amnt = 5;

		this._pc = pc;
		this._update = function(params) {
			if (params != undefined) {
				this._sizeFactor = params.sizeFactor == undefined ? this._sizeFactor : params.sizeFactor;
				this._gripFactor = params.gripFactor == undefined ? this._gripFactor : params.gripFactor;
			}

			for (var pid in this._pc.parts) {
				if (this._as[pid] != undefined) {
					scene.remove(this._as[pid]);
				}

				if (this._pc.parts[pid] != undefined) {
					scene.remove(this._pc.parts[pid]);
				}

				var a = this._extrude(this._pc.parts[pid], this.amnt, this._sizeFactor, this._gripFactor);
				this._as[pid] = a;
				scene.add(this._as[pid]);
			}
		}

		this._update();
	}

	_extrude(part, amnt, sizeFactor, gripFactor) {
		// select a subset of aoc
		var r0 = 15; // temp: finger size
		var r = gripFactor * r0;

		// TODO: check if need to get transformed geometry
		var ctrPart = getCenter(part.geometry.vertices);

		// bounding cylinder
		var cylinderSel = new xacCylinder(100, r, MATERIALCONTRAST);
		rotateObjTo(cylinderSel.m, part.normal);
		cylinderSel.m.position.copy(ctrPart.clone());
		// scene.add(cylinderSel.m);

		// select which bounding geometry to use
		var spaceSel = cylinderSel.m;
		scene.add(spaceSel);

		var aoc = xacThing.intersect(getTransformedGeometry(part), getTransformedGeometry(spaceSel), part.material);
		scene.add(aoc);

		var laoc = aoc.clone();
		scaleAroundVector(laoc, sizeFactor, part.normal);
		
		if (D) addALine(ctrPart, ctrPart.clone().add(part.normal.clone().multiplyScalar(100)));

		// stich the wall
		var geoWall = new THREE.Geometry();
		var geoAoc = getTransformedGeometry(aoc);
		var geoLaoc = getTransformedGeometry(laoc);
		for (var i = geoAoc.faces.length - 1; i >= 0; i--) {
			var f = geoAoc.faces[i];
			var lf = geoLaoc.faces[i];

			var vs = [f.a, f.b, f.c];
			for (var j = 0; j < 3; j++) {
				var n = vs[j];
				var np = vs[(j + 1) % vs.length];

				var m = geoWall.vertices.length;
				geoWall.vertices.push(
					geoAoc.vertices[n].clone(),
					geoAoc.vertices[np].clone(),

					geoLaoc.vertices[n].clone(),
					geoLaoc.vertices[np].clone()
				);

				var wf1 = new THREE.Face3(m, m + 3, m + 2);
				wf1.normal = computeFaceNormal(geoWall.vertices[wf1.a], geoWall.vertices[wf1.b], geoWall.vertices[wf1.c]);
				geoWall.faces.push(wf1);

				var wf2 = new THREE.Face3(m, m + 1, m + 3);
				wf2.normal = computeFaceNormal(geoWall.vertices[wf2.a], geoWall.vertices[wf2.b], geoWall.vertices[wf2.c]);
				geoWall.faces.push(wf2);
			}
		}

		if (this._wall != undefined) scene.remove(this._wall);
		var wall = new THREE.Mesh(geoWall, MATERIALHIGHLIGHT.clone());
		var a = mergeObjs([aoc, laoc]);

		scene.remove(aoc);
		scene.remove(spaceSel);
		return laoc;
	}

	scaleMap(a, factor) {
		return a * factor + 1;
	}

	optimize(params) {
		if (params.grip == true) {

		}

		if (params.strength == true) {

		}

		if (parames.coordination == true) {

		}

		this._sizeFactor = params.sizeFactor;

		this._extrude
	}
}