/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	voxel grid
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var CANON = CANON || {};

CANON.VoxelGrid = function() {
	this._voxels = [];
	this._table = [];
}

CANON.VoxelGrid.prototype = {
	constructor: CANON.VoxelGrid,

	get grid() {
		return this._grid;
	},

	get dim() {
		return this._dim;
	},

	get voxels() {
		return this._voxels;
	},

	get table() {
		return this._table;
	}
};

CANON.VoxelGrid.prototype.load = function(vxgRaw, dim) {
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

CANON.VoxelGrid.prototype.render = function(hideInside) {
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
					removeFromArray(this._voxels, voxel);
					this._table[i][j][k] = undefined;
				}
			} // x
		} // y
	} // z

	log(this._voxels.length + " voxels added.");
}

CANON.VoxelGrid.prototype.updateToMedialAxis = function(axis, node) {
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
			var v = axis.nodesInfo[i].mesh.position;
			var radius = axis.nodesInfo[i].radius;
			// this._grid[index[2]][index[1]][index[0]] = axis.NODE;
			if (radius != undefined) {
				this._addSphericalVoxels(v, radius);
			}
		}

		// for each edge, add voxels along it
		for (var i = axis.edgesInfo.length - 1; i >= 0; i--) {
			var v1 = axis.edgesInfo[i].v1.mesh.position;
			var v2 = axis.edgesInfo[i].v2.mesh.position;
			var pts = axis.edges[i];
			var thickness = axis.edgesInfo[i].thickness; // assume the thickness array has been re-interpolated

			if(thickness == undefined || thickness.length <= 0) {
				continue;
			}

			for (var j = thickness.length - 1; j >= 0; j--) {
				// var k = float2int(j * thickness.length / pts.length);
				var v = v1.clone().multiplyScalar(1 - j * 1.0 / thickness.length).add(
					v2.clone().multiplyScalar(j * 1.0 / thickness.length)
				);
				this._addSphericalVoxels(v, thickness[j]);
			}
		}

		// re-render the voxel grid
		// for (var i = gVoxels.length - 1; i >= 0; i--) {
		// 	scene.remove(gVoxels[i]);
		// }
		this.render(false);
		// axis.renderAxis();
	}
	//
	// only update one node and its associated edges
	//
	else {
		// TODO
	}
}

CANON.VoxelGrid.prototype.hide = function() {
	for (var i = this._voxels.length - 1; i >= 0; i--) {
		scene.remove(this._voxels[i]);
	}
}

CANON.VoxelGrid.prototype.show = function() {
	for (var i = this._voxels.length - 1; i >= 0; i--) {
		scene.add(this._voxels[i]);
	}
}


CANON.VoxelGrid.prototype._onSurface = function(i, j, k) {
	return i * j * k == 0 || (nz - 1 - i) * (ny - 1 - j) * (nx - 1 - k) == 0 ||
		this._grid[i - 1][j][k] != 1 || this._grid[i + 1][j][k] != 1 ||
		this._grid[i][j - 1][k] != 1 || this._grid[i][j + 1][k] != 1 ||
		this._grid[i][j][k - 1] != 1 || this._grid[i][j][k + 1] != 1;
}

CANON.VoxelGrid.prototype._makeVoxel = function(dim, i, j, k, mat, noMargin) {
	var geometry = new THREE.BoxGeometry(dim, dim, dim);
	var voxel = new THREE.Mesh(geometry, mat.clone());

	// leave some margin between voxels
	if (noMargin) {} else {
		dim += 1
	}

	voxel.position.set(i * dim, j * dim, k * dim);

	return voxel;
}

CANON.VoxelGrid.prototype._addSphericalVoxels = function(v, radius) {
	var vxg = this._grid;

	var zmin = float2int((v.z - radius) / this._dim),
		zmax = float2int((v.z + radius) / this._dim),
		ymin = float2int((v.y - radius) / this._dim),
		ymax = float2int((v.y + radius) / this._dim),
		xmin = float2int((v.x - radius) / this._dim),
		xmax = float2int((v.x + radius) / this._dim);
	for (var z = zmin; z < zmax; z++) {
		vxg[z] = vxg[z] == undefined ? [] : vxg[z];
		for (var y = ymin; y < ymax; y++) {
			vxg[z][y] = vxg[z][y] == undefined ? [] : vxg[z][y];
			for (var x = xmin; x < xmax; x++) {
				var v0 = new THREE.Vector3(x, y, z).multiplyScalar(this._dim);
				if (v0.distanceTo(v) <= radius) {
					vxg[z][y][x] = 1;
				}
			}
		}
	}
};