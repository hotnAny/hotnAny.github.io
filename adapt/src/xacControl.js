"use strict";

var GRASPCTRL 		= 0;
var PUSHPULLCTRL 	= 1;
var ROTATECTRL 		= 2;
var CLUTCHCTRL 		= 3;
var JOINSEPCTRL 	= 4;

class xacControl {
	constructor(type) {
		this._type = type;
	}

	_showGuide() {

	}
}

class xacGrasp extends xacControl {
	constructor() {
		super(GRASPCTRL);

		this._g = new THREE.Vector3(0, -1, 0);
	}
}