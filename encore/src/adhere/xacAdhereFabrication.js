var facesSelected = [];
var pillars = [];
var adhereConnectors = [];

var radiusAdhereHandle = EVALUATIONMODE ? 3 : 3;
var radiusPrinthead = 7.5;
var heightPrinthead = 50;
var radiusMinimum = 0.5;
var maxDropDistance = 0.5;
var supportiveness = 0.75;
var radiusSupport = 2;

/************************************************************************************

	major process of calculating object rotation and handle placement to make object adherable

	factors of printability:
	- occlusion
	- cross sectinoal strength
	- slant
	- supportive area

************************************************************************************/

function makeAdherePrintable(obj, facesSelected) {
	// if(faceSelected.scoreSetAdhere == undefined) {
	// 	faceSelected.scoreSetAdhere = performAdhereAnlysis(obj, faceSelected);
	// }

	return makeAdherePrintableWithoutAnalysis(obj, facesSelected);
}

function makeAdherePrintableWithoutAnalysis(obj, facesSelected) {
	
	// if(faceSelected == undefined) {
	// 	return;
	// }

	if(facesSelected.length == 0) {
		log("no area selected");
		return;
	}

	console.log(facesSelected.length + " points");

	var OCCLUSION = 1;
	var NOTENOUGHSUPPORT = 2;
	var TOOMUCHDROP = 3;
	var CONNECTORTOOTHIN = 4;
	var UNKNOWN = 0;

	var REASONMESSAGES 
		= ['unknown', 'occlusion', 'not enough support', 'too much drop', 'connector too thin'];
	var unprintableReason = UNKNOWN;


	var shrinkRatio = 0.9;
	

	// if(angleToRotate != undefined && axisToRotate != undefined) {
	// 	obj.rotateOnAxis(axisToRotate, -angleToRotate);	
	// }
	
	var ctrs = [];
	var nmls = [];
	var nmlMean = new THREE.Vector3(0, 0, 0);

	obj.updateMatrixWorld();
	for (var i = 0; i < facesSelected.length; i++) {
		var f = facesSelected[i];
		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);
		
		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
		// addABall(ctr.x, ctr.y, ctr.z, 0xff0000, 2);
		var nmlFace = new THREE.Vector3().crossVectors(
					new THREE.Vector3().subVectors(vb, va),
					new THREE.Vector3().subVectors(vc, va));
		
		// ctrs.push(ctr);
		ctrs.push(f.actualPoint);
		nmls.push(nmlFace);
		nmlMean.add(nmlFace);
	};
	nmlMean.divideScalar(facesSelected.length).normalize();
	
	
	var rConnectors = [];
	var ctrConnectors = [];
	for(var r=radiusAdhereHandle; r>radiusMinimum; r*=shrinkRatio) {
		console.log(r/radiusAdhereHandle + ": " + REASONMESSAGES[unprintableReason]);
		// console.log("r = " + r);
		/* 
			find the adhereNeighbors and the actual radius
		*/

		/* important: make sure the object's matrix is up to date */
		obj.updateMatrixWorld();

		var adhereNeighbors = [];
		for (var i = 0; i < facesSelected.length; i++) {
			adhereNeighbors.push(facesSelected[i]);
			var k = EVALUATIONMODE ? 0.5 : 1.5;
			findNeighbors(obj, facesSelected[i], ctrs[i], Math.min(r*k, 5), adhereNeighbors);
		};
		/* when searching, use 1.5 times of r to include more possible triangles*/
		

		// 3 is the critical number to find commonly shared plane
		// if(adhereNeighbors.length < 1) {
		// 	console.log("less than 3 neighbors found");
		// 	unprintableReason = CONNECTORTOOTHIN;
		// 	break;
		// }

		/* clean up the masks used for searching */
		cleanUpNeighbors(adhereNeighbors);
		// for(var i=0; i<adhereNeighbors.length; i++) {
		// 	adhereNeighbors[i].collected = false;
		// }

		
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

		// var coverage = actualArea / (Math.PI * r * r);

		if(Math.sqrt(actualArea/Math.PI) < radiusMinimum) {
			unprintableReason = CONNECTORTOOTHIN;
			break;
		}

		// console.log("supporting " + coverage.toFixed(4)*100 + "%");
		// if(coverage < supportiveness) {
		// 	unprintableReason = NOTENOUGHSUPPORT;
		// 	continue;
		// }


		/* 
			rotate the object 
		*/
		var yUp = new THREE.Vector3(0, 1, 0);
		var nml = new THREE.Vector3(a, b, c).normalize();

		if(Math.abs(nml.angleTo(nmlMean)) > Math.PI / 2) {
			nml.multiplyScalar(-1);
		}

		angleToRotate = nml.angleTo(yUp);
		axisToRotate = new THREE.Vector3().crossVectors(nml, yUp).normalize();

		if(EVALUATIONMODE == false) {
			obj.rotateOnAxis(axisToRotate, angleToRotate);
			obj.updateMatrixWorld();
		}



		/* 
			set up the supporting plane 
		*/
		var maxNegDist = 0; // max dist 'below' the plane
		var maxPosDist = 0; // max dist 'above' the plane

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
		}
		// console.log("maxPosDist:" + maxPosDist + ", maxNegDist: " + maxNegDist);
		// ctr2.y += Math.min(maxDropDistance, -maxNegDist);

		/* if highest possible drop exceeds the threshold */
		// if(Math.abs(maxPosDist) + Math.abs(maxNegDist) > maxDropDistance * facesSelected.length) {
		// 	if(EVALUATIONMODE == false) {
		// 		obj.rotateOnAxis(axisToRotate, -angleToRotate);
		// 	}
		// 	unprintableReason = TOOMUCHDROP;
		// 	continue;
		// }


		var distToRaise = Math.abs(angleToRotate) > Math.PI/2 ? -maxNegDist : maxPosDist;
		
		if(EVALUATIONMODE == false) {
			
			distToRaise = Math.min(maxPosDist, -maxNegDist);
			distToRaise = Math.min(maxDropDistance, distToRaise);
		} else {
			
			distToRaise = Math.min(maxDropDistance, distToRaise);
		}

		var isOccluding = false;
		for (var k = 0; k < ctrs.length && isOccluding == false; k++) {
			var ctr2 = ctrs[k].clone().applyMatrix4(obj.matrixWorld);//new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
			ctr2.y += distToRaise;

			/* 
				test for occlusion 
			*/
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

			if(isOccluding == false) {
				// addACircle(ctr2, r, 0x0faaf0);
				// ctr2.y -= distToRaise;
				// addACircle(ctr2, r, 0xf0aa0f);
				ctrConnectors.push(ctr2);
				rConnectors.push(r);
				// break;
			} else {
				unprintableReason = OCCLUSION;
			}
		}
		

		/*
			escape when finding printable radius
		*/
		if(isOccluding == false) {
			console.log(maxNegDist + ", " + maxPosDist);
			console.log("r = " + r);
			break;
		}
		

		/* 
			rotate the object back 
		*/
		if(EVALUATIONMODE == false) {
			obj.rotateOnAxis(axisToRotate, -angleToRotate);
		}
	}


	// log(rConnectors.length <= 0 ? 
	// 	("unprintable") :
	// 	("handle radius: " + rConnector));

	/*
		cleaning up
	*/
	if(rConnectors.length <= 0) {
		// angleToRotate = undefined;
		// axisToRotate = undefined;

		log("reason: " + REASONMESSAGES[unprintableReason]);
		return false;
	} else {
		console.log(ctrConnectors.length + " connectors");
		for(var i=0; i<ctrConnectors.length; i++) {
			adhereConnectors.push(
				makeAdhereConnector(ctrConnectors[i], rConnectors[i], rConnectors[i] * 2));
		}
	}

	return true;
}



/************************************************************************************

	making support material to hold the existing object

**************************************************************************************/

function makeSupport(obj) {

	obj.updateMatrixWorld();


	/* 
		calculate center of mass and lowest point 
	*/
	var ctrMass = new THREE.Vector3();
	var lowestPoint = new THREE.Vector3(0, INFINITY, 0);
	for(var i=0; i<obj.geometry.vertices.length; i++) {
		var v = obj.geometry.vertices[i].clone().applyMatrix4(obj.matrixWorld);
		ctrMass.add(v);

		if(v.y < lowestPoint.y) {
			lowestPoint = v.clone();
		}
	}

	ctrMass.divideScalar(obj.geometry.vertices.length);
	


	/*
		finding the bounds: lf, lr, ul, ur
	*/
	var bounds = [new THREE.Vector3(INFINITY, INFINITY, INFINITY), 
				  new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY),
				  new THREE.Vector3(INFINITY, INFINITY, INFINITY), 
				  new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY)];
	
	// lowest point within a certain xz range of the center of mass
	var lowestCtrMass = new THREE.Vector3(0, INFINITY, 0);

	var ctrMassXZ = ctrMass.clone();
	ctrMassXZ.y = 0;
	var rClose = 2;

	for(var i=0; i<obj.geometry.faces.length; i++) {
		var f = obj.geometry.faces[i];

		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);
		
		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

		var nmlFace = new THREE.Vector3().crossVectors(
					new THREE.Vector3().subVectors(vb, va),
					new THREE.Vector3().subVectors(vc, va)).normalize();

		var yUp = new THREE.Vector3(0, 1, 0);

		/* this is how we decide if a triangle is facing up or down */
		if(Math.abs(nmlFace.angleTo(yUp)) < Math.PI * 2 / 3) {
			continue;
		}

		/* update the bounds */
		var v = ctr;
		if(v.x < bounds[0].x) bounds[0] = v.clone();
		if(v.x > bounds[1].x) bounds[1] = v.clone();
		if(v.z < bounds[2].z) bounds[2] = v.clone();
		if(v.z > bounds[3].z) bounds[3] = v.clone();

		/* update the lowest ctr of mass */
		var ctrXZ = ctr.clone();
		ctrXZ.y = 0;
		
		if(ctrXZ.distanceTo(ctrMassXZ) < rClose) {
			if(ctr.y < lowestCtrMass.y) {
				lowestCtrMass = ctr.clone();
			}
		}
	}

	/* if there exists a lowest ctr mass at all */
	if(lowestCtrMass.y < INFINITY) {
		bounds.push(lowestCtrMass);
	}

	// TEMPTEMPTEMPTEMPTEMPTEMP
	// bounds = [lowestCtrMass];

	/*
		building the supporting pillars
	*/
	pillars = [];
	var material = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	
	/* how much the pillars go into the object to ensure some support coverage */
	var margin = 0.5;
	
	for(var i=0; i<bounds.length; i++) {
		
		var h = bounds[i].y + margin - lowestPoint.y;

		// TEMPTEMPTEMPTEMPTEMPTEMP
		// h = radiusSupport * 2;

		var geometry = new THREE.CylinderGeometry( radiusSupport, radiusSupport, h, 16 );
		var cylinder = new THREE.Mesh( geometry, material );
		// cylinder.position.set(bounds[i].x, bounds[i].y + margin - h / 2, bounds[i].z );
		cylinder.position.set(bounds[i].x, bounds[i].y + margin - h / 2, bounds[i].z );

		pillars.push(cylinder);
	}



	/*
		doing subtraction from existing object using constructive solid geometry
		
		csg ref: http://learningthreejs.com/blog/2011/12/10/conconnectorive-solid-geometry-with-csg-js/
		TODO: merge the pillars and only perform subtraction once
	*/
	
	var objCSG = new ThreeBSP(obj);
	for(var i=0; i<pillars.length; i++) {
		var pillarCSG = new ThreeBSP(pillars[i]);
		var subPillar = pillarCSG.subtract(objCSG);
		pillars[i] = subPillar.toMesh(material);
		scene.add(pillars[i]);
	}
}



/************************************************************************************

	make a connector between the existing object and the attachment

************************************************************************************/

function makeAdhereConnector(ctr, r, h) {
	h = Math.min(5, h);
	var material = new THREE.MeshPhongMaterial( { color: 0x080888, transparent: true, opacity: 0.5} );
	var geometry = new THREE.CylinderGeometry( r, r, h, 16 );

	if(EVALUATIONMODE) {
		var geometryHandle = new THREE.TorusGeometry(7.25, 2, 16, 100);
		var m1 = new THREE.Matrix4();
		m1.makeRotationX( Math.PI/2 );
		m1.makeTranslation(0, h + 7.25/2 - 2*2 + h, 0);
		geometryHandle.applyMatrix(m1);
		THREE.GeometryUtils.merge(geometry, geometryHandle);
	}

	var connector= new THREE.Mesh( geometry, material );
	connector.position.set(ctr.x, ctr.y + h / 2, ctr.z);

	scene.add(connector);
	return connector;
}



function saveAdhereObjects() {
	/* the attachment */

	var mergedGeom = objDynamic == undefined ? undefined : getTransformedGeometry(objDynamic);

	if(EVALUATIONMODE) {
		mergedGeom = getTransformedGeometry(objStatic);
	}

	/* the connector */
	for (var i = 0; i < adhereConnectors.length; i++) {
		if(mergedGeom == undefined) {
			mergedGeom = getTransformedGeometry(adhereConnectors[i]);
		} else {
			THREE.GeometryUtils.merge(mergedGeom, adhereConnectors[i]);
		}
	}
	// var connectorGeom = getTransformedGeometry(connector);
	// THREE.GeometryUtils.merge(mergedGeom, connectorGeom);

	for(var i=0; i<pillars.length; i++) {
		var supportGeom = pillars[i].geometry.clone();
		supportGeom.applyMatrix(pillars[i].matrixWorld);

		// if(i==0) {
		// 	mergedGeom = supportGeom.clone();
		// } else {
			THREE.GeometryUtils.merge(mergedGeom, supportGeom);
		// }
	}

	var m = new THREE.Matrix4();
	m.makeRotationX(Math.PI/2);
	mergedGeom.applyMatrix(m);

	var stlStr = stlFromGeometry( mergedGeom );
	var blob = new Blob([stlStr], {type: 'text/plain'});
	saveAs(blob, name + '.stl');
}

// function makeMarkers(obj) {
// 	pillars = [];

// 	obj.geometry.computeBoundingBox();
// 	var bbox = obj.geometry.boundingBox;

// 	pillars.push(addABall(bbox.min.x, 1, 0xff0000));
// 	pillars.push(addABall(bbox.max, 1, 0xff0000));	
// }