// ///////////////
// for debugging
var D = false;

var helpers = new Array();

var balls = new THREE.Object3D();
var boxes = new THREE.Object3D();

// ///////////////
var EPSILON = 10e-3;
var INFINITY = 10e9;

var BACKGROUNDCOLOR = 0xF2F0F0;
var GROUNDCOLOR     = 0xF2F0F0;
var GRIDCOLOR       = 0x888888;

var ball;

var objDynamic = null;
var objStatic = null;
var objects = new Array();
var legends = new Array();
var octrees = new Array();
var voxelGrids = new Array();
var supports = new Array();
var objectPair;// = new THREE.Object3D();

// #obselete
// projections of objStatic
// var projStatic = new Array();
// var projDynamic = new Array();

var objectMoved = new Array();
var selected = new Array();

var colorNormal = 0xDB5B8A;
var colorSelected = 0x00ff00;
var colorCollided = 0xff0000;
var colors = [0xdd0044, 0x00dd44, 0x4400dd];
var colorsBold = [0xff0000, 0x00ff00, 0x0000ff];

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

/* using physijs now */
// var scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 1, 10000 );
camera.position.set(-0, 60, 90);

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
          // objectsThreshold: 8,

          // percent between 0 and 1 that nodes will overlap each other
          // helps insert objects that lie over more than one node
          // overlapPct: 0.5,

          // pass the scene to visualize the octree
          scene: scene
      });

var octreesProj = new Array();

var usingPhysics = false;

var staticObjLocked = false;

var withoutSupport = true;

/*-----------------------------------------------------------------------------------------------
     
     models

-----------------------------------------------------------------------------------------------*/

var stlLoader = new THREE.STLLoader();

var teddy = 'things/teddy.stl';
var wrench = 'things/wrench.stl';
var mug = 'things/mug.stl';