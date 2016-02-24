"use strict";

/*
	a visualization that shows where the user selects on an object as control point/area
*/
class SelectionShadow extends xacShape {
	constructor() {
		super();
		this.FINGER = 0;
		this.PALM = 1;
	}

	cast(obj, pt, nml, type) {
		// addABall(pt);

		//
		//	1. sample a set of 'finger points'
		//
		nml = nml.normalize();
		var nmlOpp = nml.clone().multiplyScalar(-1);

		var rShadow = type == this.FINGER ? 15 : 100;
		var distAbove = rShadow * 2; // hyperthetical dist between finger(s) and the ctrl point

		var yUp = new THREE.Vector3(0, 1, 0);
		var angleToRotate = yUp.angleTo(nml);
		var axisToRotate = new THREE.Vector3().crossVectors(yUp, nml).normalize();

		// find the max distance to cast the shadow
		var ctrlPts = [];
		var tess = 32;
		var rayCaster = new THREE.Raycaster();
		var maxDist2Shadow = -1;
		for (var i = 0; i < tess; i++) {
			var x = rShadow * Math.sin(i * 2 * Math.PI / tess);
			var z = rShadow * Math.cos(i * 2 * Math.PI / tess);
			var p = new THREE.Vector3(x, distAbove, z);
			p.applyAxisAngle(axisToRotate, angleToRotate);
			p.add(pt);

			rayCaster.ray.set(p, nmlOpp);
			var ints = rayCaster.intersectObjects([obj]);

			if (ints[0] != undefined) {
				maxDist2Shadow = Math.max(ints[0].distance, maxDist2Shadow);
			}
		}

		maxDist2Shadow += 1;


		//
		//	2. create a normal-orthogonal cylinder
		//

		var cylShadow = new xacCylinder(rShadow, maxDist2Shadow, false, false);

		var midPt = pt.clone().add(nml.clone().multiplyScalar(distAbove - maxDist2Shadow * 0.5));

		// option 1: set position
		// addALine(cylShadow.m.position.clone(), midPt)

		// option 2: do translate on axis
		var vOffset = midPt.clone().sub(cylShadow.m.position.clone());
		cylShadow.m.translateOnAxis(vOffset.clone().normalize(), vOffset.length());

		cylShadow.m.rotateOnAxis(axisToRotate, angleToRotate);
		// scene.add(cylShadow.m);

		//
		//	3. intersect it with the object to obtain ctrl area
		//

		// the part where the shadow casting cylinder eats in the object
		var cylShadowIn = xacShape.intersect(cylShadow.gt, obj, MATERIALOVERLAY);
		// scene.add(cylShadowIn);
		
		// the part of the shadow casting cylinder that's outside the object
		var cylShadowOut = xacShape.subtract(cylShadow.gt, cylShadowIn.geometry, MATERIALOVERLAY);
		// scene.add(cylShadowOut);

		// let it eat in the object an epsilon to get the minimal intersection
		var vEatIn = pt.clone().sub(cylShadow.m.position);
		var dEatIn = 0.01;
		cylShadowOut.translateOnAxis(vEatIn.clone().normalize(), dEatIn);

		// get the geometric representation of the shadow
		this._shadow = xacShape.intersect(obj, getTransformedGeometry(cylShadowOut), MATERIALOVERLAY);
		// eat out a little for better display
		this._shadow.translateOnAxis(vEatIn.clone().normalize().multiplyScalar(-1), 2 * dEatIn);
		scene.add(this._shadow);

		// scene.remove(cylShadow.m);

		// remove original objects for better visibility
		// scene.remove(obj);


		//
		//	4. removing excessive faces
		//

		this._shadow.material.needsUpdate = true;
		// var clrTrans = new THREE.Color("rgba(255, 255, 0, 0)");
		var clrTrans = new THREE.Color("#ff0000");
		// clrTrans.setStyle("rgba(255, 255, 0, 0)");
		var facesToRemove = [];
		for (var i = this._shadow.geometry.faces.length - 1; i >= 0; i--) {
			var f = this._shadow.geometry.faces[i];
			// for (var j = 0; j < 3; j++) {
				if (f.normal.angleTo(nml) > Math.PI / 4) {
					// f.vertexColors[j] = new THREE.Color(colorNormal);
					facesToRemove.push(f);
				} else {
					// f.vertexColors[j] = new THREE.Color(colorContrast);
				}
			// }
		}
		// this._shadow.geometry.colorsNeedUpdate = true;

		// for (var i = facesToRemove.length - 1; i >= 0; i--) {
		// 	removeFromArray(this._shadow.geometry.faces, facesToRemove[i]);
		// }
		
	}
}

var balls = [];

/*
	load models from stl binary/ascii data
*/
function loadStl(data) {
	var geometry = stlLoader.parse(data);
	var object = new THREE.Mesh(geometry, MATERIALNORMAL);
	scene.add(object);

	objects.push(object);

	// TODO package non-regular objects
	// gItems.push(object);
}

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

/*
	get the geometry from a mesh with transformation matrix applied
*/
function getTransformedGeometry(mesh) {
	mesh.updateMatrixWorld();
	var gt = mesh.geometry.clone();
	gt.applyMatrix(mesh.matrixWorld);
	return gt;
}

function removeFromArray(arr, elm) {
	var idx = arr.indexOf(elm);
	arr.splice(idx, 1);
}