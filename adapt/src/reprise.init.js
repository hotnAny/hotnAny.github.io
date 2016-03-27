/*-----------------------------------------------------------------------------------------------
     
     template

-----------------------------------------------------------------------------------------------*/
// var D = false;

var helpers = new Array();


var boxes = new THREE.Object3D();

// ///////////////
var EPSILON = 10e-3;
var INFINITY = 10e9;

var BACKGROUNDCOLOR = 0xF2F0F0;
var GROUNDCOLOR = 0xF2F0F0;
var GRIDCOLOR = 0x888888;

var LEFTMOUSE = 1;
var MIDMOUSE = 2;
var RIGHTMOUSE = 3;

var WIDTHCONTAINER = 388;

var ball;

var objDynamic = null;
var objStatic = null;
var objects = new Array();
var legends = new Array();
var octrees = new Array();
var voxelGrids = new Array();
var supports = new Array();
var objectPair; // = new THREE.Object3D();

var objectMoved = new Array();
var selected = new Array();

var colorNormal = 0xDB5B8A;
var colorContrast = 0xD1D6E7; // is the contrast of the colorNormal
var colorOverlay = 0xF2F2F2;  //colorContrast;
var colorHighlight = 0xfffa90; //
var colors = [0xdd0044, 0x00dd44, 0x4400dd];
var colorsBold = [0xff0000, 0x00ff00, 0x0000ff];
var colorStroke = 0xff0000;

var renderer = new THREE.WebGLRenderer({
     antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
var gPosCam = new THREE.Vector3(-16, 8, 10);
camera.position.copy(gPosCam.clone().multiplyScalar(50));
var gLookAt = new THREE.Vector3(-25, 0, -0).multiplyScalar(10);
var gMouseCtrls = new THREE.TrackballControls(camera, undefined, gLookAt); // for mouse control

//
// draw floor
//
function drawGround(yOffset) {
     var groundMaterial = new THREE.MeshBasicMaterial({
          color: GROUNDCOLOR,
          transparent: true,
          opacity: 0.5
     });


     var geometryGround = new THREE.CubeGeometry(1000, 1, 1000);
     var ground = new THREE.Mesh(
          geometryGround,
          groundMaterial,
          0 // mass
     );

     ground.position.y -= yOffset;
     return ground;
}
var gGround = drawGround(0);
scene.add(gGround);

//
// draw grid
//
function drawGrid(yOffset) {
     var lineMaterial = new THREE.LineBasicMaterial({
          color: GRIDCOLOR
     });
     var lineGeometry = new THREE.Geometry();
     var floor = 0.5 - yOffset;
     var step = 25;

     for (var i = 0; i <= 40; i++) {

          lineGeometry.vertices.push(new THREE.Vector3(-500, floor, i * step - 500));
          lineGeometry.vertices.push(new THREE.Vector3(500, floor, i * step - 500));

          lineGeometry.vertices.push(new THREE.Vector3(i * step - 500, floor, -500));
          lineGeometry.vertices.push(new THREE.Vector3(i * step - 500, floor, 500));

     }

     return new THREE.Line(lineGeometry, lineMaterial, THREE.LinePieces);
}
var gGrid = drawGrid(0);
scene.add(gGrid);

//
// add lights
//
var lights = [];
lights[0] = new THREE.PointLight(0xffffff, 1, 0);
lights[0].position.set(0, 100, -100);
lights[0].castShadow = true;
scene.add(lights[0]);


/*-----------------------------------------------------------------------------------------------
     
     app specific

-----------------------------------------------------------------------------------------------*/

var D = gup('d', window.location.href);

var MATERIALNORMAL = new THREE.MeshPhongMaterial({
     color: colorNormal,
     transparent: true,
     opacity: 0.75
});

var MATERIALCONTRAST = new THREE.MeshPhongMaterial({
     color: colorContrast,
     transparent: true,
     // wireframe: true,
     opacity: 0.25
});

var MATERIALOVERLAY = new THREE.MeshPhongMaterial({
     color: colorOverlay,
     transparent: true,
     opacity: 0.75
});

var MATERIALHIGHLIGHT = new THREE.MeshPhongMaterial({
     color: colorHighlight,
     transparent: true,
     opacity: 0.75
});

var MATERIALPLAIN = new THREE.MeshBasicMaterial({
     vertexColors: THREE.VertexColors,
     transparent: true,
     opacity: 1.0
});

var MATERIALINVISIBLE= new THREE.MeshBasicMaterial({
     vertexColors: 0xffffff,
     transparent: true,
     wireframe: true,
     visible: false
});

var MATERIALFOCUS = new THREE.MeshPhongMaterial({
     color: 0xE82C0C,
     transparent: true,
     opacity: 1.0
});

var FINGERSIZE = 15;
var HANDSIZE = 150;

// specifying accessible area
var gAccessSel = [];

// the hand for selecting grasp area
var HANDMODELPATH = 'things/big_hand.stl';
var gHand = undefined;

// cam mechanism
var CAMMODELPATH = 'things/cam_crank.stl';
var gCam = undefined;

// clamp mechanism
var CLAMPMODELPATH = 'things/clamp_clutch.stl';
var gClamp = undefined;
var RADIUSM3 = 1.65;

// universal joint mechanism
var YOKEPATH = 'things/yoke.stl';
var YOKECROSSPATH = 'things/yoke_cross.stl';
var gYoke = undefined;
var gYokeCross = undefined;

var gStep = 0;
var gItems = [];

// actions
var gPartSerial = 0;
var gPartsActions = new Array();
var gCurrPartsAction = undefined; 

// adaptations
var gAdaptations = [];
var gCurrAdapt = undefined; // the adaptation that is currently being worked on
var gAdaptationComponents = new Array();

// var gOptParams = new Array();

// attachment
var gCurrAttach = undefined;
var gAttachments = [];  // connection method

var gObjTemp;  // temp object for visual debugging

//
//   dealing with focus on ui-objects
//
var gJustFocusedUIs = new Array();
var gJustFocusedObjs = new Array();
var FOCUSACTION = 0;
var DELETEACTION = 1;
var ADDACTION = 2;