function unitTest() {
	log('---------------- unit test begins ----------------');

	// DEBUG: distance fields
	var dfs = [];
	var intval = 0.05;
	var step = 0.1;

	document.addEventListener('keydown', function(e) {
		switch (e.keyCode) {
			case 48:
				FORTE.design._mode = FORTE.Design.POINTER;
				$(FORTE.renderer.domElement).css('cursor', 'pointer');
				break;
			case 49:
				FORTE.switchLayer(FORTE.FORMLAYER);
				break;
			case 50:
				FORTE.switchLayer(FORTE.FUNCSPECLAYER);
				break;
			case 83: //S
				var strData = FORTE.design.getData();
				// log(strData)
				XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['forte', 'query',
					'resolution', 'material', 'originality', 'verbose'
				], [strData, 0, 64, 0.25, 1.0, 1]);
				// FORTE.design._mode = FORTE.FUNCTIONALFEEDBACK;
				// $(FORTE.renderer.domElement).css('cursor', 'help');
				FORTE.switchLayer(FORTE.FEEDBACKLAYER);
				break;
			case 79: //O
				var strData = FORTE.design.getData();
				XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['forte', 'query',
					'resolution', 'material', 'originality', 'verbose'
				], [strData, 1, 64, 0.3, 1.0, 1]);
				log(strData)
				break;
			case 68: //D
				FORTE.mixedInitiative = FORTE.mixedInitiative == null ? new FORTE.MixedInitiatives(FORTE.scene) :
					FORTE.mixedInitiative;
				dfs.push(FORTE.mixedInitiative._computeDistanceField(FORTE.design));
				intval = 2 - dfs.length;
				break;
			case 37: // left arrow
				// idxt = XAC.clamp(idxt + 1, 0, dfmts.length - 1);
				// log(idxt)
				// mimt._showDistanceField(dfmts[idxt], new THREE.Vector3(0, 50, 0));
				// mili._interpolateDistanceFields(df1, df2, idxt * 1.0 / (dfmts.length - 1));
				// FORTE.tmp -= 0.1;
				// FORTE.design.setInkSize(FORTE.tmp);
				var t = XAC.clamp(FORTE.t - 0.1, 0, 1);
				// log([t, FORTE.t])
				if (FORTE.t != t) {
					FORTE.design.interpolate(FORTE.designVariations, [FORTE.t, 1 - FORTE.t]);
					FORTE.t = t;
				}
				// log(FORTE.scene.children.length)
				break;
			case 39: // right arrow
				// idxt = XAC.clamp(idxt - 1, 0, dfmts.length - 1);
				// log(idxt)
				// mimt._showDistanceField(dfmts[idxt], new THREE.Vector3(0, 50, 0));
				// mili._interpolateDistanceFields(df1, df2, idxt * 1.0 / (dfmts.length - 1));
				// FORTE.tmp += 0.1;
				// FORTE.design.setInkSize(FORTE.tmp);
				var t = XAC.clamp(FORTE.t + 0.1, 0, 1);
				// log([t, FORTE.t])
				if (FORTE.t != t) {
					FORTE.design.interpolate(FORTE.designVariations, [FORTE.t, 1 - FORTE.t]);
					FORTE.t = t;
				}
				// log(FORTE.scene.children.length)
				break;
			case 67: // C
				// FORTE.voxelGrid.clear();
				var strData = FORTE.design.getData();
				log(strData)
				break;
			case 80:
				FORTE.paused = (FORTE.paused != true);
				if (FORTE.paused == false) {
					FORTE.render();
				}
				break;
		}
	}, false);

	FORTE.tmp = 0.2;
	// FORTE.design.setInkSize(FORTE.tmp);

	FORTE.t = 0;

	log('----------------  unit test ends  ----------------');
}

// drag & drop forte files
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
			FORTE.designVariations = FORTE.designVariations == undefined ? [] : FORTE.designVariations;
			var designObject = JSON.parse(e.target.result);
			FORTE.Design.cleanup(designObject);
			if (designObject.original == true) {
				FORTE.design = FORTE.Design.fromRawData(designObject, FORTE.scene, FORTE.camera);
			}

			FORTE.designVariations.push(designObject);

			if (FORTE.designVariations.length > 1) {
				FORTE.design.interpolate(FORTE.designVariations, [FORTE.t, 1 - FORTE.t]);
			}
		});
		reader.readAsBinaryString(files[i]);
	}
});

FORTE.Design.cleanup = function(design) {
	var edges = design.design;
	for (var i = 0; i < edges.length; i++) {
		if (edges[i].points.length <= 2) {
			edges[i].points = [edges[i].node1].concat(edges[i].points);
			edges[i].points.push(edges[i].node2);
			edges[i].thickness = [edges[i].thickness[0]].concat(edges[i].thickness);
			edges[i].thickness.push(edges[i].thickness[0]);
		}

		var minThickness = 1;
		for (var j = 0; j < edges[i].thickness.length; j++) {
			edges[i].thickness[j] = Math.max(minThickness, edges[i].thickness[j]);
		}
	}
}

FORTE.Design.prototype.interpolate = function(designs, weights) {
	for (var i = 0; i < this._medialAxis.edges.length; i++) {
		var edge = this._medialAxis.edges[i];

		// interpolating the nodes
		var nodes = [edge.node1, edge.node2];
		for (var j = 0; j < nodes.length; j++) {
			var centroid = new THREE.Vector3();
			for (var k = 0; k < designs.length; k++) {
				var nodePosArray = j == 0 ? designs[k].design[i].node1 : designs[k].design[i].node2;
				var nodePos = new THREE.Vector3().fromArray(nodePosArray);
				centroid.add(nodePos.multiplyScalar(weights[k]));
			}
			nodes[j].position.copy(centroid);
		}

		// interpolating the points on the edge
		for (var j = 0; j < edge.points.length; j++) {
			var centroid = new THREE.Vector3();
			for (var k = 0; k < designs.length; k++) {
				var pointArray = designs[k].design[i].points[j];
				var point = new THREE.Vector3().fromArray(pointArray);
				centroid.add(point.multiplyScalar(weights[k]));
			}
			edge.points[j].copy(centroid);
		}
	}
	this._medialAxis._inflate();
}

FORTE.Design.fromRawData = function(designObj, scene, camera) {
	try {
		log(designObj)

		// design
		var design = new FORTE.Design(scene, camera);
		design._medialAxis = FORTE.MedialAxis.fromRawData(designObj.design, scene, camera);
		// design._medialAxis._matNode = design._matDesign;
		// design._medialAxis._matInflation = design._matDesign;
		// design._medialAxis._matHighlight.opacity = 1;
		design._inkSize = 2 * design._medialAxis._radiusEdge;

		// update design elements
		design._designElements = [];
		for (var i = design._medialAxis.edges.length - 1; i >= 0; i--) {
			var edge = design._medialAxis.edges[i];
			design._designElements.push(edge.node1.inflation.m);
			design._designElements.push(edge.node2.inflation.m);
			for (var j = edge.inflations.length - 1; j >= 0; j--) {
				design._designElements.push(edge.inflations[j].m);
			}
		}

		// store raw data
		design._loadsRaw = designObj.loads;
		design._boundariesRaw = designObj.boundaries;
		design._clearancesRaw = designObj.clearances;

		return design;
	} catch (e) {
		err(e.stack);
	}
}

FORTE.MedialAxis.fromRawData = function(edges, scene, camera) {
	var medialAxis = new FORTE.MedialAxis(scene, camera);
	medialAxis.RESTORINGEDGE = false;
	for (var i = 0; i < edges.length; i++) {
		var points = [];

		for (var j = 0; j < edges[i].points.length; j++) {
			points.push(new THREE.Vector3().fromArray(edges[i].points[j]));
		}

		try {
			var edge = medialAxis.addEdge(points, false);
			edge.thickness = edges[i].thickness;
			// log(edge.points.length)
		} catch (e) {
			edges[i].deleted = true;
			err(e.stack)
		}
	}

	for (var i = 0; i < medialAxis.nodes.length; i++) {
		var node = medialAxis.nodes[i];
		var r = 0;
		for (var j = 0; j < node.edges.length; j++) {
			var edge = node.edges[j];
			r += node == edge.node1 ? edge.thickness[0] : edge.thickness.slice(-1)[0]
		}
		node.radius = r * 1.1 / node.edges.length;
	}

	var rmean = 0;
	var cnt = 0;
	for (var i = 0; i < medialAxis.edges.length; i++) {
		var edge = medialAxis.edges[i];
		for (var j = 0; j < edge.thickness.length; j++) {
			rmean += edge.thickness[j];
			cnt++;
		}
	}
	rmean /= cnt;

	medialAxis._radiusEdge = rmean;
	medialAxis._radiusNode = medialAxis._radiusEdge * 1.1;

	medialAxis._inflate();
	return medialAxis;
}
