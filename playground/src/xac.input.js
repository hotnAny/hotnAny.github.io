var XAC = XAC || {};

XAC.Maniplane = function(pos, orthogonal, showPlane) {
	// this._object = object;
	this._camera = camera;
	this._plane = new XAC.Plane(1000, 1000, showPlane ? XAC.MATERIALPLAIN : XAC.MATERIALINVISIBLE).m;
	this._plane.position.copy(pos);

	var vecView = new THREE.Vector3().subVectors(camera.position, this._plane.position);
	if (orthogonal) {
		var angleView = new THREE.Vector3(0, 1, 0).angleTo(vecView);
		if(angleView > Math.PI / 3) {
			XAC.rotateObjTo(this._plane, vecView);	
		}
	} else {
		XAC.rotateObjTo(this._plane, vecView);
	}

	scene.add(this._plane);
};

XAC.Maniplane.prototype = {
	update: function(e) {
		return XAC.hitPoint(e, [this._plane]);
	},

	destruct: function() {
		scene.remove(this._plane);
	}
}