var gBalls = [];
var gObjectDelay; // loaded from file

/*
	routines for time stamping
*/
var ts = new Date().getTime();

function now() {
	return new Date().getTime();
}

function timeStamp() {
	var now = new Date().getTime();
	var elapsed = now - ts;
	ts = now;
	return elapsed;
}

function timeElapsed(t) {
	var now = new Date().getTime();
	return now - t;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function log(msg) {
	console.log(msg);
}

function getMax(values) {
	var theMax = -Infinity;
	for (var i = values.length - 1; i >= 0; i--) {
		theMax = Math.max(theMax, values[i]);
	}
	return theMax;
}

function contains(array, elm) {
	if (array instanceof Array) {
		for (var i = 0; i < array.length; i++) {
			if (array[i] === elm) {
				return true;
			}
		}
	}
	return false;
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
	controls.target = new THREE.Vector3(0, 0, 0);
	// camera.position.y = 0;

	// specifying accessible area
	gAccessSel.push(new BboxResizer(object));

	// store the object
	objects.push(object);

}


function loadStlFromFile(objPath, material) {
	var stlLoader = new THREE.STLLoader();
	stlLoader.load(objPath, function(geometry) {
		THREE.GeometryUtils.center(geometry);
		gObjectDelay = new THREE.Mesh(geometry, material.clone());
	});
}

// function showBoundingBox(obj) {
// 	var bbox = new THREE.BoundingBoxHelper(obj, 0x00ff00);
// 	bbox.update();
// 	scene.add(bbox);
// }

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

function addAVector(v1, dir, clr, len) {
	// BEFORE: simplistic version
	// var v2 = v1.clone().add(dir.clone().normalize().multiplyScalar(1000));
	// return addALine(v1, v2, clr);

	// NOW: make an arrow
	var rArrow = 1;
	var lArrow = len == undefined ? 100 : len;
	var bodyArrow = new xacCylinder(rArrow, lArrow, MATERIALFOCUS).m;

	var rArrowHead = rArrow * 5;
	var headArrow = new xacCylinder([0, rArrowHead], rArrowHead * 2, MATERIALFOCUS).m;
	headArrow.position.add(new THREE.Vector3(0, 1, 0).multiplyScalar(lArrow * 0.5 + rArrowHead));

	var arrow = new THREE.Object3D();
	arrow.add(bodyArrow);
	arrow.add(headArrow);

	rotateObjTo(arrow, dir.clone().normalize());
	arrow.position.copy(v1.clone().add(dir.clone().normalize().multiplyScalar(lArrow * 0.5)));

	scene.add(arrow);
	return arrow;
}

function addAPlane(a, b, c, d) {
	var v1 = new THREE.Vector3(-d / a, 0, 0);
	var v2 = new THREE.Vector3(0, -b / d, 0);
	var v3 = new THREE.Vector3(0, 0, -c / d);
	addATriangle(v1, v2, v3, 0x0ff00f);
}

function addATriangle(v1, v2, v3, clr) {
	var vs = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z];
	var fs = new THREE.Face3(0, 1, 2);

	var geometry = new THREE.Geometry(); //PolyhedronGeometry(vs, fs, 1, 1);
	geometry.vertices.push(v1);
	geometry.vertices.push(v2);
	geometry.vertices.push(v3);
	geometry.faces.push(new THREE.Face3(0, 1, 2));
	var material = new THREE.MeshBasicMaterial({
		color: clr,
		transparent: true,
		opacity: 0.5
	});
	var tri = new THREE.Mesh(geometry, material);
	tri.material.side = THREE.DoubleSide;

	scene.add(tri);

	return tri;
}

/*
	remove all the gBalls
*/
function removeBalls() {
	for (var i = gBalls.length - 1; i >= 0; i--) {
		scene.remove(gBalls[i]);
	}
}

/*
	show a ui element
*/
function showElm(elm, actionUponShow) {
	if (elm.is(":visible") == false) {
		elm.show('slow');
		try {
			actionUponShow();
		} catch (e) {

		}
	}
}

/*
	hide a ui element
*/
function hideElm(elm) {
	if (elm.is(":visible") == true) {
		elm.hide();
	}
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

/*
	pts is an array of THREE.Vector3
*/
function getCenter(pts) {
	var ctr = new THREE.Vector3(0, 0, 0);
	for (var i = pts.length - 1; i >= 0; i--) {
		ctr.x += pts[i].x;
		ctr.y += pts[i].y;
		ctr.z += pts[i].z;
	}

	if (pts.length > 0) ctr.multiplyScalar(1.0 / pts.length);

	return ctr;
}

/*
	get parameter values from url
*/
function gup(name, url) {
	if (!url) url = location.href;
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	return results == null ? null : results[1];
}

/*
	float to int conversion
*/
function float2int(value) {
	return value | 0;
}