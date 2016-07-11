var XAC = XAC || {};

XAC.Const = {};

// some common visual properties
XAC.COLORNORMAL = 0xDB5B8A; // the normal color
XAC.COLORCONTRAST = 0xD1D6E7; // is the contrast of the COLORNORMAL
XAC.COLORHIGHLIGHT = 0xfffa90;
XAC.COLORFOCUS = 0xE82C0C; // color to really draw users' focus

XAC.MATERIALNORMAL = new THREE.MeshPhongMaterial({
     color: XAC.COLORNORMAL,
     transparent: true,
     opacity: 0.75
});

XAC.MATERIALCONTRAST = new THREE.MeshPhongMaterial({
     color: XAC.COLORCONTRAST,
     transparent: true,
     opacity: 0.75
});

XAC.MATERIALHIGHLIGHT = new THREE.MeshPhongMaterial({
     color: XAC.COLORHIGHLIGHT,
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

XAC.MATERIALFOCUS = new THREE.MeshPhongMaterial({
     color: XAC.COLORFOCUS,
     transparent: true,
     opacity: 0.95
});


// TEMP: for testing on the playground
var gVoxelGrid;
var gMedialAxis;
var gVisualizer;