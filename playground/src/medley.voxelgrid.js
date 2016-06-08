/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	voxel grid
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

MEDLEY.VoxelGrid = function() {
	this._voxels = [];
	this._table = [];
}

MEDLEY.VoxelGrid.prototype = {
	constructor: MEDLEY.VoxelGrid
};

MEDLEY.VoxelGrid.prototype.load = function(vxgRaw, dim) {
	this._grid = [];
	this._dim = dim;

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
		this._grid.push(slice);
	}

	return this._grid;
}

MEDLEY.VoxelGrid.prototype.render = function(hideInside) {
	var nz = this._grid.length;
	var ny = this._grid[0].length;
	var nx = this._grid[0][0].length;

	for (var i = 0; i < nz; i++) {
		this._table[i] = this._table[i] == undefined ? [] : this._table[i];
		// EXP: only showing one layer
		for (var j = 0; j < 1; j++) {
			this._table[i][j] = this._table[i][j] == undefined ? [] : this._table[i][j];
			// var row = [];
			for (var k = 0; k < nx; k++) {
				// row[k] = undefined;
				if (this._grid[i][j][k] == 1 && this._table[i][j][k] == undefined) {
					if (hideInside != true || this._onSurface(i, j, k)) {
						var voxel = this._makeVoxel(this._dim, k, j, i, MATERIALNORMAL, true);
						voxel.index = [k, j, i];
						scene.add(voxel);
						// row[k] = voxel;
						// this._grid[i][j][k].idxMesh = gVoxels.length; // store the voxel's index in gVoxels
						this._voxels.push(voxel);
						this._table[i][j][k] = voxel;
					}
				} else if (this._grid[i][j][k] != 1 && this._table[i][j][k] != undefined) {
					var voxel = this._table[i][j][k];
					scene.remove(voxel);
					removeFromArray(gVoxels, voxel);
					this._table[i][j][k] = undefined;
				}
			} // x
		} // y
	} // z

	log(this._voxels.length + " voxels added.");
}

MEDLEY.VoxelGrid.prototype.updateToMedialAxis = function(axis) {
	//
	// update the entire voxel grid based on the axis
	//
	if (node == undefined) {
		// clear existing voxels
		var nz = this._grid.length;
		var ny = this._grid[0].length;
		var nx = this._grid[0][0].length;

		for (var i = 0; i < nz; i++) {
			// EXP: only deal with 2D for now
			for (var j = 0; j < 1; j++) {
				for (var k = 0; k < nx; k++) {
					this._grid[i][j][k] = 0;
				}
			}
		}

		// for each node, add voxels around it
		for (var i = axis.nodesInfo.length - 1; i >= 0; i--) {
			var index = axis.nodesInfo[i].index;
			var radius = axis.nodesInfo[i].radius;
			this._grid[index[2]][index[1]][index[0]] = axis.NODE;
			if (radius != undefined) {
				addSphericalVoxels(this._grid, index, radius);
			}
		}

		// for each edge, add voxels along it
		for (var i = axis.edgesInfo.length - 1; i >= 0; i--) {
			var v1 = axis.edgesInfo[i].v1;
			var v2 = axis.edgesInfo[i].v2;
			var pts = axis.edges[i];
			var thickness = axis.edgesInfo[i].thickness; // assume the thickness array has been re-interpolated

			for (var j = pts.length - 1; j >= 0; j--) {
				var k = float2int(j * thickness.length / pts.length);
				addSphericalVoxels(this._grid, pts[j].index, thickness[k]);
			}
		}

		// re-render the voxel grid
		// for (var i = gVoxels.length - 1; i >= 0; i--) {
		// 	scene.remove(gVoxels[i]);
		// }
		renderVoxels(vxg, dim, true);
		axis.renderAxis();
	}
	//
	// only update one node and its associated edges
	//
	else {
		// TODO
	}
}


MEDLEY.VoxelGrid.prototype.grid = function() {
	return this._grid;
}

MEDLEY.VoxelGrid.prototype.dim = function() {
	return this._dim;
}

MEDLEY.VoxelGrid.prototype.voxels = function() {
	return this._voxels;
}

MEDLEY.VoxelGrid.prototype.table = function() {
	return this._table;
}

MEDLEY.VoxelGrid.prototype._onSurface = function(i, j, k) {
	return i * j * k == 0 || (nz - 1 - i) * (ny - 1 - j) * (nx - 1 - k) == 0 ||
		this._grid[i - 1][j][k] != 1 || this._grid[i + 1][j][k] != 1 ||
		this._grid[i][j - 1][k] != 1 || this._grid[i][j + 1][k] != 1 ||
		this._grid[i][j][k - 1] != 1 || this._grid[i][j][k + 1] != 1;
}

MEDLEY.VoxelGrid.prototype._makeVoxel = function(dim, i, j, k, mat, noMargin) {
	var geometry = new THREE.BoxGeometry(dim, dim, dim);
	var voxel = new THREE.Mesh(geometry, mat.clone());

	// leave some margin between voxels
	if (noMargin) {} else {
		dim += 1
	}

	voxel.position.set((i + 0.5) * dim, (j + 0.5) * dim, (k + 0.5) * dim);

	return voxel;
}

MEDLEY.VoxelGrid.prototype._addSphericalVoxels = function(vxg, index, radius) {
	var zmin = float2int(index[2] - radius),
		zmax = float2int(index[2] + radius),
		ymin = float2int(index[1] - radius),
		ymax = float2int(index[1] + radius),
		xmin = float2int(index[0] - radius),
		xmax = float2int(index[0] + radius);
	for (var z = zmin; z < zmax; z++) {
		vxg[z] = vxg[z] == undefined ? [] : vxg[z];
		for (var y = ymin; y < ymax; y++) {
			vxg[z][y] = vxg[z][y] == undefined ? [] : vxg[z][y];
			for (var x = xmin; x < xmax; x++) {
				if (getDist([x, y, z], index) <= radius) {
					vxg[z][y][x] = 1;
				}
			}
		}
	}
};