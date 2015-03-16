/*
	assess the printablity of an object by the following metrics:
		[x] flatness
		[x] stability
		[x] occlusion
		[ ] strength
*/

// TODO: try to remember what these two are
var faceNeighbors = [];

var neighbors;	// neighbors of a particular face, used in both mouse selection and whole-object search

var wfla = 0.25;
var wsta = 0.25;
var wocc = 0.50;
var wstr = 0;

var TOSHOWHEATMAP = false;

/*
	analyze printability by computing scores across several criteria
*/
function analyzePrintability() {

	for(var i=0; i<objects.length; i++) {
		var obj = objects[i];

		if(obj.isStatic) {
			/*
				preprocessing #1: creating a neighbor list for each triangle
			*/
			if(obj.neighbors == undefined) {
				createNeighborList(obj);
			}

			timeStamp();
			console.log("analyzing printablity ...")
			/* remember to reset face.collected to false */
			var maxScore = -INFINITY;
			for(var i=0; i<obj.geometry.faces.length; i++) {
				var f = obj.geometry.faces[i];

				var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
				var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
				var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

				var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

				neighbors = [f]; // need to check if this f is out of bound
				findNeighbors(obj, f, ctr, radiusHandle, neighbors, 2);


				/* -----------------------------------------------------------------------------
					flatness assessment
				*/

				var nmlStats = assessFlatness(obj, neighbors);
				var flatness = nmlStats.sd / 180; // normalize
				

				/* ----------------------------------------------------------------------------- 
					occlusion assessment
				*/
				var stability = assessStability(obj, neighbors, radiusHandle);		// percentage unsupported
				
				
				/* ----------------------------------------------------------------------------- 
					for occlusion assessment
				*/
				var yUp = new THREE.Vector3(0, 1, 0);
				var angleToRotate = nmlStats.mean.angleTo(yUp);
				var axisToRotate = new THREE.Vector3().crossVectors(nmlStats.mean, yUp).normalize();

				var theta = 15 * Math.PI / 180;
				var occlusion = assessOcclusion(obj, neighbors, axisToRotate, angleToRotate, theta);
				
				var score = flatness * wfla + stability * wsta + occlusion * wocc;
				f.score = score;
				maxScore = Math.max(score, maxScore);
				// console.log(score);

			}
			console.log("done, in " + timeStamp() + " msec.");

			if(TOSHOWHEATMAP) {
				// var colorSchemes = [0xd7191c, 0xfdae61, 0xffffbf, 0xa6d96a, 0x1a9641];
				var colorSchemes = [0x1a9850, 0x91cf60, 0xd9ef8b, 0xffffbf, 0xfee08b, 0xfc8d59, 0xd73027];

				for(var i=0; i<obj.geometry.faces.length; i++) {

					var f = obj.geometry.faces[i];
					var color = new THREE.Color( 0xffffff );
					f.color = color;

					var neighborWeight = 0.25;
					var scoreNeighbors = 0;
					var score = f.score;

					/* average the value from its neighbors */
					for(var k=0; k<f.neighbors.length; k++) {
						scoreNeighbors += f.neighbors[k].score;
					}
					score = (1 - neighborWeight) * f.score + neighborWeight * scoreNeighbors / f.neighbors.length;

					for(var j=0; j<colorSchemes.length; j++) {	
						if(score <= maxScore * (j+1) / colorSchemes.length) {
							color.setHex(colorSchemes[j]);
							break;
						}	
					}

					var faceIndices = ['a', 'b', 'c', 'd'];  
					var numberOfSides = ( f instanceof THREE.Face3 ) ? 3 : 4;

					/* assign color to each vertex of current face */
					for( var j = 0; j < numberOfSides; j++ )  
					{
					    f.vertexColors[ j ] = color;
					}
				}
				scene.add(obj);
			}
		}
	}
}



/*
	creating a list of neighbours (edge sharing) for each triangle

	known issues: 
	- each triangle should have exactly 3 neighbors. however, some have 4 due to triangle redundance; some have only 2 due to unmanifold structure
*/
function createNeighborList(obj) {
	timeStamp();
	console.log("creating neighbor list ...");

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

		// for later use - finding neighbors
		f.collected = false;

		f.area = triangleArea(va, vb, vc);

		for(var j=0; j<elms.length; j++) {
			var ff = elms[j].faces;//.centroid.clone();

			var vlist2 = [ff.a, ff.b, ff.c];

			// skip the face itself
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

			/* when there are two pairs of them, this is a neighbor that shares exactly one edge */
			if(numPairs == 2) {
				f.neighbors.push(ff);
			}

		}
	}

	console.log("done, in " + timeStamp() + " msec.");
}



/*
	
*/
function findNeighbors(obj, f, ctr, r, neighbors) {

	if(f.neighbors == undefined) {
		createNeighborList(obj);
	}

	for(var i=0; i<f.neighbors.length; i++) {
		var ff = f.neighbors[i];
		var vaa = obj.geometry.vertices[ff.a].clone().applyMatrix4(obj.matrixWorld);
		var vbb = obj.geometry.vertices[ff.b].clone().applyMatrix4(obj.matrixWorld);
		var vcc = obj.geometry.vertices[ff.c].clone().applyMatrix4(obj.matrixWorld);

		var ctr2 = new THREE.Vector3().addVectors(vaa, vbb).add(vcc).divideScalar(3);

		/* if this face has not been collected and
			its entirety lies in the radius */
		if(ff.collected == false && 
			vaa.distanceTo(ctr) < r && vbb.distanceTo(ctr) < r && vcc.distanceTo(ctr) < r) {
			neighbors.push(ff);
			ff.collected = true;
			// addATriangle(vaa, vbb, vcc, 0xffff00);

			/* recursively find more neighbors */
			findNeighbors(obj, ff, ctr, r, neighbors);
		}
	}
}



/*
	assess the flatness of the neighborhood
*/
function assessFlatness(obj, neighbors) {

	/* 
		compute normals 
	*/
	var normals = [];
	for(var i=0; i<neighbors.length; i++) {
		var ff = neighbors[i];

		var vaa = obj.geometry.vertices[ff.a].clone().applyMatrix4(obj.matrixWorld);
		var vbb = obj.geometry.vertices[ff.b].clone().applyMatrix4(obj.matrixWorld);
		var vcc = obj.geometry.vertices[ff.c].clone().applyMatrix4(obj.matrixWorld);

		var nml = new THREE.Vector3().crossVectors(
				new THREE.Vector3().subVectors(vbb, vaa),
				new THREE.Vector3().subVectors(vcc, vaa)
			);
		normals.push(nml);
	}


	/* 
		compute mean
	*/
	var nmlMean = new THREE.Vector3();
	for(var i=0; i<normals.length; i++) {
		nmlMean.add(normals[i]);
	}
	nmlMean.divideScalar(normals.length);


	/* 
		compute standard deviation 
	*/
	var nmlSd = 0;
	if(normals.length > 1) {
		for(var i=0; i<normals.length; i++) {
			nmlSd += Math.pow((normals[i].angleTo(nmlMean)), 2);
		}
		nmlSd = Math.sqrt(nmlSd / (normals.length - 1));
	}


	var nmlStats = new Object();
	nmlStats.mean = nmlMean;
	nmlStats.sd = nmlSd * 180 / Math.PI;		// translated to angle, for better readability
	
	return nmlStats;
}



/*
	assess stability, i.e., how much of the area is actually supporting the handle
*/
function assessStability(obj, neighbors, r) {
	var areaTotal = 0;

	for(var i=0; i<neighbors.length; i++) {
		// TODO: test ff.area
		
		var ff = neighbors[i];

		// var vaa = obj.geometry.vertices[ff.a].clone().applyMatrix4(obj.matrixWorld);
		// var vbb = obj.geometry.vertices[ff.b].clone().applyMatrix4(obj.matrixWorld);
		// var vcc = obj.geometry.vertices[ff.c].clone().applyMatrix4(obj.matrixWorld);

		// var area = triangleArea(vaa, vbb, vcc);

		areaTotal += ff.area;
	}

	return 1 - Math.min(1, areaTotal / (Math.PI * r * r));
}



/*
	assess occlusion, the percentage of the triangles that will have the print head hit the object while being printed
*/
function assessOcclusion(obj, neighbors, axis, angle, theta, radius) {
	var areaTotal = 0;
	var areaOccluding = 0;

	for(var i=0; i<neighbors.length; i++) {
		var ff = neighbors[i];

		var vaa = obj.geometry.vertices[ff.a].clone().applyMatrix4(obj.matrixWorld);
		var vbb = obj.geometry.vertices[ff.b].clone().applyMatrix4(obj.matrixWorld);
		var vcc = obj.geometry.vertices[ff.c].clone().applyMatrix4(obj.matrixWorld);

		var ctr2 = new THREE.Vector3().addVectors(vaa, vbb).add(vcc).divideScalar(3);

		var area = triangleArea(vaa, vbb, vcc);

		var subNeighbors = [ff];
		findNeighbors(obj, ff, ctr2, radius, subNeighbors);

		for(var j=0; j<subNeighbors.length; j++) {
			var fff = subNeighbors[j];

			var vaaa = obj.geometry.vertices[fff.a].clone().applyMatrix4(obj.matrixWorld);
			var vbbb = obj.geometry.vertices[fff.b].clone().applyMatrix4(obj.matrixWorld);
			var vccc = obj.geometry.vertices[fff.c].clone().applyMatrix4(obj.matrixWorld);

			var nml = new THREE.Vector3().crossVectors(
				new THREE.Vector3().subVectors(vbbb, vaaa),
				new THREE.Vector3().subVectors(vccc, vaaa)
			);

			/* how this normal will look like after we rotate the object upright */
			var nmlRotated = nml.clone().applyAxisAngle(axis, angle);

			/* to not occlude the print head, angle to Y up must be smaller than theta */
			var angleWithY = nmlRotated.angleTo(new THREE.Vector3(0, 1, 0));

			if(angleWithY > theta) {
				areaOccluding += area;
				ff.occluding = true;
				// addATriangle(vaa, vbb, vcc, 0xff0000);
				break;
			}
		}
				
		areaTotal += area;
	}

	return areaOccluding / areaTotal;
}