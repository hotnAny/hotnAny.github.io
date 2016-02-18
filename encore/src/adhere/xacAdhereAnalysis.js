
/*********************************************************************************************

	analysis for adhering technique

*********************************************************************************************/

function analyzeAdhereMethod() {
	var obj = objStatic;

	timeStamp();
	console.log("analyzing ...")

	obj.updateMatrixWorld();
	/* remember to reset face.collected to false */
	var maxScore = -INFINITY;
	

	/*
		compute scores for eac face
	*/
	for(var i=0; i<obj.geometry.faces.length; i++) {
		var f = obj.geometry.faces[i];

		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

		f.ctrTemp = ctr;
		f.verticesTemp = [va, vb, vc];

		var nml = new THREE.Vector3().crossVectors(
				new THREE.Vector3().subVectors(vb, va),
				new THREE.Vector3().subVectors(vc, va)).normalize();

		/* for adhering, scores are calculated as a set using one function */
		if(f.scoreSetAdhere == undefined) {
			var mat = obj.matrixWorld.clone();
			f.scoreSetAdhere = performAdhereAnlysis(obj, f);
			obj.updateMatrixWorld(mat);

			// f.scoreSetAdhere.visual = 0;
			// console.log(f.scoreSetAdhere.balance);

			// TODO: fix the nml that is not the nml that should be used
			// balance is a general term across techniques
			f.scoreSetAdhere.balance = assessBalance(obj, ctr, nml);

			// f.scoreSetAdhere.visual = assessVisualImpact(obj, ctr, nml, outLooks);
		}
		
		// printability (occlusion is a hard constraint)
		var score = (f.scoreSetAdhere.isOccluding == false ? 1 : 0) * (
						
						f.scoreSetAdhere.flatness * wAttachability +
						(f.scoreSetAdhere.strength * wstr +
							f.scoreSetAdhere.balance * wbal) * wUsability

					) / (wAttachability + wUsability);

		// console.log(f.scoreSetAdhere);
		f.scoreAdhere = score;
		maxScore = Math.max(score, maxScore);
		// console.log(score);

	}
	console.log("done, in " + timeStamp() + " msec.");




	/*
		computing heatmap visualization
	*/

	// if(TOSHOWHEATMAP) {
	console.log("generating heatmap ...");

  	obj.material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, transparent: true, opacity: 0.85 } )
  	obj.material.needsUpdate = true;
  
	for(var i=0; i<obj.geometry.faces.length; i++) {

		var f = obj.geometry.faces[i];

		for( var j = 0; j < 3; j++ ) {
			var weightTotal = 1;
			var score = f.scoreAdhere;

			var v = f.verticesTemp[j];
			
			for(var k=0; k<f.neighbors2R.length; k++) {
				var ff = f.neighbors2R[k];
				for(var h=0; h<3; h++) {
					var dist = v.distanceTo(ff.verticesTemp[h]);
					var w = Math.max(0, 1 - dist/radiusAdhereHandle/2);
					score += ff.scoreAdhere * w;
					weightTotal += w;
				} 
			}

			score /= weightTotal;

			f.vertexColors[j] = getColorFromScore(score, maxScore);
		}
	}

	obj.geometry.colorsNeedUpdate = true;
	console.log("done, in " + timeStamp() + " msec.");
	// }
}

function performAdhereAnlysis(obj, faceSelected) {

	var scores = new Object();
	scores.strength = 0;
	scores.flatness = 0;
	scores.isOccluding = true;
	
	// var OCCLUSION = 1;
	// var NOTENOUGHSUPPORT = 2;
	// var TOOMUCHDROP = 3;
	// var CONNECTORTOOTHIN = 4;
	// var UNKNOWN = 0;

	// var REASONMESSAGES 
	// 	= ['unknown', 'occlusion', 'not enough support', 'too much drop', 'connector too thin'];
	// var unprintableReason = UNKNOWN;


	var shrinkRatio = 0.9;
	var rConnector;

	// if(angleToRotate != undefined && axisToRotate != undefined) {
	// 	obj.rotateOnAxis(axisToRotate, -angleToRotate);	
	// }
	
	
	obj.updateMatrixWorld();
	var va = obj.geometry.vertices[faceSelected.a].clone().applyMatrix4(obj.matrixWorld);
	var vb = obj.geometry.vertices[faceSelected.b].clone().applyMatrix4(obj.matrixWorld);
	var vc = obj.geometry.vertices[faceSelected.c].clone().applyMatrix4(obj.matrixWorld);
	
	var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
	// addABall(ctr.x, ctr.y, ctr.z, 0xff0000, 2);
	var nmlFace = new THREE.Vector3().crossVectors(
				new THREE.Vector3().subVectors(vb, va),
				new THREE.Vector3().subVectors(vc, va));

	var ctrConnector;
	for(var r=radiusAdhereHandle; r>radiusMinimum; r*=shrinkRatio) {

		/***********************************************/

		scores.strength = r / radiusAdhereHandle;

		/***********************************************/

		/* 
			find the adhereNeighbors and the actual radius
		*/

		/* important: make sure the object's matrix is up to date */
		obj.updateMatrixWorld();

		adhereNeighbors = [];
		/* when searching, use 1.5 times of r to include more possible triangles*/
		findNeighbors(obj, faceSelected, ctr, r*1.5, adhereNeighbors);

		if(adhereNeighbors.length <= 0) {
			// unprintableReason = CONNECTORTOOTHIN;
			break;
		}

		/* clean up the masks used for searching */
		cleanUpNeighbors(adhereNeighbors);

		
		/* 
			find the commonly shared plane 
		*/
		var points = [];
		for(var i=0; i<adhereNeighbors.length; i++) {
			var f = adhereNeighbors[i];
			var indices = [f.a, f.b, f.c];
			var vertices = [];
			for(var j=0; j<indices.length; j++) {
				var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
				points.push(v);
				vertices.push(v);
			}

			f.verts = vertices;
		}

		// 3 is the minimum number of points that can be applied the following method
		if(points.length <= 3) {
			continue;
		}

		var planeParams = findPlaneToFitPoints(points);
		var a = planeParams.A;
		var b = planeParams.B;
		var c = planeParams.C;
		var d = planeParams.D;



		/* 
			measure coverage 
			s: project the adhereNeighbors onto the plane, cal the sum of their area
			S: the plane's area (circle)
			coverage = s/S
		*/
		var actualArea = 0;
		var projections = [];
		for(var i=0; i<adhereNeighbors.length; i++) {
			var f = adhereNeighbors[i];
			var proj = [];
			for(var j=0; j<f.verts.length; j++) {
				var p = getProjection(f.verts[j], a, b, c, d);
				proj.push(p);
				projections.push(p);
			}

			// addATriangle(projections[0], projections[1], projections[2], 0x00ff00);
			actualArea += triangleArea(proj[0], proj[1], proj[2]);
		}

		var coverage = actualArea / (Math.PI * r * r);

		// console.log("supporting " + coverage.toFixed(4)*100 + "%");
		// if(coverage < supportiveness) {
		// 	// unprintableReason = NOTENOUGHSUPPORT;
		// 	continue;
		// }


		/* 
			rotate the object 
		*/
		var yUp = new THREE.Vector3(0, 1, 0);
		var nml = new THREE.Vector3(a, b, c).normalize();

		if(Math.abs(nml.angleTo(nmlFace)) > Math.PI / 2) {
			nml.multiplyScalar(-1);
		}

		angleToRotate = nml.angleTo(yUp);
		axisToRotate = new THREE.Vector3().crossVectors(nml, yUp).normalize();

		obj.rotateOnAxis(axisToRotate, angleToRotate);
		obj.updateMatrixWorld();



		/* 
			set up the supporting plane 
		*/
		var maxNegDist = 0; // max dist 'below' the plane
		var maxPosDist = 0; // max dist 'above' the plane
		var sumDist = 0;

		/* note that points are the vertices BEFORE rotating the object */
		for(var i=0; i<points.length; i++) {
			var v = points[i];

			/* there are points from the extended search that actually fall out of r */
			if(projections[i].distanceTo(ctr) > r) {
				continue;
			}

			var dist = (a*v.x + b*v.y + c*v.z + d) / Math.sqrt(a*a + b*b + c*c);

			maxNegDist = Math.min(dist, maxNegDist);
			maxPosDist = Math.max(dist, maxPosDist);
			sumDist += Math.abs(dist);
		}

		/***********************************************************************************/

		scores.flatness = Math.max(0, 1 - sumDist / points.length / maxDropDistance);

		/***********************************************************************************/


		// console.log("maxPosDist:" + maxPosDist + ", maxNegDist: " + maxNegDist);
		// ctr2.y += Math.min(maxDropDistance, -maxNegDist);

		/* if highest possible drop exceeds the threshold */
		if(Math.abs(maxPosDist) + Math.abs(maxNegDist) > maxDropDistance) {
			obj.rotateOnAxis(axisToRotate, -angleToRotate);
			// unprintableReason = TOOMUCHDROP;
			continue;
		}
		var distToRaise = Math.abs(angleToRotate) > Math.PI/2 ? -maxNegDist : maxPosDist;
		distToRaise = Math.max(distToRaise, 1);
		
		var ctr2 = ctr.clone().applyMatrix4(obj.matrixWorld);//new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
		ctr2.y += distToRaise;



		/* 
			test for occlusion 
		*/
		var isOccluding = false;
		var ctrXZ = ctr2.clone();
		ctrXZ.y = 0;
		for(var i=0; i<obj.geometry.faces.length && isOccluding == false; i++) {
			var f = obj.geometry.faces[i];
			var indices = [f.a, f.b, f.c];
			for(var j=0; j<indices.length; j++) {
				var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
				
				/* ignore points y-below the plane */
				if(v.y < ctr2.y) {
					break;
				}

				/* for points above the plane, test if it's in the cylinder */
				v.y = 0;
				if(v.distanceTo(ctrXZ) < r + radiusPrinthead) {
					isOccluding = true;
					break;
				}
			}
		}
		
		/* 
			rotate the object back 
		*/
		obj.rotateOnAxis(axisToRotate, -angleToRotate);

		/*
			escape when finding printable radius
		*/

		/***********************************************************************************/

		scores.isOccluding = isOccluding;

		/***********************************************************************************/

		if(isOccluding == false) {
			// addACircle(ctr2, r, 0x0faaf0);
			// ctr2.y -= distToRaise;
			// addACircle(ctr2, r, 0xf0aa0f);
			ctrConnector = ctr2;
			rConnector = r;

			break;
		} else {
			// unprintableReason = OCCLUSION;
		}

	}


	// log(rConnector == undefined ? 
	// 	("unprintable") :
	// 	("handle radius: " + rConnector));

	// /*
	// 	cleaning up
	// */
	if(rConnector == undefined) {
		angleToRotate = undefined;
		axisToRotate = undefined;
	}
	// 	log("reason: " + REASONMESSAGES[unprintableReason]);
	// 	return false;
	// } else {
	// 	makeConnector(ctrConnector, rConnector, rConnector * 2);
	// }

	return scores;
}