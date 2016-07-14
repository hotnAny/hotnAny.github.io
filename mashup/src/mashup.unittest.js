function unitTest() {
	log('---------------- unit test begins ----------------');

	// log(p2ls(1.01, 0.5, 0, 0, 0, 0, 1, 0, 0))

	// getMedian([3, 5, 1, 8, 6])

	// var thing = new XAC.Thing();
	// log(thing.g)
	// thing.unitTest();
	// var sphere = new XAC.Sphere(10);
	// log(sphere)

	// addABall(new THREE.Vector3(0, 0, 0), 0xff0000, 5)

	// var sketchpad = new MASHUP.Sketchpad($(document.body), window.innerWidth, window.innerHeight);
	// sketchpad.open()

	// var I = numeric.identity(3);
	// numeric.mul(I, 0.5);
	// log(I)

	// var verticesOfCube = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, ];

	// var indicesOfFaces = [
	// 	2, 1, 0, 0, 3, 2,
	// 	0, 4, 7, 7, 3, 0,
	// 	0, 1, 5, 5, 4, 0,
	// 	1, 2, 6, 6, 5, 1,
	// 	2, 3, 7, 7, 6, 2,
	// 	4, 5, 6, 6, 7, 4
	// ];

	// var geometry = new THREE.PolyhedronGeometry(verticesOfCube, indicesOfFaces, 2);
	// var mesh = new THREE.Mesh(geometry, XAC.MATERIALNORMAL.clone());
	// scene.add(mesh)

	// var values = [3,5,2,14,8];
	// log(XAC.getStd(values));

	// var curve = new THREE.CubicBezierCurve3(
	// 	new THREE.Vector3(-10, 0, 0),
	// 	new THREE.Vector3(-5, 15, 0),
	// 	new THREE.Vector3(20, 15, 0),
	// 	new THREE.Vector3(10, 0, 0)
	// );

	// var geometry = new THREE.Geometry();
	// geometry.vertices = curve.getPoints(50);

	// var material = new THREE.LineBasicMaterial({
	// 	color: 0xff0000
	// });

	// // Create the final Object3d to add to the scene
	// var curveObject = new THREE.Line(geometry, material);
	// scene.add(curveObject);

	document.addEventListener('keydown', function(e) {
		switch (e.keyCode) {
			case 49:
				MASHUP.design._mode = MASHUP.Design.SKETCH;
				MASHUP.design.disableEventListeners();
				break;
			case 50:
				MASHUP.design._mode = MASHUP.Design.EDIT;
				MASHUP.design._medialAxis.enableEventListeners();
				break;
			case 51:
				break;
			case 52:
				break;
		}
	}, false);


	var p = new THREE.Vector3(1, 0, 0);
	var q = new THREE.Vector3(2, 0, 0);
	var u = new THREE.Vector3(2, 1, 0);
	var v = new THREE.Vector3(0, 1, 0);
	log(vectorsIntersection(p, u, q, v));

	log('----------------  unit test ends  ----------------');
}