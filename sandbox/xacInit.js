var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 10000 );
camera.position.set(-0, 180, 200);
camera.rotation.x -= Math.PI / 6;

var controls = new THREE.TrackballControls( camera ); // for mouse control

var angle = 0;