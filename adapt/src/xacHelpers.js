"use strict";

class SelectionSphere extends xacShape {
	constructor() {
		super();
	}

	update(ctr, r) {
		this._ctr = ctr;
		this._r = r;
		this._g = new THREE.SphereGeometry(this._r, 32, 32);
		this._m = new THREE.Mesh(this._g, MATERIALCONTRAST);
		this._m.position = this._ctr;
	}

	show() {
		scene.add(this._m);
	}

	hide() {
		scene.remove(this._m);
	}
}

class SelectionShadow extends xacShape {
	constructor() {
		super();
		this.FINGER = 0;
		this.PALM = 1;
	}

	cast(obj, pt, nml, type) {
		//
		//	1. sample a set of 'finger points'
		//
		// addABall(pt);
		nml = nml.normalize();
		var nmlOpp = nml.clone().multiplyScalar(-1);

		var rShadow = type == this.FINGER ? 10 : 100;
		var distAbove = rShadow * 2; // hyperthetical dist between finger(s) and the ctrl point

		var yUp = new THREE.Vector3(0, 1, 0);
		var angleToRotate = yUp.angleTo(nml);
		var axisToRotate = new THREE.Vector3().crossVectors(yUp, nml).normalize();

		// find the max distance to cast the shadow
		var ctrlPts = [];
		var tess = 32;
		var rayCaster = new THREE.Raycaster();
		var maxDist2Shadow = -1;
		// var midPtMaxDist = undefined;
		for (var i = 0; i < tess; i++) {
			var x = rShadow * Math.sin(i * 2 * Math.PI / tess);
			var z = rShadow * Math.cos(i * 2 * Math.PI / tess);
			var p = new THREE.Vector3(x, distAbove, z);
			p.applyAxisAngle(axisToRotate, angleToRotate);
			p.add(pt);
			// ctrlPts.push(q);
			// addABall(p);

			rayCaster.ray.set(p, nmlOpp);
			var ints = rayCaster.intersectObjects([obj]);

			// log(ints[0]);

			// if (ints[0] != undefined) {
			// 	addABall(ints[0].point, 0xffffff);
			// }

			if (ints[0] != undefined) {
				maxDist2Shadow = Math.max(ints[0].distance, maxDist2Shadow);
				// midPtMaxDist = p.clone().add(ints[0].point).multiplyScalar(0.5);
				// addABall(midPtMaxDist, 0x00ff00);
			}
		}

		maxDist2Shadow += 1;


		//
		//	2. create a normal-orthogonal cylinder
		//
		var cylShadow = new xacCylinder(rShadow, maxDist2Shadow, false, false);
		
		var midPt = pt.clone().add(nml.clone().multiplyScalar(distAbove - maxDist2Shadow * 0.5));
		// cylShadow.m.position.add(midPt);

		// option 1: set position
		// addALine(cylShadow.m.position.clone(), midPt)
		var vOffset = midPt.clone().sub(cylShadow.m.position.clone());
		cylShadow.m.translateOnAxis(vOffset.clone().normalize(), vOffset.length());
		cylShadow.m.rotateOnAxis(axisToRotate, angleToRotate);
		// scene.add(cylShadow.m);
		// update(cylShadow.m);


		//
		//	3. intersect it with the object to obtain ctrl area
		//

		var cylShadowIn = xacShape.intersect(cylShadow.gt, obj, true);
		// scene.add(cylShadowIn);
		var cylShadowOut = xacShape.subtract(cylShadow.gt, cylShadowIn.geometry, true);
		var vEatIn = pt.clone().sub(cylShadow.m.position);
		var dEatIn = 0.1;
		cylShadowOut.translateOnAxis(vEatIn.clone().normalize(), dEatIn);
		// scene.add(cylShadowOut);

		this._shadow = xacShape.intersect(obj, getTransformedGeometry(cylShadowOut), true);
		this._shadow.translateOnAxis(vEatIn.clone().normalize().multiplyScalar(-1), 2 * dEatIn);
		scene.add(this._shadow);

		scene.remove(cylShadow.m);
		// scene.remove(obj);

	}
}

var balls = [];

/*
	add a ball as visualization
*/
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
	addABall(v1);
}

/*
	remove the balls
*/
function removeBalls() {
	for (ball in balls) {
		scene.remove(ball);
	}
}

function log(msg) {
	console.log(msg);
}

function update(mesh) {
	mesh.updateMatrixWorld();
	mesh.geometry.applyMatrix(mesh.matrixWorld);
	mesh.matrix.identity();
}

function getTransformedGeometry(mesh) {
	mesh.updateMatrixWorld();
	var gt = mesh.geometry.clone();
	gt.applyMatrix(mesh.matrixWorld);
	return gt;
}