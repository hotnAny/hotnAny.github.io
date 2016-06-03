var gVoxelGrid = [];

function loadVoxels(vxgRaw) {
	var voxelGrid = [];

	// reading voxel info from vxgRaw file object
	var vxgRawSlices = vxgRaw.split('\n\n');
	for (var i = vxgRawSlices.length - 1; i >= 0; i--) {
		var slice = [];
		var vxgRawRows = vxgRawSlices[i].split('\n');
		for (var j = vxgRawRows.length - 1; j >= 0; j--) {
			var row = vxgRawRows[j].split(',');
			// binarize it
			for (var k = row.length - 1; k >= 0; k--) {
				row[k] = row[k] >= 1 ? 1 : 0;
			}
			slice.push(row);
		}
		voxelGrid.push(slice);
	}

	// log(voxelGrid);

	return voxelGrid;
}

function renderVoxels(vxg, dim, hideInside) {
	// by passed a lot of corner case check
	var nz = vxg.length;
	var ny = vxg[0].length;
	var nx = vxg[0][0].length;

	var onSurface = function(i, j, k) {
		return i * j * k == 0 || (nz - 1 - i) * (ny - 1 - j) * (nx - 1 - k) == 0 ||
			vxg[i - 1][j][k] != 1 || vxg[i + 1][j][k] != 1 ||
			vxg[i][j - 1][k] != 1 || vxg[i][j + 1][k] != 1 ||
			vxg[i][j][k - 1] != 1 || vxg[i][j][k + 1] != 1;
	}

	for (var i = 0; i < nz; i++) {
		// EXP: only showing one layer
		for (var j = 0; j < 1; j++) {
			for (var k = 0; k < nx; k++) {
				if (vxg[i][j][k] == 1) {
					if (hideInside != true || onSurface(i, j, k)) {
						var voxel = makeVoxel(dim, k, j, i, MATERIALNORMAL, true);
						scene.add(voxel);
						gVoxels.push(voxel);
					}
				}
			} // x
		} // y
	} // z

	log(gVoxels.length + " voxels added.");
}

function makeVoxel(dim, i, j, k, mat, noMargin) {
	var geometry = new THREE.BoxGeometry(dim, dim, dim);
	var voxel = new THREE.Mesh(geometry, mat.clone());

	// leave some margin between voxels
	if (noMargin) {} else {
		dim += 1
	}

	voxel.position.set((i + 0.5) * dim, (j + 0.5) * dim, (k + 0.5) * dim);

	return voxel;
}

function snapToMedialAxis(vxg, axis) {
	// for each voxel, find the anchoring edge, point and vector

}
