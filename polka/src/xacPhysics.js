var DIMVOXELS = 32;
var GRAVITYSCALE = 16;
var gravityDir = -1;

var prevVel;
var prevPos;

// for the non static object
var minHeight = 1000;
var maxHeight = -1000;


var NUMFRAMESFORSTABILITY = 80;
var cntStableFrames = -NUMFRAMESFORSTABILITY;

/*
	voxelizing predefined objects
*/
function voxelize() {
	for(var i=0; i<objects.length; i++) {
		voxelizeObject(objects[i]);
	}
	// voxelizeObject(objects[1]);
}

/*
	voxelizing an object, using cubes to represent the surface
*/
function voxelizeObject(obj) {

	var voxels = new Array();

	/* building a voxel grid */
	var voxelGrid = new VoxelGrid(DIMVOXELS, obj);
	voxelGrid._isStatic = obj.isStatic;

	console.log(obj.name + "\'s voxel dimension: ")
	console.log(voxelGrid._dim);

	/* building an octree */
	var ot = new THREE.Octree({
          undeferred: false,
          depthMax: Infinity,
          scene: scene
        });
	ot.add(obj, { useFaces: true });
	ot.update();
	// ot.setVisibility(true);

	/* surface-in-cude test */
	obj.geometry.computeFaceNormals();
	for(var i=0; i<voxelGrid._dim.x; i++) {
		for(var j=0; j<voxelGrid._dim.y; j++) {
			for(var k=0; k<voxelGrid._dim.z; k++) {

				var ctr = voxelGrid.getVoxelCentroid(i, j, k);
				// console.log(ctr);
				var elms = ot.search(ctr, 0.5);
				// console.log(elms.length);
				// if(elms.length > 0) {
				// 	voxelGrid.mark(i, j, k);
				// }

				for(var h=0; h<elms.length; h++) {
					
					/* face centroid */
					var v = elms[h].faces.centroid.clone();
					v.applyMatrix4(obj.matrixWorld);

					/* if a face center is in this voxel, include this voxel */
					if(voxelGrid.isInThisVoxel(v, i, j, k)) {
						voxelGrid.mark(i, j, k);
						break;
					} 
					/* otherwise test the case where a triangle might span multiple voxels */
					else {
						/* faces and their vertices */
						var f = elms[h].faces;
						var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
						var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
						var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

						if(triangleArea(va, vb, vc) < 1) {
							continue;
						}

						/* 
							calculating the intersecting point between |v1v2| and the plane of the elms[i].face 
							ref: http://geomalgorithms.com/a06-_intersect-2.html
						*/
						var nml = f.normal.clone();
						var v1 = ctr.clone();
						var v2 = ctr.clone().add(nml);
						var denominator = nml.dot(new THREE.Vector3().subVectors(v2, v1));

						if(denominator == 0) {
							continue;
						}

						var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / denominator;
						var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

						/* find out if the intersecting point is i) between v1 and v2; and ii) inside the triangle */
						if(isInTriangle(pr, va, vb, vc) && ctr.distanceTo(pr) < voxelGrid._unitSize / 4) {

							voxelGrid.mark(i, j, k);

							// if(i == 0 && j > 16) {
							// 	// addALine(ctr, pr, 0xffff00);
							// 	addATriangle(va, vb, vc, 0xffff00);
							// 	console.log(va);
							// 	console.log(vb);
							// 	console.log(vc);
							// 	console.log(" ========= ");	
							// }
							break;
						}
					}
				} /* end of octree search */
			}
		}
	}

	// var voxels = voxelGrid.exportMarkedVoxels();
	// console.log(voxels.length);
	scene.remove(obj);
	voxelGrid.exportMarkedVoxels(obj.isStatic);
	scene.add(voxelGrid._voxelGroup);
	// for(var idx=0; idx < voxels.length; idx++) {
	// 	scene.add(voxels[idx]);
	// }
	
	voxelGrids.push(voxelGrid);
}

function slice() {
	for(var i=0; i<voxelGrids.length; i++) {
		if(voxelGrids[i]._isStatic) {
			voxelGrids[i].sliceToHeight(maxHeight);
			break;
		}
	}
	computeLayerAtHeight(maxHeight);
}

function changeGravity() {
	// gravity.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
	gravityDir *= -1;
	var gravity = new THREE.Vector3(0, gravityDir * GRAVITYSCALE, 0)
	console.log(gravity);
	scene.setGravity(gravity);

	usingPhysics = true;
	controlPanel.checkbox3.checked = usingPhysics;
	scene.simulate();
	
	// reset variables
	cntStableFrames = -NUMFRAMESFORSTABILITY;
	minHeight = 1000;
	maxHeight = -1000;
}

function updatePositions() {
	if(!usingPhysics) {
		return;
	}

	// console.log("updating positions ...");

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
			vel = voxelGrids[i]._voxelGroup.position.y - prevPos;
		}

		// console.log(delta);

		if(Math.abs(vel) < 0.1 || Math.abs(voxelGrids[i]._voxelGroup.position.y) > 200) {
			scene.updateMatrixWorld();

			minHeight = 1000;
			maxHeight = -1000;
			
			for(var j=0; j<voxelGrids[i]._voxelGroup.children.length; j++) {
				voxelGrids[i]._voxelGroup.updateMatrixWorld();
				var pos = new THREE.Vector3().getPositionFromMatrix(voxelGrids[i]._voxelGroup.children[j].matrixWorld);
				minHeight = Math.min(pos.y, minHeight);
				maxHeight = Math.max(pos.y, maxHeight);
				// minHeight = Math.min(voxelGrids[i]._voxelGroup.children[j].position.y, minHeight);
				// maxHeight = Math.max(voxelGrids[i]._voxelGroup.children[j].position.y, maxHeight);
			}

			// console.log(minHeight + ", " + maxHeight);

			// var deltaMinMax = 1000;
			// if(preMinHeight != undefined && preMaxHeight != undefined) {
			// 	deltaMinMax = Math.max(Math.abs(maxHeight - preMaxHeight), Math.abs(minHeight - preMinHeight));
			// }
			// preMinHeight = minHeight;
			// preMaxHeight = maxHeight;

			// if(deltaMinMax < 0.0001) {
			// 	usingPhysics = false;
			// 	controlPanel.checkbox3.checked = usingPhysics;
			// }

			cntStableFrames++;

		} else {
			cntStableFrames = 0;
		}


		if(cntStableFrames >= NUMFRAMESFORSTABILITY || Math.abs(voxelGrids[i]._voxelGroup.position.y) > 200) {
			usingPhysics = false;
			controlPanel.checkbox3.checked = usingPhysics;

			log("Range of height: [" + minHeight + ", " + maxHeight + "]");

		}

		// else {
		// 	usingPhysics = true;
		// 	controlPanel.checkbox3.checked = usingPhysics;
		// }

		prevPos = voxelGrids[i]._voxelGroup.position.y;
		// prevVel = vel;
		// console.log(i + ": " + voxelGrids[i]._isStatic + ": " + voxelGrids[i]._voxelGroup.position.y + "\r");
	}	
}

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
