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
//	line
//
XAC.Line = function(p1, p2, clr) {
	this._g = new THREE.Geometry();
	this._g.vertices.push(p1);
	this._g.vertices.push(p2);
	clr = clr == undefined ? 0x000000 : clr;
	var mat = new THREE.LineBasicMaterial({
		color: clr
	});
	this._m = new THREE.Line(this._g, mat);
};
XAC.Line.prototype = Object.create(XAC.Thing.prototype);

//
//	plane
//
XAC.Plane = function(w, l, mat) {
	this._g = new THREE.CubeGeometry(w, 1, l);
	this._m = new THREE.Mesh(this._g, mat == undefined ? MATERIALNORMAL.clone() : mat.clone());
}
XAC.Plane.prototype = Object.create(XAC.Thing.prototype);

//
//	sphere
//
XAC.Sphere = function(r, mat, highFi) {
	this.prototype = Object.create(XAC.Thing.prototype);
	this._r = r;
	this._g = highFi == true ? new THREE.SphereGeometry(r, 32, 32) : new THREE.SphereGeometry(r, 8, 8);
	this._m = new THREE.Mesh(this._g, mat == undefined ? MATERIALNORMAL.clone() : mat.clone());
};
XAC.Sphere.prototype = Object.create(XAC.Thing.prototype);