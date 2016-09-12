
/**********************************************************************************************

	for fabricating strapped handle

**********************************************************************************************/

var strokes = [];
var strokePoints = [];
var facesToStrapOn = [];
var verticesToStrapOn = [];

var minMargin = 0.5;
var heightStrap = 3//4;
var widthStrap = 1.5//2.5;

var angleStrap;
var axisStrap;

var connectors = [];

var radiusMinimumStrap = 3;
var radiusHandleStrap = 5;

var geometryHandle;

function makeStrapPrintable(obj, faceSelected) {

	radiusHandleStrap = attachmentMethod == ADHESIVE ? 6 : 3;

	/*
		some variables used
	*/
	// var strappableFace;
	var ctrConnector;
	var rConnector;
	var nmlConnector;

	var ctrStrap = new THREE.Vector3();
	var rStrap;
	// var dimStrap;


	obj.updateMatrixWorld();


	// log("")
	/*
		computing connector info + rotating the object
	*/

	var va = obj.geometry.vertices[faceSelected.a].clone().applyMatrix4(obj.matrixWorld);
	var vb = obj.geometry.vertices[faceSelected.b].clone().applyMatrix4(obj.matrixWorld);
	var vc = obj.geometry.vertices[faceSelected.c].clone().applyMatrix4(obj.matrixWorld);
		
	var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

	var strapNeighbors = [faceSelected];
	var k = EVALUATIONMODE ? 0.75 : 1.5;
	findNeighbors(obj, faceSelected, ctr, Math.min(5, radiusHandleStrap*k), strapNeighbors);
	cleanUpNeighbors(strapNeighbors);

	var nmlStats = assessFlatness(obj, strapNeighbors);
	ctrConnector = EVALUATIONMODE ? faceSelected.actualPoint : ctr;
	nmlConnector = nmlStats.mean.normalize();

	var yUp = new THREE.Vector3(0, 1, 0);
	var v = new THREE.Vector3().crossVectors(yUp, nmlConnector);
	var u = nmlConnector;

	var a = u.y*v.z - u.z*v.y;
	var b = u.z*v.x - u.x*v.z;
	var c = u.x*v.y - u.y*v.x;
	var d = -a*ctr.x - b*ctr.y - c*ctr.z;

	var v0 = new THREE.Vector3(0, 0, -d/c);
	var v1 = new THREE.Vector3(0, -d/b, 0);
	var v2 = new THREE.Vector3(-d/a, 0, 0);

	// addATriangle(v0, v1, v2, 0xffff00);

	var matConnector = new THREE.MeshPhongMaterial( { color: 0x080888, transparent: true, opacity: 0.5} );
	matConnector.DoubleSide = true;

	if(attachmentMethod == ADHESIVE) {

		/* carefully compute how tall/long the connector needs to be */
		ctrConnector.y += radiusHandleStrap;
		var connector = makeStrapConnector(ctrConnector, radiusHandleStrap, 
			// Math.max(rConnector * 2, (widthStrap + minMargin * 2) * 2), nmlConnector);
			radiusHandleStrap * 2,
			nmlConnector);

		// connector.position.add(nmlConnector.multiplyScalar(0.5));
		connector.updateMatrixWorld();
		var subConnector = csgSubtract(connector, obj, matConnector);

		scene.add(subConnector);
		connectors.push(subConnector);
		return;
	}

	var nmlPlane = new THREE.Vector3(a, b, c);
	var angleToRotateObj = nmlPlane.angleTo(yUp);
	var axisToRotateObj = nmlPlane.clone().cross(yUp).normalize();
	obj.rotateOnAxis(axisToRotateObj, angleToRotateObj);

	obj.updateMatrixWorld();
	rStrap = faceSelected.rCrossSection;

	rConnector = Math.min(rStrap, radiusHandleStrap);

	/* 
		digging a tunnel 
	*/

	/* find a common plane i 2xr neighborhood */
	strapNeighbors = [];
	findNeighbors(obj, faceSelected, ctrConnector, rConnector*2, strapNeighbors);
	cleanUpNeighbors(strapNeighbors);
	if(strapNeighbors.length > 0) {
		var points = [];
		for(var i=0; i<strapNeighbors.length; i++) {
			strapNeighbors[i].collected = false;

			var f = strapNeighbors[i];
			var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
			var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
			var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

			// addATriangle(va, vb, vc, 0xff0ff0);
			points.push(va);
			points.push(vb);
			points.push(vc);
		}

		var planeParams = findPlaneToFitPoints(points);
		a = planeParams.A;
		b = planeParams.B;
		c = planeParams.C;
		d = planeParams.D;
	}


	/* compute the raise distance */
	var maxDist = -INFINITY;
	for(var i=0; i<points.length; i++) {
		var v = points[i];

		/* there are points from the extended search that actually fall out of r */
		if(getProjection(v, a, b, c, d).distanceTo(ctrConnector) > rConnector) {
			continue;
		}
		var dist = Math.abs(a*v.x + b*v.y + c*v.z + d) / Math.sqrt(a*a + b*b + c*c);

		maxDist = Math.max(dist, maxDist);
	}

	/* dig tunnerl at that distance so it does not intersect with the object */
	var ctrTunnel = ctrConnector.clone().add(
		nmlConnector.clone().multiplyScalar(maxDist + minMargin + widthStrap/2));
	console.log(nmlConnector);
	// addABall(ctrTunnel.x, ctrTunnel.y, ctrTunnel.z, 0xf00fff, 1);
	// var tunnel = makeTunnel(ctrTunnel, widthStrap, heightStrap, rConnector * 2);
	// scene.add(tunnel);

	var matTunnel = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	var rStubOuter = rStrap + widthStrap; //Math.abs(dimStrap.dot(nmlConnector)) / 2;
	// rStubOuter *= 1.1;
	var ctrStubs = ctrTunnel.clone().sub(nmlConnector.multiplyScalar(rStubOuter - widthStrap/2));
	// rStubOuter += widthStrap;
	var stubOuter = makeStub(ctrStubs, rStubOuter, heightStrap, nmlConnector);
	scene.add(stubOuter);

	var rStubInner = rStubOuter - widthStrap;
	var stubInner = makeStub(ctrStubs, rStubInner, heightStrap, nmlConnector);
	scene.add(stubInner);

	var strap = csgSubtract(stubOuter, stubInner, matTunnel);
	// strap.position.add(nmlConnector.multiplyScalar(0.5));

	// strap.applyMatrix(obj.matrixWorld);
	// var yUp = new THREE.Vector3(0, 1, 0);
	// var vecStrap = ctrTunnel.clone().sub(ctrStubs);
	// var angleToRotateStrap = Math.PI/2 - vecStrap.angleTo(yUp);
	// console.log(angleToRotateStrap * 180/Math.PI);
	// var axisToRotateStrap = vecStrap.clone().cross(yUp).normalize();
	// strap.rotateOnAxis(axisToRotateStrap, angleToRotateStrap);

	scene.add(strap);
	scene.remove(stubOuter);
	scene.remove(stubInner);


	// return;

	/* 
		adding a connector & perform csg
	*/

	var matConnector = new THREE.MeshPhongMaterial( { color: 0x080888, transparent: true, opacity: 0.5} );

	/* carefully compute how tall/long the connector needs to be */
	var connector = makeStrapConnector(ctrConnector, rConnector, 
		// Math.max(rConnector * 2, (widthStrap + minMargin * 2) * 2), nmlConnector);
		Math.max(rConnector * 2, (rStubOuter - ctrConnector.distanceTo(ctrStubs)) * 2 + minMargin), 
		nmlConnector);

	// connector.position.add(nmlConnector.multiplyScalar(0.5));
	connector.updateMatrixWorld();
	var subConnector = csgSubtract(connector, obj, matConnector);


	subConnector = csgSubtract(subConnector, strap, matConnector);
	scene.remove(strap);
	scene.add(subConnector);

	connectors.push(subConnector);

}



function makeStrapConnector(ctr, r, h, nml) {
	var geometry = new THREE.CylinderGeometry( r, r, h, 16 );

	if(EVALUATIONMODE) {
		geometryHandle = new THREE.TorusGeometry(7.25, 2, 16, 100);
		var m1 = new THREE.Matrix4();
		m1.makeRotationX( Math.PI/2 );
		m1.makeTranslation(0, h + 7.25/2 - 2*2 + h, 0);
		geometryHandle.applyMatrix(m1);
		// THREE.GeometryUtils.merge(geometry, geometryHandle);
	}

	var connector= new THREE.Mesh( geometry );


	var yUp = new THREE.Vector3(0, 1, 0);
	angleStrap = yUp.angleTo(nml);
	axisStrap = new THREE.Vector3().crossVectors(yUp, nml).normalize();

	connector.rotateOnAxis(axisStrap, angleStrap);
	connector.position.copy(ctr);

	return connector;
}

function makeStub(ctr, r, h, tilt) {
	var material = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	var geometry = new THREE.CylinderGeometry( r, r, h, 16 );
	
	var stub = new THREE.Mesh( geometry, material);

	var yUp = new THREE.Vector3(0, 1, 0);
	var angleStub = tilt.angleTo(yUp);
	var axisStub = new THREE.Vector3().crossVectors(yUp, tilt).normalize();
	console.log("angleStub: " + angleStub * 180 / Math.PI);
	stub.rotateOnAxis(axisStub, - (Math.PI/2 - angleStub));
	stub.position.copy(ctr);

	return stub;
}

function makeTunnel(ctr, w, h, l, nml) {
	var material = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	var geometry = new THREE.CubeGeometry(l*1.5, h, w);
	var tunnel = new THREE.Mesh(geometry, material);

	var yUp = new THREE.Vector3(0, 1, 0);
	tunnel.rotateOnAxis(axisStrap, angleStrap);
	tunnel.position.copy(ctr);

	return tunnel;
}

function saveStrapObjects() {

	var mergedGeom = objDynamic == undefined ? 
		undefined : getTransformedGeometry(objDynamic);

	// if(EVALUATIONMODE) {
	// 	mergedGeom = getTransformedGeometry(objStatic);
	// }

	if(EVALUATIONMODE && attachmentMethod == ADHESIVE) {
		geometryHandle.applyMatrix(connectors[0].matrixWorld);
		mergedGeom = geometryHandle;
	}

	for(var i=0; i<connectors.length; i++) {
	// console.log(mergedGeom);
		var connectorGeom = connectors[i].geometry.clone();
		connectorGeom.applyMatrix(connectors[i].matrixWorld);

		if(mergedGeom == undefined) {
			mergedGeom = connectorGeom;
		} else {
			THREE.GeometryUtils.merge(mergedGeom, connectorGeom);
		}
	}

	var m = new THREE.Matrix4();
	m.makeRotationX(Math.PI/2);
	mergedGeom.applyMatrix(m);

	var stlStr = stlFromGeometry( mergedGeom );
	var blob = new Blob([stlStr], {type: 'text/plain'});
	saveAs(blob, name + '.stl');
}