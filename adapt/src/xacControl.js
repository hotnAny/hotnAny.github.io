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

	// clear up the visual elements
	clear() {
		for (var i = this._ve.length - 1; i >= 0; i--) {
			scene.remove(this._ve[i]);
		}
	}
}

class xacPushPull extends xacControl {
	constructor(type) {
		super(PUSHPULLCTRL);
	}

	mouseDown(e, obj, pt, fnml) {
		this._dirForce = fnml.clone();
		gPartSel.press(obj, pt, this._dirForce, true);
		gPartSel.finishUp();
	}

	mouseMove(e, obj, pt, fnml) {}

	mouseUp(e, obj, pt, fnml) {}
}

class xacClutch extends xacControl {
	constructor(objs) {
		super(CLUTCHCTRL);

		this._TOSELECTFREEEND = 0;
		this._TOSELECTANCHOR = 1;
		this._TOSELECTFULCRUM = 2;

		this._step = this._TOSELECTFREEEND;
	}

	mouseDown(e, obj, pt, fnml) {
		switch (this._step) {
			case this._TOSELECTFREEEND:
				// select free end
				if (obj != undefined && pt != undefined && fnml != undefined) {
					gPartSel.press(obj, pt, fnml, true);
					this._pocFree = pt.clone(); // poc: point of contact
					this._nmlFree = fnml.clone();
					// addAVector(this._pocFree, this._nmlFree);
					gPartSel.finishUp();
					this._step = this._TOSELECTANCHOR;
				}

				break;
			case this._TOSELECTANCHOR:
				// select anchor
				if (obj != undefined && pt != undefined && fnml != undefined) {
					gPartSel.clear();
					gPartSel.press(obj, pt, fnml, true);
					this._pocAnchor = pt.clone(); // poc: point of contact
					this._nmlAnchor = fnml.clone();
					// addAVector(this._pocAnchor, this._nmlAnchor);
					gPartSel.finishUp();

					// var midPoint = new THREE.Vector3().addVectors(this._pocFree, this._pocAnchor).multiplyScalar(0.5);
					var midNml = new THREE.Vector3().addVectors(this._nmlFree, this._nmlAnchor).multiplyScalar(0.5);
					// addAVector(midPoint, midNml);

					this._planeSel = new PlaneSelector([this._pocFree, this._pocAnchor], midNml, true);
					gSticky = true;
					this._step = this._TOSELECTFULCRUM;
				}
				break;
			case this._TOSELECTFULCRUM:
				this._planeSel.clear();
				this._fulcrum = this._planeSel.selection;
				this._plane = getPlaneFromPointVectors(this._fulcrum, this._pocFree.clone().sub(this._fulcrum), this._pocAnchor.clone().sub(this._fulcrum));

				// this._dirLeverFree = this._pocFree.clone().sub(this._fulcrum);
				gSticky = false;
				this._step = this._TOSELECTOBJ;
				break;
		}
	}

	mouseMove(e, obj, pt, fnml) {
		switch (this._step) {
			case this._TOSELECTFULCRUM:
				this._planeSel.hitTest(e);
				break;
		}
	}

	mouseUp(e, obj, pt, fnml) {}

	get fulcrum() {
		return this._fulcrum;
	}

	get pocFree() {
		return this._pocFree;
	}

	get pocAnchor() {
		return this._pocAnchor;
	}

	// TODO: return the plane of clutching
	get plane() {
		return this._plane;
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
			this._ve.push(gPartSel.release());
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

/*
	routines to specify a rotation control
*/
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
					this._step = this._TOSELECTFULCRUM;
				}
				break;
			case this._TOSELECTFULCRUM:
				this._planeSel.clear();
				this._fulcrum = this._planeSel.selection;
				this._dirLever = this._poc.clone().sub(this._fulcrum);
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