"use strict";

var GRASPCTRL = 0;
var PUSHPULLCTRL = 1;
var ROTATECTRL = 2;
var CLUTCHCTRL = 3;
var JOINSEPCTRL = 4;

class xacControl {
	constructor(type) {
		this._type = type;
		this._ve = [];	// visual elements
	}

	get type() {
		return this._type;
	}

	clear() {
		for (var i = this._ve.length - 1; i >= 0; i--) {
			scene.remove(this._ve[i]);
		}
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
		super(ROTATECTRL);

		// the steps
		this._TOSELECTOBJ = 0;
		this._TOSELECTPLANE = 1;
		this._TOSELECTFULCRUM = 2;

		this._step = this._TOSELECTOBJ;
	}

	mouseDown(e, obj, pt, fnml) {
		switch (this._step) {
			case this._TOSELECTOBJ:
				// do 3dui press
				if (obj != undefined && pt != undefined && fnml != undefined) {
					gPartSel.press(obj, pt, fnml);
					gPartSel.finishUp();
					this._step = this._TOSELECTPLANE;
					this._planeSel = new PlaneSelector(pt);
				}
				break;
			case this._TOSELECTPLANE:
				// show planes
				if(this._planeSel.hitTest(e) == true) {
					gSticky = true;
					this._step = this._TOSELECTFULCRUM;
				}
				break;
			case this._TOSELECTFULCRUM:
				this._planeSel.clear();
				this._ve.push(addABall(this._planeSel.selection));
				this._step = this._TOSELECTOBJ;
				break;
		}
	}

	mouseMove(e, obj, pt, fml) {
		switch (this._step) {
			case this._TOSELECTPLANE:
				break;
			case this._TOSELECTFULCRUM:
				this._planeSel.hitTest(e);
				break;
		}
	}

	mouseUp(e, obj, pt, fml) {
		switch (this._step) {
			case this._TOSELECTOBJ:
				break;
			case this._TOSELECTFULCRUM:
				// compute the fulcrum
				break;
		}
	}
}