"use strict";

class xacConnector {
	constructor(a) {
		this._a = a; // the original adaptation 
		this._awc = undefined; // the adaptation with connector
	}
}

/*
	marking part of the adaptation to be printed with flexible material
*/
class xacFlexiblePart extends xacConnector {
	constructor(a) {
		super(a);

		this._flexiblePart = undefined;

		// TODO: this can be improved by considering interpolating btwn the adaptation & the object
		this._ratio = 0.4; // in the adaptation, about this percentage the size of the original object will be flexible

		this._makeFlexiblePart();

	}

	_makeFlexiblePart() {
		// enlarge the original object
		var objInflated = this._a.adaptation.obj.clone();

		objInflated.scale.set(1 + this._ratio, 1 + this._ratio, 1 + this._ratio);

		// get its intersection with the adaptation
		var fp = xacThing.intersect(getTransformedGeometry(objInflated), getTransformedGeometry(this._a.adaptation), MATERIALOVERLAY);
		scene.add(fp);
		this._flexiblePart = fp;
		
		this._awc = xacThing.subtract(getTransformedGeometry(this._a.adaptation), getTransformedGeometry(fp), this._a.adaptation.material);
		scene.remove(this._a.adaptation);
		scene.add(this._awc);

		this._a.awc = this._awc;
		this._a.fp = this._flexiblePart;
	}
}

class xacStrap extends xacConnector {
	constructor(a) {
		super(a);

		this._strapWidth = 8;
		this._strapThickness = 4;
		this._inflateRatio = 1.1;
	}

	mousedown(e, obj, pt, fnml) {
		this._strokePoints = [];
	}

	mousemove(e, obj, pt, fnml) {
		this._obj = obj;
		this._strokePoints.push(pt);
		addABall(pt, colorHighlight);
	}

	mouseup(e) {
		if (this._strokePoints.length > 3) {
			this._makeStrapFor(this._strokePoints, this._obj, this._a);
		}
		removeBalls();
	}

	// strapping adaptation(a) to object(obj)
	// TODO: debug this
	_makeStrapFor(pts, obj) {
		//	1. find cutting center and cross section radius
		var planeParams = findPlaneToFitPoints(this._strokePoints);
		var a = planeParams.A;
		var b = planeParams.B;
		var c = planeParams.C;
		var d = planeParams.D;

		var ctrStroke = getCenter(this._strokePoints);
		var cutter = new xacCylinder(100, this._strapWidth);
		rotateObjTo(cutter.m, new THREE.Vector3(a, b, c));
		cutter.m.position.copy(ctrStroke);
		// scene.add(cutter.m);

		var cutPart = xacThing.intersect(getTransformedGeometry(cutter.m), getTransformedGeometry(obj));
		var ctrStrap = getBoundingBoxCenter(cutPart);
		var rStrap = getBoundingSphereRadius(cutPart);
		rStrap *= this._inflateRatio;
		// scene.add(addABall(ctrStrap, 0x6a5c2b, rStrap).clone());

		//	2. generate the ghost strap model
		var strapOut = new xacCylinder(rStrap + this._strapThickness, this._strapWidth);
		var strapIn = new xacCylinder(rStrap, this._strapWidth);
		var strap = xacThing.subtract(strapOut.gt, strapIn.gt, MATERIALCONTRAST);
		rotateObjTo(strap, new THREE.Vector3(a, b, c));
		strap.position.copy(ctrStrap);
		scene.add(strap);

		//	3. cut from the adaptation
		if (this._a != undefined) {
			scene.remove(this._a.adaptation);
			this._awc = xacThing.subtract(getTransformedGeometry(this._a.adaptation), getTransformedGeometry(strap), this._a.adaptation.material);
			scene.add(this._awc);
			this._a.awc = this._awc;
		}

		setTimeout(function(strap) {
			scene.remove(strap)
		}, 1000, strap);
	}
}