/**
 * means for specifying types of actions with 3d objects
 * 	
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

"use strict"; 

var GRASPCTRL = 0;
var PUSHPULLCTRL = 1;
var ROTATECTRL = 2;
var CLUTCHCTRL = 3;
var JOINSEPCTRL = 4;

/*
	the base class for a type of action
*/
class xacAction {
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

		if(this._selector != undefined && this._selector.clear != undefined) {
			this._selector.clear();
		}
	}
}

/*
	grasping action
*/
class xacGrasp extends xacAction {
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

	cancel() {
		this.clear();
		gPartSel.clear();
		gSticky = false;
	}
}

/*
	push/pull action
*/
class xacPushPull extends xacAction {
	constructor(type) {
		super(PUSHPULLCTRL);

		this._TOSHOWSPHERE = 0;
		this._TOSELECTDIR = 1;
		this._step = this._TOSHOWSPHERE;

		this._pt = undefined;
		this._dirForce = undefined;
	}

	mouseDown(e, obj, pt, fnml) {
		if (this._step == this._TOSHOWSPHERE) {
			// this._dirForce = fnml.clone();
			this._pt = pt;
			gPartSel.press(obj, pt, fnml, true);
			gPartSel.finishUp();

			this._sphereSel = new SphereSelector(pt);
			gSticky = true;
		} else if (this._step == this._TOSELECTDIR) {

		}
	}

	mouseMove(e, obj, pt, fnml) {
		if (this._step == this._TOSHOWSPHERE) {

		} else if (this._step == this._TOSELECTDIR) {
			this._sphereSel.hitTest(e);
		}
	}

	mouseUp(e, obj, pt, fnml) {
		if (this._step == this._TOSHOWSPHERE) {
			this._step = this._TOSELECTDIR;
		} else if (this._step == this._TOSELECTDIR) {
			this._dirForce = this._sphereSel.selection.clone().sub(this._pt).normalize();
			this._ve.push(this._sphereSel.pointer);

			gSticky = false;
			// setTimeout(function(ctrl) {
			// 	ctrl._sphereSel.clear();
			// }, 1000, this);
		}
	}

	cancel() {
		if (this._sphereSel != undefined) {
			this._sphereSel.clear();
		}
		this._step = this._TOSHOWSPHERE;
	}

	get dirForce() {
		return this._dirForce;
	}

	get pt() {
		return this._pt;
	}
}

/*
	rotation action
*/
class xacRotate extends xacAction {
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
					this._selector = this._planeSel;
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
				this._fulcrum = this._planeSel.selection;
				this._dirLever = this._poc.clone().sub(this._fulcrum);

				this._step = this._TOSELECTOBJ;

				gSticky = false;
				// setTimeout(function(ctrl) {
				// 	ctrl._planeSel.clear();
				// }, 1000, this);
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

	cancel() {
		this._step = this._TOSELECTOBJ;
		this.clear();
		this._planeSel.clear();
		gPartSel.clear();
	}
}

/*
	clutching action
*/
class xacClutch extends xacAction {
	constructor(objs) {
		super(CLUTCHCTRL);

		this._TOSELECTFREEEND = 0;
		this._TOSELECTANCHOR = 1;
		this._TOSELECTFULCRUM = 2;

		this._step = this._TOSELECTFREEEND;

		// index arm/lever by part name
		this._partArms = new Array();
		this._partFree = undefined;
		this._partFixed = undefined;
	}

	mouseDown(e, obj, pt, fnml) {
		switch (this._step) {
			case this._TOSELECTFREEEND:
				if (obj != undefined && pt != undefined && fnml != undefined) {
					gPartSel.press(obj, pt, fnml, true);
					this._pocFree = pt.clone(); // poc: point of contact
					this._nmlFree = fnml.clone();
					gPartSel.finishUp();
					this._partFree = 'Part ' + gPartSerial;
					this._step = this._TOSELECTANCHOR;

					// addAVector(this._pocFree, this._nmlFree);
				}

				break;
			case this._TOSELECTANCHOR:
				if (obj != undefined && pt != undefined && fnml != undefined) {
					gPartSel.clear();
					gPartSel.press(obj, pt, fnml, true);
					this._pocFixed = pt.clone(); // poc: point of contact
					this._nmlAnchor = fnml.clone();
					gPartSel.finishUp();
					this._partFixed = 'Part ' + gPartSerial;

					// addAVector(this._pocFixed, this._nmlAnchor);

					// BEFORE: naively summing the normals
					// var midNml = new THREE.Vector3().addVectors(this._nmlFree, this._nmlAnchor).multiplyScalar(0.5);
					// NOW: compute the plane
					var midPt = new THREE.Vector3().addVectors(this._pocFree, this._pocFixed).multiplyScalar(0.5);
					var pl = getPlaneFromPointVectors(midPt, this._nmlFree, this._nmlAnchor);
					var midNml = new THREE.Vector3(pl.A, pl.B, pl.C).normalize();
					// addAVector(midPt, midNml);

					this._planeSel = new PlaneSelector([this._pocFree, this._pocFixed], midNml, true);
					this._selector = this._planeSel;
					gSticky = true;
					this._step = this._TOSELECTFULCRUM;
				}
				break;
			case this._TOSELECTFULCRUM:

				this._fulcrum = this._planeSel.selection;
				this._plane = getPlaneFromPointVectors(this._fulcrum, this._pocFree.clone().sub(this._fulcrum), this._pocFixed.clone().sub(this._fulcrum));

				this._partArms[this._partFree] = this._pocFree.clone().sub(this._fulcrum).normalize();
				this._partArms[this._partFixed] = this._pocFixed.clone().sub(this._fulcrum).normalize();

				gSticky = false;
				this._step = this._TOSELECTOBJ;

				// setTimeout(function(ctrl) {
				// 	ctrl._planeSel.clear();
				// }, 1000, this);
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

	get pocFixed() {
		return this._pocFixed;
	}

	get partArms() {
		return this._partArms;
	}

	// TODO: return the plane of clutching
	get plane() {
		return this._plane;
	}

	cancel() {
		this._step = this._TOSELECTFREEEND;
		this.clear();
		this._planeSel.clear();
		gPartSel.clear();
	}
}

/*
	objects or their components joinable and separable
*/
class xacJoinSeparate extends xacAction {
	constructor(objs) {
		super(JOINSEPCTRL);

		this._mobile = undefined;
		this._static = undefined;
		this._dir = undefined;

		// show bounding box
		this._bboxes = [];
		for (var i = objs.length - 1; i >= 0; i--) {
			// var bbox = new THREE.BoundingBoxHelper(objs[i], COLORHIGHLIGHT);
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

	get dirMobile() {
		return this._dirMobile
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
			this._dirMobile = intersects[0].object.normal;
		} else if (this._static == undefined) {
			// second is the static one
			if (obj != this._mobile) {
				this._static = obj;
				this._dir = intersects[0].object.normal;
				this._ve.push(addAVector(intersects[0].point, this._dir));
			}
		}
	}

	mouseMove(e, obj, pt, fnml) {}

	mouseUp(e, obj, pt, fnml) {}
}