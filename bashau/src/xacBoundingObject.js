/*
	only for testing the physics engine
*/

function createBoxelizedSphere(radius, numBoxes) {
	var bSphere;
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	var height = (Math.random() + 1) * radius;

	var x0, y0;
	var dim = 2 * Math.PI * radius / numBoxes;
	for(var i=0; i<numBoxes; i++) {
		var box = new Physijs.BoxMesh(new THREE.CubeGeometry( dim, dim, dim ), material);

		var x = radius * Math.sin(i * 2 * Math.PI / numBoxes);
		var y = radius * Math.cos(i * 2 * Math.PI / numBoxes);

		// console.log(x + ", " + y);

		if(i == 0) {
			box.position.set(x, y, 0);
			x0 = x;
			y0 = y;
			bSphere = box;
		} else {
			box.position.set(x - x0, y - y0, 0);
			bSphere.add(box);
		}

	}

	bSphere.position.y += height;
	bSphere.rotation.set(Math.random() * Math.PI / 2, Math.random() * Math.PI / 2, Math.random() * Math.PI / 2);
	objects.push(bSphere);
	scene.add(bSphere);
}