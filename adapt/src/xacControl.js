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

	get type(){
		return this._type;
	}
}

class xacGrasp extends xacControl {
	constructor() {
		super(GRASPCTRL);

		this._g = new THREE.Vector3(0, -1, 0);
	}

	mouseDown(e, obj, pt, fnml) {

	}
}

class xacRotate extends xacControl {
	constructor() {
		super(GRASPCTRL);

		// the steps
		this._step = undefined;
		this._TOSELECTOBJ = 0;
		this._TOSELECTPLANE = 1;
		this._TODRAWPATH = 2;
	}

	mouseDown(e, obj, pt, fnml) {

	}

	mouseMove(e, obj, pt, fml) {

	}

	mouseUp(e, obj, pt, fml) {
		
	}
}