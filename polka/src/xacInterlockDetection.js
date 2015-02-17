
function detectInterlock() {
	var isInterlocking = true;
	var t0 = new Date().getTime();

	/* new algorithm (based on topology definition) */
	// ??

	/* step 0: if there is any mutually bounded points */
	if(findMutuallyBounded() > 0) {
		/* step 1: intersection test - do they intersect? */
		if(detectIntersection()) {
			isInterlocking = false;
		}
		/* step 2: deformation test - if not intersecting, can one shrink to a point without running into the other */
		// else {
		// 	if(!deform(objStatic, objDynamic) && !deform(objDynamic, objStatic)) {
		// 		isInterlocking = true;
		// 	} else {
		// 		isInterlocking = false;
		// 	}
		// }
	} else {
		isInterlocking = false;
	}

	log((isInterlocking ? "" : "not") + " interlocking. computed in " + timeElapsed(t0) + " msec");
	return isInterlocking;
}

function detectInterlockBetweenObjects(objD, objS) {

}

function deform(obj1, obj2) {
	/* calculating center of mass */
	// var ctrMass = new THREE.Vector3(0, 0, 0);

	var numVertices = obj1.geometry.vertices.length;
	// var ctrMass = obj1.ctrMass.clone().applyMatrix4(obj1.matrixWorld);
	for(var i=0; i<numVertices; i++) {
		var v = obj1.geometry.vertices[i].clone().applyMatrix4(obj1.matrixWorld);

		// ctrMass.add(obj1.geometry.vertices[i].clone().applyMatrix4(obj1.matrixWorld));
		/* ray casting */
		var raycaster = new THREE.Raycaster(v, ctrMass.clone().sub(v).normalize(), 0, v.distanceTo(ctrMass));
		// raycaster.ray.set(v, ctrMass.clone().sub(v))
		var intersects = raycaster.intersectObjects([obj2]);

		if(intersects.length > 0) {
			console.log(intersects[0]);
			if(D_INTERLOCK) {
				addALine(v, ctrMass, 0xff0ff0);
			}
			console.log(obj1.name + " cannot deform to a point in R3 \\ " + obj2.name);
			return false;
		}
	}

	// ctrMass.divideScalar(numVertices);
	
	// addABall(ctrMass.x, ctrMass.y, ctrMass.z, 0xf00fee, 2);
	// scene.add(balls);
	console.log(obj1.name + " can deform to a point in R3 \\ " + obj2.name);
	return true;
}

function fillObjVoxels() {
	for(var i=0; i<voxelGrids.length; i++) {
		scene.remove(voxelGrids[i]._voxelGroup);
		voxelGrids[i].fillVoxels();
		voxelGrids[i].exportMarkedVoxels(i==0);
		scene.add(voxelGrids[i]._voxelGroup);
	}
}

function peelObjVoxels() {
	for(var i=0; i<voxelGrids.length; i++) {
		scene.remove(voxelGrids[i]._voxelGroup);
		voxelGrids[i].peelVoxels();
		voxelGrids[i].exportMarkedVoxels(i==0);
		scene.add(voxelGrids[i]._voxelGroup);
	}
}