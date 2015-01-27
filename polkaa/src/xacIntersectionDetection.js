/* ---------------------------------------------------------------------------------------------------------------------------------------- */
// problem-specific variables
var USINGVERTICES = false;
var balls;
var mutuallyBounded = new Array();
var stopper = 0;


/* ---------------------------------------------------------------------------------------------------------------------------------------- */
// STEP ONE: build the octree
function buildOctree() {
	
	refreshDebugView();
	buildThisOctree(octree);
	updateDebugView();
}

function buildThisOctree(ot) {
	// if(D_INTERSECTION) {
	// 	scene.remove(balls);
	// 	scene.remove(boxes);
	// }
	
	timeStamp();
	ot.rebuild();
	
	// var t = timeStamp();
	log("octree (re)built in " + timeStamp() + " msec");

	if(D_INTERSECTION) {
		ot.setVisibility(true);
		// controlPanel.checkbox2.checked = true;
	}
}



/* ---------------------------------------------------------------------------------------------------------------------------------------- */
// STEP TWO: find mutually bounded points
function findMutuallyBounded() {

	refreshDebugView();
	checkInitialization();
	findMutuallyBoundedBetweenObjects3D(objDynamic, objStatic, mutuallyBounded);
	updateDebugView();
}

/* 
	find mutually bounded vertices/faces between two 3d objects, 
	using aabb 3d bounding boxes
	if USINGVERTICES == true, find the faces instead of vertices 
*/
function findMutuallyBoundedBetweenObjects3D(objD, objS, arrMulBounded) {
	
	// if(D_INTERSECTION) {
	// 	octree.setVisibility(false);
	// 	scene.remove(balls);
	// 	scene.remove(boxes);
	// 	balls = new THREE.Object3D();
	// 	boxes = new THREE.Object3D();
	// }

	timeStamp();
	
	arrMulBounded.splice(0, mutuallyBounded.length);
	
	// scene.updateMatrixWorld();
	objD.updateMatrixWorld();
	objS.geometry.computeBoundingBox();
	
	/* 
		calculating bounding box 
	*/
	var bboxHelper = new THREE.BoundingBoxHelper( objS, 0xff0000 );
	bboxHelper.update();
	if(D_INTERSECTION) {
		boxes.add( bboxHelper );
	}

	/* 
		find objD's points that are contained in objS's bounding box
	*/
	var len = USINGVERTICES ? objD.geometry.vertices.length : objD.geometry.faces.length;
	// objD.material.color.setHex(colorCollided);
	
	for(var i=0; i<len; i++) {

		/* finding mutually bounded VERTICES */
		if(USINGVERTICES) {
			var v = objD.geometry.vertices[i].clone();
			v.applyMatrix4(objD.matrixWorld);

			if(isInBoundingBox(v, bboxHelper.box) == true) {	
				
				if(D_INTERSECTION) {
					if(i % 10 == 0) addABall(v.x, v.y, v.z, 0x00ffff, 0.2);
				}

				arrMulBounded.push(i);
			}
		}

		/* finding mutually bounded faces */
		else {
			var f = objD.geometry.faces[i];
			
			var va = objD.geometry.vertices[f.a].clone().applyMatrix4(objD.matrixWorld);
			var vb = objD.geometry.vertices[f.b].clone().applyMatrix4(objD.matrixWorld);
			var vc = objD.geometry.vertices[f.c].clone().applyMatrix4(objD.matrixWorld);

			/* if any of the triangle's verext is in the bounding box */
			if(isInBoundingBox(va, bboxHelper.box) 
				|| isInBoundingBox(vb, bboxHelper.box)
				|| isInBoundingBox(vc, bboxHelper.box)) {

				if(D_INTERSECTION) {
					if(i % 10 == 0) addATriangle(va, vb, vc, 0x00ffff);
				}

				arrMulBounded.push(i);
			}
		}
	}

	// var t = timeStamp();
	log("found " + arrMulBounded.length + " mutually bounded points in " + timeStamp() + " msec");

	// if(D_INTERSECTION) {
	// 	scene.add(balls);
	// 	scene.add(boxes);
	// }

	return arrMulBounded.length;
}

/*
	find mutually bounded vertices using 2d bounding rectangle
*/
function findMutuallyBoundedBetweenObjects2D(objD, objS, arrMulBounded) {

	timeStamp();

	arrMulBounded.splice(0, mutuallyBounded.length);
	
	// scene.updateMatrixWorld();
	
	/*
		manually computing 2d bounding rectangle
	*/
	var minS = new THREE.Vector3(10000, 10000, 10000);
	var maxS = new THREE.Vector3(-10000, -10000, -10000);
	var vsObjS = objS.geometry.vertices;
	for(var i=0; i<vsObjS.length; i++) {
		var v = vsObjS[i].clone();
		v.applyMatrix4(objS.matrixWorld);

		minS.set(Math.min(minS.x, v.x),
				Math.min(minS.y, v.y),
				Math.min(minS.z, v.z));
		maxS.set(Math.max(maxS.x, v.x),
				Math.max(maxS.y, v.y),
				Math.max(maxS.z, v.z)); 
	}

	var box = new THREE.Box3(minS, maxS);
	// console.log(box);

	/*
		optional: visualizing the boudning rectangle
	*/
	var bboxHelper = new THREE.BoundingBoxHelper( objS, 0xff0000 );
	bboxHelper.update();
	if(D_INTERSECTION) {
		// boxes.add( bboxHelper );
	}

	/* 
		find objD's points that are contained in objS's bounding box
	*/
	var len = objD.geometry.vertices.length;
	
	objD.updateMatrixWorld();
	for(var i=0; i<len; i++) {
		var v = objD.geometry.vertices[i].clone();
		v.applyMatrix4(objD.matrixWorld);

		if(isInBoundingBox(v, box) == true) {	
			
			if(D_INTERSECTION) {
				if(i % 100 == 0) addABall(v.x, v.y, v.z, 0x00ffff * Math.random(), 0.2);
			}

			arrMulBounded.push(i);
		}
	}

	// var t = timeStamp();
	log("found " + arrMulBounded.length + " mutually bounded points in " + timeStamp() + " msec");

	return arrMulBounded.length;
}

/* 
	if a point is in a given bounding box
*/
function isInBoundingBox(v, b) {

	return b.min.x <= v.x && v.x <= b.max.x &&
		   b.min.y <= v.y && v.y <= b.max.y &&
		   b.min.z <= v.z && v.z <= b.max.z;	
}


/* ---------------------------------------------------------------------------------------------------------------------------------------- */
// STEP THREE: detect intersection based on mutually bounded elements

function detectIntersection() {
	var octreeStatic = octree;
	return detectInsersectionBetweenObjects3D(objDynamic, objStatic, octreeStatic, mutuallyBounded);
}

function detectInsersectionBetweenObjects2D(objD, objS, octreeStatic, arrMulBounded) {
	return detectInsersectionBetweenObjects(objD, objS, octreeStatic, arrMulBounded, false);
}

function detectInsersectionBetweenObjects3D(objD, objS, octreeStatic, arrMulBounded) {
	var isIntersecting = detectInsersectionBetweenObjects(objD, objS, octreeStatic, arrMulBounded, true);
	controlPanel.log(isIntersecting ? "intersecting" : "not intersecting");
	return isIntersecting;
}

/* 
	one single function that handles intersection detection of 2d and 3d (using either vertices or edges)
	if USINGVERTICES == false, assume arrMulBounded contains faces 
*/
function detectInsersectionBetweenObjects(objD, objS, octreeStatic, arrMulBounded, is3D) {

	timeStamp();

	var len = arrMulBounded.length;

	// console.log(len);
	objD.updateMatrixWorld();
	objS.updateMatrixWorld();

	/* the 3D version needs normals on each face */
	if(is3D) objS.geometry.computeFaceNormals();

	var numIntersections = 0;
	var isIntersecting = false;

	for(var i=0; i<len; i++) {

		/* using vertices, applicable for both 2d and 3d */
		if(USINGVERTICES || !is3D) {
			var v1 = objD.geometry.vertices[ arrMulBounded[i] ].clone();
			v1.applyMatrix4(objD.matrixWorld);

			/* for 3d, detect if a point is inside a face; for 2d if inside a triangle */
			var inside = (is3D == true ? isInside3D(v1, octreeStatic, objS) : isInside2D(v1, octreeStatic, objS));

			if(inside) {
				isIntersecting = true;
				numIntersections++;

				if(D_INTERSECTION) {
					if(i % 1000 == 0) addABall(v1.x, v1.y, v1.z, 0xff0000, 0.5);	
				} else {
					break;
				}
			} 
			// else {
			// 	if(D_INTERSECTION) {
			// 		// if(i % (len/1000) == 0) console.log(v1); //addABall(v1.x, v1.y, v1.z, 0xff88ff, 0.5);
			// 	}
			// }
		}

		/* using edges, applicable for 3d only */
		else {

			var f = objD.geometry.faces[ arrMulBounded[i] ];
			var va = objD.geometry.vertices[f.a].clone().applyMatrix4(objD.matrixWorld);
			var vb = objD.geometry.vertices[f.b].clone().applyMatrix4(objD.matrixWorld);
			var vc = objD.geometry.vertices[f.c].clone().applyMatrix4(objD.matrixWorld);

			if(isCrossing(va, vb, octreeStatic, objS) 
				|| isCrossing(vb, vc, octreeStatic, objS)
				|| isCrossing(vc, va, octreeStatic, objS)) {

				isIntersecting = true;
				numIntersections++;

				if(D_INTERSECTION || D_INTERLOCK) {
					if(i % 1000 == 0) {
						/* debug render is in the isCrossing function */
					}
				} else {
					break;
				}
			}

		}
	}
	
	var t = timeStamp();

	controlPanel.log("done. first " + numIntersections + " intersecting node(s) found in " + t + " msec");
	// controlPanel.log(isIntersecting ? "intersecting" : "not intersecting");

	/* for limited debugging */
	stopper = 0;

	return isIntersecting;
}

/*
	find out if the segment |v1v2| crosses any faces of objS with octreeStatic
*/
function isCrossing(v1, v2, octreeStatic, objS) {

	var crossing = false;

	/*
		use the mid point between v1 and v2 as query point
	*/
	var vMid = new THREE.Vector3().addVectors(v1, v2).divideScalar(2);

	var r = 0.5;
	var organizedByObjects = false;
	var elms = octreeStatic.search(vMid, r, organizedByObjects);

	var numIntersections = 0;
	// var minDist = -1;
	// var minAngleToFace = -1;
	// var minFaceCentroid;
	// var minNormal;

	// var idxClosestFace = -1;

	for(var i=0; i<elms.length; i++) {

		var v = elms[i].faces.centroid.clone();
		v.applyMatrix4(objS.matrixWorld);

		/* face and its vertices */
		var f = elms[i].faces;
		var va = objS.geometry.vertices[f.a].clone().applyMatrix4(objS.matrixWorld);
		var vb = objS.geometry.vertices[f.b].clone().applyMatrix4(objS.matrixWorld);
		var vc = objS.geometry.vertices[f.c].clone().applyMatrix4(objS.matrixWorld);

		/* 
			calculating the intersecting point between |v1v2| and the plane of the elms[i].face 
			ref: http://geomalgorithms.com/a06-_intersect-2.html
		*/
		var nml = f.normal.clone();
		var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / 
				nml.dot(new THREE.Vector3().subVectors(v2, v1));
		var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

		/* find out if the intersecting point is i) between v1 and v2; and ii) inside the triangle */
		if(0 <= r && r <= 1 && isInTriangle(pr, va, vb, vc)) {
			
			if((D_INTERSECTION && stopper < 5) || D_INTERLOCK) {
				
				addALine(v, new THREE.Vector3().addVectors(v, nml), 0x00ff00);					
				addALine(v1, v2, 0xffff00);														
				addALine(new THREE.Vector3().addVectors(v1, v2).divideScalar(2), pr, 0xff0000);
				addATriangle(va, vb, vc, 0xffff00);
				addABall(pr.x, pr.y, pr.z, 0xff0000, 0.1);
				
				stopper++;

				// console.log("r = " + r);
			}

			return true;
		}
	}

	return false;
}

/* 
	find out if v1 is inside any triangles of objS, with octreeStatic (the 2d version)
*/
function isInside2D(v1, octreeStatic, objS) {
	var inside = false;	

	var r = 0.5;

	var organizedByObjects = false;
	var elms = octreeStatic.search(v1, r, organizedByObjects);
	
	for(var i=0; i<elms.length; i++) {

		/* the vertices of the elms[i].faces */
		var va = elms[i].object.geometry.vertices[elms[i].faces.a].clone().applyMatrix4(objS.matrixWorld);
		var vb = elms[i].object.geometry.vertices[elms[i].faces.b].clone().applyMatrix4(objS.matrixWorld);
		var vc = elms[i].object.geometry.vertices[elms[i].faces.c].clone().applyMatrix4(objS.matrixWorld);

		// if(isInTriangle(v1.clone(), va.clone(), vb.clone(), vc.clone())) {	
		if(isInTriangle(v1, va, vb, vc)) {	
			inside = true;
			break;
		}
	}

	return inside;
}

/*
	find out if v is inside a triangle formed by va, vb and vc
	ref: http://www.blackpawn.com/texts/pointinpoly/
*/
function isInTriangle(v, va, vb, vc) {
	return onSameside(v, va, vb, vc) &&
			onSameside(v, vb, va, vc) &&
			onSameside(v, vc, va, vb);
}

/*
	find out if p1 and p2 are on the same side of the segment |ab|
*/
function onSameside(p1, p2, a, b) {
	var cp1 = b.clone().sub(a).cross(p1.clone().sub(a));
	var cp2 = b.clone().sub(a).cross(p2.clone().sub(a));

	return cp1.dot(cp2) >= 0;
}

/*
	find out if v1 is inside objS who has the octreeStatic
*/
function isInside3D(v1, octreeStatic, objS) {

	// radius for detecting whether a vertex intersect with an octree's nodes
	var r = 0.5;

	var organizedByObjects = false;
	var elms = octreeStatic.search(v1, r, organizedByObjects);
	
	var numIntersections = 0;
	var minDist = -1;
	var minAngleToFace = -1;
	var minFaceCentroid;
	var minNormal;

	for(var i=0; i<elms.length; i++) {

		/* face centroid and normal */
		var c = elms[i].faces.centroid.clone();
		c.applyMatrix4(objS.matrixWorld);
		var nml = elms[i].faces.normal.clone();

		/* v1 to face's centroid vector */
		var pointToFace = new THREE.Vector3();
		pointToFace.subVectors(c, v1)
		
		/* dot product that reflects the angular relationship between v1 and face*/
		var angleToFace = pointToFace.dot(nml);

		var dist = pointToFace.length();

		/*
			the above could be postponed until finding the closest face
		*/
		if(minDist < 0) {
			minDist = dist;
		} else {
			if(dist < minDist) {
				minDist = dist;
				minAngleToFace = angleToFace;
				minFaceCentroid = c;
				minNormal = nml;
			}
		}
	}

	// if(minAngleToFace < 0 || elms.length < 128) {
	return minAngleToFace > 0;
}