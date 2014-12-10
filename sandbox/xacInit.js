// for debugging
var D = false;
var ball;

var objects = new Array();
var selected = new Array();

var colorNormal = 0xffffff;
var colorSelected = 0x00ff00;

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 10000 );
camera.position.set(-0, 180, 200);

var controls = new THREE.TrackballControls( camera ); // for mouse control

var angle = 0;