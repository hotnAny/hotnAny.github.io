/*
	work in progress	
*/
function computeMedialAxis(voxelGrid) {
	var obj = voxelGrid.obj;
	var medialAxis = [];

	// console.log(voxelGrid._interiorVoxels.length);
	for(var idx=0; idx < voxelGrid._interiorVoxels.length; idx++) {

		/* compute its centroid */
		var i = voxelGrid._interiorVoxels[idx].x;
		var j = voxelGrid._interiorVoxels[idx].y;
		var k = voxelGrid._interiorVoxels[idx].z;

		var xctr = voxelGrid._vmin.x + (i+0.5) * voxelGrid._unitSize;
		var yctr = voxelGrid._vmin.y + (j+0.5) * voxelGrid._unitSize;
		var zctr = voxelGrid._vmin.z + (k+0.5) * voxelGrid._unitSize;
		
		var ctr = new THREE.Vector3(xctr, yctr, zctr);

		/* find its closest faces using octree */
		var elms = obj.ot.search(ctr, 0.5);

		/* compute the closest distances */
		var closest1 = INFINITY;
		var closest2 = 0;
		// console.log(elms.length);
		for(var h=0; h<elms.length; h++) {
			var f = elms[h].faces;

			var va = obj.geometry.vertices[f.a].clone();
			var vb = obj.geometry.vertices[f.b].clone();
			var vc = obj.geometry.vertices[f.c].clone();

			var fctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

			var dist = ctr.distanceTo(fctr);

			if(dist < 2) {
				closest2 = closest1 + INFINITY;
				break;
			}

			if(dist < closest1) {
				closest2 = closest1;
				closest1 = dist;
			} else {
				closest2 = Math.min(dist, closest2);
			}			
		}

		// console.log(closest1 + ", " + closest2);
		// break;

		if(Math.abs(closest1 - closest2) < EPSILON) {
			medialAxis.push(new THREE.Vector3(i, j, k));
		}
	}
	console.log((medialAxis.length / voxelGrid._interiorVoxels.length * 100).toFixed(2) + "%");
	voxelGrid.exportVoxels(medialAxis);
	scene.add(voxelGrid._voxelGroup);

}