"use strict";

var SUBTRACT = 0;
var UNION = 1;
var INTERSECT = 2;

class xacThing {
	constructor(m) {
		this._g = undefined; // the original geometry, always!
		this._m = m;

		this._weight = undefined;
	}

	get g() {
		return this._g;
	}

	get gt() {
		this._m.updateMatrixWorld();
		var gTransformed = this._g.clone();
		gTransformed.applyMatrix(this._m.matrixWorld);
		return gTransformed;
	}

	get m() {
		return this._m;
	}

	static _boolean(obj1, obj2, type) {
		var objCsg1 = new ThreeBSP(obj1);
		var objCsg2 = new ThreeBSP(obj2);

		var csgBoolean = undefined;
		switch (type) {
			case SUBTRACT:
				csgBoolean = objCsg1.subtract(objCsg2);
				break;
			case UNION:
				csgBoolean = objCsg1.union(objCsg2);
				break;
			case INTERSECT:
				csgBoolean = objCsg1.intersect(objCsg2);
				break;
		}
		return csgBoolean;
	}

	static subtract(obj1, obj2, material) {
		return xacThing._boolean(obj1, obj2, SUBTRACT).toMesh(material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}

	static union(obj1, obj2, material) {
		return xacThing._boolean(obj1, obj2, UNION).toMesh(material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}

	static intersect(obj1, obj2, material) {
		return xacThing._boolean(obj1, obj2, INTERSECT).toMesh(material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}
}

class xacSphere extends xacThing {
	constructor(r, material) {
		super();
		this._r = r;
		this._g = new THREE.SphereGeometry(r, 32, 32);
		this._m = new THREE.Mesh(this._g, material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}
}

class xacCylinder extends xacThing {
	constructor(r, h, material) {
		super();
		this._r = r;
		this._h = h;
		this._g = new THREE.CylinderGeometry(r, r, h, 32, 1);
		this._m = new THREE.Mesh(this._g, material == undefined ? MATERIALNORMAL.clone() : material.clone());
	}
}

class xacRectPrism extends xacThing {
	// width, thickness, length
	constructor(w, t, l) {
		super();
		this._g = new THREE.CubeGeometry(w, t, l);
		this._m = new THREE.Mesh(this._g, MATERIALNORMAL.clone());
	}
}

class xacPlane extends xacThing {
	constructor(w, l) {
		super();
		this._g = new THREE.CubeGeometry(w, 1, l);
		this._m = new THREE.Mesh(this._g, MATERIALNORMAL.clone());
	}
}