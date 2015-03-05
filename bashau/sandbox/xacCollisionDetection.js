
/*

	OBSELETE

*/

var balls;

// var ball1;
// var ball2;

if(D_COLLISION) {
	// var geometry = new THREE.SphereGeometry( 2, 10, 10 );
 //  	var material = new THREE.MeshBasicMaterial( { color: 0xf0ff00 } );
 //  	ball1 = new THREE.Mesh( geometry, material );
 //  	scene.add( ball1 );
 //  	ball2 = new THREE.Mesh( geometry, material );
 //  	scene.add( ball2 );
 	balls = new THREE.Object3D();
}

/********************/
/* WORK IN PROGRESS */
/********************/
function detectCollision(obj1, obj2)
{
	// var ray = new THREE.Ray(obj1.position, obj2.position);
	var rayCaster = new THREE.Raycaster();
	// var rayCaster = new THREE.Raycaster(obj1.position, obj2.position - obj1.position, 0, 1000);
	var direction = new THREE.Vector3();
	direction.subVectors(obj2.position, obj1.position);
	rayCaster.ray.set(obj1.position, direction.normalize());

	var collidables = [obj1, obj2];
	var intersects = rayCaster.intersectObjects( collidables );
	// var collision = THREE.Collisions.rayCast(ray);
	// if(collision && collision.distance <= 50) {
	
	for (var i = 0; i < objects.length; i++) {
		objects[i].material.color.setHex(colorCollided);
	};

	if(intersects.length > 1) {
		console.log(intersects[0].object == obj1 ? "obj1, obj2" : "obj2 : obj1");
	}
	
	// for (var i = 0; i < intersects.length; i++) {
	// 	intersects[i].object.material.color.setHex(colorCollided);
	// };

	// if(intersects.length > 0) {
	// 	obj1.material.color.setHex(colorCollided);
	// 	obj2.material.color.setHex(colorCollided);
	// } else {
	// 	obj1.material.color.setHex(colorNormal);
	// 	obj2.material.color.setHex(colorNormal);
	// }

	if(D_COLLISION) {
		ball1.position.x = obj1.position.x;
		ball1.position.y = obj1.position.y;
		ball1.position.z = obj1.position.z;

		ball2.position.x = obj2.position.x;
		ball2.position.y = obj2.position.y;
		ball2.position.z = obj2.position.z;
	}
}