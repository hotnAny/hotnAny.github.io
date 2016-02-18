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


// printability
// var wPrintability = 0.50;

// attachability
var wAttachability = 0.5;
	var wfla = 0.50;
	var wsup = 0.50;

// usability
var wUsability = 0.5;
	var wbal = 0.5;
// var wvis = 0.5;
	var wstr = 0.5;
// var wStrength = 0.0;

// var TOSHOWHEATMAP = true;


// function analyzeAttachmentMethod() {
// 	if(attachmentMethod == ADHERE) {
// 		analyzeAdhereMethod();
// 	} else if(attachmentMethod == STRAP) {
// 		analyzeStrapMethod(objStatic, facesToStrapOn);
// 	} else if(attachmentMethod == INTERLOCK) {
// 		makeInterlockPrintable();
// 	}
// }


function getColorFromScore(score, maxScore) {
	var colorSchemes = [0xd7191c, 0xfdae61, 0xffffbf, 0xa6d96a, 0x1a9641];
	var color = new THREE.Color( 0xffffff );
	for(var k=0; k<colorSchemes.length; k++) {	
		if(score <= maxScore * (k+1) / colorSchemes.length) {
			color.setHex(colorSchemes[k]);
			break;
		}	
	}
	return color;
}



function computeCtrOfMass(obj) {
	obj.ctrMass = new THREE.Vector3();
	var sumArea = 0;

	for(var i=0; i<obj.geometry.faces.length; i++) {
		var f = obj.geometry.faces[i];

		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);
		
		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

		// var r = ctr.clone().sub(ctrSelected);
		// moment += ctrSelected.distanceTo(ctr) * Math.sin(r.angleTo(nmlSelected)) 
		// 	* triangleArea(va, vb, vc);

		var area = triangleArea(va, vb, vc);
		obj.ctrMass.add(ctr.multiplyScalar(area));
		sumArea += area;
	}

	obj.ctrMass.divideScalar(sumArea);
	// addABall(obj.ctrMass.x, obj.ctrMass.y, obj.ctrMass.z, 0xff0000, 1);

	obj.geometry.computeBoundingBox();
	obj.maxMoment = obj.geometry.boundingBox.max.distanceTo(obj.geometry.boundingBox.min) / 2;
}


/*
	creating a list of neighbours (edge sharing) for each triangle

	known issues: 
	- each triangle should have exactly 3 neighbors. however, some have 4 due to triangle redundance; some have only 2 due to unmanifold structure
*/
function createNeighborList(obj, rConnector) {
	timeStamp();
	console.log("creating neighbor list ...");

	obj.updateMatrixWorld();

	for(var i=0; i<obj.geometry.faces.length; i++) {
		var f = obj.geometry.faces[i];

		if(f.neighbors != undefined && f.neighbors.length > 0) {
			continue;
		}

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

	for(var i=0; i<obj.geometry.faces.length; i++) {
		var f = obj.geometry.faces[i];

		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

		/* neighbors within one radius of range */
		if(f.neighbors1R != undefined && f.neighbors1R.length > 0) {
			continue;
		}

		f.neighbors1R = [f]; // need to check if this f is out of bound
		findNeighbors(obj, f, ctr, rConnector, f.neighbors1R);

		for(var j=0; j<f.neighbors1R .length; j++) {
			f.neighbors1R [j].collected = false;
		}

		/* neighbors within two radii of range */
		if(f.neighbors2R != undefined && f.neighbors2R.length > 0) {
			continue;
		}

		f.neighbors2R = [f];
		findNeighbors(obj, f, ctr, 2 * rConnector, f.neighbors2R);

		for(var j=0; j<f.neighbors2R .length; j++) {
			f.neighbors2R [j].collected = false;
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


function assessBalance(obj, ctrSelected, nmlSelected) {

	var r = obj.ctrMass.clone().sub(ctrSelected);
	var moment = ctrSelected.distanceTo(obj.ctrMass) * Math.sin(r.angleTo(nmlSelected));
	return Math.max(0, 1 - moment/obj.maxMoment);

}

function assessVisualImpact(obj, ctr, nml, outlooks) {
	
	var rayCaster = new THREE.Raycaster();
	var numBlocks = 0;
	for (var i = 0; i < outlooks.length; i++) {
		rayCaster.ray.set( outlooks[i], ctr.clone().sub(outlooks[i]).normalize() );
		// addALine(outlooks[i], ctr, 0xffff00);
		var intersecteds = rayCaster.intersectObjects([obj]);

		if(intersecteds.length > 0
		&& intersecteds[0].point.distanceTo(ctr) > 0.1) {//} && intersecteds[0].object.codeName != proxy.codeName) {
			numBlocks++;
		} 
	}
	// scene.remove(proxy);
	return Math.min(1, (outlooks.length - numBlocks)/(outlooks.length/2));

}

function getLinePlaneIntersection(p0, p1, a, b, c, d) {
	var n = new THREE.Vector3(a, b, c);
	var u = new THREE.Vector3().subVectors(p1, p0);
	// var s1 = -(a*p0.x, + b*p0.y + c*p0.z + d) / (n.dot(u));
	var v0 = new THREE.Vector3(0, 0, -d/c);
	var s1 = n.dot(v0.clone().sub(p0)) / (n.dot(u));
	var ps = p0.clone().add(u.clone().multiplyScalar(s1));
	return ps;
}

function onSameSidePlane(p0, p1, a, b, c, d) {
	var d0 = a*p0.x + b*p0.y + c*p0.z + d;
	var d1 = a*p1.x + b*p1.y + c*p1.z + d;

	return d0 * d1 >= 0;
}

/*
	assuming pts are on xz plane, i.e., the y's of pts are ignored
	ref: http://geomalgorithms.com/a10-_hull-1.html
*/
function findConvexHull(pts) {
	var chs = []; // indices of points that make the convex hull

	/* 
		select the lowest rightmost point 
	*/
	var idx0 = 0;
	for (var i = 0; i < pts.length; i++) {
		// console.log(pts[i].y);
		if(pts[i].z > pts[idx0].z) {
			idx0 = i;
		}
	}

	for (var i = 0; i < pts.length; i++) {
		if(pts[i].z == pts[idx0].z && pts[i].x > pts[idx0]) {
			idx0 = i;
		}
	}

	// addABall(pts[idx0].x, pts[idx0].y, pts[idx0].z, 0xffff00, 0.25);
	swap(pts, 0, idx0);


	/* 
		sort the points radially (ccw) 
	*/
	for (var i = 1; i < pts.length; i++) {

		// if(i > 10) break;

		// addABall(pts[i].x, pts[i].y, pts[i].z, 0xff00ff, 0.25);
		for (var j = i+1; j < pts.length; j++) {
			if(isLeft(pts[j], pts[0], pts[i]) == false) {
				// addALine(pts[j], pts[0], 0x00ff00);
				swap(pts, i, j);
				
			} else {
				// addALine(pts[j], pts[0], 0xff0000);
			}
		}

		// addALine(pts[i], pts[0], 0x00ff00);
		// if(i > 10) break;
		// break;
	}

	// for (var i = 0; i < pts.length; i++) {

	// 	if(i > 10) break;

	// 	addABall(pts[i].x, pts[i].y, pts[i].z, 0xff00ff, 0.25);
	// }



	/* 
		incrementally add them to the convex hull using the stack ds 
	*/
	chs.push(0);
	chs.push(1);
	for (var i = 2; i < pts.length; i++) {

		// console.log(chs);

		while(true) {
			var k = chs.length - 1;
			if(k < 1) {
				break;
			}

			// addABall(pts[i].x, pts[i].y, pts[i].z, 0xff00ff, 0.25);
			// addALine(pts[chs[k-1]], pts[chs[k]], 0x00ff00);
			if(isLeft(pts[i], pts[chs[k-1]], pts[chs[k]])) {
				break;
			} else {
				chs.pop();
			}
		}
		chs.push(i);

		// if(i > 10) 
			// break;
	};

	// console.log("chs: " + chs.length);

	// for (var i = 0; i < chs.length; i++) {
	// 	var idx = chs[i];
	// 	addABall(pts[idx].x, pts[idx].y, pts[idx].z, 0xff00ff, 0.25);
	// };

	return chs;
}

function isLeft(c, a, b) {
	// var v = new THREE.Vector3().subVectors(p, p0);
	// var v1 = new THREE.Vector3().subVectors(p1, p0);
	// var n = new THREE.Vector3().crossVectors(v, v1);
	// var v3 = new THREE.Vector3().crossVectors(n, v1);

	// return v3.dot(v) < 0;

	return ((b.x - a.x)*(c.z - a.z) - (b.z - a.z)*(c.x - a.x)) < 0;
}

function swap(array, i, j) {
	var temp = array[i];
	array[i] = array[j];
	array[j] = temp;
}



/*
	assuming on XZ plane
*/
function distanceToSegment(p, a, b, c) {
	return Math.abs(a*p.x + b*p.z + c) / Math.sqrt(a*a + b*b);
}

function  cleanUpNeighbors (neighbors) {
	for(var j=0; j<neighbors.length; j++) {
		neighbors[j].collected = false;
	}
}