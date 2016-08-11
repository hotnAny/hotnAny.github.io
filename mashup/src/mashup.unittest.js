function unitTest() {
	log('---------------- unit test begins ----------------');

	// DEBUG: distance fields
	var dfs = [];
	var intval = 0.5;
	var step = 0.05;

	document.addEventListener('keydown', function(e) {
		// if (MASHUP.design._mode != MASHUP.Design.EDIT) {
		// MASHUP.design._medialAxis.disableEventListeners();
		// }

		switch (e.keyCode) {
			case 48:
				MASHUP.design._mode = MASHUP.Design.POINTER;
				$(MASHUP.renderer.domElement).css('cursor', 'pointer');
				break;
			case 49:
				MASHUP.design._mode = MASHUP.Design.SKETCH;
				$(MASHUP.renderer.domElement).css('cursor', 'crosshair');
				break;
			case 50:
				MASHUP.design._mode = MASHUP.Design.EDIT;
				$(MASHUP.renderer.domElement).css('cursor', 'pointer');
				// MASHUP.design._medialAxis.enableEventListeners();
				break;
			case 51:
				MASHUP.design._mode = MASHUP.Design.LOADPOINT;
				$(MASHUP.renderer.domElement).css('cursor', 'context-menu');
				break;
			case 52:
				MASHUP.design._mode = MASHUP.Design.BOUNDARYPOINT;
				$(MASHUP.renderer.domElement).css('cursor', 'auto');
				break;
			case 83: //S
				var strData = MASHUP.design.getData();
				log(strData)
				XAC.pingServer(MASHUP.xmlhttp, 'localhost', '9999', ['mashup', 'query',
					'resolution', 'material', 'originality', 'verbose'
				], [strData, 0, 64, 0.45, 1.0, 1]);
				break;
			case 79: //O
				var strData = MASHUP.design.getData();
				XAC.pingServer(MASHUP.xmlhttp, 'localhost', '9999', ['mashup', 'query',
					'resolution', 'material', 'originality', 'verbose'
				], [strData, 1, 32, 0.45, 1.0, 1]);
				log(strData)
				break;
			case 68: //D
				MASHUP.mixedInitiative = MASHUP.mixedInitiative == null ? new MASHUP.MixedInitiatives(MASHUP.scene) :
					MASHUP.mixedInitiative;
				dfs.push(MASHUP.mixedInitiative._computeDistanceField(MASHUP.design));
				intval = 2 - dfs.length;
				break;
			case 37: // left arrow
				intval += step;
				intval = Math.min(intval, 1);
				if (dfs.length == 2) {
					MASHUP.mixedInitiative._interpolateDistanceFields(dfs[0], dfs[1], intval);
				}
				break;
			case 39: // right arrow
				intval -= step;
				intval = Math.max(0, intval);
				if (dfs.length == 2) {
					MASHUP.mixedInitiative._interpolateDistanceFields(dfs[0], dfs[1], intval);
				}
				break;
			case 67: // C
				MASHUP.mixedInitiative._clearDump();
				break;
		}
	}, false);



	// try {
	// XAC.pingServer(MASHUP.xmlhttp, 'localhost', '9999', ['tpd'], ['testpath']);
	// log('server ok')
	// } catch (e) {
	// err('cannot connect to server')
	// }

	log('----------------  unit test ends  ----------------');
}
