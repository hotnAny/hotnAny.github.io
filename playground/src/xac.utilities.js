/*------------------------------------------------------------------------------------*
 *
 * useful recurring routines
 * 
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *------------------------------------------------------------------------------------*/

var XAC = XAC || {};

function log(msg) {
	console.log(msg);
}

function err(msg) {
	console.error(msg);
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

	var geometry = new THREE.SphereGeometry(radius, 32, 32);
	var material = new THREE.MeshBasicMaterial({
		color: clr
	});
	var ball = new THREE.Mesh(geometry, material);
	ball.position.set(pt.x, pt.y, pt.z);

	gBalls.push(ball);
	scene.add(ball);

	return ball;
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


function getAvg(values) {
	if (values == undefined) {
		err('[getAvg]: input variable not an array')
		return;
	}

	if (values.length <= 0) {
		err('[getAvg]: input arrays contain no values')
		return;
	}

	var sum = 0;
	for (var i = values.length - 1; i >= 0; i--) {
		if (isNaN(values[i])) {
			err('[getAvg]: input arrays contain not numbers')
			return;
		}
		sum += values[i];
	}

	return sum / values.length;
}

function getMedian(values) {
	if (values == undefined) {
		err('[getAvg]: input variable not an array')
		return;
	}

	if (values.length <= 0) {
		err('[getAvg]: input arrays contain no values')
		return;
	}

	var vals = [];
	for (var i = values.length - 1; i >= 0; i--) {
		if (isNaN(values[i])) {
			err('[getAvg]: input arrays contain not numbers')
			return;
		}
		vals.push(values[i]);
	}

	vals.sort();
	return vals[vals.length / 2];
}

function getMax(values) {
	if (values == undefined) {
		err('[getAvg]: input variable not an array')
		return;
	}

	if (values.length <= 0) {
		err('[getAvg]: input arrays contain no values')
		return;
	}

	var max = Number.MIN_VALUE;
	for (var i = values.length - 1; i >= 0; i--) {
		if (isNaN(values[i])) {
			err('[getAvg]: input arrays contain not numbers')
			return;
		}
		max = Math.max(values[i], max);
	}

	return max;
}

function removeFromArray(array, elm, compFunc) {
	// if (storage != undefined) {
	// 	for (var i = 0; i < gVoxels.length; i++) {
	// 		if (storage[i][0] == voxel.index[0] && storage[i][1] == voxel.index[1] && storage[i][2] == voxel.index[2]) {
	// 			storage = storage.splice(i, 1);
	// 		}
	// 	}
	// }

	var toRemove = [];
	for (var i = array.length - 1; i >= 0; i--) {
		var equal = undefined;
		if (compFunc != undefined) {
			equal = compFunc(elm, array[i]);
		} else {
			equal = elm == array[i];
		}

		if (equal) {
			toRemove.push(i);
		}
	}

	for (var i = toRemove.length - 1; i >= 0; i--) {
		array.splice(toRemove[i], 1);
	}

	return array;
}