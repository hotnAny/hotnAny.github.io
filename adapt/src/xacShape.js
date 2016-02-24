"use strict";

var SUBTRACT = 0;
var UNION = 1;
var INTERSECT = 2;

class xacShape {
	constructor() {
		this._g = undefined; // the original geometry, always!
		this._m = undefined;
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
		// this geometry

		// this._csg = new ThreeBSP(this.gt());

		// incoming geometry
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
		return xacShape._boolean(obj1, obj2, SUBTRACT).toMesh(material == undefined ? MATERIALNORMAL : material);
	}

	static union(obj1, obj2, material) {
		return xacShape._boolean(obj1, obj2, UNION).toMesh(material == undefined ? MATERIALNORMAL : material);
	}

	static intersect(obj1, obj2, material) {
		return xacShape._boolean(obj1, obj2, INTERSECT).toMesh(material == undefined ? MATERIALNORMAL : material);
	}
}

class xacCylinder extends xacShape {
	constructor(r, h, isOpenEnded, material) {
		super();
		this._g = new THREE.CylinderGeometry(r, r, h, 32, 1, isOpenEnded);
		this._m = new THREE.Mesh(this._g, material == undefined ? MATERIALNORMAL : MATERIALOVERLAY);
	}
}

class xacRectPrism extends xacShape {
	// width, thickness, length
	constructor(w, t, l) {
		super();
		this._g = new THREE.CubeGeometry(w, t, l);
		this._m = new THREE.Mesh(this._g, MATERIALNORMAL);
	}
}

class xacPlane extends xacShape {
	constructor(w, l) {
		super();
		this._g = new THREE.CubeGeometry(w, 1, l);
		this._m = new THREE.Mesh(this._g, MATERIALNORMAL);
	}
}