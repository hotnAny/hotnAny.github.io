var faceNeighbors = [];

function analyzePrintability() {

	/*
		preprocessing #1: creating a neighbor list for each triangle
	*/
	for(var i=0; i<objects.length; i++) {
		if(objects[i].isStatic) {
			createNeighborList(objects[i]);
		}
	}

}

function createNeighborList(obj) {
	
	for(var i=0; i<obj.geometry.faces.length; i++) {
		var f = obj.geometry.faces[i];

		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

		/* use octree to filter close-by faces */
		var elms = obj.ot.search(ctr, 1);

		f.neighbors = [];
		var vlist = [f.a, f.b, f.c];

		for(var j=0; j<elms.length; j++) {
			var ff = elms[j].faces;//.centroid.clone();

			var vlist2 = [ff.a, ff.b, ff.c];

			// skip faces that are geometrically identical to this one
			if(Math.abs(f.a-ff.a) < EPSILON && Math.abs(f.b == ff.b) < EPSILON && Math.abs(f.c == ff.c) < EPSILON) {
				continue;
			}
			
			// searching for pairs of vertices that correspond to the shared edge of neighboring triangles
			var numPairs = 0;
			for(var ii=0; ii<vlist2.length; ii++) {
				for(var jj=0; jj<vlist.length; jj++) {
					if(obj.geometry.vertices[ vlist2[ii] ].distanceTo( 
							 obj.geometry.vertices[ vlist[jj] ]) < EPSILON ) {
						numPairs++;
						break;
					}
				}
			}

			if(numPairs == 2) {
				f.neighbors.push(ff);
			}

		}
	}
}