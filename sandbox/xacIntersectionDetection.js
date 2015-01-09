
var balls;
var mutuallyBounded = new Array();

function buildOctree() {
	controlPanel.log("building octree ...");
	octree.rebuild();
	controlPanel.log("done.");
}

function findMutuallyBounded() {
	if(D_INTERSECTION) {
		scene.remove(balls);
		balls = new THREE.Object3D();
	}

	var obj1 = objects[0];
	var obj2 = objects[1];

    obj1.geometry.computeBoundingBox();
	
	var len = obj1.geometry.vertices.length;
	// controlPanel.log(len);
	var cnt = 0;
	mutuallyBounded.splice(0, mutuallyBounded.length);
	for(var i=0; i<len; i++) {
		if(isInBoundingBox(obj1.geometry.vertices[i], obj2.geometry) == true) {
			if(D_INTERSECTION) {
				addABall(obj1.geometry.vertices[i].x, obj1.geometry.vertices[i].y, obj1.geometry.vertices[i].z,
				0x00ffff, 0.5);
			}
			mutuallyBounded.push(i);
			cnt++;
		}
	}

	if(D_INTERSECTION) {
		scene.add(balls);
	}

	controlPanel.log(cnt + " mutually bounded points");
}

function isInBoundingBox(v, g) {
	var b = g.boundingBox;

	return b.min.x < v.x && v.x < b.max.x &&
		   b.min.y < v.y && v.y < b.max.y &&
		   b.min.z < v.z && v.z < b.max.z;	
}

function detectIntersection() {
	controlPanel.log("detecting intersection ...");
	
	if(D_INTERSECTION) {
		scene.remove(balls);
		balls = new THREE.Object3D();

		scene.remove(boxes);
  		boxes = new THREE.Object3D();

  		for (var i = 0; i < objects.length; i++) {
			objects[i].material.color.setHex(colorNormal);
		};
	}

	var len = mutuallyBounded.length;
	var obj1 = objects[0];
	var obj2 = objects[1];

	obj2.geometry.computeFaceNormals();
	var octree2 = octree;

	for(var i=0; i<len; i++) {
		if(isInside(obj1.geometry.vertices[ mutuallyBounded[i] ], octree2)) {
			controlPanel.log("intersecting");
			// return;
			var vtmp = obj1.geometry.vertices[ mutuallyBounded[i] ];
			addABall(vtmp.x, vtmp.y, vtmp.z, 0xff00ff, 0.5);
			return;
		}
	}

	if(D_INTERSECTION) {
		scene.add(balls);
		scene.add(boxes);
		// console.log("done. " + numIntersections + " intersected nodes found");
	}

	controlPanel.log("not intersecting");
}

function isInside(v1, octree2) {
	var inside;	

	// var obj1 = objects[0];
	// var octree2 = octree;

	var r = 0.5;

	var organizedByObjects = false;
	var objs = octree2.search(v1, r, organizedByObjects);
	// addABall(obj1.position.x, obj1.position.y, obj1.position.z, 0xffff00, r);
	// console.log(objs.length);
	var numIntersections = 0;
	var minDist = -1;
	var minAngleToFace = -1;
	for(var i=0; i<objs.length; i++) {
		objs[i].object.material.color.setHex(colorCollided);
		// controlPanel.log(objs[i]);
		// console.log(objs[i]);
		numIntersections++;
		
		// if(D_INTERSECTION) {
		// 	addABall(objs[i].faces.centroid.x, objs[i].faces.centroid.y, objs[i].faces.centroid.z, 0xff0000, 0.25);
		// }
		// addATriangle()

		var pointToFace = new THREE.Vector3();
		pointToFace.subVectors(objs[i].faces.centroid, v1)
		
		var angleToFace = pointToFace.dot(objs[i].faces.normal);
		// console.log("distance: " + pointToFace.length() + ", angle-to-face: " + angleToFace);

		var dist = pointToFace.length();
		if(minDist < 0) {
			minDist = dist;
		} else {
			if(dist < minDist) {
				minDist = dist;
				minAngleToFace = angleToFace;
			}
		}
	}

	if(minAngleToFace < 0) {
		console.log("outside");
		inside = false;

	} else {
		console.log("inside");
		inside = true;
	}


	return inside;
}

function toggleOctreeVisibility() {
	controlPanel.log("showing/hiding octree visibility ...");
	octree.toggleVisibility();
}

function addABall(x, y, z, clr, radius) {
	var geometry = new THREE.SphereGeometry( radius, 10, 10 );
  	var material = new THREE.MeshBasicMaterial( { color: clr } );
 	var ball = new THREE.Mesh( geometry, material );
 	ball.position.set(x, y, z);
 	
 	// console.log(ball.position);
 	balls.add(ball);
 //  	scene.add( ball1 );
 //  	ball2 = new THREE.Mesh( geometry, material );
 //  	scene.add( ball2 );
}