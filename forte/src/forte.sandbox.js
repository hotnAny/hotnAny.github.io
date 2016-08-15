function unitTest() {
	log('---------------- unit test begins ----------------');

	// DEBUG: distance fields
	var dfs = [];
	var intval = 0.5;
	var step = 0.05;

	document.addEventListener('keydown', function(e) {

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


	// DEBUG: server communication
	// try {
	// XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['tpd'], ['testpath']);
	// log('server ok')
	// } catch (e) {
	// err('cannot connect to server')
	// }

	// DEBUG: mass transport
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
	// log(f1)
	log('----')

	// f2 = XAC.copyArray(f1).reverse();
	visualizeDistr(f2);
	// log(f2)
	log('----')

	// naive linear interpolation
	var t = 0.5;
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

	log('----------------  unit test ends  ----------------');
}

XAC.computeBarycenter = function(pdfs, lambdas, numItrs) {
	if (pdfs == undefined || pdfs[0] == undefined || pdfs[0][0] == undefined) return undefined;

	var k = pdfs.length;
	var m = pdfs[0].length;
	var n = pdfs[0][0].length;

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

	var gaussian = XAC.compute2DGaussianKernel(n / 10, n);

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

// XAC.convolve = function(input, output, kernel) {
// 	var m = input.length;
// 	var n = input[0].length;
// 	var k = kernel.length;
//
// 	var normFactor = 0;
// 	for (var i = 0; i < m; i++) {
// 		for (var j = 0; j < n; j++) {
// 			output[i][j] = input[i][j] * kernel[m - 1 - i][n - 1 - j];
// 			normFactor += kernel[m - 1 - i][n - 1 - j];
// 		}
// 	}
//
// 	for (var i = 0; i < m; i++) {
// 		for (var j = 0; j < n; j++) {
// 			output[i][j] /= normFactor;
// 		}
// 	}
// }

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

// XAC.convolve = function(input, output, kernel) {
// 	var m = input.length;
// 	var n = input[0].length;
// 	var k = kernel[0].length;
//
// 	for (var i = 0; i < m; i++) {
// 		for (var j = 0; j < n; j++) {
// 			var cnvl = 0;
//
// 			for (var h = 0; h < k; h++) {
// 				var jj = j - XAC.float2int(k / 2) + h;
// 				if (0 <= jj && jj < n) {
// 					cnvl += kernel[0][h] * input[i][jj];
// 				}
// 			}
//
// 			output[i][j] = cnvl;
// 		} // i of output
// 	} // j of output
// }
