/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Input techniques - contains a collection of input techniques
 * 	
 *	@author Xiang 'Anthonj' Chen http://xiangchen.me
 *
 *	NOTE:
 *	> it assumes a global variable camera exists - might want to fix that
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var XAC = XAC || {};

XAC.LEFTMOUSE = 1;
XAC.RIGHTMOUSE = 2;
XAC.WHEEL = 4;

//
//	a plane orthogonal to the camera for manipulation
//	@param	pos - the position of a point in R3
//	@param	orthogonal - whether to snap the plane to XZ or Y
//	@param	showPlane - whether to show the plane visually
//
XAC.Maniplane = function(pos, scene, camera, orthogonal, showPlane) {
	this._camera = camera;
	this._scene = scene;

	this._plane = new XAC.Plane(1000, 1000, showPlane == true ? XAC.MATERIALPLAIN : XAC.MATERIALINVISIBLE).m;
	this._plane.position.copy(pos);

	var vecView = new THREE.Vector3().subVectors(this._camera.position, this._plane.position);
	if (orthogonal == true) {
		var angleView = new THREE.Vector3(0, 1, 0).angleTo(vecView);
		if(angleView > Math.PI / 3) {
			XAC.rotateObjTo(this._plane, vecView);	
		}
	} else {
		XAC.rotateObjTo(this._plane, vecView);
	}

	this._scene.add(this._plane);
};

XAC.Maniplane.prototype = {
	update: function(e) {
		return XAC.hitPoint(e, [this._plane], this._camera);
	},

	destruct: function() {
		this._scene.remove(this._plane);
	}
}