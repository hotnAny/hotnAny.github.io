var groundMaterial = new THREE.MeshBasicMaterial( { color: 0x030303 } );
var geometryGround = new THREE.PlaneGeometry( 1000, 1000, 25, 25 );

var ground = new THREE.Mesh( geometryGround, groundMaterial );
ground.rotation.x -= Math.PI / 2;
// ground.position.set(0, -50, 0);
scene.add( ground );