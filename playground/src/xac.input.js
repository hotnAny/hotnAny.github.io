var XAC = XAC || {};

XAC.Maniplane = function(object) {
	this._object = object;
	this._camera = camera;
	this._plane = new XAC.Plane(1000, 1000, XAC.MATERIALINVISIBLE).m;
	this._plane.position.copy(this._object.position);
	XAC.rotateObjTo(this._plane, new THREE.Vector3().subVectors(camera.position, this._plane.position));

	scene.add(this._plane);
};

XAC.Maniplane.prototype = {
	update: function(e) {
		return XAC.hitPoint(e, [this._plane]);
	},

	destruct: function() {
		// setTimeout(function() {
		scene.remove(this._plane);
		// }, 500);
	}
}