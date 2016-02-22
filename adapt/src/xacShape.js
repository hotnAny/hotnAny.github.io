"use strict";

class xacShape {
	constructor() {
		this._geometry = undefined;
		this._material = MATERIALNORMAL;
	}

	get g() {
		return this._geometry;
	}

	get m() {
		return this._mesh;
	}
}

class xacCylinder extends xacShape {
	constructor(r, h) {
		super();
		this._geometry = new THREE.CylinderGeometry( r, r, h, 32 );
		this._mesh = new THREE.Mesh(this._geometry, this._material);
	}
}

class xacRectPrism extends xacShape {
	// width, thickness, length
	constructor(w, t, l) {
		super();
		this._geometry = new THREE.CubeGeometry(w, t, l);
		this._mesh = new THREE.Mesh(this._geometry, this._material);
	}
}

class xacPlane extends xacShape {
	constructor(w, l) {
		super();
		this._geometry = new THREE.CubeGeometry(w, 1, l);
		this._mesh = new THREE.Mesh(this._geometry, this._material);
	}
}