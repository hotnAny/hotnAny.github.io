
// function preprocessStrapping (obj) {
	
// 	for(var i=0; i<obj.geometry.faces.length; i++) {

// 		/* no printability */

// 		/* compute attachability */

// 		/* compute usability */
// 	}

// }

function analyzeStrapMethod(obj, facesToStrapOn) {

	if(facesToStrapOn == undefined || facesToStrapOn.length <= 0) {
		return;
	}

	obj.updateMatrixWorld();
	
	var maxScore = -INFINITY;
	for(var i=0; i<facesToStrapOn.length; i++) {

		var f = facesToStrapOn[i];
		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);
		
		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

		f.ctrTemp = ctr;
		f.verticesTemp = [va, vb, vc];
		/* no printability */

		/* compute attachability */
		var subNeighbors = [f];
		findNeighbors(obj, f, ctr, widthStrap * 1.5, subNeighbors);
		for(var k=0; k<subNeighbors.length; k++) {
			subNeighbors[k].collected = false;
		}
		var nmlStats = assessFlatness(obj, subNeighbors);

		/* attachability */
		if(f.strapAttachability == undefined) {
			f.strapAttachability = performStrapAnalysis(obj, f, nmlStats.mean);
		}

		/* balance == usability */
		if(f.strapBalance == undefined) {
			f.strapBalance = assessBalance(obj, ctr, nmlStats.mean);
		}

		f.scoreStrap = (f.strapAttachability * wAttachability +
						f.strapBalance * wUsability
					) / (wAttachability + wUsability);

		maxScore = Math.max(f.scoreStrap, maxScore);
		// console.log(score);
		/* compute usability */

		// f.scoreStrap = score;
	}

	var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors} );
	for(var i=0; i<facesToStrapOn.length; i++) {

		var f = facesToStrapOn[i];
		
		// visualsStrap[i].material.needsUpdate = true;

		/* adding the triangle */
		var geometry = new THREE.Geometry();
		geometry.faces.push(new THREE.Face3(0, 1, 2));
		for (var k = 0; k < verticesToStrapOn[i].length; k++) {
			geometry.vertices.push(verticesToStrapOn[i][k]);
		}
		var tri = new THREE.Mesh(geometry, material);
		
		for( var j = 0; j < 3; j++ ) {
			var weightTotal = 1;
			var score = f.scoreStrap;

			var v = f.verticesTemp[j];
			
			for(var k=0; k<f.neighbors2R.length; k++) {
				var ff = f.neighbors2R[k];
				for(var h=0; h<3; h++) {
					if(ff.scoreStrap != undefined) {
						var dist = v.distanceTo(ff.verticesTemp[h]);
						var w = Math.max(0, 1 - dist/radiusHandle);
						score += ff.scoreStrap * w;
						weightTotal += w;
					}
				} 
			}

			score /= weightTotal;
			// console.log(score + ": " + maxScore);
			f.vertexColors[j]
				= getColorFromScore(score, maxScore);

			// console.log(visualsStrap[i].geometry.faces[0].vertexColors[j]);
		}

		
		// scene.add(tri);
	}

	obj.geometry.colorsNeedUpdate = true;

		
}

/*
	obj - the object
	neighbors - all the user-selected neighbors
	f - the face whose neighborhood is to be strapped on
	nml - the mean normal of that neighborhood
*/
function performStrapAnalysis(obj, f, nml) {
	
	obj.updateMatrixWorld();

	/* 
		find the cutting plane 
	*/
	var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
	var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
	var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);
	
	var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

	var yUp = new THREE.Vector3(0, 1, 0);
	var v = new THREE.Vector3().crossVectors(yUp, nml);
	var u = nml;

	var a = u.y*v.z - u.z*v.y;
	var b = u.z*v.x - u.x*v.z;
	var c = u.x*v.y - u.y*v.x;
	var d = -a*ctr.x - b*ctr.y - c*ctr.z;

	/* for debugging */
	// var v0 = new THREE.Vector3(0, 0, -d/c);
	// var v0 = ctr.clone();
	// var v1 = new THREE.Vector3(0, -d/b, 0);
	// var v2 = new THREE.Vector3(-d/a, 0, 0);

	// addATriangle(v0, v1, v2, 0xffff00);

	// addABall(va.x, va.y, va.z, 0xff0000, 0.5);
	// addABall(vb.x, vb.y, vb.z, 0xff0000, 0.5);
	// var p = getLinePlaneIntersection(va, vb, a, b, c, d);
	// addABall(p.x, p.y, p.z, 0x00ff00, 0.5);



	/* 
		find the set of intersecting points (on the edges of the triangles) 
	*/
	var cutPoints = [];
	var cutPointTris = [];
	var cutPoitnNmls = [];
	for (var i = 0; i < obj.geometry.faces.length; i++) {
		var ff = obj.geometry.faces[i];
		var faceIndices = [ff.a, ff.b, ff.c];
		var vertices = [];

		for (var j = 0; j < faceIndices.length; j++) {
			vertices.push(
				obj.geometry.vertices[faceIndices[j]].clone().applyMatrix4(obj.matrixWorld));

		};

		// var nml = new THREE.Vector3().crossVectors(
		// 		new THREE.Vector3().subVectors(vertices[1], vertices[0]),
		// 		new THREE.Vector3().subVectors(vertices[2], vertices[0])
		// 	);

		var intersects = [];
		for (var j = 0; j < vertices.length; j++) {
			var p0 = vertices[j];
			var p1 = new THREE.Vector3().addVectors(vertices[(j+1)%vertices.length], 
				vertices[(j+2)%vertices.length]).divideScalar(2);
			if(onSameSidePlane(p0, p1, a, b, c, d) == false) {
				var p = getLinePlaneIntersection(p0, p1, a, b, c, d);

				var isRedundant = false;
				for(var k=0; k<intersects.length; k++) {
					if(intersects[k].distanceTo(p) < 1) {
						isRedundant = true;
						break;
					}
				}

				if(!isRedundant) {
					cutPoints.push(p);

					// var subNeighbors = [ff];
					// findNeighbors(obj, ff, p, widthStrap, subNeighbors);
					// for(var k=0; k<subNeighbors.length; k++) {
					// 	subNeighbors[k].collected = false;
					// }

					// console.log(subNeighbors.length);

					// var nmlStats = assessFlatness(obj, subNeighbors);

					// cutPoitnNmls.push(nmlStats.mean.normalize());

					var q = vertices[(j+1)%vertices.length];
					var nmlP = new THREE.Vector3().crossVectors(
							new THREE.Vector3().subVectors(p1, p0),
							new THREE.Vector3().subVectors(q, p1)
						).normalize();
					cutPoitnNmls.push(nmlP);

					intersects.push(p);
				} 

				// cutPointTris.push(ff.clone());
			}
			
		}

		/* for debugging */
		// var vaa = obj.geometry.vertices[ff.a].clone().applyMatrix4(obj.matrixWorld);
		// var vbb = obj.geometry.vertices[ff.b].clone().applyMatrix4(obj.matrixWorld);
		// var vcc = obj.geometry.vertices[ff.c].clone().applyMatrix4(obj.matrixWorld);

		// if(onSameSidePlane(vaa, vbb, a, b, c, d) == false) {
		// 	// addALine(vaa, vbb, 0x00ff00);
		// 	cutPoints.push(getLinePlaneIntersection(vaa, vbb, a, b, c, d));
		// } 
	};

	// console.log("cutPoints: " + cutPoints.length);

	/* for debugging */
	// for (var i = 0; i < cutPoints.length; i++) {
	// 	addABall(cutPoints[i].x, cutPoints[i].y, cutPoints[i].z, 0xff88aa, 0.5);
	// };

	var planeNml = new THREE.Vector3(a, b, c);
	var angleCutPlane = planeNml.angleTo(yUp);
	var axisCutPlane = new THREE.Vector3().crossVectors(planeNml, yUp).normalize();
	var mRot = new THREE.Matrix4();
	mRot.makeRotationAxis(axisCutPlane, angleCutPlane);

	for (var i = 0; i < cutPoints.length; i++) {
		cutPoints[i].applyMatrix4(mRot);
		/* for debugging */
		// addABall(cutPoints[i].x, cutPoints[i].y, cutPoints[i].z, 0xaa88ff, 0.1);
	};



	/* 
		find the convex hull 
	*/
	// var cutPointsXZ = [];
	// for (var i = 0; i < cutPoints.length; i++) {
	// 	cutPointsXZ[i] = new THREE.Vector3();
	// 	cutPointsXZ[i].copy(cutPoints[i]);
	// 	cutPointsXZ[i].y = 0;
	// };
	var chs = findConvexHull(cutPoints);
	// console.log("chs%: " + (chs.length * 100 / cutPoints.length).toFixed(2) + "%");
	
	

	/* 
		analyze contact point properties 
	*/
	var scoreSamples = analyzeCrossSection(cutPoints, chs, cutPoitnNmls, nml);
	var thresWeakspots = 0.75;
	var cntWeakspots = 0;
	for (var i = 0; i < scoreSamples.length; i++) {
		if(scoreSamples[i].max < thresWeakspots) {
			cntWeakspots++;
		}
	}
	var attachability = 1 - cntWeakspots / scoreSamples.length;
	// console.log(attachability);



	var toVisualize = false;
	/*
		visualization
	*/

	if(toVisualize){
		mRot = new THREE.Matrix4();
		mRot.makeRotationAxis(axisCutPlane, -angleCutPlane);

		for (var i = 0; i < cutPoints.length; i++) {
			cutPoints[i].applyMatrix4(mRot);
		};
		for(var i=0; i<chs.length; i++) {
			var idx = chs[i];
			addABall(cutPoints[idx].x, cutPoints[idx].y, cutPoints[idx].z, 0xff00ff, 0.25);
			addALine(cutPoints[idx], cutPoints[idx].clone().add(cutPoitnNmls[idx].clone().multiplyScalar(5)), 0x0000ff);
			// var ff = cutPointTris[idx]; //obj.geometry.faces[cutPointTris[idx]];
			// var vaa = obj.geometry.vertices[ff.a].clone().applyMatrix4(obj.matrixWorld);
			// var vbb = obj.geometry.vertices[ff.b].clone().applyMatrix4(obj.matrixWorld);
			// var vcc = obj.geometry.vertices[ff.c].clone().applyMatrix4(obj.matrixWorld);
			// addATriangle(vaa, vbb, vcc, 0xffff00);
		}
	}

	return attachability;
}

/*
	assuming points are sorted
	assuming on XZ plane
*/
function analyzeCrossSection(pts, chs, nmls, nmlPlane) {

	/* 
		form the segment sets 
	*/
	var segments = [];
	
	for (var i = 0; i < chs.length - 1; i++) {
		var p0 = pts[ chs[i] ];
		var p1 = pts[ chs[i+1] ];

		var line = new Object();
		line.a = p0.z - p1.z;
		line.b = p1.x - p0.x;
		line.c = p0.x*p1.z - p1.x*p0.z;

		segments.push(line);
	};

	// var ctrPnt = new THREE.Vector3().addVectors(minPnt, maxPnt).divideScalar(2);

	var numSectors = 18;
	var scoreSectors = new Array(numSectors);
	for (var i = 0; i < scoreSectors.length; i++) {
		scoreSectors[i] = new Object();
	}

	var numPointsPerSector = pts.length / numSectors;
	var contactThreshold = 0.25;

	var idxSector = 0;
	var cntPts = 0;
	var sumPerSector = 0;
	var maxPerSector = 0;
	for (var i = 0; i < pts.length; i++) {
		var minDist = INFINITY;
		
		for(var j=0; j<segments.length; j++) {
			var l = segments[j];
			minDist = Math.min(minDist, distanceToSegment(pts[i], l.a, l.b, l.c));	
		}

		var isContacting = minDist < contactThreshold;
		var scorePnt = 0;
		if(!isContacting) {
			scorePnt = 0;
		} else {
			scorePnt = Math.abs(nmls[i].dot(nmlPlane));
		}
		// console.log(scorePnt);

		if(Math.floor(i/numPointsPerSector) != idxSector) {
			scoreSectors[idxSector].mean = sumPerSector / cntPts;
			scoreSectors[idxSector].max = maxPerSector;

			// console.log(scoreSectors[idxSector]);

			idxSector = Math.floor(i/numPointsPerSector);
			sumPerSector = 0;
			maxPerSector = 0;
			cntPts = 0;
		}

		sumPerSector += scorePnt;
		maxPerSector = Math.max(scorePnt, maxPerSector);
		cntPts++;
	}

	/* 
		for each point, compute the shortest distance to the segments 
	*/
	// var distToCH = 0;
	// for (var i = 0; i < pts.length; i++) {
	// 	var minDist = INFINITY;
		
	// 	for(var j=0; j<segments.length; j++) {
	// 		var l = segments[j];
	// 		minDist = Math.min(minDist, distanceToSegment(pts[i], l.a, l.b, l.c));	
	// 	}

	// 	distToCH += minDist;
	// };

	// console.log("distToCH mean: " + (distToCH/pts.length));

	/* compute the global distance */

	return scoreSectors;
}

/*
	assuming points are sorted
	assuming on XZ plane
*/
function converageConvexHull(pts, chs) {
	// var area = 0;
	// for (var i = 1; i < pts.length - 1; i++) {
	// 	area += triangleArea(pts[0], pts[])
	// };

	/* 
		form the segment sets 
	*/
	var segments = [];
	for (var i = 0; i < chs.length - 1; i++) {
		var p0 = pts[ chs[i] ];
		var p1 = pts[ chs[i+1] ];

		// addALine(p0, p1, 0xff0f0f);

		var line = new Object();
		line.a = p0.z - p1.z;
		line.b = p1.x - p0.x;
		line.c = p0.x*p1.z - p1.x*p0.z;

		segments.push(line);
	};


	/* 
		for each point, compute the shortest distance to the segments 
	*/
	var distToCH = 0;
	for (var i = 0; i < pts.length; i++) {
		var minDist = INFINITY;
		
		for(var j=0; j<segments.length; j++) {
			var l = segments[j];
			minDist = Math.min(minDist, distanceToSegment(pts[i], l.a, l.b, l.c));	
		}

		distToCH += minDist;
	};

	console.log("distToCH mean: " + (distToCH/pts.length));

	/* compute the global distance */
}