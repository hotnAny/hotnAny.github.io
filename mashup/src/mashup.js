/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Main of the Mashup project
 *
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var MASHUP = MASHUP || {};

$(document).ready(function() {
	//
	// visualize stats
	//
	MASHUP.stats = new Stats();
	MASHUP.stats.domElement.style.position = 'absolute';
	MASHUP.stats.domElement.style.top = '0px';
	MASHUP.stats.domElement.style.right = '0px';
	document.body.appendChild(MASHUP.stats.domElement);

	//
	// set the scene
	//
	MASHUP.renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	MASHUP.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(MASHUP.renderer.domElement);

	MASHUP.scene = new THREE.Scene();
	MASHUP.objects = new Array();

	MASHUP.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight,
		1, 10000);
	MASHUP.camera.position.copy(new THREE.Vector3(0, 0, 250));

	MASHUP.mouesCtrls = new THREE.TrackballControls(MASHUP.camera, undefined,
		undefined);
	// MASHUP.mouesCtrls.wheelDisabled = false;

	MASHUP.renderer.setClearColor(XAC.BACKGROUNDCOLOR);

	//
	// add lights
	//
	MASHUP.lights = [];
	MASHUP.lights[0] = new THREE.PointLight(0xffffff, 1, 0);
	MASHUP.lights[0].position.set(0, 100, -100);
	MASHUP.lights[0].castShadow = true;
	MASHUP.scene.add(MASHUP.lights[0]);

	MASHUP.render = function() {
		requestAnimationFrame(MASHUP.render);
		MASHUP.mouesCtrls.update();
		MASHUP.stats.update();
		MASHUP.lights[0].position.copy(MASHUP.camera.position);
		MASHUP.renderer.render(MASHUP.scene, MASHUP.camera);
	};

	MASHUP.render();

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
	// MASHUP.scene.add(ground);

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
	MASHUP.scene.add(grid);

	//
	//	set up communication
	//
	MASHUP.xmlhttp = new XMLHttpRequest();
	MASHUP.xmlhttp.timeout = 1e9;
	MASHUP.xmlhttp.onreadystatechange = function() {
		if (MASHUP.xmlhttp.readyState == 4 && MASHUP.xmlhttp.status == 200) {
			log(MASHUP.xmlhttp.responseText);
			var name = XAC.getParameterByName('name', MASHUP.xmlhttp.responseText);
			var dimVoxel = XAC.getParameterByName('dim_voxel', MASHUP.xmlhttp.responseText);
			var xmin = XAC.getParameterByName('xmin', MASHUP.xmlhttp.responseText);
			var ymin = XAC.getParameterByName('ymin', MASHUP.xmlhttp.responseText);

			// log([name, dimVoxel, xmin, xmax])

			// TODO:  what type of result it is
			// var resultName = MASHUP.xmlhttp.responseText;
			// var resultName = './mashup_1470164320'
			var resultVoxelGrid = name + '_analyzed.vxg';
			var resultDisp = name + '_analyzed.disp';

			MASHUP.voxelGrid = new MASHUP.VoxelGrid(MASHUP.scene, new THREE.Vector3(
				parseFloat(xmin), parseFloat(ymin), 5));
			XAC.readTextFile(resultVoxelGrid, function(dataVoxelGrid) {
				if (dataVoxelGrid != undefined) {
					MASHUP.voxelGrid.load(dataVoxelGrid, dimVoxel);
					// MASHUP.voxelGrid.render(false);

					MASHUP.visualizer = MASHUP.visualizer == undefined ? new MASHUP.Visualizer(
						MASHUP.scene) : MASHUP.visualizer;
					MASHUP.visualizer.clear();
					XAC.readTextFile(resultDisp, function(dataDisp) {
						if (dataDisp != undefined) {
							MASHUP.visualizer.visualizeStress(dataDisp, MASHUP.voxelGrid);
						}
					});
				}
			});
		}
	}

	//	init an empty design
	MASHUP.design = new MASHUP.Design(MASHUP.scene, MASHUP.camera);

	// finally do unit test
	unitTest();
});
