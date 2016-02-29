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

	for(var i=0; i<points.length; i++) {
		G.push([points[i].x, points[i].y, points[i].z, 1]);
	}

	// console.log(G);
	var usv = numeric.svd(G);

	var a = usv.V[0][3];
	var b = usv.V[1][3];
	var c = usv.V[2][3];
	var d = usv.V[3][3];

	return {A:a, B:b, C:c, D:d};
}


function project(points, axis) {
	var min = 1000;
	var max = -1000;

	for(var i=0; i<points.length; i++) {
		var val = axis.dot(points[i]);
		min = Math.min(min, val);
		max = Math.max(val, max);
	}

	return [min, max];
}


function getPlaneFromThreePoints(p0, p1, p2) {
	var A = [	[p0.x, p0.y, p0.z, 1],
				[p1.x, p1.y, p1.z, 1],
				[p2.x, p2.y, p2.z, 1]
			];
	// var D = numeric.mul(numeric.identity(), -)
	var b = [0, 0, 0, 0];
	var LUP = numeric.ccsLUP(A);
	var p = numeric.ccsLUPSolve(LUP, b);
	console.log(p);
}


/*
	get the projection coordinates of a point on a given plane parameterized by ax+by+cz+d=0
*/
function getProjection(v, a, b, c, d) {
	var t = -(a*v.x + b*v.y + c*v.z + d) / (a*a + b*b + c*c);
	return new THREE.Vector3(v.x + a*t, v.y + b*t, v.z + c*t);
}