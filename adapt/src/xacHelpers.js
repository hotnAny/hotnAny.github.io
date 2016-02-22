"use strict";

class SelectionSphere extends xacShape {
	constructor() {
		super();
	}

	update(ctr, r) {
		this._ctr = ctr;
		this._r = r;
		this._g = new THREE.SphereGeometry(this._r, 32, 32);
		this._m = new THREE.Mesh(this._g, MATERIALCONTRAST);
		this._m.position = this._ctr;
	}

	show() {
		scene.add(this._m);
	}

	hide() {
		scene.remove(this._m);
	}
}