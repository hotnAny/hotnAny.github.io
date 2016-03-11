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

function toggleOctreeVisibility() {
	// controlPanel.log("showing/hiding octree visibility ...");
	octree.setVisibility(controlPanel.checkbox2.checked);

	for (var i = 0, len = octreesProj.length; i < len; i++) {
		octreesProj[i].setVisibility(controlPanel.checkbox2.checked);
	}
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

// function calCtrMass(obj) {
// 	var ctrMass = new THREE.Vector3(0, 0, 0);
// 	var numVertices = obj.geometry.vertices.length;
// 	for (var i = 0; i < numVertices; i++) {
// 		ctrMass.add(obj.geometry.vertices[i].clone().applyMatrix4(obj.matrixWorld));
// 	}

// 	ctrMass.divideScalar(numVertices);
// 	return ctrMass;
// }

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
	// var upperLeft = object.position.clone().add(new THREE.Vector3(-dims[0] / 2, dims[1] / 2, dims[2] / 2));
	var r = Math.max(25, getBoundingSphereRadius(object));
	camera.position.copy(gPosCam.clone().normalize().multiplyScalar(r * 2));

	// re-lookAt for the camera
	controls.target = new THREE.Vector3(0, 0, 0);
	// camera.position.y = 0;

	// specifying accessible area
	gAccessSel.push(new BboxResizer(object));

	// store the object
	objects.push(object);

	// TODO package non-regular objects
	// gItems.push(object);
}

var objectDelay; // loaded from file
function loadStlFromFile(objPath, material) {
	var stlLoader = new THREE.STLLoader();
	stlLoader.load(objPath, function(geometry) {
		THREE.GeometryUtils.center(geometry);
		objectDelay = new THREE.Mesh(geometry, material.clone());
	});
}

function showBoundingBox(obj) {
	var bbox = new THREE.BoundingBoxHelper(obj, 0x00ff00);
	bbox.update();
	scene.add(bbox);
}

/*
	add a ball as visualization
*/
var balls = [];

function addABall(pt, clr, radius) {
	clr = clr == undefined ? 0xff0000 : clr;
	radius = radius == undefined ? 1 : radius;

	var geometry = new THREE.SphereGeometry(radius, 10, 10);
	var material = new THREE.MeshBasicMaterial({
		color: clr
	});
	var ball = new THREE.Mesh(geometry, material);
	ball.position.set(pt.x, pt.y, pt.z);

	balls.push(ball);
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

function addAVector(v1, dir, clr) {
	var v2 = v1.clone().add(dir.clone().normalize().multiplyScalar(1000));
	return addALine(v1, v2, clr);
}

/*
	remove the balls
*/
function removeBalls() {
	for (var i = balls.length - 1; i >= 0; i--) {
		scene.remove(balls[i]);
	}
}

function getRandom(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomVector(scale) {
	return new THREE.Vector3(getRandom(-scale, scale), getRandom(-scale, scale), getRandom(-scale, scale));
}

function removeFromArray(arr, elm) {
	var idx = arr.indexOf(elm);
	arr.splice(idx, 1);
}

function showElm(elm, actionUponShow) {
	if (elm.is(":visible") == false) {
		elm.show('slow');
		try {
			actionUponShow();
		} catch (e) {

		}
	}
}

function hideElm(elm) {
	if (elm.is(":visible") == true) {
		elm.hide();
	}
}

function computeFaceNormal(u, v, w) {
	var uv = v.clone().sub(u);
	var vw = w.clone().sub(v);
	var nml = new THREE.Vector3().crossVectors(uv, vw);
	return nml;
}

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


function getClosestIntersected() {
	var objInt = undefined;
	var distObj = INFINITY;
	for (var i = intersects.length - 1; i >= 0; i--) {
		if (intersects[i].distance < distObj) {
			distObj = intersects[i].distance;
			objInt = intersects[i];
		}
	}
	return objInt;
}



function gup(name, url) {
	if (!url) url = location.href;
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	return results == null ? null : results[1];
}


function float2int(value) {
	return value | 0;
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