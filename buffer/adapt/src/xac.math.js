/*
	math routines
	
	requiring numeric.js and three.js
*/

/*
	assuming @param points is THREE.Vector3, or something that has x, y, z components
	ref: http://stackoverflow.com/questions/10900141/fast-plane-fitting-to-many-points
	svd related: http://www.mathworks.com/help/matlab/ref/svd.html
*/
function findPlaneToFitPoints(points) {
	var G = [];

	for (var i = 0; i < points.length; i++) {
		G.push([points[i].x, points[i].y, points[i].z, 1]);
	}

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

/*
	project a set of points onto an axis and get the range
*/
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

/*
	get a plance from a point and two vectors
*/
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

/*
	?
*/
function getVerticalOnPlane(v, a, b, c, d) {
	var ux = c * v.y - b * v.z;
	var uy = a * v.z - c * v.x;
	var uz = b * v.x - a * v.y;
	return new THREE.Vector3(ux, uy, uz).normalize();
}

function triangleArea(va, vb, vc) {
	var ab = vb.clone().sub(va);
	var ac = vc.clone().sub(va);

	var x1 = ab.x,
		x2 = ab.y,
		x3 = ab.z,
		y1 = ac.x,
		y2 = ac.y,
		y3 = ac.z;

	return 0.5 * Math.sqrt(
		Math.pow((x2 * y3 - x3 * y2), 2) +
		Math.pow((x3 * y1 - x1 * y3), 2) +
		Math.pow((x1 * y2 - x2 * y1), 2)
	);
}