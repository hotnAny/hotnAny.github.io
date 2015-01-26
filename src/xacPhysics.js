var DIMVOXELS = 32;


/*
	voxelizing predefined objects
*/
function voxelize() {
	voxelizeObject(objects[0]);
	voxelizeObject(objects[1]);
}

/*
	voxelizing an object, using cubes to represent the surface
*/
function voxelizeObject(obj) {

	var voxels = new Array();

	/* building a voxel grid */
	var voxelGrid = new VoxelGrid(DIMVOXELS, obj);

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

	/* octree search */
	/* surface-in-cude test */

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
					var ctr = elms[h].faces.centroid.clone();
					ctr.applyMatrix4(obj.matrixWorld);

					if(voxelGrid.isInThisVoxel(ctr, i, j, k)) {
						voxelGrid.mark(i, j, k);
						break;
					}
				}
			}
		}
	}

	// var voxels = voxelGrid.exportMarkedVoxels();
	// console.log(voxels.length);
	scene.remove(obj);
	scene.add(voxelGrid.exportMarkedVoxels());
	// for(var idx=0; idx < voxels.length; idx++) {
	// 	scene.add(voxels[idx]);
	// }
	
}
