/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Visualizer - contains a collection of visualization techniques
 * 	
 *	@author Xiang 'Anthonj' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var MASHUP = MASHUP || {};

// check dependencies
if (XAC.Thing == undefined || XAC.Utilities == undefined || XAC.Const == undefined) {
	err('missing dependency!');
}

MASHUP.Visualizer = function(scene) {
	this._scene = scene;
	this._arrows = [];
};

MASHUP.Visualizer.prototype = {
	constructor: MASHUP.Visualizer
};

//
//	visualize displacement vector:
//	@param 	listDisp - a list of displacement values (raw)
//	@param 	vxg - the corresponding voxel grid
//
MASHUP.Visualizer.prototype.visualizeDisplacement = function(listDisp, vxg) {
	var nelx = vxg.nx;
	var nely = vxg.ny;
	var nelz = vxg.nz;

	var dispElms = this._computeDisplacement(listDisp, vxg);

	// clean up existing visualization
	for (var i = this._arrows.length - 1; i >= 0; i--) {
		this._scene.remove(this._arrows[i]);
	}
	this._arrows = [];

	// normalize the forces by a customize worst case displacement
	var worstDisp = Math.sqrt(nelx * nelx + nely * nely + nelz * nelz) / 2;
	for (var i = 0; i < nelx; i++) {
		for (var j = 0; j < nely; j++) {
			for (var k = 0; k < nelz; k++) {
				var pos = new THREE.Vector3(i, j, k).multiplyScalar(vxg.dim);
				var arrow = addAnArrow(pos, dispElms[i][j][k], vxg.dim, 1);

				for (var h = arrow.children.length - 1; h >= 0; h--) {
					arrow.children[h].material.color = this._getColorFromScore(dispElms[i][j][k].length(), worstDisp);
					arrow.children[h].material.opacity = vxg.gridRaw[k][j][i];
					arrow.children[h].material.needsUpdate = true;
				}

				this._arrows.push(arrow);
			} // z
		} // y
	} // x
}

MASHUP.Visualizer.prototype._computeStress = function(listDisp, vxg) {
	var nelx = vxg.nx;
	var nely = vxg.ny;
	var nelz = vxg.nz;

	var arrDisp = listDisp.split(',');

	//
	// re-tessellate voxel grid into tetrahedrals
	//
	var tetraGrid = [];
	for (var i = 0; i < nelx; i++) {
		var plane = [];
		for (var j = 0; j < nely; j++) {
			var line = [];
			for (var k = 0; k < nelz; k++) {
				var ns = MASHUP.Optimization.elm2nodes(nelx, nely, nelz, i + 1, j + 1, k + 1);
				var tetras = [];

				// indices of nodes of the 6 tetrahedrals in a cube
				var tetraIndices = [
					[0, 1, 2, 4],
					[1, 3, 4, 5],
					[1, 2, 3, 4],
					[6, 7, 2, 4],
					[7, 3, 4, 5],
					[7, 2, 3, 4]
				];

				// init the tetrahedral data structure
				for (var h = 0; h < tetraIndices.length; h++) {
					var idxTetra = tetraIndices[h];
					var idxNodes = [ns[idxTetra[0]] - 1, ns[idxTetra[1]] - 1, ns[idxTetra[2]] - 1, ns[idxTetra[3]] - 1];
					var positions = [];
					var displacements = [];

					for (var l = 0; l < idxNodes.length; l++) {
						var idx = idxNodes[l];
						displacements.push(new THREE.Vector3(Number(arrDisp[idx * 3]), Number(arrDisp[idx * 3 + 1]), Number(arrDisp[idx * 3 + 2])));

						var z = XAC.float2int(idx / (nelx + 1) / (nely + 1));
						var x = XAC.float2int((idx - z * (nelx + 1) * (nely + 1)) / (nely + 1));
						var y = nely - XAC.float2int(idx - z * (nelx + 1) * (nely + 1) - x * (nely + 1));
						positions.push(new THREE.Vector3(x, y, z));

						// log([idx, x, y, z])
					}

					var stress = this._computeTetraStress(positions, displacements);
					// log(gs)
					tetras.push({
						idxNodes: idxNodes,
						positions: positions,
						stress: stress
					});
				}

				line.push(tetras);
			}
			plane.push(line)
		}
		tetraGrid.push(plane);
	}

	log(tetraGrid)

	return tetraGrid;
}

MASHUP.Visualizer.prototype._computeTetraStress = function(positions, displacements) {
	var node = positions[0];
	var node1 = positions[1];
	var node2 = positions[2];
	var node3 = positions[3];

	var v1 = new THREE.Vector3().subVectors(node1, node);
	var v2 = new THREE.Vector3().subVectors(node2, node);
	var v3 = new THREE.Vector3().subVectors(node3, node);

	node.add(displacements[0]);
	node1.add(displacements[1]);
	node2.add(displacements[2]);
	node3.add(displacements[3]);

	var V1 = new THREE.Vector3().subVectors(node1, node);
	var V2 = new THREE.Vector3().subVectors(node2, node);
	var V3 = new THREE.Vector3().subVectors(node3, node);

	// should instead get the max?
	var E = this._computeGreenStrain(v1, v2, v3, V1, V2, V3);
	return numeric.fnorm(E);
};

MASHUP.Visualizer.prototype.visualizeStress = function(listDisp, vxg) {
	this._computeStress(listDisp, vxg);
	return;

	var nelx = vxg.nx;
	var nely = vxg.ny;
	var nelz = vxg.nz;

	var arrDisp = listDisp.split(',');
	var _getNodeDisp = function(x, y, z) {
		var idx = XAC.float2int(z * (nelx + 1) * (nely + 1) + x * (nely + 1) + y);
		if (arrDisp[idx] == undefined) {
			err('overflow!');
		}
		return new THREE.Vector3(Number(arrDisp[idx]), Number(arrDisp[idx + 1]), Number(arrDisp[idx + 2]));;
	};

	var stressElms = [];
	for (var i = 0; i < nelx; i++) {
		var plane = [];
		for (var j = 0; j < nely; j++) {
			var line = [];
			for (var k = 0; k < nelz; k++) {
				line.push([]);
			}
			plane.push(line)
		}
		stressElms.push(plane);
	}

	// go thru each node
	for (var i = 0; i < nelx + 1; i++) {
		for (var j = 0; j < nely + 1; j++) {
			for (var k = 0; k < nelz + 1; k++) {
				var greenStrains = [];
				var cnt = 0;

				var ni, nj, nk;
				for (var ni = i - 1; ni <= i + 1; ni += 2) {
					for (var nj = j - 1; nj <= j + 1; nj += 2) {
						for (var nk = k - 1; nk <= k + 1; nk += 2) {
							if (ni < 0 || ni > nelx || nj < 0 || nj > nely || nk < 0 || nk > nelz) {
								continue;
							}

							var node = new THREE.Vector3(i, j, k);
							var node1 = new THREE.Vector3(ni, j, k);
							var node2 = new THREE.Vector3(i, nj, k);
							var node3 = new THREE.Vector3(i, j, nk);

							var v1 = new THREE.Vector3().subVectors(node1, node);
							var v2 = new THREE.Vector3().subVectors(node2, node);
							var v3 = new THREE.Vector3().subVectors(node3, node);

							node.add(_getNodeDisp(i, j, k));
							node1.add(_getNodeDisp(ni, j, k));
							node2.add(_getNodeDisp(i, nj, k));
							node3.add(_getNodeDisp(i, j, nk));

							var V1 = new THREE.Vector3().subVectors(node1, node);
							var V2 = new THREE.Vector3().subVectors(node2, node);
							var V3 = new THREE.Vector3().subVectors(node3, node);

							// should instead get the max?
							var E = this._computeGreenStrain(v1, v2, v3, V1, V2, V3);
							var gs = numeric.fnorm(E);
							greenStrains.push(gs);
							// cnt++;

						} // nk
					} // nj
				} // ni

				log(greenStrains)

			} // z
		} // y
	} // x
}

MASHUP.Visualizer.prototype._computeGreenStrain = function(v1, v2, v3, V1, V2, V3) {
	var U = [v1.toArray(), v2.toArray(), v3.toArray()];
	var W = [V1.toArray(), V2.toArray(), V3.toArray()];
	var F = numeric.dot(W, numeric.inv(U));

	// DEBUG:
	// numeric.print(F);
	// log('------------')

	var E = numeric.times(numeric.sub(numeric.dot(numeric.transpose(F), F), numeric.identity(3)), 0.5);
	return E;
}

MASHUP.Visualizer.prototype._computeDisplacement = function(listDisp, vxg) {
	var nelx = vxg.nx;
	var nely = vxg.ny;
	var nelz = vxg.nz;

	var arrDisp = listDisp.split(',');

	// initialize displacement arrays for the elements
	var dispElms = [];
	for (var i = 0; i < nelx; i++) {
		var plane = [];
		for (var j = 0; j < nely; j++) {
			var line = [];
			for (var k = 0; k < nelz; k++) {
				line.push([]);
			}
			plane.push(line)
		}
		dispElms.push(plane);
	}

	// collect displacement vector for corresponding elements
	for (var i = 0; i + 2 < arrDisp.length; i += 3) {
		var dispNode = new THREE.Vector3(Number(arrDisp[i]), Number(arrDisp[i + 1]), Number(arrDisp[i + 2]));
		elmsOfNode = MASHUP.Optimization.node2elms(nelx, nely, nelz, i / 3);
		for (var j = elmsOfNode.length - 1; j >= 0; j--) {
			var idxElm = elmsOfNode[j];
			var disps = dispElms[idxElm[0]][idxElm[1]][idxElm[2]];
			disps.push(dispNode);
		}
	}

	// obtain the average displacement vector for each element
	for (var i = 0; i < nelx; i++) {
		for (var j = 0; j < nely; j++) {
			for (var k = 0; k < nelz; k++) {
				var vdisp = new THREE.Vector3();
				for (var h = dispElms[i][j][k].length - 1; h >= 0; h--) {
					vdisp.add(dispElms[i][j][k][h]);
				}
				vdisp.divideScalar(dispElms[i][j][k].length);

				// take into account the penalty
				var xe = vxg.gridRaw[k][j][i]; // density at this voxel
				vdisp.multiplyScalar(Math.pow(xe, MASHUP.Optimization.p)); // multiplied by penalty

				dispElms[i][j][k] = []; // release the original array
				dispElms[i][j][k] = vdisp; // assign the displacement vector
			}
		}
	}

	return dispElms;
}

//
//	get heatmap like color based on - 
//	@param	score
//	@param	maxScore
//
MASHUP.Visualizer.prototype._getColorFromScore = function(score, maxScore) {
	// ceiling the score by maxScore
	score = Math.min(score, maxScore);

	// var colorSchemes = [0xd7191c, 0xfdae61, 0xffffbf, 0xa6d96a, 0x1a9641];
	var colorSchemes = [0xd73027, 0xf46d43, 0xfdae61, 0xfee08b, 0xffffbf, 0xd9ef8b, 0xa6d96a, 0x66bd63, 0x1a9850]
	colorSchemes.reverse(); // EXP
	var color = new THREE.Color(0xffffff);
	for (var k = 0; k < colorSchemes.length; k++) {
		if (score <= maxScore * (k + 1) / colorSchemes.length) {
			color.setHex(colorSchemes[k]);
			break;
		}
	}
	return color;
}

//
//	SEVERAL EXTENSION OF NUMERIC LIBRARY
//	@author Xiang 'Anthonj' Chen http://xiangchen.me
//

// compute the Frobenius norm of a matrix
numeric.fnorm = function(matrix) {
	var sum = 0;
	for (var i = 0; i < matrix.length; i++) {
		for (var j = 0; j < matrix[i].length; j++) {
			sum += Math.pow(matrix[i][j], 2);
		}
	}
	return Math.sqrt(sum);
}

// print a matrix
numeric.print = function(matrix) {
	for (var i = 0; i < matrix.length; i++) {
		log(matrix[i]);
	}
}

// times a matrix (including vector) by a scalar
numeric.times = function(matrix, scalar) {
	for (var i = 0; i < matrix.length; i++) {
		for (var j = 0; j < matrix[i].length; j++) {
			matrix[i][j] *= scalar;
		}
	}
	return matrix;
}