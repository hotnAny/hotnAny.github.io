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
//	thick line
//
XAC.ThickLine = function(p1, p2, r, mat) {
	var h = p1.distanceTo(p2);
	var line = new XAC.Cylinder(r, h, mat, true);
	this._g = line.g;
	this._m = line.m;

	var dir = p2.clone().sub(p1);
	XAC.rotateObjTo(this._m, dir);
	var ctr = p1.clone().add(p2).multiplyScalar(0.5);
	this._m.position.copy(ctr);
}
XAC.ThickLine.prototype = Object.create(XAC.Thing.prototype);

//
//	plane
//
XAC.Plane = function(w, l, mat) {
	this._g = new THREE.CubeGeometry(w, 1, l);
	this._m = new THREE.Mesh(this._g, mat == undefined ? XAC.MATERIALNORMAL.clone() : mat.clone());
}
XAC.Plane.prototype = Object.create(XAC.Thing.prototype);

//
//	sphere
//
XAC.Sphere = function(r, mat, highFi) {
	this._r = r;
	this._g = highFi == true ? new THREE.SphereGeometry(r, 32, 32) : new THREE.SphereGeometry(r, 8, 8);
	this._m = new THREE.Mesh(this._g, mat == undefined ? XAC.MATERIALNORMAL.clone() : mat.clone());
};
XAC.Sphere.prototype = Object.create(XAC.Thing.prototype);

//
// cylinder
//
XAC.Cylinder = function(r, h, mat, openEnded) {
	if (r.r1 != undefined && r.r2 != undefined) {
		this._r1 = r.r1;
		this._r2 = r.r2;
	} else {
		this._r1 = this._r2 = r;
	}

	this._h = h;
	this._g = new THREE.CylinderGeometry(this._r1, this._r2, this._h, 32, 1, openEnded);
	this._m = new THREE.Mesh(this._g, mat == undefined ? XAC.MATERIALNORMAL.clone() : mat.clone());
}
XAC.Cylinder.prototype = Object.create(XAC.Thing.prototype);