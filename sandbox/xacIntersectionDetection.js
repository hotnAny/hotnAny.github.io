
var balls;
var mutuallyBounded = new Array();


/******************************************************************/
// STEP ONE: build the octree
function buildOctree() {
	// controlPanel.log("building octree ...");
	if(D_INTERSECTION) {
		scene.remove(balls);
		scene.remove(boxes);
	}

	timeStamp();

	octree.rebuild();
	controlPanel.log("done.");
	
	var t = timeStamp();
	log("octree (re)built in " + t + " msec");

	if(D_INTERSECTION) {
		octree.setVisibility(true);
	}
}


/******************************************************************/
// STEP TWO: find mutually bounded points
function findMutuallyBounded() {
	
	if(D_INTERSECTION) {
		octree.setVisibility(false);
		scene.remove(balls);
		scene.remove(boxes);
		balls = new THREE.Object3D();
		boxes = new THREE.Object3D();
	}

	timeStamp();

	var obj1 = objects[0];
	var obj2 = objects[1];
	
	// controlPanel.log(len);
	mutuallyBounded.splice(0, mutuallyBounded.length);
	
	scene.updateMatrixWorld();
	obj2.geometry.computeBoundingBox();
	var bboxHelper = new THREE.BoundingBoxHelper( obj2, 0xff0000 );
	// var bboxHelper = buildBoundingBox(obj2);
	if(D_INTERSECTION) {
		bboxHelper.update();
		boxes.add( bboxHelper );
		// var b = obj2.geometry.boundingBox;
		// b.min.applyMatrix4(obj2.matrixWorld);
		// b.max.applyMatrix4(obj2.matrixWorld);
		// addABox(b.min.x, b.max.x, b.max.y, b.min.y, b.max.z, b.min.z);
	}

	// find obj1's points that are contained in obj2's bounding box
	var len = obj1.geometry.vertices.length;
	obj1.updateMatrixWorld();
	for(var i=0; i<len; i++) {
		var v = obj1.geometry.vertices[i].clone();
		// v.add(new THREE.Vector3().getPositionFromMatrix(obj1.matrixWorld));
		v.applyMatrix4(obj1.matrixWorld);
		// if(i % 100 == 0) addABall(v.x, v.y, v.z, 0x00ffff, 0.5);

		if(isInBoundingBox(v, bboxHelper.box) == true) {	
			
			if(D_INTERSECTION) {
				addABall(v.x, v.y, v.z, 0x00ffff, 0.5);
			}
			mutuallyBounded.push(i);
		}
	}

	var t = timeStamp();
	log("found " + mutuallyBounded.length + " mutually bounded points in " + t + " msec");

	if(D_INTERSECTION) {
		scene.add(balls);
		scene.add(boxes);
	}
}

function buildBoundingBox(obj) {
	var rot = obj.rotation.clone();
	obj.rotation.set(0, 0, 0);
	obj.updateMatrixWorld();
	var bbh = new THREE.BoundingBoxHelper(obj, 0xff0000);
	bbh.rotation.set(rot.x, rot.y, rot.z);
	obj.rotation.set(rot.x, rot.y, rot.z);
	return bbh;
}

function isInBoundingBox(v, b) {

	return b.min.x < v.x && v.x < b.max.x &&
		   b.min.y < v.y && v.y < b.max.y &&
		   b.min.z < v.z && v.z < b.max.z;	
}

// function isInBoundingBox(v, obj2) {
// 	var b = obj2.geometry.boundingBox.clone();
// 	b.min.add(new THREE.Vector3().getPositionFromMatrix(obj2.matrixWorld));
// 	b.max.add(new THREE.Vector3().getPositionFromMatrix(obj2.matrixWorld));

// 	return b.min.x < v.x && v.x < b.max.x &&
// 		   b.min.y < v.y && v.y < b.max.y &&
// 		   b.min.z < v.z && v.z < b.max.z;	
// }

function detectIntersection() {
	// controlPanel.log("detecting intersection ...");
	
	if(D_INTERSECTION) {
		scene.remove(balls);
		balls = new THREE.Object3D();

		scene.remove(boxes);
  		boxes = new THREE.Object3D();

  		for (var i = 0; i < objects.length; i++) {
			objects[i].material.color.setHex(colorNormal);
		};
	}

	timeStamp();

	var len = mutuallyBounded.length;
	var obj1 = objects[0];
	var obj2 = objects[1];

	obj1.updateMatrixWorld();
	obj2.updateMatrixWorld();

	obj2.geometry.computeFaceNormals();
	var octree2 = octree;

	var numIntersections = 0;
	var isIntersecting = false;
	for(var i=0; i<len; i++) {
		// var v1 = obj1.geometry.vertices[ mutuallyBounded[i] ].clone();
		// v1.add(new THREE.Vector3().getPositionFromMatrix(obj1.matrixWorld));
		var v1 = obj1.geometry.vertices[ mutuallyBounded[i] ].clone();
		v1.applyMatrix4(obj1.matrixWorld);
		if(isInside(v1, octree2, obj2)) {
			
			isIntersecting = true;
			
			if(D_INTERSECTION) {
				// var vtmp = obj1.geometry.vertices[ mutuallyBounded[i] ];
				addABall(v1.x, v1.y, v1.z, 0xff0000, 0.5);
				numIntersections++;
			} else {
				return;
			}
		} else {
			if(D_INTERSECTION) {
				// addABall(v1.x, v1.y, v1.z, 0xff88ff, 0.5);
			}
		}
	}

	var t = timeStamp();

	if(D_INTERSECTION) {
		scene.add(balls);
		scene.add(boxes);	
	}

	controlPanel.log("done. " + numIntersections + " intersected nodes found in " + t + " msec");
	if(isIntersecting) {
		controlPanel.log("intersecting");
	} else {
		controlPanel.log("not intersecting");
	}
}

function isInside(v1, octree2, obj) {
	var inside;	

	// radius for detecting whether a vertex intersect with an octree's nodes
	var r = 0.5;

	var organizedByObjects = false;
	var elms = octree2.search(v1, r, organizedByObjects);
	
	var numIntersections = 0;
	var minDist = -1;
	var minAngleToFace = -1;
	var minFaceCentroid;
	var minNormal;

	// console.log(elms.length + " possible intersections");

	for(var i=0; i<elms.length; i++) {
		// elms[i].object.material.color.setHex(colorCollided);

		var c = elms[i].faces.centroid.clone();
		c.applyMatrix4(obj.matrixWorld);

		var nml = elms[i].faces.normal.clone();
		// nml.applyMatrix4(obj.matrixWorld);

		var pointToFace = new THREE.Vector3();
		// pointToFace.subVectors(elms[i].faces.centroid, v1)
		pointToFace.subVectors(c, v1)
		
		// var angleToFace = pointToFace.dot(elms[i].faces.normal);
		var angleToFace = pointToFace.dot(nml);

		var dist = pointToFace.length();

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

	if(minAngleToFace < 0 || elms.length < 64) {
		// if(D_INTERSECTION) console.log("outside");
		inside = false;

	} else {
		// if(D_INTERSECTION) console.log("inside");
		inside = true;

		if(D_INTERSECTION) {
			// addABall(v1.x, v1.y, v1.z, 0xff00ff, 0.1);
			// addALine(minFaceCentroid, v1, 0xff0000);
			// addALine(minFaceCentroid, new THREE.Vector3().addVectors(minFaceCentroid, minNormal), 0xffff00);
			// addABall(minFaceCentroid.x, minFaceCentroid.y, minFaceCentroid.z, 0xff0000, 0.1);
			// console.log("found " + elms.length + " intersections.");
		}
	}


	return inside;
}

function toggleOctreeVisibility() {
	// controlPanel.log("showing/hiding octree visibility ...");
	octree.toggleVisibility();
}