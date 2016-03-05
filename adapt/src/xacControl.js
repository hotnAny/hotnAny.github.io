"use strict";

var GRASPCTRL = 0;
var PUSHPULLCTRL = 1;
var ROTATECTRL = 2;
var CLUTCHCTRL = 3;
var JOINSEPCTRL = 4;

class xacControl {
	constructor(type) {
		this._type = type;
		this._ve = []; // visual elements
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
		if (gSticky == false) {
			if (obj != undefined && pt != undefined && fnml != undefined) {
				gPartSel.grab(obj, pt, fnml);
			}
		} else if (gSticky) {
			gPartSel.release();
			gPartSel.finishUp();
		}
	}

	mouseMove(e, obj, pt, fml) {
		if (gSticky) {
			gPartSel.rotateHand(e.ptMove, e.ptDown);
		}
	}

	mouseUp(e, obj, pt, fml) {}
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

	get fulcrum() {
		return this._fulcrum;
	}

	get dirLever() {
		return this._dirLever;
	}

	mouseDown(e, obj, pt, fnml) {
		switch (this._step) {
			case this._TOSELECTOBJ:
				// do 3dui press
				if (obj != undefined && pt != undefined && fnml != undefined) {
					gPartSel.press(obj, pt, fnml, true);
					this._poc = pt.clone();	// poc: point of contact
					gPartSel.finishUp();
					this._step = this._TOSELECTPLANE;
					this._planeSel = new PlaneSelector(pt);
				}
				break;
			case this._TOSELECTPLANE:
				// show planes
				if (this._planeSel.hitTest(e) == true) {
					gSticky = true;
					log("xacControl")
					this._step = this._TOSELECTFULCRUM;
				}
				break;
			case this._TOSELECTFULCRUM:
				this._planeSel.clear();
				this._fulcrum = this._planeSel.selection;
				this._dirLever = this._poc.clone().sub(this._fulcrum);
				this._ve.push(addABall(this._fulcrum));
				this._ve.push(addAVector(this._fulcrum, this._dirLever));
				gSticky = false;
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

	mouseUp(e, obj, pt, fml) {}
}