function detectOverlap() {
	checkInitialization();
	return detectOverlapBetweenObjects(objDynamic, objStatic);	
}

/* note: obj2 is static */
function detectOverlapBetweenObjects(objD, objS) {

	var isOverlapping = true;
	var t0 = new Date().getTime();

	/* step one: find mutually bounded points */
	if(findMutuallyBoundedBetweenObjects3D(objD, objS, new Array()) <= 0) {
		isOverlapping = false;
	}
	else {
		/* if there are, go to the projection level */
		if(D_OVERLAP) showProjections();	

		makeProjections(objD, projDynamic);
		// console.log(projDynamic.length);

		refreshDebugView();
		for(var i=0; i<3; i++) {
			var projD = projDynamic[i];
			var projS = projStatic[i];
			var octreeProjS = octreesProj[i];		

			var arrMuBounded = new Array();
			findMutuallyBoundedBetweenObjects2D(projD, projS, arrMuBounded);
			var isProjIntersecting = detectInsersectionBetweenObjects2D(projD, projS, octreeProjS, arrMuBounded);

			if(!isProjIntersecting) {
				isOverlapping = false;
				break;
			}
		}
		if(D_OVERLAP) updateDebugView();
	}

	log((isOverlapping ? "overlapping" : "not overlapping") + ". finished in " + timeElapsed(t0) + " msec.");

	if(!D_OVERLAP) {
		hideProjections();
	}

	return isOverlapping;
}

function showProjections() {

	for(var i=0; i<projStatic.length; i++) {
		scene.add(projStatic[i]);
	}
	for(var i=0; i<projDynamic.length; i++) {
		scene.add(projDynamic[i]);
	}
}

function hideProjections() {

	for(var i=0; i<projStatic.length; i++) {
		scene.remove(projStatic[i]);
	}
	for(var i=0; i<projDynamic.length; i++) {
		scene.remove(projDynamic[i]);
	}
}

function makeProjections(obj, array) {

	for(var i=0; i<array.length; i++) {
		scene.remove(array[i]);
	}

	array.length = 0;

	obj.updateMatrixWorld();
	var len = obj.geometry.vertices.length;
	for(var i=0; i<3; i++) {
		var material = new THREE.MeshPhongMaterial( { color: colors[i]} );  
		var objProjGeom = obj.geometry.clone();
		var objProj = new THREE.Mesh(objProjGeom, material);
		// objProj.applyMatrix(obj.matrixWorld);
		// if(D_OVERLAP) {
    		var offset = 60;
    		objProj.position.set(offset * (i==0?1:0), offset * (i==1?1:0), offset * (i==2?1:0));

    		// if(D_OVERLAP) 
    			scene.add(objProj);
		// }

		for(var j=0; j<len; j++) {
			var v = objProjGeom.vertices[j];
			v.applyMatrix4(obj.matrixWorld);
			v.setX(v.x * (i==0?0:1));
			v.setY(v.y * (i==1?0:1));
			v.setZ(v.z * (i==2?0:1));
		}

    	// objProj.applyMatrix(obj.matrixWorld);

		array.push(objProj);
	}
}

function mask(guess, answer) {
	return guess == answer ? 1 : 0;
}

function applyMatrixToObject(obj, m) {
  var len = obj.geometry.vertices.length;
  for (var i = 0; i < len; i++) {
    obj.geometry.vertices[i].applyMatrix(m);
  };
}