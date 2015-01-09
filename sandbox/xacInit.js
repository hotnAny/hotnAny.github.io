// ///////////////
// for debugging
var D = false;
var D_MOUSE = false;
var D_COLLISION = false;
var D_INTERSECTION = true;
var helpers = new Array();

var boxes = new THREE.Object3D();

// ///////////////
var ball;

var objects = new Array();
var objectMoved = new Array();
var selected = new Array();

var colorNormal = 0xffffff;
var colorSelected = 0x00ff00;
var colorCollided = 0xff0000;

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 1, 10000 );
camera.position.set(-0, 150, 180);

var controls = new THREE.TrackballControls( camera ); // for mouse control

var angle = 0;

var octree = new THREE.Octree({
		  // automatic, no need to specify
		  // radius: 100,	

		  // when undeferred = true, objects are inserted immediately
          // instead of being deferred until next octree.update() call
          // this may decrease performance as it forces a matrix update
          undeferred: false,

          // set the max depth of tree
          depthMax: Infinity,

          // max number of objects before nodes split or merge
          objectsThreshold: 1,

          // percent between 0 and 1 that nodes will overlap each other
          // helps insert objects that lie over more than one node
          // overlapPct: 0,

          // pass the scene to visualize the octree
          scene: scene
      });

// var octrees = new Array();