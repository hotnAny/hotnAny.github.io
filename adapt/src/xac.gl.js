// function findBoundaryEdges(obj, action) {
// 	for (var i = obj.geometry.faces.length - 1; i >= 0; i--) {
// 		var f = obj.geometry.faces[i];
// 		var vidx = [f.a, f.b, f.c];
// 		for (var j = vidx.length - 1; j >= 0; j--) {
// 			var v = obj.geometry.vertices[vidx[j]];
// 			var vNext = obj.geometry.vertices[vidx[(j + 1) % vidx.length]];

// 			if(v.isOnBoundary == undefined && vNext.isOnBoundary == u markSameEdgeVertices(obj, vidx[j], vidx[(j + 1) % vidx.length]) == true) {
// 				v.isOnBoundary = false;
// 				vNext.isOnBoundary = false;
// 			}

// 		}
// 		// if(m)
// 	}
// }

// // helper functions
// function markSameEdgeVertices(obj, idx1, idx2) {
// 	var v1 = obj.geometry.vertices[idx1];
// 	var v2 = obj.geometry.vertices[idx2];

// 	if(v1.nextTos == undefined) v1.nextTos = new Array();
// 	if(v1.nextTos[v2] != undefined) {
// 		return true;
// 	} else {
// 		v1.nextTos[v2] = true;
// 	}

// 	if(v2.nextTos == undefined) v2.nextTos = new Array();
// 	if(v2.nextTos[v1] != undefined) {
// 		return true;
// 	} else {
// 		v2.nextTos[v1] = true;
// 	}

// 	return false;
// }

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