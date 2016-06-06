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

	return voxelGrid;
}

//
// TODO: fix gVoxels, gVoxelGrid, gVoxelTable
//
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
		var slice = [];
		// EXP: only showing one layer
		for (var j = 0; j < 1; j++) {
			var row = [];
			for (var k = 0; k < nx; k++) {
				row[k] = undefined;
				if (vxg[i][j][k] == 1) {
					if (hideInside != true || onSurface(i, j, k)) {
						var voxel = makeVoxel(dim, k, j, i, MATERIALNORMAL, true);
						voxel.index = [k, j, i];
						scene.add(voxel);
						row[k] = voxel;
						// vxg[i][j][k].idxMesh = gVoxels.length; // store the voxel's index in gVoxels
						gVoxels.push(voxel);
					}
				}
			} // x
			slice.push(row);
		} // y
		gVoxelTable.push(slice);
	} // z

	log(gVoxels.length + " voxels added.");
}

function renderMedialAxis(axis, vxg) {

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

function snapToMedialAxis(vxg, axis, dim) {

	if (!axis.isVoxelized) {
		//
		// for each voxel, find the anchoring edge
		//
		var nz = vxg.length;
		var ny = vxg[0].length;
		var nx = vxg[0][0].length;

		var nearestMedialAxis = [];

		for (var i = 0; i < nz; i++) {
			var slice = [];
			for (var j = 0; j < 1; j++) {
				var row = [];
				for (var k = 0; k < nx; k++) {
					if (vxg[i][j][k] == 1) {
						snapVoxelToMediaAxis(k, j, i, axis, dim);
					} // voxel
				} // x
			} // y
		} // z
	}

	//
	// revoxelize based on media axis
	//
	updateVoxels(vxg, dim, axis);
}

//
//
//
function snapVoxelToMediaAxis(kx, jy, iz, axis, dim) {
	var k = kx,
		j = jy,
		i = iz;
	var edgeMin = -1;
	var distMin = Number.MAX_VALUE;

	//
	// snap to edge
	//
	for (var h = axis.edgesInfo.length - 1; h >= 0; h--) {
		var v1 = axis.edgesInfo[h].v1.index;
		var v2 = axis.edgesInfo[h].v2.index;

		// if (isProjectionInBetween(k, j, i, v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]) {
		var dist = p2ls(k, j, i, v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]);
		if (!isNaN(dist) && dist < distMin) {
			edgeMin = h;
			distMin = dist;
		}
	}

	//
	// snap to node
	//
	var nodeMin = -1;
	if (distMin == Number.MAX_VALUE) {
		for (var h = axis.nodesInfo.length - 1; h >= 0; h--) {
			var dist = getDist([k, j, i], axis.nodesInfo[h].index);
			if (dist < distMin) {
				nodeMin = h;
				distMin = dist;
			}
		}
	} else {
		var v1 = axis.edgesInfo[edgeMin].v1.index;
		var v2 = axis.edgesInfo[edgeMin].v2.index;
		var vmid = new THREE.Vector3(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]).multiplyScalar(0.5 * dim);
		addALine(new THREE.Vector3(k, j, i).multiplyScalar(dim), vmid);
		return;
	}

	var v = axis.nodesInfo[nodeMin].index;
	addALine(new THREE.Vector3(k, j, i).multiplyScalar(dim), new THREE.Vector3(v[0], v[1], v[2]).multiplyScalar(dim));
}

//
//
//
function updateVoxels(vxg, dim, axis, node) {
	//
	// update the entire voxel grid based on the axis
	//
	if (node == undefined) {
		// clear existing voxels
		var nz = vxg.length;
		var ny = vxg[0].length;
		var nx = vxg[0][0].length;

		for (var i = 0; i < nz; i++) {
			// EXP: only deal with 2D for now
			for (var j = 0; j < 1; j++) {
				for (var k = 0; k < nx; k++) {
					vxg[i][j][k] = 0;
				}
			}
		}

		// for each node, add voxels around it
		for (var i = axis.nodesInfo.length - 1; i >= 0; i--) {
			var index = axis.nodesInfo[i].index;
			var radius = axis.nodesInfo[i].radius;
			vxg[index[2]][index[1]][index[0]] = NODE;
			if (radius != undefined) {
				// TODO
				addSphericalVoxels(index, radius);
			}
		}

		// for each edge, add voxels along it
		for (var i = axis.edgesInfo.length - 1; i >= 0; i--) {
			var v1 = axis.edgesInfo[i].v1;
			var v2 = axis.edgesInfo[i].v2;
			var pts = axis.edges[i];
			var thickness = axis.edgesInfo[i].thickness; // assume the thickness array has been re-interpolated

			for (var j = pts.length - 1; j >= 0; j--) {
				// TODO
				addCylindricalVoxels(pts[j].index, thickness[j])
			}
		}

		// re-render the voxel grid
		renderVoxels(vxg, dim, true);
	}
	//
	// only update one node and its associated edges
	//
	else {
		// TODO
	}

}