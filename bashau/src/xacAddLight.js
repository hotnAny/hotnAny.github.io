var lights = [];
lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[0].position.set( 0, 100, -100 );
lights[1].position.set( 100, 100, 100 );
lights[2].position.set( -100, 100, 100 );

scene.add( lights[0] );
scene.add( lights[1] );
scene.add( lights[2] );

// ambient light
scene.add( new THREE.AmbientLight( 0x000000) );