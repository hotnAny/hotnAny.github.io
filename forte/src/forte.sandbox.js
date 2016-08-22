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
				log(strData)
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
				], [strData, 1, 32, 0.15, 1.0, 1]);
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
				FORTE.t = XAC.clamp(FORTE.t - 0.1, 0, 1);
				FORTE.design.interpolate(FORTE.designs, [FORTE.t, 1 - FORTE.t]);
				break;
			case 39: // right arrow
				// idxt = XAC.clamp(idxt - 1, 0, dfmts.length - 1);
				// log(idxt)
				// mimt._showDistanceField(dfmts[idxt], new THREE.Vector3(0, 50, 0));
				// mili._interpolateDistanceFields(df1, df2, idxt * 1.0 / (dfmts.length - 1));
				// FORTE.tmp += 0.1;
				// FORTE.design.setInkSize(FORTE.tmp);
				FORTE.t = XAC.clamp(FORTE.t + 0.1, 0, 1);
				FORTE.design.interpolate(FORTE.designs, [FORTE.t, 1 - FORTE.t]);
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

	// DEBUG: server communication
	// try {
	// XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['tpd'], ['testpath']);
	// log('server ok')
	// } catch (e) {
	// err('cannot connect to server')
	// }

	var dimDebug = XAC.getParameterByName('dim', window.location);
	// DEBUG: mass transport 1d
	if (dimDebug == 1) {
		var n = 25;
		var f1 = [];
		var f2 = [];

		var computePDF = function(f) {
			var pdf = [];
			for (var i = 0; i < f1.length; i++) {
				pdf.push(f[i] + (pdf[i - 1] == undefined ? 0 : pdf[i - 1]));
			}
			return pdf;
		}

		var visualizeDistr = function(f) {
			var bar = '';
			for (var i = 0; i < f.length; i++) {
				bar += (i < 10 ? '0' : '') + i + ' '
				for (var j = 0; j < f[i]; j++) {
					bar += '*'
				}
				bar += '\n'
			}
			log(bar)
		}

		var getDistr = function(pdf) {
			var f = [pdf[0]];
			for (var i = 0; i < pdf.length - 1; i++) {
				f.push(pdf[i + 1] - pdf[i])
			}
			return f;
		}

		var polarized = true;
		var seed = n / 3; //XAC.float2int(n / 2 * Math.random())
		var sumf1 = 0;
		var sumf2 = 0;
		for (var i = 0; i < n; i++) {
			f1[i] = 30 * Math.pow(1 - Math.abs(i - seed) / n, 10);
			f2[i] = 30 * Math.pow(1 - Math.abs(i - n + seed) / n, 10);
		}

		visualizeDistr(f1);
		log('----')

		visualizeDistr(f2);
		log('----')

		// naive linear interpolation
		var t = 0.95;
		var fint1 = [];
		for (var i = 0; i < f1.length; i++) {
			fint1[i] = t * f1[i] + (1 - t) * f2[i];
		}
		visualizeDistr(fint1);
		log('----')

		// mass transport
		var mt = XAC.computeBarycenter([
			[f1],
			[f2]
		], [1 - t, t], 100);
		visualizeDistr(mt[0]);
	}
	// DEBUG mass transport 2d
	else if (dimDebug == 2) {
		t = 0.5;

		// show distance fields
		mi1 = new FORTE.MixedInitiatives(FORTE.scene, FORTE.camera);
		mi1._showDistanceField(df1, new THREE.Vector3(-50, 0, 0));
		mi2 = new FORTE.MixedInitiatives(FORTE.scene, FORTE.camera);
		mi2._showDistanceField(df2, new THREE.Vector3(50, 0, 0));
		mili = new FORTE.MixedInitiatives(FORTE.scene, FORTE.camera);
		mili._interpolateDistanceFields(df1, df2, t);

		var m = df1.length;
		var n = df1[0].length;
		var df2d1 = XAC.initMDArray([m, n], 0);
		var df2d2 = XAC.initMDArray([m, n], 0);
		var sumdf1 = 0.0;
		var sumdf2 = 0.0;
		for (var i = 0; i < m; i++) {
			for (var j = 0; j < n; j++) {
				df2d1[i][j] = Math.max(XAC.EPSILON, Math.exp(-df1[i][j][0]));
				// sumdf1 += df2d1[i][j];
				df2d2[i][j] = Math.max(XAC.EPSILON, Math.exp(-df2[i][j][0]));
				// sumdf2 += df2d2[i][j];
			}
		}

		// for (var i = 0; i < m; i++) {
		// 	for (var j = 0; j < n; j++) {
		// 		df2d1[i][j] = Math.max(XAC.EPSILON, df2d1[i][j] / sumdf1);
		// 		df2d2[i][j] = Math.max(XAC.EPSILON, df2d2[i][j] / sumdf2);
		// 	}
		// }

		log('precomputing')
		step = 0.02
		for (var t = 1; t >= 0.85; t -= step) {
			log('t = ' + t);
			var df2dt = XAC.computeBarycenter([
				df2d1,
				df2d2
			], [t, 1 - t], 50);
			var dfmt = XAC.initMDArray([m, n, 1], 0);
			var mindf = m + n;
			var maxdf = 0;
			// var summt = sumdf1 * t + sumdf2 * (1 - t);
			for (var i = 0; i < m; i++) {
				for (var j = 0; j < n; j++) {
					dfmt[i][j][0] = -Math.log(Math.max(XAC.EPSILON, df2dt[i][j]));
					// mindf = Math.min(mindf, dfmt[i][j][0]);
					// maxdf = Math.max(maxdf, dfmt[i][j][0]);
				}
			}
			// for (var i = 0; i < m; i++) {
			// 	for (var j = 0; j < n; j++) {
			// 		dfmt[i][j][0] = maxdf * (dfmt[i][j][0] - mindf) / (maxdf - mindf);
			// 	}
			// }
			dfmts.push(dfmt);
		}

		idxt = XAC.float2int(dfmts.length / 2);

		// log(JSON.stringify(dfmt))
		mimt = new FORTE.MixedInitiatives(FORTE.scene, FORTE.camera);
		mimt._showDistanceField(dfmts[idxt], new THREE.Vector3(0, 50, 0));
	}

	FORTE.t = 0.5;

	log('----------------  unit test ends  ----------------');
}

XAC.computeBarycenter = function(pdfs, lambdas, numItrs) {
	if (pdfs == undefined || pdfs[0] == undefined || pdfs[0][0] == undefined) return undefined;

	var k = pdfs.length;
	var m = pdfs[0].length;
	var n = pdfs[0][0].length;

	// log([k, m, n])

	var geomMean = function(cnvla, result, lambdas, k, m, n) {
		var safeLog = function(x) {
			var eps = XAC.EPSILON == undefined ? 1e-9 : XAC.EPSILON;
			return Math.log(Math.max(eps, x));
		};

		for (var i = 0; i < k; i++) {
			for (var j = 0; j < m; j++) {
				for (var h = 0; h < n; h++) {
					result[j][h] += safeLog(cnvla[i][j][h]) * lambdas[i];
				}
			}
		}

		for (var j = 0; j < m; j++) {
			for (var h = 0; h < n; h++) {
				result[j][h] = Math.exp(result[j][h]);
			}
		}
	}

	var gaussian = XAC.compute2DGaussianKernel(n / 160, n);

	var baryCenter = XAC.initMDArray([m, n], 0.0);

	var a = XAC.initMDArray([k, m, n], 1.0);
	var b = XAC.initMDArray([k, m, n], 1.0);
	var convolution = XAC.initMDArray([k, m, n], 0.0);

	for (var itr = 0; itr < numItrs; itr++) {
		for (var i = 0; i < k; i++) {
			XAC.convolve2D(b[i], convolution[i], gaussian);

			for (var j = 0; j < m; j++) {
				for (var h = 0; h < n; h++) {
					a[i][j][h] = pdfs[i][j][h] / convolution[i][j][h];
				}
			}
			XAC.convolve2D(a[i], convolution[i], gaussian);
		}

		baryCenter = XAC.initMDArray([m, n], 0.0);
		geomMean(convolution, baryCenter, lambdas, k, m, n);

		for (var i = 0; i < k; i++) {
			for (var j = 0; j < m; j++) {
				for (var h = 0; h < n; h++) {
					b[i][j][h] = baryCenter[j][h] / convolution[i][j][h]
				}
			}
		}
	}

	return baryCenter;
}

XAC.compute2DGaussianKernel = function(sigma, size) {
	var kernel = XAC.initMDArray([size, size], 0);
	var sumVal = 0;
	for (var i = 0; i < size; i++) {
		x = XAC.float2int(-size / 2) + i;
		for (var j = 0; j < size; j++) {
			y = XAC.float2int(-size / 2) + j;
			kernel[i][j] = Math.exp(-(x * x + y * y) * 1.0 / (2.0 * sigma * sigma));
			sumVal += kernel[i][j];
		}
	}

	for (var i = 0; i < size; i++) {
		for (var j = 0; j < size; j++) {
			kernel[i][j] /= sumVal;
		}
	}

	// for (var i = 0; i < size; i++) {
	// 	log(kernel[i])
	// }
	return kernel;
}

XAC.convolve2D = function(input, output, kernel) {
	var m = input.length;
	var n = input[0].length;
	var k = kernel.length;

	for (var i = 0; i < m; i++) {
		for (var j = 0; j < n; j++) {
			var cnvl = 0;
			for (var ki = 0; ki < k; ki++) {
				for (var kj = 0; kj < k; kj++) {
					var ii = i - XAC.float2int(k / 2.0) + ki;
					var jj = j - XAC.float2int(k / 2.0) + kj;
					if (ii < 0 || ii >= m || jj < 0 || jj >= n) {
						continue;
					}
					cnvl += input[ii][jj] * kernel[ki][kj];
				} // ki of kernel
			} // kj of kernel

			output[i][j] = cnvl;
		} // i of output
	} // j of output
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
			// log(e.target.result);
			FORTE.designs = FORTE.designs == undefined ? [] : FORTE.designs;
			// FORTE.design = FORTE.Design.fromRawData(e.target.result, FORTE.scene, FORTE.camera);
			// FORTE.designs.push(FORTE.design);
			FORTE.designs.push(JSON.parse(e.target.result));

			if (FORTE.designs.length >= 2) {
				FORTE.design = FORTE.Design.fromRawData(FORTE.designs[0], FORTE.scene, FORTE.camera);
				FORTE.design.interpolate(FORTE.designs, [FORTE.t, 1 - FORTE.t]);
			}
		});
		reader.readAsBinaryString(files[i]);
	}

	// FORTE.design = FORTE.Design.fromRawData(FORTE.designs[0], FORTE.scene, FORTE.camera);
	// FORTE.design.interpolate(FORTE.designs, FORTE.t);
});

FORTE.Design.prototype.interpolate = function(designs, weights) {
	for (var i = 0; i < this._medialAxis.edges.length; i++) {
		var edge = this._medialAxis.edges[i];
		for (var j = 0; j < edge.points.length; j++) {
			var centroid = new THREE.Vector3();
			for (var k = 0; k < designs.length; k++) {
				var point = new THREE.Vector3().fromArray(designs[k].design[i].points[j]);
				centroid.add(point.multiplyScalar(weights[k]));
			}
			edge.points[j].copy(centroid);
		}
	}
	this._medialAxis._inflate();
}

FORTE.Design.fromRawData = function(designObj, scene, camera) {
	try {
		// var designObj = JSON.parse(str);
		log(designObj)
		var design = new FORTE.Design(scene, camera);
		design._medialAxis = FORTE.MedialAxis.fromRawData(designObj.design, scene, camera);
		design._medialAxis._matNode = design._matDesign;
		design._medialAxis._matInflation = design._matDesign;
		design._medialAxis._matHighlight.opacity = 1;
		design._inkSize = 2 * design._medialAxis._radiusEdge;
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
			// if (edge != undefined) {
			edge.thickness = edges[i].thickness;
			log(edge.points.length)
		} catch (e) {
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
