"use strict";

class xacShape {
	constructor() {
		this._g = undefined;
		this._m = undefined;
	}

	get g() {
		return this._g;
	}

	get m() {
		return this._m;
	}
}

class xacCylinder extends xacShape {
	constructor(r, h) {
		super();
		this._g = new THREE.CylinderGeometry( r, r, h, 32 );
		this._m = new THREE.Mesh(this._g, MATERIALNORMAL);
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