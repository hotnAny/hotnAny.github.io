var groundMaterial = new THREE.MeshBasicMaterial( { color: 0xBFB2A3, transparent: true, opacity: 0.25 } );

/* original */
// var geometryGround = new THREE.PlaneGeometry( 1000, 1000, 25, 25 );
// var ground = new THREE.Mesh( geometryGround, groundMaterial );
// ground.rotation.x -= Math.PI / 2;

/* physics */
var geometryGround = new THREE.CubeGeometry(1000, 1, 1000);
var ground = new THREE.Mesh(
      geometryGround,
      groundMaterial,
      0 // mass
    );
// var df = 0.0;
// ground.setDamping([df, df, df], [df, df, df]);
ground.receiveShadow = true;
ground.position.y -= 50;
;

scene.add(ground);