var line_material = new THREE.LineBasicMaterial( { color: 0x303030 } ),
	geometry = new THREE.Geometry(),
	floor = -75, step = 25;

for ( var i = 0; i <= 40; i ++ ) {

	geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
	geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

	geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
	geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

}

var line = new THREE.Line( geometry, line_material, THREE.LinePieces );
scene.add( line );