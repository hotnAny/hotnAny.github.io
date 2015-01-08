
var balls;

function buildOctree() {
	controlPanel.log("building octree ...");
	octree.rebuild();
	controlPanel.log("done.");
}

function detectIntersection() {
	if(D_INTERSECTION) {
		scene.remove(balls);
		balls = new THREE.Object3D();
	}

	controlPanel.log("detecting intersection ...");

	var obj1 = objects[0];
	var octree2 = octree;

	var r = 0.1;

	for (var i = 0; i < objects.length; i++) {
		objects[i].material.color.setHex(colorNormal);
	};

	var objs = octree2.search(obj1.position, r);
	addABall(obj1.position.x, obj1.position.y, obj1.position.z, 0xffff00, r);
	// console.log(objs.length);
	var numIntersections = 0;
	for(var i=0; i<objs.length; i++) {
		objs[i].object.material.color.setHex(colorCollided);
		// controlPanel.log(objs[i]);
		// console.log(objs[i]);
		numIntersections++;
		addABall(objs[i].faces.centroid.x, objs[i].faces.centroid.y, objs[i].faces.centroid.z, 0xff0000, 0.5);
	}

	if(D_INTERSECTION) {
		scene.add(balls);
	}

	controlPanel.log("done. " + numIntersections + " intersections found.");
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