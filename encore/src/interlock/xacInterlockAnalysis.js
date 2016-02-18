// var AXISX = new THREE.Vector3(1, 0, 0);
// var AXISZ = new THREE.Vector3(0, 0, 1);

var rotZ = Math.PI / 18;
var rotX = Math.PI / 18;

var rot = Math.PI / 2;

var tSearchStart;

var voxelGroupStatic;
var voxelGroupDynamic;
var voxelGroupsDyn = new Array();

function detectInterlock() {
	var isInterlocking = true;
	var t0 = new Date().getTime();

	/* possibly rebuild octree */
	for(var i=0; i<objects.length; i++) {
		if(objects[i].isStatic == true && objects[i].needRebuildOctree == true) {
			octree.rebuild();
			objects[i].needRebuildOctree = false;
		}
	}

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


/*
	a iterative process to find printable configuration
*/
function makeInterlockPrintable() {
	/* start timing */
	if(tSearchStart == undefined) {
		tSearchStart = now();
	}

	/* restoring objects from voxels to meshes */
	restoreObjects(false);

	/* rotating the objects to search for printable configuration */
	rotateObjectPair();
	if(objectPair != undefined) {
		console.log("Orientation: " + (objectPair.rotation.x * 180 / Math.PI) + ", " + (objectPair.rotation.z * 180 / Math.PI));
	}

	/* transfer and translate voxels to the most current object positions*/
	transferVoxels();

	/* initialize the pair of objects */
	if(objectPair == undefined) {
		objectPair = new THREE.Object3D();
		scene.add(objectPair);
		for(var i=0; i<objects.length; i++) {
			objectPair.add(objects[i]);
		}
	}

	/* remove mesh objects, voxels only*/
	removeObjects();
	
	/* start off the physics engine */
	scene.setGravity(gravity);
		
	if(usingPhysics == false) {
		usingPhysics = true;
		scene.simulate();
	}

	log("using physics ...");
	initPhysics();

}


/*
	rotate the two objects as a whole
*/
function rotateObjectPair() {
	if(objectPair != undefined) {
		
		/* method 1. naive step-wise */
		// if(objectPair.rotation.x >= Math.PI - rotX) {
		// 	objectPair.rotation.x = 0;
		// 	objectPair.rotation.z += rotZ;
		// } else {
		// 	objectPair.rotation.x += rotX;
		// }


		/* method 2. shrinking step */
		if(objectPair.rotation.x >= Math.PI - rot) {
			objectPair.rotation.x = 0;
			if(objectPair.rotation.z >= Math.PI - rot) {
				objectPair.rotation.z = 0;
				rot /= 2;	
			} else {
				objectPair.rotation.z += rot;
			}
		} else {
			objectPair.rotation.x += rot;
		}
		
	}
}


/*
	copy and transfer voxels from the initial model to the new position
*/
function transferVoxels() {

	scene.updateMatrixWorld();
	for(var i=0; i<voxelGrids.length; i++) {

		/* small enough so not to cause physical contact */
		// var geometry = new THREE.CubeGeometry(voxelGrids[i]._unitSize, voxelGrids[i]._unitSize, voxelGrids[i]._unitSize);
		
		// var geometrySmall = new THREE.CubeGeometry(0.001, 0.001, 0.001);
		var geometrySmall = new THREE.CubeGeometry(0, 0, 0);
		// var geometrySmall = new THREE.SphereGeometry(0.00001, 8, 8);

		var material = new THREE.MeshBasicMaterial( {color: (voxelGrids[i].obj.isStatic ? 0xff0f0f : 0x0ffff0), transparent: true, opacity: 0.25} );
		// var voxelGroupNew = new Physijs.BoxMesh(geometrySmall, material, voxelGrids[i].obj.isStatic ? 0 : 10);
		var voxelGroupNew = new Physijs.SphereMesh(geometrySmall, material, voxelGrids[i].obj.isStatic ? 0 : 0.00001);
		voxelGroupNew.position = voxelGrids[i]._voxelGroup.position;

		// scene.remove(voxelGrids[i]._voxelGroup);
		if(voxelGrids[i].obj.isStatic) {
			// scene.remove(voxelGroupStatic);
			voxelGroupStatic = voxelGroupNew;
		} else {
			// scene.remove(voxelGroupDynamic);
			voxelGroupDynamic = voxelGroupNew;
		}
		

		voxelGrids[i].obj.updateMatrixWorld();
		var mat = voxelGrids[i].obj.matrixWorld;
		
		/* normal geometry */
		// var geometry = new THREE.CubeGeometry(voxelGrids[i]._unitSize, voxelGrids[i]._unitSize, voxelGrids[i]._unitSize);
		var geometry = new THREE.SphereGeometry(voxelGrids[i]._unitSize / 2, 8, 8);
		for(var j=0; j<voxelGrids[i]._voxelGroup.children.length; j++) {
			/* creating a voxel identical to the original voxel group*/

			// var voxel = new Physijs.BoxMesh(geometry, material, voxelGrids[i].obj.isStatic ? 0 : 10);
			var voxel = new Physijs.SphereMesh(geometry, material, voxelGrids[i].obj.isStatic ? 10 : 0);
			
			voxel.position = voxelGrids[i]._voxelGroup.children[j].position;
			voxelGroupNew.add(voxel);
		}

		/* applying object' world matrix so the voxels are aligned with its position */
		voxelGroupNew.applyMatrix(mat);

		/* using voxelGroupsDyn to keep track of voxel updates */
		if(voxelGroupsDyn.length > i) {
			scene.remove(voxelGroupsDyn[i]);
			voxelGroupsDyn[i] = voxelGroupNew;
		} else {
			// scene.remove(voxelGrids[i]._voxelGroup);
			voxelGroupsDyn.push(voxelGroupNew);
		}
		scene.add(voxelGroupNew);
	}

}