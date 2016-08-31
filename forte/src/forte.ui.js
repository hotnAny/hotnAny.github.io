/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	a collection of routines to render ui elements
 *
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var FORTE = FORTE || {};

FORTE.WIDTHCONTAINER = 320;

FORTE.renderUI = function() {
    var aspectRatio = 0.9; // h to w
    var widthWindow = window.innerWidth * 0.98;
    var heightWindow = window.innerHeight * 0.98;

    var tblLayout = $('<table></table>');
    tblLayout.css('max-height', heightWindow);
    var trLayout = $('<tr></tr>');
    tblLayout.append(trLayout);

    var tdOptimization = $('<td></td>');
    trLayout.append(tdOptimization);

    //
    //  set up optimization view
    //
    var tblOptimization = $('<table></table>');
    // tblOptimization.css('overflow', 'auto');
    tdOptimization.append(tblOptimization);
    var trOptView = $('<tr></tr>');
    var tdOptView = $('<td></td>')
    trOptView.append(tdOptView);
    tblOptimization.append(trOptView);

    var widthOptView = widthWindow - heightWindow / (aspectRatio * 0.9);
    var heightOptView = aspectRatio * widthOptView;
    optviewRenderSet = FORTE.createRenderableScene(widthOptView, heightOptView);
    FORTE.optRenderer = optviewRenderSet.renderer;
    FORTE.optScene = optviewRenderSet.scene;
    FORTE.optCamera = optviewRenderSet.camera;
    FORTE.optRenderer.render(FORTE.optScene, FORTE.optCamera);
    tdOptView.append(FORTE.optRenderer.domElement);

    //
    // set up thumbnails
    //
    var trThumbnails = $('<tr></tr>');
    var tdThumbnails = $('<td></td>')
    FORTE.divOptThumbnails = $('<div></div>');
    FORTE.divOptThumbnails.css('height', (heightWindow - heightOptView) + 'px');
    FORTE.divOptThumbnails.css('overflow', 'scroll');
    FORTE.thumbnailMargin = 8;
    FORTE.widthThumbnail = widthOptView / 4 - FORTE.thumbnailMargin - 1;
    FORTE.heightThumbnail = aspectRatio * FORTE.widthThumbnail;
    tdThumbnails.append(FORTE.divOptThumbnails);
    trThumbnails.append(tdThumbnails);
    tblOptimization.append(trThumbnails);

    var thumbnailRenderSet = FORTE.createRenderableScene(FORTE.widthThumbnail, FORTE.heightThumbnail);
    FORTE.tbnRenderer = thumbnailRenderSet.renderer;
    FORTE.tbnScene = thumbnailRenderSet.scene;
    FORTE.tbnCamera = thumbnailRenderSet.camera;

    //
    //  set up main canvas
    //
    var tdCanvas = $('<td></td>');
    var widthCanvas = widthWindow - widthOptView;
    var heightCanvas = heightWindow;
    canvasRenderSet = FORTE.createRenderableScene(widthCanvas, heightCanvas);
    FORTE.canvasRenderer = canvasRenderSet.renderer;
    FORTE.canvasCamera = canvasRenderSet.camera;
    FORTE.mouesCtrls = new THREE.TrackballControls(FORTE.canvasCamera, undefined,
        undefined);

    tdCanvas.append(FORTE.canvasRenderer.domElement);
    trLayout.append(tdCanvas);

    return tblLayout;
}

FORTE.createRenderableScene = function(w, h) {
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(w, h);
    renderer.setClearColor(XAC.BACKGROUNDCOLOR);

    var camera = new THREE.PerspectiveCamera(60, w / h, 1, 10000);
    camera.position.copy(new THREE.Vector3(0, 0, 200));

    var scene = new THREE.Scene();

    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 100, -100);
    lights[0].castShadow = true;
    lights[0].position.copy(camera.position);
    scene.add(lights[0]);

    var lineMaterial = new THREE.LineBasicMaterial({
        color: XAC.GRIDCOLOR
    });
    var lineGeometry = new THREE.Geometry();
    var floor = -0.5;
    var ylength = 1000;
    var xlength = XAC.float2int(ylength * window.innerWidth / window.innerHeight);
    var step = 25;
    xlength = XAC.float2int(xlength / step) * step;

    for (var i = 0; i <= xlength / step; i++) {
        lineGeometry.vertices.push(new THREE.Vector3(i * step - xlength / 2, -
            ylength / 2, floor));
        lineGeometry.vertices.push(new THREE.Vector3(i * step - xlength / 2,
            ylength / 2, floor));
    }

    for (var i = 0; i <= ylength / step; i++) {
        lineGeometry.vertices.push(new THREE.Vector3(-xlength / 2, i * step -
            ylength / 2, floor));
        lineGeometry.vertices.push(new THREE.Vector3(xlength / 2, i * step -
            ylength / 2, floor));
    }

    var grid = new THREE.Line(lineGeometry, lineMaterial, THREE.LinePieces);
    scene.add(grid);

    return {
        renderer: renderer,
        camera: camera,
        scene: scene,
        lights: lights,
        grid: grid
    };
}

FORTE.cloneCanvas = function(oldCanvas) {
    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}
