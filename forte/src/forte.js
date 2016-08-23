/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Main of the Forte project
 *
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var FORTE = FORTE || {};

$(document).ready(function() {
	//
	// visualize stats
	//
	FORTE.stats = new Stats();
	FORTE.stats.domElement.style.position = 'absolute';
	FORTE.stats.domElement.style.top = '0px';
	// FORTE.stats.domElement.style.right = '0px';
	document.body.appendChild(FORTE.stats.domElement);

	//
	// set the scene
	//
	FORTE.renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	FORTE.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(FORTE.renderer.domElement);

	FORTE.scene = new THREE.Scene();
	FORTE.objects = new Array();

	FORTE.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight,
		1, 10000);
	FORTE.camera.position.copy(new THREE.Vector3(0, 0, 200));

	FORTE.mouesCtrls = new THREE.TrackballControls(FORTE.camera, undefined,
		undefined);
	// FORTE.mouesCtrls.wheelDisabled = false;

	FORTE.renderer.setClearColor(XAC.BACKGROUNDCOLOR);

	//
	// add lights
	//
	FORTE.lights = [];
	FORTE.lights[0] = new THREE.PointLight(0xffffff, 1, 0);
	FORTE.lights[0].position.set(0, 100, -100);
	FORTE.lights[0].castShadow = true;
	FORTE.scene.add(FORTE.lights[0]);

	FORTE.render = function() {
		if (FORTE.paused) {
			return;
		}

		requestAnimationFrame(FORTE.render);
		FORTE.mouesCtrls.update();
		FORTE.stats.update();
		FORTE.lights[0].position.copy(FORTE.camera.position);
		FORTE.renderer.render(FORTE.scene, FORTE.camera);
	};

	FORTE.render();

	//
	// draw ground
	//
	var groundMaterial = new THREE.MeshBasicMaterial({
		color: XAC.GROUNDCOLOR,
		transparent: true,
		opacity: 0.5
	});

	var geometryGround = new THREE.CubeGeometry(window.innerWidth * 1000 /
		window.innerHeight, 1000, 1);
	var ground = new THREE.Mesh(
		geometryGround,
		groundMaterial
	);

	ground.position.z -= 1;
	// FORTE.scene.add(ground);

	//
	// draw grid
	//
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
	FORTE.scene.add(grid);

	//
	// set up ui
	//
	FORTE.FORMLAYER = 0;
	FORTE.FUNCTIONLAYER = 1;
	FORTE.FUNCSPECLAYER = 1.1
	FORTE.FEEDBACKLAYER = 1.2;
	FORTE.SUGGESTIONLAYER = 1.3
	FORTE.FABRICATIONLAYER = 2;

	FORTE.USERIGHTKEYFOR3D = false;
	FORTE.mouesCtrls.noRotate = !FORTE.USERIGHTKEYFOR3D

	// document.addEventListener('mousedown', FORTE._mousedown.bind(this), false);
	// document.addEventListener('mousemove', FORTE._mousemove.bind(this), false);
	// document.addEventListener('mouseup', FORTE._mouseup.bind(this), false);
	// document.addEventListener('keydown', FORTE._keydown.bind(this), false);

	//
	//	set up communication
	//
	FORTE.QUERYANALYZE = 0;
	FORTE.QUERYOPTIMIZE = 1;
	FORTE.xmlhttp = new XMLHttpRequest();
	FORTE.xmlhttp.timeout = 1e9;
	FORTE.xmlhttp.onreadystatechange = function() {
		if (FORTE.xmlhttp.readyState == 4 && FORTE.xmlhttp.status == 200) {
			log(FORTE.xmlhttp.responseText);
			var name = XAC.getParameterByName('name', FORTE.xmlhttp.responseText);
			FORTE.thisQuery = XAC.getParameterByName('query', FORTE.xmlhttp.responseText);
			var dimVoxel = XAC.getParameterByName('dim_voxel', FORTE.xmlhttp.responseText);
			var xmin = XAC.getParameterByName('xmin', FORTE.xmlhttp.responseText);
			var ymin = XAC.getParameterByName('ymin', FORTE.xmlhttp.responseText);
			var dir = XAC.getParameterByName('dir', FORTE.xmlhttp.responseText);

			var postfix = FORTE.thisQuery == FORTE.QUERYANALYZE ? 'analyzed' : 'optimized';
			var resultVoxelGrid = dir + '/' + name + '_' + postfix + '.vxg';
			var resultDisp = dir + '/' + name + '_' + postfix + '.disp';

			if (FORTE.voxelGrid != undefined) {
				FORTE.voxelGrid.clear();
			}
			FORTE.voxelGrid = new FORTE.VoxelGrid(FORTE.scene, new THREE.Vector3(
				parseFloat(xmin), parseFloat(ymin), 5));

			XAC.readTextFile(resultVoxelGrid, function(dataVoxelGrid) {
				if (dataVoxelGrid == undefined) return;

				FORTE.voxelGrid.load(dataVoxelGrid, dimVoxel);
				if (FORTE.thisQuery == FORTE.QUERYANALYZE) {
					FORTE.visualizer = FORTE.visualizer == undefined ? new FORTE.Visualizer(
						FORTE.scene) : FORTE.visualizer;
					FORTE.visualizer.clear();
					XAC.readTextFile(resultDisp, function(dataDisp) {
						if (dataDisp != undefined) {
							// FORTE.visualizer.visualizeStress(dataDisp, FORTE.voxelGrid);
							FORTE.visualizer.visualizeStressInVivo(dataDisp, FORTE.voxelGrid,
								FORTE.design.getDesignElements());
						}
					});
				} else if (FORTE.thisQuery == FORTE.QUERYOPTIMIZE) {
					FORTE.voxelGrid.render(false);
				}
			});
		}
	}

	//	init an empty design
	//	TODO: temp removed for testing
	// FORTE.design = new FORTE.Design(FORTE.scene, FORTE.camera);

	// finally do unit test
	unitTest();

	// rendering ui
	$(document.body).append(FORTE.renderUI());
});

//
//	switching between different layers
//
FORTE.switchLayer = function(layer) {
	if (FORTE.layer == layer) {
		return;
	}

	// clean up mess from the previous layer
	switch (FORTE.layer) {
		case FORTE.FORMLAYER:
			// nothing
			break;
		case FORTE.FUNCSPECLAYER:
			// fade func elms
			// for (var i = 0; i < FORTE.design._funcElements.length; i++) {
			// 	FORTE.design._funcElements[i].material.opacity = FORTE.design._opacityHalf;
			// }
			break;
		case FORTE.FEEDBACKLAYER:
			// hide the feedback-specific slider
			// replace heatmap with normal design visual
			break;
		case FORTE.SUGGESTIONLAYER:
			// hide the two suggestion-specific sliders
			break;
		case FORTE.FABRICATIONLAYER:
			// remove the generated profile
			break;
	}

	FORTE.layer = layer;

	// set up new layer
	switch (FORTE.layer) {
		case FORTE.FORMLAYER:
			log('form layer')
			FORTE.design._mode = FORTE.Design.SKETCH;
			$(FORTE.renderer.domElement).css('cursor', 'crosshair');
			break;
		case FORTE.FUNCSPECLAYER:
			log('functional specification layer')
			$(FORTE.renderer.domElement).css('cursor', 'context-menu');
			FORTE.design._mode = FORTE.Design.LOADPOINT;
			// unfade func elms
			// for (var i = 0; i < FORTE.design._funcElements.length; i++) {
			// 	FORTE.design._funcElements[i].material.opacity = FORTE.design._opacityFull;
			// }
			break;
		case FORTE.FEEDBACKLAYER:
			log('feedback layer')
			$(FORTE.renderer.domElement).css('cursor', 'crosshair');
			break;
		case FORTE.SUGGESTIONLAYER:
			log('suggestion layer')
			$(FORTE.renderer.domElement).css('cursor', 'pointer');
			// lock design
			break;
		case FORTE.FABRICATIONLAYER:
			log('fabrication layer')
			$(FORTE.renderer.domElement).css('cursor', 'pointer');
			// lock design
			break;
	}
}

//
// FORTE._keydown = function(e) {
//
// }
