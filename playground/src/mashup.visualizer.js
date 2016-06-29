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
MASHUP.Visualizer.prototype.visualizeDisplacement = function(nelx, nely, nelz, vdisp, obj3d) {
	if (obj3d == undefined) {
		var arrDisp = vdisp.split(',');

		for (var i = 0; i + 2 < arrDisp.length; i += 3) {
			var dispNode = new THREE.Vector3(arrDisp[i], arrDisp[i + 1], arrDisp[i + 2]);
			elmsOfNode = MASHUP.Optimization.node2elms(nelx, nely, nelz, i/3);
			log(elmsOfNode)
		}

		// log(dispNodes)
	}
}