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

class xacJoinSeparate extends xacControl {
	constructor(objs) {
		super(JOINSEPCTRL);

		this._mobile = undefined;
		this._static = undefined;
		this._dir = undefined;

		// show bounding box
		this._bboxes = [];
		for (var i = objs.length - 1; i >= 0; i--) {
			// var bbox = new THREE.BoundingBoxHelper(objs[i], colorHighlight);
			var bboxSel = new BboxSelector(objs[i]);
			// scene.add(bboxSel.box);
			// bboxSel.box.selector = bboxSel;
			bboxSel.obj = objs[i];
			this._bboxes = this._bboxes.concat(bboxSel.box);
		}

		this._ve = this._ve.concat(this._bboxes);
	}

	get mobile() {
		return this._mobile;
	}
	get static() {
		return this._static;
	}
	get dir() {
		return this._dir;
	}

	mouseDown(e, obj, pt, fnml) {
		if (this._bboxes.length < 2) {
			return;
		}

		intersects = rayCast(e.clientX, e.clientY, this._bboxes);
		// var objInt = intersects[0];

		if (intersects[0] == undefined) {
			return;
		}

		var bboxSel = intersects[0].object.selector;
		bboxSel.select(intersects[0].object);
		var obj = bboxSel.obj;

		// var obj = bboxSel.objContained;

		if (this._mobile == undefined) {
			// first is the mobile one
			this._mobile = obj;
			this._ve.push(addABall(intersects[0].point));
		} else if (this._static == undefined) {
			// second is the static one
			if (obj != this._mobile) {
				this._static = obj;
				this._dir = intersects[0].face.normal;
				this._ve.push(addAVector(intersects[0].point, this._dir));
			}
		}
	}

	mouseMove(e, obj, pt, fnml) {}

	mouseUp(e, obj, pt, fnml) {}
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
					this._poc = pt.clone(); // poc: point of contact
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