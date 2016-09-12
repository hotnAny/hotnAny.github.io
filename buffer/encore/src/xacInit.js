/* ------------------------------------------------------------------------------------------------------

     debugging
     
*/
var D = false;
var D_MOUSE = false;
var D_COLLISION = false;
var D_INTERSECTION = true;
var D_OVERLAP = false;
var D_INTERLOCK = false;
var D_PHYSICS = false;

var helpers = new Array();

var balls = new THREE.Object3D();
var boxes = new THREE.Object3D();

var ball;

/* ------------------------------------------------------------------------------------------------------

     constants
     
*/
var EVALUATIONMODE = false;

var BACKGROUNDCOLOR = 0xF2F0F0;
var GROUNDCOLOR     = 0xF2F0F0;
var GRIDCOLOR       = 0x888888;

var EPSILON    = 10e-3;
var INFINITY   = 10e6;

var INTERLOCK  = 0;
var ADHERE     = 1;
var STRAP      = 2;
var ADHESIVE   = 3;


/* ------------------------------------------------------------------------------------------------------

     other variables

*/

var attachmentMethod;

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

var colorNormal = 0xDB5B8A;
var colorSelected = 0x00ff00;
var colorCollided = 0xff0000;
var colors = [0xdd0044, 0x00dd44, 0x4400dd];
var colorsBold = [0xff0000, 0x00ff00, 0x0000ff];

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/* using physijs now */
var scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 10000 );
camera.position.set(-0, 30, 90);

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
var ringBig = 'things/ring-big2.stl';
var ringSmall = 'things/ring-small.stl';

/* key + ring */
// var ringStand = 'things/ring-stand.stl';
// var dodecahedron = 'things/dodecahedron.stl';

/* making bracelets */
// var diamond = 'things/diamond2.stl';
// var cross = 'things/cross.stl';

/* bracelet + heart */
// var bracelet = 'things/bracelet.stl';
var heart = 'things/heart.stl';

/* tetra keychain */
var tetra = 'things/tetra.stl';


// var cube = 'things/cube.stl';
var bracelet = 'things/nervos3.stl';
var cylinder = 'things/cylinder.stl';
var trisqr = 'things/trisqr.stl';
var arrow = 'things/arrow.stl';
var frame = 'things/frame.stl';
var skull = 'things/skull.stl';
var meshouter = 'things/deltoidalIcositetrahedron-outer.stl';
var meshinner = 'things/deltoidalIcositetrahedron-inner.stl';

var tetraSmall = 'things/tetra-small.stl';

var ballOuter = 'things/ball-outer.stl';
var ballInner = 'things/ball-inner.stl';

var teddy = 'things/teddy.stl';
var wrench = 'things/wrench_rm.stl';
var goblet = 'things/goblet.stl';
var cup = 'things/cup2.stl';

var bottle = 'things/bottle.stl';
// var coke = 'things/coke.stl';
var can = 'things/can.stl';

var zipperPull = 'things/zipper-pull.stl';
var house = 'things/house.stl';

var smallHandle = 'things/small-handle.stl';

var screwDriver = 'things/screwdriver.stl';

// var printOverBatch1 = 'evaluation/batch-3/b3-print-over.stl';
var printOverBatch1 = 'evaluation/successful-sets/2_strap/C0.67_fixed.stl'
// var printOverBatch1 = 'evaluation/successful-sets/1_print-over_affix-adhesive_tan/platforms/pf-C0.0N10.stl';

var minion = 'things/minion2.stl';
var led = 'things/led2.stl';

var magnet = 'things/magnet.stl';

var scissors = 'things/scissors.stl';
var labelRing = 'things/label-frame2.stl';

var amex = 'things/amex_rm.stl';

var teapot = 'things/teapot.stl';

var gatorade = 'things/g.stl';

var gluegun = 'things/gluegun-stand.stl';

var batteries = 'things/battery9v.stl';

var winebottle = 'things/redbull.stl';