function unitTest() {
	log('---------------- unit test begins ----------------');

	// DEBUG: distance fields
	var dfs = [];
	var intval = 0.5;
	var step = 0.05;

	document.addEventListener('keydown', function(e) {
		// if (FORTE.design._mode != FORTE.Design.EDIT) {
		// FORTE.design._medialAxis.disableEventListeners();
		// }

		switch (e.keyCode) {
			case 48:
				FORTE.design._mode = FORTE.Design.POINTER;
				$(FORTE.renderer.domElement).css('cursor', 'pointer');
				break;
			case 49:
				FORTE.design._mode = FORTE.Design.SKETCH;
				$(FORTE.renderer.domElement).css('cursor', 'crosshair');
				break;
			case 50:
				FORTE.design._mode = FORTE.Design.EDIT;
				$(FORTE.renderer.domElement).css('cursor', 'pointer');
				// FORTE.design._medialAxis.enableEventListeners();
				break;
			case 51:
				FORTE.design._mode = FORTE.Design.LOADPOINT;
				$(FORTE.renderer.domElement).css('cursor', 'context-menu');
				break;
			case 52:
				FORTE.design._mode = FORTE.Design.BOUNDARYPOINT;
				$(FORTE.renderer.domElement).css('cursor', 'auto');
				break;
			case 83: //S
				var strData = FORTE.design.getData();
				log(strData)
				XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['forte', 'query',
					'resolution', 'material', 'originality', 'verbose'
				], [strData, 0, 64, 0.45, 1.0, 1]);
				FORTE.design._mode = FORTE.FUNCTIONALFEEDBACK;
				$(FORTE.renderer.domElement).css('cursor', 'help');
				break;
			case 79: //O
				var strData = FORTE.design.getData();
				XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['forte', 'query',
					'resolution', 'material', 'originality', 'verbose'
				], [strData, 1, 32, 0.45, 1.0, 1]);
				log(strData)
				break;
			case 68: //D
				FORTE.mixedInitiative = FORTE.mixedInitiative == null ? new FORTE.MixedInitiatives(FORTE.scene) :
					FORTE.mixedInitiative;
				dfs.push(FORTE.mixedInitiative._computeDistanceField(FORTE.design));
				intval = 2 - dfs.length;
				break;
			case 37: // left arrow
				intval += step;
				intval = Math.min(intval, 1);
				if (dfs.length == 2) {
					FORTE.mixedInitiative._interpolateDistanceFields(dfs[0], dfs[1], intval);
				}
				break;
			case 39: // right arrow
				intval -= step;
				intval = Math.max(0, intval);
				if (dfs.length == 2) {
					FORTE.mixedInitiative._interpolateDistanceFields(dfs[0], dfs[1], intval);
				}
				break;
			case 67: // C
				FORTE.mixedInitiative._clearDump();
				break;
		}
	}, false);



	// try {
	// XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['tpd'], ['testpath']);
	// log('server ok')
	// } catch (e) {
	// err('cannot connect to server')
	// }

	log('----------------  unit test ends  ----------------');
}
