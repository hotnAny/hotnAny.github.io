/* 
	building a voxel grid 
*/

function VoxelGrid(dim, obj) {
	if(!this instanceof VoxelGrid) {
		return new VoxelGrid();
	}	

	this._name = obj.name;
	this.obj = obj;

	scene.updateMatrixWorld();
	obj.updateMatrixWorld();

	var geom = obj.geometry.clone();
	geom.computeBoundingBox();

	var vmin = geom.boundingBox.min.clone();
	var vmax = geom.boundingBox.max.clone();

	this._vmin = new THREE.Vector3(Math.min(vmin.x, vmax.x), Math.min(vmin.y, vmax.y), Math.min(vmin.z, vmax.z));
	this._vmax = new THREE.Vector3(Math.max(vmin.x, vmax.x), Math.max(vmin.y, vmax.y), Math.max(vmin.z, vmax.z));

	var maxEdge = Math.max(Math.max(this._vmax.x - this._vmin.x, this._vmax.y - this._vmin.y), this._vmax.z - this._vmin.z);
	this._unitSize = Math.ceil(maxEdge / (dim <= 0 ? 1 : dim), 1.0);

	this._dim = new THREE.Vector3();
	this._dim.x = Math.ceil((this._vmax.x - this._vmin.x) / this._unitSize, 1.0);
	this._dim.y = Math.ceil((this._vmax.y - this._vmin.y) / this._unitSize, 1.0);
	this._dim.z = Math.ceil((this._vmax.z - this._vmin.z) / this._unitSize, 1.0);

	this._surfaceVoxels = [];
	this._interiorVoxels = [];
	// this._markedGrid = [];

	// for(var i=0; i<this._dim.x; i++) {
	// 	for(var j=0; j<this._dim.y; j++) {
	// 		for(var k=0; k<this._dim.z; k++) {
	// 			// int idx = i * (this._dim.x * this._dim.y) + j * this._dim.y + k;
	// 			this._markedGrid.push(0);
	// 		}
	// 	}
	// }

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



VoxelGrid.prototype.markSurface = function (i, j, k) {
	/* 
		non grid based approach 
	*/
	this._surfaceVoxels.push(new THREE.Vector3(i, j, k));

	/* 
		grid based approach 
	*/
	// var idx = i * (this._dim.y * this._dim.z) + j * this._dim.z + k;
	// this._markedGrid[idx] = 1;
}


VoxelGrid.prototype.markInterior = function (i, j, k) {
	this._interiorVoxels.push(new THREE.Vector3(i, j, k));
}


VoxelGrid.prototype.voxelizeSurface = function (obj) {

	this._isStatic = obj.isStatic;

	scene.updateMatrixWorld();
	obj.updateMatrixWorld();

	/* using octree for searching potential in-voxel triangles */
	if(obj.ot == undefined) {
		obj.ot = new THREE.Octree({
	          undeferred: false,
	          depthMax: Infinity,
	          scene: scene
	        });
		obj.ot.add(obj, { useFaces: true });
		obj.ot.update();
	} else {
		obj.ot.rebuild();
	}
	// obj.ot.setVisibility(true);

	/* surface-in-cude test */
	obj.geometry.computeFaceNormals();
	for(var i=0; i<this._dim.x; i++) {
		for(var j=0; j<this._dim.y; j++) {
			for(var k=0; k<this._dim.z; k++) {

				var ctr = this.getVoxelCentroid(i, j, k);
				var elms = obj.ot.search(ctr, 0.5);
				
				/* use octree search result */
				for(var h=0; h<elms.length; h++) {
				
				/* alternative: search through all faces */
				// for(var h=0; h<obj.geometry.faces.length; h++) {
					
					/* face centroid */					
					var v = elms[h].faces.centroid.clone();
					// var v = obj.geometry.faces[i].centroid.clone();

					/* not used now: aligning the voxels to the obj's current pos/ori*/
					// v.applyMatrix4(obj.matrixWorld);

					/* if a face center is in this voxel, include this voxel */
					if(this.isInThisVoxel(v, i, j, k)) {
						this.markSurface(i, j, k);
						break;
					} 
					/* otherwise test the case where a triangle might span multiple voxels */
					else {
						/* faces and their vertices */

						// var f = obj.geometry.faces[h];
						var f = elms[h].faces;

						var va = obj.geometry.vertices[f.a].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
						var vb = obj.geometry.vertices[f.b].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
						var vc = obj.geometry.vertices[f.c].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);

						// var nml1 = f.normal.clone().applyMatrix4(obj.matrixWorld);
						var nml1 = new THREE.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va));
						var nml2 = new THREE.Vector3().crossVectors(vc.clone().sub(vb), va.clone().sub(vb));
						var nml3 = new THREE.Vector3().crossVectors(va.clone().sub(vc), vb.clone().sub(vc));

						////////////////////////////////////////////////////////////////////////////////////////////////////////////
						/* 
							the SAT approach, just another approach 
						*/

						var xmin = this._vmin.x + i * this._unitSize;
						var ymin = this._vmin.y + j * this._unitSize;
						var zmin = this._vmin.z + k * this._unitSize;

						var bbox = new Object();
						bbox.min = new THREE.Vector3(xmin, ymin, zmin);
						bbox.max = new THREE.Vector3(xmin + this._unitSize, ymin + this._unitSize, zmin + this._unitSize);
						// var nml = f.normal.clone();
						if(	testTriBoxIntersection(va, vb, vc, nml1, bbox)
							|| testTriBoxIntersection(va, vb, vc, nml2, bbox)
							|| testTriBoxIntersection(va, vb, vc, nml3, bbox)) {
							this.markSurface(i, j, k);
							break;
						}

						////////////////////////////////////////////////////////////////////////////////////////////////////////////
						/* 
							calculating the intersecting point between |v1v2| and the plane of the elms[i].face 
							ref: http://geomalgorithms.com/a06-_intersect-2.html
						*/

						// var v1 = ctr.clone();
						// var v2 = ctr.clone().add(nml);
						// var denominator = nml.dot(new THREE.Vector3().subVectors(v2, v1));

						// if(denominator == 0) {
						// 	continue;
						// }

						// var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / denominator;
						// var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

						// /* find out if the intersecting point is i) between v1 and v2; and ii) inside the triangle */
						// if(isInTriangle(pr, va, vb, vc) && ctr.distanceTo(pr) < this._unitSize / 2) {
						// 	this.mark(i, j, k);
						// 	break;
						// }
					}
				} /* end of octree search */

				hasShwonNormals = true;
			}
		}
	}

	this.exportVoxels(this._surfaceVoxels);

	/* add (or don't add) the voxels to the scene immediately */	
	// scene.add(this._voxelGroup);
}


/*
	this assumes the surface has already been voxelized
*/
VoxelGrid.prototype.voxelizeInterior = function(obj) {
	// var dir = new THREE.Vector3(0, 1, 0);

	for(var i=1; i<this._dim.x-1; i++) {
		for(var j=1; j<this._dim.y-1; j++) {
			for(var k=1; k<this._dim.z-1; k++) {

				var numXingSurfaces = [0, 0, 0, 0, 0, 0];
				for(var idx=0; idx<this._surfaceVoxels.length; idx++) {
					var ii = this._surfaceVoxels[idx].x;
					var jj = this._surfaceVoxels[idx].y;
					var kk = this._surfaceVoxels[idx].z;

					// var voxel = new THREE.Vector3(i, j, k);
					// if(voxel.distanceTo(this._surfaceVoxels[idx]) <= 1) {
					// 	numXingSurfaces = undefined;
					// 	break;
					// }

					numXingSurfaces[0] += (ii==i && kk==k && jj > j) ? 1 : 0;
					numXingSurfaces[1] += (ii==i && kk==k && jj < j) ? 1 : 0;
					numXingSurfaces[2] += (ii==i && jj==j && kk > k) ? 1 : 0;
					numXingSurfaces[3] += (ii==i && jj==j && kk < k) ? 1 : 0;
					numXingSurfaces[4] += (kk==k && jj==j && ii > i) ? 1 : 0;
					numXingSurfaces[5] += (kk==k && jj==j && ii < i) ? 1 : 0;
				}

				// console.log(numXingSurfaces);

				// if(numXingSurfaces % 2 == 1) {
				// 	this.markInterior(i, j, k);
				// }

				// if(numXingSurfaces == undefined) {
				// 	continue;
				// }

				var cntOddXing = 0;
				for(var dir=0; dir<numXingSurfaces.length; dir++) {
					if(numXingSurfaces[dir] % 2 == 1) {
						cntOddXing++;
					}
				}

				if(cntOddXing > numXingSurfaces.length/2) {
					this.markInterior(i, j, k);
				}

			} // outer k
		} // outer j
	} // outer i

	// this.exportVoxels(this._interiorVoxels);
}


VoxelGrid.prototype.exportVoxels = function(voxels) {
	// var marked = new Array();
	// var voxelGroup;
	var x0 = 0, y0 = 0, z0 = 0;

	timeStamp();

	/* 
		non grid based approach 
	*/
	
	this._voxelGroup = undefined;

	/* center piece zero dim */
	// var geometry = new THREE.CubeGeometry(this._unitSize, this._unitSize, this._unitSize);
	var geometry = new THREE.SphereGeometry(this._unitSize, 8, 8);
	
	// var geometrySmall = new THREE.CubeGeometry(0, 0, 0);
	var geometrySmall = new THREE.SphereGeometry(0.00001, 8, 8);
	var material = new THREE.MeshBasicMaterial( {color: (this.obj.isStatic ? 0xf00f0f : 0x0ff0f0), transparent: true, opacity: 0.25} );
	for(var idx=-1; idx < voxels.length; idx++) {
		
		var geom = idx >= 0 ? geometry : geometrySmall;
		var weight = this.obj.isStatic ? 10 : 0;
		
		//var voxel = new Physijs.BoxMesh(geom, material, weight);
		var voxel = new Physijs.SphereMesh(geom, material, weight);
		
		if(idx >= 0) {
			var i = voxels[idx].x;
			var j = voxels[idx].y;
			var k = voxels[idx].z;

			var xmin = this._vmin.x + i * this._unitSize;
			var ymin = this._vmin.y + j * this._unitSize;
			var zmin = this._vmin.z + k * this._unitSize;
			voxel.position.set(xmin + this._unitSize / 2 - x0, ymin + this._unitSize / 2 - y0, zmin + this._unitSize / 2 - z0);
			this._voxelGroup.add(voxel);
		} else {
			x0 = this._vmin.x + this._dim.x / 2 * this._unitSize;
			y0 = this._vmin.y + this._dim.y / 2 * this._unitSize;
			z0 = this._vmin.z + this._dim.z / 2 * this._unitSize;

			voxel.position.set(x0, y0, z0);
			// console.log(voxel.position);
			this._voxelGroup = voxel;
		}

		
	}

	this._voxelGroup.name = this.obj.name + "_voxelized";
	log(this._name + ": " + voxels.length + " voxels, computed in " + timeStamp() + " msec");

	// console.log(this._voxelGroup);
	// console.log(this._voxelGroup.children[0]);

	return this._voxelGroup;
}



VoxelGrid.prototype.selfRemove = function() {
	// for(var i=0; i<this._voxelGroup.children; i++) {
	// 	scene.remove(this._voxelGroup.children[i]);
	// }
	scene.remove(this._voxelGroup);
}