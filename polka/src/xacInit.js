// ///////////////
// for debugging
var D = false;
var D_MOUSE = false;
var D_COLLISION = false;
var D_INTERSECTION = false;
var D_OVERLAP = false;
var D_INTERLOCK = false;
var D_PHYSICS = false;

var helpers = new Array();

var balls = new THREE.Object3D();
var boxes = new THREE.Object3D();

// ///////////////
var INFINITY = 10e9;
// var SIZEZERO = 
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
var projStatic = new Array();
var projDynamic = new Array();

var objectMoved = new Array();
var selected = new Array();

var colorNormal = 0xffffff;
var colorSelected = 0x00ff00;
var colorCollided = 0xff0000;
var colors = [0xdd0044, 0x00dd44, 0x4400dd];
var colorsBold = [0xff0000, 0x00ff00, 0x0000ff];

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/* using physijs now */
var scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 1, 10000 );
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
          // objectsThreshold: 8,

          // percent between 0 and 1 that nodes will overlap each other
          // helps insert objects that lie over more than one node
          // overlapPct: 0.5,

          // pass the scene to visualize the octree
          scene: scene
      });

var octreesProj = new Array();

var usingPhysics = false;

var staticObjLocked = true;

var withoutSupport = true;

/*-----------------------------------------------------------------------------------------------
     
     models

-----------------------------------------------------------------------------------------------*/

var stlLoader = new THREE.STLLoader();

var key = 'things/keyxac.stl';
// var key2 = 'things/key2.stl';
// var key3 = 'things/key3.stl';
// var key4 = 'things/key4.stl';

var ring = 'things/ring.stl';
var ring3 = 'things/ring2.stl';

/* key + ring */
var ringStand = 'things/ring-stand.stl';
var dodecahedron = 'things/dodecahedron.stl';

/* making bracelets */
var diamond = 'things/diamond2.stl';
var cross = 'things/cross.stl';

/* bracelet + heart */
var bracelet = 'things/bracelet.stl';
var heart = 'things/heart.stl';

/* tetra keychain */
var tetra = 'things/tetra.stl';
var ringSmall = 'things/ring-small.stl';

var cube = 'things/cube.stl';
var nervos = 'things/nervos.stl';
var cylinder = 'things/cylinder.stl';
var trisqr = 'things/trisqr.stl';
var arrow = 'things/arrow.stl';
var frame = 'things/frame2.stl';
var skull = 'things/skull.stl';
var meshouter = 'things/deltoidalIcositetrahedron-outer.stl';
var meshinner = 'things/deltoidalIcositetrahedron-inner.stl';

var tetraSmall = 'things/tetra-small.stl';

var ballOuter = 'things/ball-outer.stl';
var ballInner = 'things/ball-inner.stl';