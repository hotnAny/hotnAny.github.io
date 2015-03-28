var strokes = [];
var strokePoints = [];
var facesToStrapOn = [];
var verticesToStrapOn = [];

var minMargin = 1.5;
var heightStrap = 4	;
var widthStrap = 2.5;

var angleStrap;
var axisStrap;

var connectors = [];

function makeStrapPrintable(obj) {

	/*
		clean up some visuals
	*/
	for (var i = 0; i < visualsStrap.length; i++) {
		scene.remove(visualsStrap[i]);
	};

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

	var strappableFace;
	var ctrConnector;
	var rConnector;
	var nmlConnector;

	var ctrStrap = new THREE.Vector3();
	var dimStrap;

	for(var r=radiusHandleStrap; r>radiusMinimumStrap; r*=shrinkRatio) {
		obj.updateMatrixWorld();
		
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

			/* finding the neighbors */
			findNeighbors(obj, f, ctr, r*1.5, neighbors);
			if(neighbors.length <= 0) {
				continue;
			}
			for(var j=0; j<neighbors.length; j++) {
				neighbors[j].collected = false;
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
			// addALine(minStrap, maxStrap, 0xff0000);
			// addABall(ctrStrap.x, ctrStrap.y, ctrStrap.z, 0xff0000, 0.5);
		}
		
		if(strappableFace != undefined) {
			rConnector = r;

			/*for debugging*/
			addATriangle(v0, v1, v2, 0xffff00);
			break;
		}
	}

	/*
		assess strappability
	*/
	assessStrappability(obj, strappableFace, nmlConnector);

	
	/* 
		adding a connector & perform csg
	*/
	var matConnector = new THREE.MeshPhongMaterial( { color: 0x080888, transparent: true, opacity: 0.5} );
	var connector = makeConnector(ctrConnector, rConnector, 
		Math.max(rConnector * 2, (widthStrap + minMargin * 2) * 2), nmlConnector);
	// connector.position.add(nmlConnector.multiplyScalar(0.5));
	connector.updateMatrixWorld();
	var subConnector = csgSubtract(connector, obj, matConnector);

	

	/* 
		digging a tunnel 
	*/

	/* find a common plane */
	neighbors = [];
	findNeighbors(obj, strappableFace, ctrConnector, rConnector*2, neighbors);
	var points = [];
	for(var i=0; i<neighbors.length; i++) {
		neighbors[i].collected = false;

		var f = neighbors[i];
		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

		// addATriangle(va, vb, vc, 0xff0ff0);
		points.push(va);
		points.push(vb);
		points.push(vc);
	}

	var planeParams = findPlaneToFitPoints(points);
	var a = planeParams.A;
	var b = planeParams.B;
	var c = planeParams.C;
	var d = planeParams.D;

	// var v0 = new THREE.Vector3(0, 0, -d/c);
	// var v1 = new THREE.Vector3(0, -d/b, 0);
	// var v2 = new THREE.Vector3(-d/a, 0, 0);

	// addATriangle(v0, v1, v2, 0xffff00);

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

	/* dig tunnerl at that distance */
	var ctrTunnel = ctrConnector.clone().add(nmlConnector.clone().multiplyScalar(maxDist + minMargin + widthStrap/2));
	// addABall(ctrTunnel.x, ctrTunnel.y, ctrTunnel.z, 0xf00fff, 1);
	// var tunnel = makeTunnel(ctrTunnel, widthStrap, heightStrap, rConnector * 2);
	// scene.add(tunnel);

	var matTunnel = new THREE.MeshPhongMaterial( { color: 0x888008, transparent: true, opacity: 0.5} );
	var rStubOuter = rStrap; //Math.abs(dimStrap.dot(nmlConnector)) / 2;
	// rStubOuter *= 1.1;
	var ctrStubs = ctrTunnel.clone().sub(nmlConnector.multiplyScalar(rStubOuter));
	// rStubOuter += widthStrap;
	var stubOuter = makeStub(ctrStubs, rStubOuter, heightStrap, nmlConnector);
	scene.add(stubOuter);

	var rStubInner = rStubOuter - widthStrap;
	var stubInner = makeStub(ctrStubs, rStubInner, heightStrap, nmlConnector);
	scene.add(stubInner);

	var strap = csgSubtract(stubOuter, stubInner, matTunnel);
	// strap.position.add(nmlConnector.multiplyScalar(0.5));
	scene.add(strap);
	scene.remove(stubOuter);
	scene.remove(stubInner);

	subConnector = csgSubtract(subConnector, strap, matConnector);
	scene.remove(strap);
	scene.add(subConnector);

	connectors.push(subConnector);
}



function makeConnector(ctr, r, h, nml) {
	var geometry = new THREE.CylinderGeometry( r, r, h, 32 );
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

	var mergedGeom = getTransformedGeometry(objDynamic);

	for(var i=0; i<connectors.length; i++) {
	// console.log(mergedGeom);
		var connectorGeom = connectors[i].geometry.clone();
		connectorGeom.applyMatrix(connectors[i].matrixWorld);

		// if(i==0) {
		// 	mergedGeom = supportGeom.clone();
		// } else {
		THREE.GeometryUtils.merge(mergedGeom, connectorGeom);
	}

	var m = new THREE.Matrix4();
	m.makeRotationX(Math.PI/2);
	mergedGeom.applyMatrix(m);

	var stlStr = stlFromGeometry( mergedGeom );
	var blob = new Blob([stlStr], {type: 'text/plain'});
	saveAs(blob, name + '.stl');
}