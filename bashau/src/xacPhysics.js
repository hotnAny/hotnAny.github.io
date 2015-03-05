/* 
	physics specific variables
*/

var DIMVOXELS = 16;
var GRAVITYSCALE = 640;
var gravityDir = -1;
var gravity = new THREE.Vector3(0, gravityDir * GRAVITYSCALE, 0);

// var prevVel;
var prevPos;

// for the non static object
var minHeight = INFINITY;
var maxHeight = -INFINITY;

var NUMFRAMESPERSIMULATION = 60 * 5;
var NUMFRAMESFORSTABILITY = 60 * 1;
var cntStableFrames = -NUMFRAMESFORSTABILITY;
var cntFramesPerSimulation = 0;


var lowerHeights = new Array();
var higherHeights = new Array();

var BOUND = 2000;

// var numsVoxels = new Array();


/*
	voxelizing predefined objects
*/
function voxelize() {
	for(var i=0; i<objects.length; i++) {
		voxelizeObject(objects[i]);
	}
}


/*
	voxelizing an object, using cubes to represent the surface
*/
function voxelizeObject(obj) {
	var voxelGrid = new VoxelGrid(DIMVOXELS, obj);
	voxelGrid.voxelizeSurface(obj);
	voxelGrids.push(voxelGrid);
}


/*
	optionally removing voxels, definitely restoring meshes
*/
function restoreObjects(toRemoveVoxels) {
	if(toRemoveVoxels) {
		for(var i=0; i<voxelGrids.length; i++) {
			voxelGrids[i].selfRemove();
		}
		voxelGrids.splice(0, voxelGrids.length);

		for(var i=0; i<voxelGroupsDyn.length; i++) {
			scene.remove(voxelGroupsDyn[i]);
		}
	}
	
	if(objectPair != undefined) {
		scene.add(objectPair);
	} else {
		for(var i=0; i<objects.length; i++) {
			scene.add(objects[i]);
		}
	}
}


/*
	removing voxels, restoring meshes
*/
function removeObjects() {
	if(objectPair != undefined) {
		scene.remove(objectPair);
	} else {
		for(var i=0; i<objects.length; i++) {
			scene.remove(objects[i]);
		}
	}
}


/* 
	slice the object to print up to a specific height 
*/
function slice() {
	
	/* only care about the max height of the overlapping part*/
	var boundedMaxHeight = -INFINITY;

	for(var i=0; i<objects.length; i++) {
		if(!objects[i].isStatic) {
			objects[i].updateMatrixWorld();
			for(var j=0; j<mutuallyBounded.length; j++) {
				var f = objects[i].geometry.faces[mutuallyBounded[j]];
				var va = objects[i].geometry.vertices[f.a].clone().applyMatrix4(objects[i].matrixWorld);
				var vb = objects[i].geometry.vertices[f.b].clone().applyMatrix4(objects[i].matrixWorld);
				var vc = objects[i].geometry.vertices[f.c].clone().applyMatrix4(objects[i].matrixWorld);

				boundedMaxHeight = Math.max(boundedMaxHeight, va.y);
				boundedMaxHeight = Math.max(boundedMaxHeight, vb.y);
				boundedMaxHeight = Math.max(boundedMaxHeight, vc.y);
			}
		}
	}
	
	/* slice the object to print */
	var sliceHeight = mutuallyBounded.length <= 0 ? maxHeight : boundedMaxHeight;
	for(var i=0; i<voxelGrids.length; i++) {
		if(voxelGrids[i]._isStatic) {
			/* replacing static object with sliced layers */
			voxelGroupsDyn[i] = sliceToHeight(voxelGroupsDyn[i], sliceHeight);
			break;
		}
	}

	/* get the pausing point based on slicing */
	computeLayerAtHeight(sliceHeight);
}


function sliceToHeight (voxelGroup, height) {

	scene.updateMatrixWorld();
	voxelGroup.updateMatrixWorld();

	var geometry = new THREE.CubeGeometry(0, 0, 0);
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0.25} );
	var voxelGroupSliced = new Physijs.BoxMesh(geometry, material, 0);
	voxelGroupSliced.position = voxelGroup.position;
	voxelGroupSliced.applyMatrix(voxelGroup.matrixWorld);
	
	var childrenToKeep = new Array();
	for(var j=0; j<voxelGroup.children.length; j++) {
		
		var pos = new THREE.Vector3().getPositionFromMatrix(voxelGroup.children[j].matrixWorld);//.add(voxelGroup.position);
		
		if(pos.y + voxelGrids[0]._unitSize / 2 <= height ) {

			childrenToKeep.push(voxelGroup.children[j]);
		} 
	}

	// voxelGroup.children.splice(0, voxelGroup.children.length);
	scene.remove(voxelGroup);
	// console.log("childre to keep: " + childrenToKeep.length);
	for(var i=0; i<childrenToKeep.length; i++) {
		voxelGroupSliced.add(childrenToKeep[i]);
	}
	scene.add(voxelGroupSliced);
	return voxelGroupSliced;
}



/*
	reverse the gravity to gauge printability
*/

var gravityReversed = false;

function reverseGravity() {
	var minusGravity = gravity.clone().multiplyScalar(-1);
	scene.setGravity(minusGravity);
	initPhysics();
	gravityReversed = true;
}


// function switchGravity() {

// 	var axisX = new THREE.Vector3(1, 0, 0);
// 	rotateGravity(axisX, rotX);

// 	var axisZ = new THREE.Vector3(0, 0, 1);
// 	rotateGravity(axisZ, rotZ);

// 	log("Range of height: [" + minHeight + ", " + maxHeight + "]");
// 	gravityReversed = false;
// 	cntFramesPerSimulation = 0;
// }

function initPhysics() {
	cntStableFrames = -NUMFRAMESFORSTABILITY;
	cntFramesPerSimulation = 0;
	minHeight = INFINITY;
	maxHeight = -INFINITY;
	prevPos = undefined;
}


// function rotateGravity(axis, angle) {
// 	gravity.applyAxisAngle(axis, angle);

// 	for(var i=0; i<legends.length; i++) {
// 		if(legends[i].name == 'arrow') {
// 			legends[i].rotateOnAxis(axis, angle);
// 		}
// 	}
// }



/*
	keep track of objects min/max y position as one drops
	run per update cycle
*/
function updatePositions() {
	if(!usingPhysics) {
		return;
	}

	if(cntFramesPerSimulation == 0) {
		timeStamp();
	}

	++cntFramesPerSimulation;

	for(var i=0; i<voxelGrids.length; i++) {
		if(voxelGrids[i]._isStatic) {
			continue;
		}

		if(voxelGrids[i]._voxelGroup._dirtyPosition == false) {
			continue;
		}

		// var delta = 1000;
		var vel;
		if(prevPos != undefined) {
			vel = voxelGrids[i]._voxelGroup.position.y/*dot(gravity)*/ - prevPos;
		}

		// console.log(delta);

		/* if object is pausing || it has gone away too far */
		if(Math.abs(vel) < 0.1 || !isOutOfBound(voxelGrids[i]._voxelGroup.position, BOUND)) {// Math.abs(voxelGrids[i]._voxelGroup.position.y) > 200) {
			scene.updateMatrixWorld();

			minHeight = INFINITY;
			maxHeight = -INFINITY;
			
			/* traverse all the voxels to obtain the extremes */
			// for(var j=0; j<voxelGrids[i]._voxelGroup.children.length; j++) {
			for(var j=0; j<voxelGroupDynamic.children.length; j++) {	
				// voxelGrids[i]._voxelGroup.updateMatrixWorld();
				voxelGroupDynamic.updateMatrixWorld();

				// var pos = new THREE.Vector3().getPositionFromMatrix(voxelGrids[i]._voxelGroup.children[j].matrixWorld);
				var pos = new THREE.Vector3().getPositionFromMatrix(voxelGroupDynamic.children[j].matrixWorld);

				minHeight = Math.min(pos.y, minHeight);
				maxHeight = Math.max(pos.y, maxHeight);
			}

			cntStableFrames++;

		} else {
			cntStableFrames = 0;
		}


		/* if object has been relatively static for a few frames || or it has gone too far*/
		// 
		// cntStableFrames >= NUMFRAMESFORSTABILITY || Math.abs(voxelGrids[i]._voxelGroup.position.y) > 200) {
		//
		prevPos = voxelGrids[i]._voxelGroup.position.y;//.dot(gravity);

		if(cntStableFrames >= NUMFRAMESFORSTABILITY || cntFramesPerSimulation > NUMFRAMESPERSIMULATION 
			|| isOutOfBound(voxelGrids[i]._voxelGroup.position, BOUND)) {
			console.log(cntStableFrames + ", " + cntFramesPerSimulation);

			log("Range of height: [" + minHeight + ", " + maxHeight + "]");

			log("Time elapsed: " + timeStamp() + " msec");
			if(gravityReversed) {
				
				higherHeights[0] = minHeight;
				higherHeights[1] = maxHeight;

				if(higherHeights[0] < lowerHeights[1]) {
					// restoreObjects();
					gravityReversed = false;

					if(withoutSupport) {
						makeItPrintable();
					} else {
						usingPhysics = false;
						restoreObjects(false);
						objectPair = undefined;
					}
				} else {
					usingPhysics = false;
					log("Search time: " + (now() - tSearchStart) + " msec");
				}

				controlPanel.checkbox3.checked = usingPhysics;
			} else {
				lowerHeights[0] = minHeight;
				lowerHeights[1] = maxHeight;

				slice();
				reverseGravity();
			}
		}
	}	
}

function isOutOfBound(pos, perimeter) {
	return Math.abs(pos.x) > perimeter || Math.abs(pos.y) > perimeter || Math.abs(pos.z) > perimeter;
}



/*
	compute which layer (to pause, shown in %) at a given height
*/
function computeLayerToPause() {
	computeLayerAtHeight(minHeight);
}

function computeLayerAtHeight(height) {
	for(var i=0; i<objects.length; i++) {
		if(objects[i].isStatic) {
			objects[i].geometry.computeBoundingBox();
			var bbMin = objects[i].geometry.boundingBox.min.applyMatrix4(objects[i].matrixWorld);
			var bbMax = objects[i].geometry.boundingBox.max.applyMatrix4(objects[i].matrixWorld);
			var top = Math.max(bbMin.y, bbMax.y);

			/* updated: we are actually considering the height from ground zero */
			// var btm = 0;// Math.min(bbMin.y, bbMax.y);
			var btm = Math.min(bbMin.y, bbMax.y);
			if(height > top || height < btm) {
				log("out of bound");
			} else {
				var heightRatio = (height - btm) / (top - btm);
				log("pause at " + (heightRatio * 100) + "%");
			}
			break;
		}
	}
}
