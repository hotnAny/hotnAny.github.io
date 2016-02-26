"use strict";

class xacAdaptation {
	constructor(pc) {
		this._pc = pc;
		this._as = new Array(); // adaptation mesh

		// a factor that will dampen the growth of the adaptation
		this._sizeFactor = 1.25;
		// this._bboxFactor = 1.25;
	}
}

class xacEnlargement extends xacAdaptation {
	constructor(pc) {
		super(pc);

		// these parameters the optimize function will manipulate
		// TODO: rehink how to compute this parameter
		this.amnt = 5;
		// this.factor = 1.5;

		// preprocess aoc - find center, normal
		this._pc = pc;
		for (var pid in this._pc.parts) {
			// log(pc.parts[pid]);
			var a = this._extrude(this._pc.parts[pid], this.amnt, this._sizeFactor);
			scene.add(a);
			this._as[pid] = a;
		}
	}

	_extrude(aoc, amnt, factor) {
		// remove the previous extruded enlargement
		// TODO: merge generated into this._a
		// if (this._a != undefined) {
		// 	scene.remove(this._a);
		// }

		// if (aoc != undefined) {
		// 	this._aoc = aoc;
		// }

		// if(this._aoc == undefined) {
		// 	return;
		// }

		// aoc = this._aoc;
		// copy, scale & raise the aoc
		var laoc = aoc.clone();
		scaleAroundCenter(laoc, factor);

		// if (this._laoc != undefined) {
		// 	scene.remove(this._laoc);
		// }

		// scene.add(laoc);
		// TODO: raise it

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

				// log(geoAoc.vertices[n])

				// triangle 1
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
		// scene.add(wall);


		// this._laoc = laoc;
		// this._wall = wall;
		var a = mergeObjs([aoc, wall, laoc]);

		// scene.remove(aoc);
		// scene.remove(wall);

		return a;
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