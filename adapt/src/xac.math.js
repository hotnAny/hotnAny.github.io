/*
	based on numeric.js
*/


/*
	assuming @param points is THREE.Vector3, or something that has x, y, z components
	ref: http://stackoverflow.com/questions/10900141/fast-plane-fitting-to-many-points
	svd related: http://www.mathworks.com/help/matlab/ref/svd.html
*/
function findPlaneToFitPoints(points) {
	// package the points into a matrix
	var G = [];

	for (var i = 0; i < points.length; i++) {
		G.push([points[i].x, points[i].y, points[i].z, 1]);
	}

	// console.log(G);
	var usv = numeric.svd(G);

	var a = usv.V[0][3];
	var b = usv.V[1][3];
	var c = usv.V[2][3];
	var d = usv.V[3][3];

	return {
		A: a,
		B: b,
		C: c,
		D: d
	};
}


function project(points, axis) {
	var min = 1000;
	var max = -1000;

	for (var i = 0; i < points.length; i++) {
		var val = axis.dot(points[i]);
		min = Math.min(min, val);
		max = Math.max(val, max);
	}

	return [min, max];
}


function getPlaneFromPointVectors(pt, v1, v2) {
	var cp = new THREE.Vector3().crossVectors(v1, v2);

	var a = cp.x;
	var b = cp.y;
	var c = cp.z;
	var d = -a * pt.x - b * pt.y - c * pt.z;

	return {
		A: a,
		B: b,
		C: c,
		D: d
	};
}


/*
	get the projection coordinates of a point on a given plane parameterized by ax+by+cz+d=0
*/
function getProjection(v, a, b, c, d) {
	var t = -(a * v.x + b * v.y + c * v.z + d) / (a * a + b * b + c * c);
	return new THREE.Vector3(v.x + a * t, v.y + b * t, v.z + c * t);
}