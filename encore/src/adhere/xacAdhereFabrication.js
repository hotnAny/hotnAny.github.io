var faceSelected = [];
var pillars = [];
var connector;

/************************************************************************************

	major process of calculating object rotation and handle placement to make object adherable

	factors of printability:
	- occlusion
	- cross sectinoal strength
	- slant
	- supportive area

************************************************************************************/

function makeAdherePrintable(obj) {
	
	var OCCLUSION = 1;
	var NOTENOUGHSUPPORT = 2;
	var TOOMUCHDROP = 3;
	var CONNECTORTOOTHIN = 4;
	var UNKNOWN = 0;

	var REASONMESSAGES 
		= ['unknown', 'occlusion', 'not enough support', 'too much drop', 'connector too thin'];
	var unprintableReason = UNKNOWN;


	var shrinkRatio = 0.9;
	var rConnector;

	if(angleToRotate != undefined && axisToRotate != undefined) {
		obj.rotateOnAxis(axisToRotate, -angleToRotate);	
	}
	
	
	obj.updateMatrixWorld();
	var va = obj.geometry.vertices[faceSelected[0].a].clone().applyMatrix4(obj.matrixWorld);
	var vb = obj.geometry.vertices[faceSelected[0].b].clone().applyMatrix4(obj.matrixWorld);
	var vc = obj.geometry.vertices[faceSelected[0].c].clone().applyMatrix4(obj.matrixWorld);
	
	var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
	// addABall(ctr.x, ctr.y, ctr.z, 0xff0000, 2);
	var nmlFace = new THREE.Vector3().crossVectors(
				new THREE.Vector3().subVectors(vb, va),
				new THREE.Vector3().subVectors(vc, va));

	var ctrConnector;
	for(var r=radiusHandle; r>radiusMinimum; r*=shrinkRatio) {
		/* 
			find the neighbors and the actual radius
		*/

		/* important: make sure the object's matrix is up to date */
		obj.updateMatrixWorld();

		neighbors = [];
		/* when searching, use 1.5 times of r to include more possible triangles*/
		findNeighbors(obj, faceSelected[0], ctr, r*1.5, neighbors);

		if(neighbors.length <= 0) {
			unprintableReason = CONNECTORTOOTHIN;
			break;
		}

		/* clean up the masks used for searching */
		for(var i=0; i<neighbors.length; i++) {
			neighbors[i].collected = false;
		}

		
		/* 
			find the commonly shared plane 
		*/
		var points = [];
		for(var i=0; i<neighbors.length; i++) {
			var f = neighbors[i];
			var indices = [f.a, f.b, f.c];
			var vertices = [];
			for(var j=0; j<indices.length; j++) {
				var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
				points.push(v);
				vertices.push(v);
			}

			f.verts = vertices;
		}

		var planeParams = findPlaneToFitPoints(points);
		var a = planeParams.A;
		var b = planeParams.B;
		var c = planeParams.C;
		var d = planeParams.D;


		/* 
			measure coverage 
			s: project the neighbors onto the plane, cal the sum of their area
			S: the plane's area (circle)
			coverage = s/S
		*/
		var actualArea = 0;
		var projections = [];
		for(var i=0; i<neighbors.length; i++) {
			var f = neighbors[i];
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
		if(coverage < supportiveness) {
			unprintableReason = NOTENOUGHSUPPORT;
			continue;
		}


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
		if(Math.abs(maxPosDist) + Math.abs(maxNegDist) > maxDropDistance) {
			obj.rotateOnAxis(axisToRotate, -angleToRotate);
			unprintableReason = TOOMUCHDROP;
			continue;
		}
		var distToRaise = Math.abs(angleToRotate) > Math.PI/2 ? -maxNegDist : maxPosDist;

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
			escape when finding printable radius
		*/
		if(isOccluding == false) {
			addACircle(ctr2, r, 0x0faaf0);
			// ctr2.y -= distToRaise;
			// addACircle(ctr2, r, 0xf0aa0f);
			ctrConnector = ctr2;
			rConnector = r;
			break;
		} else {
			unprintableReason = OCCLUSION;
		}

		/* 
			rotate the object back 
		*/
		obj.rotateOnAxis(axisToRotate, -angleToRotate);
	}


	log(rConnector == undefined ? 
		("unprintable") :
		("handle radius: " + rConnector));

	/*
		cleaning up
	*/
	if(rConnector == undefined) {
		angleToRotate = undefined;
		axisToRotate = undefined;

		log("reason: " + REASONMESSAGES[unprintableReason]);
		return false;
	} else {
		makeConnector(ctrConnector, rConnector, rConnector * 2);
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



	/*
		building the supporting pillars
	*/
	pillars = [];
	var material = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	
	/* how much the pillars go into the object to ensure some support coverage */
	var margin = 0.5;
	
	for(var i=0; i<bounds.length; i++) {
		
		var h = bounds[i].y + margin - lowestPoint.y;
		var geometry = new THREE.CylinderGeometry( radiusSupport, radiusSupport, h, 16 );
		var cylinder = new THREE.Mesh( geometry, material );
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

function makeConnector(ctr, r, h) {
	var material = new THREE.MeshPhongMaterial( { color: 0x080888, transparent: true, opacity: 0.5} );
	var geometry = new THREE.CylinderGeometry( r, r, h, 16 );
	connector= new THREE.Mesh( geometry, material );
	connector.position.set(ctr.x, ctr.y + h / 2, ctr.z);

	scene.add(connector);
	return connector;
}



/*
	get the projection coordinates of a point on a given plane parameterized by ax+by+cz+d=0
*/
function getProjection(v, a, b, c, d) {
	var t = -(a*v.x + b*v.y + c*v.z + d) / (a*a + b*b + c*c);
	return new THREE.Vector3(v.x + a*t, v.y + b*t, v.z + c*t);
}