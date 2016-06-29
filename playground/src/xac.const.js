var XAC = XAC || {};

XAC.Const = {};

// some common visual properties
XAC.MATERIALNORMAL = new THREE.MeshPhongMaterial({
     color: COLORNORMAL,
     transparent: true,
     opacity: 0.5
});


XAC.MATERIALCONTRAST = new THREE.MeshPhongMaterial({
     color: COLORCONTRAST,
     transparent: true,
     opacity: 0.75
});

XAC.MATERIALHIGHLIGHT = new THREE.MeshPhongMaterial({
     color: COLORHIGHLIGHT,
     transparent: true,
     opacity: 0.95
});

XAC.MATERIALINVISIBLE= new THREE.MeshBasicMaterial({
     vertexColors: 0xffffff,
     transparent: true,
     visible: false
});

XAC.MATERIALPLAIN= new THREE.MeshBasicMaterial({
     vertexColors: 0xffffff,
     transparent: true,
     opacity: 0.75
});


// var DIMVOXEL = 10;
// var gVoxels = [];
// var gVoxelTable = []; // a lookup table for meshes that represetn each voxel
var gVoxelGrid;
var gMedialAxis;
var gVisualizer;