/*
	merge a list of THREE.Mesh
*/
function mergeObjs(objs) {
	if (objs.length == 0) return undefined;

	// the openjscad approach
	// var mm = objs[objs.length - 1];
	// for (var i = objs.length - 1; i > 0; i--) {
	// 	mm = xacThing.union(getTransformedGeometry(mm), getTransformedGeometry(objs[i]), mm.material);
	// }

	// the three js approach
	var mo = new THREE.Geometry();
	// var mm = objs[objs.length - 1];
	for (var i = objs.length - 1; i > 0; i--) {
		// mm = xacThing.union(getTransformedGeometry(mm), getTransformedGeometry(objs[i]), mm.material);
		// var vs = mo.geometry.vertices;
		var gtObj = getTransformedGeometry(objs[i]);
		var objFs = gtObj.faces;
		var fs = [];
		var n = mo.vertices.length;

		for (var j = 0; j < objFs.length; j++) {
			fs.push(objFs[j]);
			fs[j].a += n;
			fs[j].b += n;
			fs[j].c += n;
		}

		mo.vertices = mo.vertices.concat(gtObj.vertices);
		mo.faces = mo.faces.concat(objFs);

	}

	var material = objs[0].material.clone();
	material.side = THREE.DoubleSide;
	var mm = new THREE.Mesh(mo, material);

	return mm;
}

/*
	scale an object around its center by factor
*/
function scaleAroundCenter(obj, factor) {
	// find true center point
	var ctr0 = getCenter(getTransformedGeometry(obj).vertices);

	// naive scaling
	if (factor.length == 3) {
		obj.scale.set(factor[0], factor[1], factor[2]);
	} else {
		obj.scale.set(factor, factor, factor);
	}

	// re-position
	var ctr1 = getCenter(getTransformedGeometry(obj).vertices, factor);
	obj.position.add(ctr0.clone().sub(ctr1));
}

/*
	scale an object along the plane ┴ to dir
*/
function scaleAroundVector(obj, factor, dir) {
	scaleWithVector(obj, [factor, 1, factor], dir);
}

/*
	scale an object/geometry/vector along dir
*/
function scaleAlongVector(obj, factor, dir) {
	scaleWithVector(obj, [1, factor, 1], dir);
}

// TODO: clean up unused methods

/*
	this method is implemented based on geometry rather than mesh
*/
function scaleWithVector(obj, factors, dir) {
	var ctr0 = obj.geometry.center();
	rotateGeoTo(obj.geometry, dir, true);

	var m = new THREE.Matrix4();
	m.makeScale(factors[0], factors[1], factors[2]);
	obj.geometry.applyMatrix(m);

	rotateGeoTo(obj.geometry, dir);

	var ctr1 = obj.geometry.center();
	var offset = ctr1.clone().sub(ctr0);
	obj.geometry.translate(offset.x, offset.y, offset.z);
}

function rotateObjTo(obj, dir, isReversed) {
	var yUp = new THREE.Vector3(0, 1, 0);
	var angleToRotate = yUp.angleTo(dir);
	var axisToRotate = new THREE.Vector3().crossVectors(yUp, dir).normalize();
	obj.rotateOnAxis(axisToRotate, isReversed == true ? angleToRotate * -1 : angleToRotate);
}

function rotateGeoTo(geo, dir, isReversed) {
	var mr = new THREE.Matrix4();
	var yUp = new THREE.Vector3(0, 1, 0);
	var angleToRotate = yUp.angleTo(dir);
	var axisToRotate = new THREE.Vector3().crossVectors(yUp, dir).normalize();
	mr.makeRotationAxis(axisToRotate, isReversed == true ? angleToRotate * -1 : angleToRotate);
	geo.applyMatrix(mr);
}

function rotateVectorTo(v, dir) {
	var yUp = new THREE.Vector3(0, 1, 0);
	var angleToRotate = yUp.angleTo(dir);
	var axisToRotate = new THREE.Vector3().crossVectors(yUp, dir).normalize();
	v.applyAxisAngle(axisToRotate, angleToRotate);
}

function tessellate(obj, minArea) {

}

function computeFaceArea(obj) {
	var g = getTransformedGeometry(obj);
	for (var i = g.faces.length - 1; i >= 0; i--) {
		var f = g.faces[i];
		// log(f.vertexNormals);
		var va = g.vertices[f.a];
		var vb = g.vertices[f.b];
		var vc = g.vertices[f.c];
		f.area = triangleArea(va, vb, vc);

		va.normal = f.vertexNormals[0];
		// addALine(va, va.clone().add(va.normal.clone().multiplyScalar(20)));
		vb.normal = f.vertexNormals[1];
		// addALine(vb, vb.clone().add(vb.normal.clone().multiplyScalar(20)));
		vc.normal = f.vertexNormals[2];
		// addALine(vc, vc.clone().add(vc.normal.clone().multiplyScalar(20)));
	}
}

function markVertexNeighbors(obj) {
	removeBalls();

	obj.vneighbors = [];
	var g = getTransformedGeometry(obj);
	var addNeighbors = function(list, idx, idxNeighbors) {
		if (list[idx] == undefined) list[idx] = [];
		for (var i = idxNeighbors.length - 1; i >= 0; i--) {
			list[idx].push(idxNeighbors[i]);
		}
	}

	for (var i = g.faces.length - 1; i >= 0; i--) {
		var f = g.faces[i];
		addNeighbors(obj.vneighbors, f.a, [f.b, f.c]);
		addNeighbors(obj.vneighbors, f.b, [f.c, f.a]);
		addNeighbors(obj.vneighbors, f.c, [f.a, f.b]);
	}

	for (var i = g.vertices.length - 1; i >= 0; i--) {
		addABall(g.vertices[i], 0xffffff, 0.15);
	}

	var idx = getRandomInt(0, obj.vneighbors.length);
	var v = g.vertices[idx];
	addABall(v, 0xff0000, 0.5)
	nudgeNeighbors(obj, g, idx, v, 9);
	vns = obj.vneighbors[idx];

	for (var i = vns.length - 1; i >= 0; i--) {
		var vn = g.vertices[vns[i]];
		addABall(vn, 0x444444, 0.3);
	}
}

function nudgeNeighbors(a, ag, idx, ctr, d) {
	// var v = ag.vertices[idx];
	// if (v.activated != undefined || v.distanceTo(ctr) > d) {
	// 	if(v.distanceTo(ctr) > d)

	// 	return false;
	// }

	// v.activated = false;

	var vneighbors = a.vneighbors[idx];
	for (var i = vneighbors.length - 1; i >= 0; i--) {
		var nidx = vneighbors[i];
		var vn = ag.vertices[nidx];

		if (vn.activated == false) {
			continue;
		}

		if (vn.distanceTo(ctr) < d) {
			vn.activated = false;
			this.nudgeNeighbors(a, ag, nidx, ctr, d);
			addABall(vn, 0x444444, 0.2);
		} else {
			addABall(vn, 0x0000ff, 0.2);
			continue;
		}

	}
}

function computeVertexNormal(obj) {

}

/*
	get the geometry from a mesh with transformation matrix applied
*/
function getTransformedGeometry(mesh) {
	mesh.updateMatrixWorld();
	var gt = mesh.geometry.clone();
	gt.applyMatrix(mesh.matrixWorld);
	return gt;
}

function getTransformedVector(v, mesh) {
	var vt = v.clone();
	vt.applyMatrix4(mesh.matrixWorld);
	return vt;
}

function getBoundingBoxCenter(obj) {
	var g = obj.geometry;
	g.computeBoundingBox();
	var x = 0.5 * (g.boundingBox.max.x + g.boundingBox.min.x);
	var y = 0.5 * (g.boundingBox.max.y + g.boundingBox.min.y);
	var z = 0.5 * (g.boundingBox.max.z + g.boundingBox.min.z);
	return new THREE.Vector3(x, y, z);
}

function getBoundingSphereRadius(obj) {
	var g = obj.geometry;
	g.computeBoundingSphere();
	return g.boundingSphere.radius;
}

// function getAspectRatios(obj) {


// 	var ratios = [1 / (ly * lz), 1 / (lz * lx), 1 / (lx * ly)];
// 	// log(ratios)
// 	var minRatio = ratios[0];
// 	for (var i = ratios.length - 1; i > 0; i--) {
// 		minRatio = Math.min(minRatio, ratios[i]);
// 	}

// 	// TODO denominator zero check
// 	for (var i = ratios.length - 1; i >= 0; i--) {
// 		ratios[i] /= minRatio;
// 	}

// 	return ratios;
// }

function getBoundingBoxDimensions(obj) {
	var g = obj.geometry;
	g.computeBoundingBox();

	var lx = (g.boundingBox.max.x - g.boundingBox.min.x);
	var ly = (g.boundingBox.max.y - g.boundingBox.min.y);
	var lz = (g.boundingBox.max.z - g.boundingBox.min.z);

	return [lx, ly, lz];
}

function getBoundingBoxVolume(obj) {
	var dims = getBoundingBoxDimensions(obj);
	return dims[0] * dims[1] * dims[2];
}

function getEndPointsAlong(obj, dir) {
	var bbox = new THREE.BoundingBoxHelper(obj, 0x00ff00);
	var ctr = getBoundingBoxCenter(obj);
	bbox.update();
	bbox.material.side = THREE.DoubleSide;
	// scene.add(bbox);

	var signs = [1, -1];
	var endPoints = [];
	for (var i = signs.length - 1; i >= 0; i--) {
		var sdir = dir.clone().multiplyScalar(signs[i]).normalize();
		var rayCaster = new THREE.Raycaster();

		rayCaster.ray.set(ctr, sdir);
		// addALine(ctr, ctr.clone().add(sdir.clone().multiplyScalar(100)));

		var ints = rayCaster.intersectObjects([bbox.object]);
		// while(ints.length == 0) {
		// 	var dv = getRandomVector(1.0);
		// 	rayCaster.ray.set(ctr.clone().add(dv), sdir);
		// 	ints = rayCaster.intersectObjects([bbox.object]);
		// }
		// 	log(ints);
		if (ints[0] != undefined) {
			// addABall(ints[0].point, 0xaabbcc);
			endPoints[i] = ints[0].point;
		}
	}

	if (endPoints[0] == undefined && endPoints[1] != undefined) {
		endPoints[0] = ctr.add(ctr.clone().sub(endPoints[1]));
	}

	if (endPoints[1] == undefined && endPoints[0] != undefined) {
		endPoints[1] = ctr.add(ctr.clone().sub(endPoints[0]));
	}

	if (endPoints[0] == undefined && endPoints[1] == undefined) {
		endPoints[0] = new THREE.Vector3(ctr.x, bbox.box.min.y, ctr.z);
		endPoints[1] = new THREE.Vector3(ctr.x, bbox.box.max.y, ctr.z);
	}

	// log(endPoints);
	return endPoints;
}