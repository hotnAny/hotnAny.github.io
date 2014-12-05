// directional light
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 1, 1, 1 );
scene.add( directionalLight );

// ambient light
scene.add( new THREE.AmbientLight( 0x888888 ) );