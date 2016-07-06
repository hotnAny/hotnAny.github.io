/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Visualizer - contains a collection of visualization techniques
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
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
//	@param	obj3d - (optional) might be possible to visualize directly onto an Object3D
//
MASHUP.Visualizer.prototype.visualizeDisplacement = function(listDisp, vxg, obj3d) {
	if (vxg != undefined) {
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

		// clean up existing visualization
		for (var i = this._arrows.length - 1; i >= 0; i--) {
			this._scene.remove(this._arrows[i]);
		}
		this._arrows = [];

		// normalize the forces by a customize worst case displacement
		var worstDisp = Math.sqrt(vxg.nx * vxg.nx + vxg.ny * vxg.ny + vxg.nz * vxg.nz) / 2;
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
}

MASHUP.Visualizer.prototype.visualizeStress = function(listDisp, vxg) {

}


MASHUP.Visualizer.prototype._computeDisplacement = function(listDisp, vxg) {

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