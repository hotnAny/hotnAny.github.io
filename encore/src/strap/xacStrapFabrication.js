var strokes = [];
var strokePoints = [];
var facesToStrapOn = [];

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

	for(var r=radiusHandle; r>radiusMinimum; r*=shrinkRatio) {
		obj.updateMatrixWorld();
		var strappableFace;
		var minSd = INFINITY;
		var v0, v1, v2;

		for(var i=0; i<facesToStrapOn.length; i++) {
			var f = facesToStrapOn[i];
			neighbors = [];

			var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
			var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
			var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);
			
			var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
			
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
				nmlConnector = nmlStats.mean;

				/*for debugging*/
				strappableFace = f;
				minSd = nmlStats.sd;
				v0 = va;
				v1 = vb;
				v2 = vc;
			}
		}
		
		if(strappableFace != undefined) {
			rConnector = r;

			/*for debugging*/
			addATriangle(v0, v1, v2, 0xffff00);
			break;
		}
	}


	/* 
		perform csg 
	*/
	var material = new THREE.MeshPhongMaterial( { color: 0x080888, transparent: true, opacity: 0.5} );
	var geometry = new THREE.CylinderGeometry( rConnector, rConnector, rConnector, 16 );
	connector= new THREE.Mesh( geometry, material );
	var yUp = new THREE.Vector3(0, 1, 0);
	var angleStrap = yUp.angleTo(nmlConnector);
	var axisStrap = new THREE.Vector3().crossVectors(yUp, nmlConnector).normalize();
	connector.rotateOnAxis(axisStrap, angleStrap);
	connector.position.set(ctrConnector.x, ctrConnector.y, ctrConnector.z);

	scene.add(connector);


	/* 
		dig a tunnel in the connector for the strap 
			- straight tunnel
			- curvy tunnel
	*/

	/**/
}