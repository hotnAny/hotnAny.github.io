var XAC = XAC || {};

XAC.Thing = function(m) {
	this._g = undefined; // the original geometry, always!
	this._m = m;

	this._weight = undefined;
};

XAC.Thing.prototype = {
	constructor: XAC.Thing,

	get g() {
		return this._g;
	},

	get gt() {
		this._m.updateMatrixWorld();
		var gTransformed = this._g.clone();
		gTransformed.applyMatrix(this._m.matrixWorld);
		return gTransformed;
	},

	get m() {
		return this._m;
	},

	unitTest: function() {
		log(this.g);
	}
}

//
//	sphere
//
XAC.Sphere = function(r, m, highFi) {
	this.prototype = Object.create(XAC.Thing.prototype);
	this._r = r;
	this._g = highFi == true ? new THREE.SphereGeometry(r, 32, 32) : new THREE.SphereGeometry(r, 8, 8);
	this._m = new THREE.Mesh(this._g, m == undefined ? MATERIALNORMAL.clone() : m.clone());
}
XAC.Sphere.prototype = Object.create(XAC.Thing.prototype);