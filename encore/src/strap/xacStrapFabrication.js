var strokes = [];
var strokePoints = [];
var facesToStrapOn = [];

var lengthStrap = 2;
var widthStrap = 1;

function makeStrapPrintable (obj) {
	/* 
		find the size and position of the connector
	*/
	var OCCLUSION = 1;
	var NOTENOUGHSUPPORT = 2;
	var TOOMUCHDROP = 3;
	var CONNECTORTOOTHIN = 4;
	var UNKNOWN = 0;

	var REASONMESSAGES 
		= ['unknown', 'occlusion', 'not enough support', 'too much drop', 'connector too thin'];
	var unprintableReason = UNKNOWN;

	var ctrConnector;
	var rConnector;
	var nmlConnector;

	var ctrStrap = new THREE.Vector3();
	var dimStrap;

	for(var r=radiusHandle; r>radiusMinimum; r*=shrinkRatio) {
		obj.updateMatrixWorld();
		var strappableFace;
		var minSd = INFINITY;
		var v0, v1, v2;
		
		var minStrap = new THREE.Vector3(INFINITY, INFINITY, INFINITY);
		var maxStrap = new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY);

		for(var i=0; i<facesToStrapOn.length; i++) {
			var f = facesToStrapOn[i];
			neighbors = [];

			var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
			var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
			var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);
			
			var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
			// ctrStrap.add(ctr);

			minStrap.x = Math.min(minStrap.x, ctr.x);
			minStrap.y = Math.min(minStrap.y, ctr.y);
			minStrap.z = Math.min(minStrap.z, ctr.z);

			maxStrap.x = Math.max(maxStrap.x, ctr.x);
			maxStrap.y = Math.max(maxStrap.y, ctr.y);
			maxStrap.z = Math.max(maxStrap.z, ctr.z);

			var nmlFace = new THREE.Vector3().crossVectors(
						new THREE.Vector3().subVectors(vb, va),
						new THREE.Vector3().subVectors(vc, va));

			findNeighbors(obj, f, ctr, r*1.5, neighbors);

			if(neighbors.length <= 0) {
				continue;
			}

			var nmlStats = assessFlatness(obj, neighbors);
			if(Math.abs(nmlStats.sd) < minSd) {
				ctrConnector = ctr;
				nmlConnector = nmlStats.mean.normalize();

				/*for debugging*/
				strappableFace = f;
				minSd = nmlStats.sd;
				v0 = va;
				v1 = vb;
				v2 = vc;
			}
		}

		if(facesToStrapOn.length > 0) {
			// ctrStrap.divideScalar(facesToStrapOn.length);
			ctrStrap = new THREE.Vector3().addVectors(minStrap, maxStrap).divideScalar(2);
			rStrap = minStrap.distanceTo(maxStrap) / 2;
			// dimStrap = new THREE.Vector3().subVectors(maxStrap, minStrap);
			addALine(minStrap, maxStrap, 0xff0000);
			addABall(ctrStrap.x, ctrStrap.y, ctrStrap.z, 0xff0000, 0.5);
		}
		
		if(strappableFace != undefined) {
			rConnector = r;

			/*for debugging*/
			addATriangle(v0, v1, v2, 0xffff00);
			break;
		}
	}


	/* 
		adding a connector & perform csg
	*/
	var matConnector = new THREE.MeshPhongMaterial( { color: 0x080888, transparent: true, opacity: 0.5} );
	var connector = makeConnector(ctrConnector, rConnector, rConnector * 2, nmlConnector);
	// connector.position.add(nmlConnector.multiplyScalar(0.5));
	connector.updateMatrixWorld();
	var subConnector = csgSubtract(connector, obj, matConnector);

	scene.add(subConnector);

	/* 
		dig a tunnel in the connector for the strap 
			- straight tunnel
			- curvy tunnel
	*/

	/*find the centers*/
	var matTunnel = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	subConnector.updateMatrixWorld();
	var ctrSubConnector = new THREE.Vector3();
	var minSubConnector = new THREE.Vector3(INFINITY, INFINITY, INFINITY);
	var maxSubConnector= new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY);
	for (var i = 0; i < subConnector.geometry.vertices.length; i++) {
		var v = subConnector.geometry.vertices[i].clone().applyMatrix4(subConnector.matrixWorld);

		minSubConnector.x = Math.min(minSubConnector.x, v.x);
		minSubConnector.y = Math.min(minSubConnector.y, v.y);
		minSubConnector.z = Math.min(minSubConnector.z, v.z);

		maxSubConnector.x = Math.max(maxSubConnector.x, v.x);
		maxSubConnector.y = Math.max(maxSubConnector.y, v.y);
		maxSubConnector.z = Math.max(maxSubConnector.z, v.z);

		// ctrSubConnector.add(v);
	};
	// ctrSubConnector.divideScalar(subConnector.geometry.vertices.length);
	ctrSubConnector = new THREE.Vector3().addVectors(minSubConnector, maxSubConnector).divideScalar(2);

	// TODO: this raise can be calculated
	// ctrSubConnector.add(nmlConnector.multiplyScalar(0.25));


	// console.log(ctrSubConnector);
	addABall(ctrSubConnector.x, ctrSubConnector.y, ctrSubConnector.z, 0x00ff00, 0.5);

	/*make two cylinder*/
	// var rStubOuter = Math.abs(new THREE.Vector3().subVectors(ctrSubConnector, ctrStrap).dot(nmlConnector));
	var rStubOuter = rStrap; //Math.abs(dimStrap.dot(nmlConnector)) / 2;
	// rStubOuter *= 1.1;
	var ctrStubs = ctrSubConnector.clone().sub(nmlConnector.multiplyScalar(rStubOuter));
	// rStubOuter += widthStrap;
	var stubOuter = makeStub(ctrStubs, rStubOuter, lengthStrap, nmlConnector);
	scene.add(stubOuter);

	var rStubInner = rStubOuter - widthStrap;
	var stubInner = makeStub(ctrStubs, rStubInner, lengthStrap, nmlConnector);
	scene.add(stubInner);

	var strap = csgSubtract(stubOuter, stubInner, matTunnel);
	// strap.position.add(nmlConnector.multiplyScalar(0.5));
	scene.add(strap);
	scene.remove(stubOuter);
	scene.remove(stubInner);
}

function makeConnector(ctr, r, h, nml) {
	var geometry = new THREE.CylinderGeometry( r, r, h, 32 );
	var connector= new THREE.Mesh( geometry );

	var yUp = new THREE.Vector3(0, 1, 0);
	var angleStrap = yUp.angleTo(nml);
	var axisStrap = new THREE.Vector3().crossVectors(yUp, nml).normalize();

	connector.rotateOnAxis(axisStrap, angleStrap);
	connector.position.copy(ctr);

	return connector;
}

function makeStub(ctr, r, h, tilt) {
	var material = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	var geometry = new THREE.CylinderGeometry( r, r, h, 32 );
	var stub = new THREE.Mesh( geometry, material);

	var yUp = new THREE.Vector3(0, 1, 0);
	var angleStub = tilt.angleTo(yUp);
	var axisStub = new THREE.Vector3().crossVectors(yUp, tilt).normalize();
	console.log("angleStub: " + angleStub * 180 / Math.PI);
	stub.rotateOnAxis(axisStub, - (Math.PI/2 - angleStub));
	stub.position.copy(ctr);

	return stub;
}