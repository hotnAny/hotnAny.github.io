/* 
	building a voxel grid 
*/
function VoxelGrid(dim, obj) {
	if(!this instanceof VoxelGrid) {
		return new VoxelGrid();
	}	

	obj.geometry.computeBoundingBox();
	this._vmin = obj.geometry.boundingBox.min.clone().applyMatrix4(obj.matrixWorld);
	this._vmax = obj.geometry.boundingBox.max.clone().applyMatrix4(obj.matrixWorld);

	// console.log(this._vmin);
	// console.log(this._vmax);

	var maxEdge = Math.max(Math.max(this._vmax.x - this._vmin.x, this._vmax.y - this._vmin.y), this._vmax.z - this._vmin.z);
	this._unitSize = Math.ceil(maxEdge / (dim <= 0 ? 1 : dim), 1.0);

	// console.log(this._unitSize);

	this._dim = new THREE.Vector3();
	this._dim.x = Math.ceil((this._vmax.x - this._vmin.x) / this._unitSize, 1.0);
	this._dim.y = Math.ceil((this._vmax.y - this._vmin.y) / this._unitSize, 1.0);
	this._dim.z = Math.ceil((this._vmax.z - this._vmin.z) / this._unitSize, 1.0);

	this._markedVoxels = [];

	return this;
}

VoxelGrid.prototype.getVoxelCentroid = function (i, j, k) {
	var xctr = this._vmin.x + i * this._unitSize + this._unitSize / 2;
	var yctr = this._vmin.y + j * this._unitSize + this._unitSize / 2;
	var zctr = this._vmin.z + k * this._unitSize + this._unitSize / 2;

	return new THREE.Vector3(xctr, yctr, zctr);
}

VoxelGrid.prototype.isInThisVoxel = function (p, i, j, k) {
	var xmin = this._vmin.x + i * this._unitSize;
	var ymin = this._vmin.y + j * this._unitSize;
	var zmin = this._vmin.z + k * this._unitSize;

	return xmin <= p.x && p.x <= xmin + this._unitSize &&
		   ymin <= p.y && p.y <= ymin + this._unitSize &&
		   zmin <= p.z && p.z <= zmin + this._unitSize;
}

VoxelGrid.prototype.mark = function (i, j, k) {
	this._markedVoxels.push(new THREE.Vector3(i, j, k));
}

VoxelGrid.prototype.exportMarkedVoxels = function() {
	// var marked = new Array();
	var voxelGroup;
	var x0 = 0, y0 = 0, z0 = 0;

	for(var idx=0; idx < this._markedVoxels.length; idx++) {
		var geometry = new THREE.CubeGeometry(this._unitSize, this._unitSize, this._unitSize);
		// var material = new THREE.MeshBasicMaterial( {color: 0xf0ff0f} );
		var material = new THREE.MeshNormalMaterial( { color: 0xf0ff0f, transparent: true, opacity: 0.5 } );

		var voxel = new Physijs.BoxMesh(geometry, material);

		var i = this._markedVoxels[idx].x;
		var j = this._markedVoxels[idx].y;
		var k = this._markedVoxels[idx].z;

		var xmin = this._vmin.x + i * this._unitSize;
		var ymin = this._vmin.y + j * this._unitSize;
		var zmin = this._vmin.z + k * this._unitSize;

		voxel.position.set(xmin + this._unitSize / 2 - x0, ymin + this._unitSize / 2 - y0, zmin + this._unitSize / 2 - z0);

		// marked.push(voxel);
		if(idx == 0) {
			x0 = voxel.position.x;
			y0 = voxel.position.y;
			z0 = voxel.position.z;
			voxelGroup = voxel;
		} else {
			voxelGroup.add(voxel);
		}
	}

	console.log("effective voxels: " + this._markedVoxels.length);
	return voxelGroup;
}