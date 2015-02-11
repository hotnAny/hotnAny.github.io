var groundMaterial = new THREE.MeshBasicMaterial( { color: 0x030303 } );

/* original */
// var geometryGround = new THREE.PlaneGeometry( 1000, 1000, 25, 25 );
// var ground = new THREE.Mesh( geometryGround, groundMaterial );
// ground.rotation.x -= Math.PI / 2;

/* physics */
var geometryGround = new THREE.CubeGeometry(1000, 1, 1000);
var ground = new Physijs.BoxMesh(
      geometryGround,
      groundMaterial,
      0 // mass
    );
ground.receiveShadow = true;
ground.position.y -= 0.5
;

scene.add(ground);