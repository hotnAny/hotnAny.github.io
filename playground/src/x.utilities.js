/*------------------------------------------------------------------------------------*
 *
 * useful recurring routines
 * 
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *------------------------------------------------------------------------------------*/

function log(msg) {
	console.log(msg);
}

/*
	load models from stl binary/ascii data
*/
function loadStl(data) {
	var stlLoader = new THREE.STLLoader();
	var geometry = stlLoader.parse(data);
	var object = new THREE.Mesh(geometry, MATERIALNORMAL);
	scene.add(object);

	var dims = getBoundingBoxDimensions(object);
	var ctr = getBoundingBoxCenter(object);

	// reposition the ground & grid
	gGround.position.y -= dims[1] * 0.55;

	scene.remove(gGrid);
	gGrid = drawGrid(dims[1] * 0.55);
	scene.add(gGrid);

	// relocate the camera
	var r = Math.max(25, getBoundingSphereRadius(object));
	camera.position.copy(gPosCam.clone().normalize().multiplyScalar(r * 2));

	// re-lookAt for the camera
	gMouseCtrls.target = new THREE.Vector3(0, 0, 0);

	// store the object
	objects.push(object);

}

function addALine(v1, v2, clr) {
	clr = clr == undefined ? 0xff0000 : clr;

	var geometry = new THREE.Geometry();
	geometry.vertices.push(v1);
	geometry.vertices.push(v2);
	var material = new THREE.LineBasicMaterial({
		color: clr
	});
	var line = new THREE.Line(geometry, material);

	scene.add(line);
	// addABall(v1);
	return line;
}

var gBalls = [];
function addABall(pt, clr, radius) {
	clr = clr == undefined ? 0xff0000 : clr;
	radius = radius == undefined ? 1 : radius;

	var geometry = new THREE.SphereGeometry(radius, 10, 10);
	var material = new THREE.MeshBasicMaterial({
		color: clr
	});
	var ball = new THREE.Mesh(geometry, material);
	ball.position.set(pt.x, pt.y, pt.z);

	gBalls.push(ball);
	scene.add(ball);

	return ball;
}

function hitObject(e, objs) {
	var hits = rayCast(e.clientX, e.clientY, objs);
	if (hits.length > 0) {
		return hits[0].object;
	}
	return undefined;
}

function hitPoint(e, objs) {
	var hits = rayCast(e.clientX, e.clientY, objs);
	if(hits.length > 0) {
		return hits[0].point;
	}
}

function float2int(value) {
	return value | 0;
}

/*
	get the euclidean distance between two R^d points
*/
function getDist(p1, p2) {
	var len = Math.min(p1.length, p2.length);
	var d = 0;
	for (var i = len - 1; i >= 0; i--) {
		d += Math.pow(p1[i] - p2[i], 2);
	}

	return Math.sqrt(d);
}