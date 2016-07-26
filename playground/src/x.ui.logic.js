/*------------------------------------------------------------------------------------*
 *
 * ui logic (event handlers, etc.), based on jquery
 * 
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *------------------------------------------------------------------------------------*/

// $(document.body).append(panel);

var initPanel = function() {
	$(document).on('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		e.dataTransfer.dropEffect = 'copy';
	});

	$(document).on('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		var files = e.dataTransfer.files;

		for (var i = files.length - 1; i >= 0; i--) {
			var reader = new FileReader();
			reader.onload = (function(e) {
				// loadStl(e.target.result);

				// first drag & drop a voxel grid object (vxg)
				if (gVoxelGrid == undefined) {
					gVoxelGrid = new MASHUP.VoxelGrid();
					gVoxelGrid.load(e.target.result, 10);
					gVoxelGrid.render(false);

					gMedialAxis = new MASHUP.MedialAxis(scene);
				} else {
					gVisualizer = gVisualizer == undefined ? new MASHUP.Visualizer(scene) : gVisualizer;
					// gVisualizer.visualizeDisplacement(e.target.result, gVoxelGrid);
					gVisualizer.visualizeStress(e.target.result, gVoxelGrid);
				}

			});
			reader.readAsBinaryString(files[i]);
		}

	});
}

$(document).ready(function() {
	initPanel();
	unitTest();

	// position the default camera
	// camera.position.copy(new THREE.Vector3(0, 50, 0));
	// var lookAt = new THREE.Vector3(0, -1, 0);
	// var gMouseCtrls = new THREE.TrackballControls(camera, undefined, gLookAt);
	// var design = new MASHUP.Design(scene);
})