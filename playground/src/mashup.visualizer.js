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

};

MASHUP.Visualizer.prototype = {
	constructor: MASHUP.Visualizer
};

//
//	visualize displacement vector:
//		- if obj3d is given, visualize it onto the obj3d (THREE.Object3D)
//		- otherwise visualize it on a voxel grid (created)
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
					line.push(new THREE.Vector3());
				}
				plane.push(line)
			}
			dispElms.push(plane);
		}

		// add displacement vector to corresponding elements
		var maxDisp = Number.MIN_VALUE;
		for (var i = 0; i + 2 < arrDisp.length; i += 3) {
			var dispNode = new THREE.Vector3(Number(arrDisp[i]), Number(arrDisp[i + 1]), Number(arrDisp[i + 2]));
			elmsOfNode = MASHUP.Optimization.node2elms(nelx, nely, nelz, i / 3);
			for (var j = elmsOfNode.length - 1; j >= 0; j--) {
				var idxElm = elmsOfNode[j];
				var vdisp = dispElms[idxElm[0]][idxElm[1]][idxElm[2]];
				vdisp.add(dispNode);
				maxDisp = Math.max(maxDisp, vdisp.length());
			}
		}

		// normalize the forces
		for (var i = 0; i < nelx; i++) {
			for (var j = 0; j < nely; j++) {
				for (var k = 0; k < nelz; k++) {
					dispElms[i][j][k].divideScalar(maxDisp);
					// log(dispElms[i][j][k]);

					var pos = new THREE.Vector3(i, j, k).multiplyScalar(vxg.dim);
					var arrow = addAnArrow(pos, dispElms[i][j][k], vxg.dim * 0.8 * dispElms[i][j][k].length(), 1);

					for (var h = arrow.children.length - 1; h >= 0; h--) {
						arrow.children[h].material.opacity = dispElms[i][j][k].length();
						arrow.children[h].material.needsUpdate = true;
					}
				} // z
			} // y
		} // x

	}
}