"use strict";

class xacAdaptation {
	constructor(pc) {
		this._pc = pc;
		this._a = undefined; // adaptation mesh
	}
}

class xacEnlargement extends xacAdaptation {
	constructor(pc) {
		super(pc);

		// stud values
		this.amnt = 10;
		this.factor = 2;

		// preprocess aoc - find center, normal

		for (var pid in pc.parts) {
			// log(pc.parts[pid]);
			this._extrude(pc.parts[pid], this.amnt, this.factor);
		}
	}

	_extrude(aoc, amnt, factor) {
		// remove the previous extruded enlargement
		if (this._a != undefined) {
			scene.remove(this._a);
		}

		// copy, scale & raise the aoc
		var laoc = aoc.clone();
		laoc.scale.set(factor, factor, factor);
		scene.add(laoc);
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

				var wf1 = new THREE.Face3(m, m+3, m+2);
				wf1.normal = computeFaceNormal(geoWall.vertices[wf1.a], geoWall.vertices[wf1.b], geoWall.vertices[wf1.c]);
				geoWall.faces.push(wf1);

				var wf2 = new THREE.Face3(m, m+1, m+3);
				wf2.normal = computeFaceNormal(geoWall.vertices[wf2.a], geoWall.vertices[wf2.b], geoWall.vertices[wf2.c]);
				geoWall.faces.push(wf2);
			}
		}

		log(geoWall)
		// geoWall.computeFaceNormals();
		// geoWall.computeVertexNormals();

		var wall = new THREE.Mesh(geoWall, MATERIALHIGHLIGHT.clone());
		scene.add(wall);
	}
}