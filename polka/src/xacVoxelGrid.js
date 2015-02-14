/* 
	building a voxel grid 
*/
function VoxelGrid(dim, obj) {
	if(!this instanceof VoxelGrid) {
		return new VoxelGrid();
	}	

	this._name = obj.name;

	obj.geometry.computeBoundingBox();
	var vmin = obj.geometry.boundingBox.min.clone().applyMatrix4(obj.matrixWorld);
	var vmax = obj.geometry.boundingBox.max.clone().applyMatrix4(obj.matrixWorld);

	this._vmin = new THREE.Vector3(Math.min(vmin.x, vmax.x), Math.min(vmin.y, vmax.y), Math.min(vmin.z, vmax.z));
	this._vmax = new THREE.Vector3(Math.max(vmin.x, vmax.x), Math.max(vmin.y, vmax.y), Math.max(vmin.z, vmax.z));

	var maxEdge = Math.max(Math.max(this._vmax.x - this._vmin.x, this._vmax.y - this._vmin.y), this._vmax.z - this._vmin.z);
	this._unitSize = Math.ceil(maxEdge / (dim <= 0 ? 1 : dim), 1.0);

	// console.log(this._unitSize);

	this._dim = new THREE.Vector3();
	this._dim.x = Math.ceil((this._vmax.x - this._vmin.x) / this._unitSize, 1.0);
	this._dim.y = Math.ceil((this._vmax.y - this._vmin.y) / this._unitSize, 1.0);
	this._dim.z = Math.ceil((this._vmax.z - this._vmin.z) / this._unitSize, 1.0);

	this._markedVoxels = [];
	this._markedGrid = [];

	for(var i=0; i<this._dim.x; i++) {
		for(var j=0; j<this._dim.y; j++) {
			for(var k=0; k<this._dim.z; k++) {
				// int idx = i * (this._dim.x * this._dim.y) + j * this._dim.y + k;
				this._markedGrid.push(0);
			}
		}
	}

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
	/* 
		non grid based approach 
	*/
	this._markedVoxels.push(new THREE.Vector3(i, j, k));

	/* 
		grid based approach 
	*/
	// var idx = i * (this._dim.y * this._dim.z) + j * this._dim.z + k;
	// this._markedGrid[idx] = 1;
}


VoxelGrid.prototype.exportMarkedVoxels = function(isStatic) {
	// var marked = new Array();
	// var voxelGroup;
	var x0 = 0, y0 = 0, z0 = 0;

	timeStamp();

	/* 
		non grid based approach 
	*/
	for(var idx=0; idx < this._markedVoxels.length; idx++) {
		var geometry = new THREE.CubeGeometry(this._unitSize, this._unitSize, this._unitSize);
		var material = new THREE.MeshBasicMaterial( {color: (isStatic ? 0xf00f0f : 0x0ff0f0), transparent: true, opacity: 0.25} );
		// var material = new THREE.MeshNormalMaterial( { color: 0xff0000, transparent: true, opacity: 0.5 } );

		var voxel = isStatic ? new Physijs.BoxMesh(geometry, material, 0) : new Physijs.BoxMesh(geometry, material, 10);

		voxel.setDamping(100, 100);

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
			this._voxelGroup = voxel;
		} else {
			this._voxelGroup.add(voxel);
		}
	}

	log(this._name + ": " + this._markedVoxels.length + " voxels, computed in " + timeStamp() + " msec");

	// console.log(this._voxelGroup);
	// console.log(this._voxelGroup.children[0]);

	return this._voxelGroup;
}

VoxelGrid.prototype.sliceToHeight = function(height) {

	scene.updateMatrixWorld();
	this._voxelGroup.updateMatrixWorld();

	var geometry = new THREE.CubeGeometry(this._unitSize, this._unitSize, this._unitSize);
				var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent: true, opacity: 0.25} );
				var voxelGroupNew = new Physijs.BoxMesh(geometry, material, 0);
				voxelGroupNew.position = this._voxelGroup.position;
	// var voxelGroupNew;// = this._voxelGroup.clone();
	// voxelGroupNew.children.splice[0, voxelGroupNew.children.length];
	
	var childrenBelow = new Array();
	for(var j=0; j<this._voxelGroup.children.length; j++) {
		
		var pos = new THREE.Vector3().getPositionFromMatrix(this._voxelGroup.children[j].matrixWorld);//.add(this._voxelGroup.position);
		// var pos = new this._voxelGroup.children[j].position.clone().add(this._voxelGroup.position);
		// console.log(pos);
		if(pos.y + this._unitSize / 2 <= height ) {

			childrenBelow.push(this._voxelGroup.children[j]);
			this._voxelGroup.children[j].material = new THREE.MeshBasicMaterial( {color: 0xf0ff0f, transparent: true, opacity: 0.50} );

			// this._voxelGroup.children[j].position.y += 10;
			voxelGroupNew.add(this._voxelGroup.children[j].clone());
			// if(voxelGroupNew == undefined) {
			// 	//this._voxelGroup.children[j].clone();
			// } else {
				
			// }
		} else {
			// this._voxelGroup.children[j].material = new THREE.MeshBasicMaterial( {color: 0x444444, transparent: true, opacity: 0.05} );
		}

		// scene.remove(this._voxelGroup.children[j]);
	}

	// this._voxelGroup.children.splice(0, this._voxelGroup.children.length);
	// console.log(this._voxelGroup.children.length);

	for(var i=0; i<childrenBelow.length; i++) {
		// var idx = childrenBelow[i];
		// this._voxelGroup.children[idx].material = new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent: true, opacity: 0.25} );
		// this._voxelGroup.remove(childrenBelow[i]);
		// scene.remove(childrenBelow[i]);
		voxelGroupNew.add(childrenBelow[i]);
	}

	scene.remove(this._voxelGroup);
	scene.add(voxelGroupNew);
	this._voxelGroup = voxelGroupNew;
}