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
	// have different scales for the rest of the two axes
	if (Array.isArray(factor)) {
		if (factor.length >= 2) {
			scaleWithVector(obj, [factor[0], 1, factor[1]], dir);
		}
	}
	// have uniform scales for the rest of the axes
	else {
		scaleWithVector(obj, [factor, 1, factor], dir);
	}
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
	// var ctr0 = obj.geometry.center();
	var ctr0 = getTransformedGeometry(obj).center();

	rotateGeoTo(obj.geometry, dir, true);

	var m = new THREE.Matrix4();
	m.makeScale(factors[0], factors[1], factors[2]);
	obj.geometry.applyMatrix(m);

	rotateGeoTo(obj.geometry, dir);

	// var ctr1 = obj.geometry.center();
	var ctr1 = getTransformedGeometry(obj).center();

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

function getBoundingCylinder(obj, dir) {
	var ctr = getBoundingBoxCenter(obj);
	var h = getDimAlong(obj, dir);

	var a = dir.x;
	var b = dir.y;
	var c = dir.z;
	var d = -a * ctr.x - b * ctr.y - c * ctr.z;

	var gt = getTransformedGeometry(obj);
	var r = 0;
	for (var i = gt.vertices.length - 1; i >= 0; i--) {
		var v = getProjection(gt.vertices[i], a, b, c, d);
		r = Math.max(r, v.distanceTo(ctr));
	}

	return {
		radius: r,
		height: h
	};
}

function getBoundingBoxMesh(obj) {
	var params = getBoundingBoxEverything(obj);
	var g = new THREE.BoxGeometry(params.lenx, params.leny, params.lenz);
	var m = MATERIALCONTRAST;
	var bbox = new THREE.Mesh(g, m);
	bbox.position.set(params.ctrx, params.ctry, params.ctrz);
	return bbox;
}

function getBoundingBoxEverything(obj) {
	var gt = getTransformedGeometry(obj);
	gt.computeBoundingBox();
	var cmax = gt.boundingBox.max;
	var cmin = gt.boundingBox.min;
	var lenx = cmax.x - cmin.x;
	var leny = cmax.y - cmin.y;
	var lenz = cmax.z - cmin.z;
	var ctrx = 0.5 * (cmax.x + cmin.x);
	var ctry = 0.5 * (cmax.y + cmin.y);
	var ctrz = 0.5 * (cmax.z + cmin.z);

	return {
		cmax: cmax,
		cmin: cmin,
		lenx: lenx,
		leny: leny,
		lenz: lenz,
		ctrx: ctrx,
		ctry: ctry,
		ctrz: ctrz
	};
}

function getBoundingBoxCenter(obj) {
	var g = obj.geometry;
	g.computeBoundingBox();
	var x = 0.5 * (g.boundingBox.max.x + g.boundingBox.min.x);
	var y = 0.5 * (g.boundingBox.max.y + g.boundingBox.min.y);
	var z = 0.5 * (g.boundingBox.max.z + g.boundingBox.min.z);
	return new THREE.Vector3(x, y, z);
}

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

function getBoundingSphereRadius(obj) {
	var gt = getTransformedGeometry(obj);
	gt.computeBoundingSphere();
	return gt.boundingSphere.radius;
}

function getDimAlong(obj, dir) {
	var gt = getTransformedGeometry(obj);
	var range = project(gt.vertices, dir);
	return range[1] - range[0];
}

function getEndPointsAlong(obj, dir) {
	var ctr = getBoundingBoxCenter(obj);
	var ctrVal = dir.dot(ctr);
	log("ctr: " + ctrVal);
	var gt = getTransformedGeometry(obj);
	var range = project(gt.vertices, dir);

	var endMin = ctr.clone().add(dir.clone().normalize().multiplyScalar(range[0] - ctrVal));
	var endMax = ctr.clone().add(dir.clone().normalize().multiplyScalar(range[1] - ctrVal));

	log(endMin)
	log(endMax)

	return [endMin, endMax];
}

// TODO: possibly rewrite this - don't need raycasting
function getEndPointsAlong2(obj, dir) {
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

function removeDisconnectedComponents(pt, pts, dist) {
	var ctr = getCenter(pts);
	var axis = ctr.clone().sub(pt);
	var midDist = axis.length();
	axis.normalize();
	var minPosDist = Infinity;
	var maxNegDist = -Infinity;


	var toKeep = [];
	for (var i = pts.length - 1; i >= 0; i--) {
		// determine the sign of the dist measure
		var dToPt = (pts[i].clone().sub(pt)).dot(axis);
		var sign = dToPt < midDist ? 1 : -1;

		// measure the abs dist to ctr
		var d = (pts[i].clone().sub(ctr)).dot(axis);
		if (sign > 0) {
			minPosDist = Math.min(Math.abs(d), minPosDist);
			toKeep.push(pts[i]);
		} else {
			maxNegDist = Math.max(-Math.abs(d), maxNegDist);
		}
	}

	// if there is a 'gap', discard the set of far away points
	if (minPosDist - maxNegDist > dist) {
		return toKeep;
	} else {
		return pts;
	}
}