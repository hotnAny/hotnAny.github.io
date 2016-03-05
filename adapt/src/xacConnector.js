"use strict";

class xacConnector {
	constructor(a) {
		this._a = a; // the original adaptation 
		this._awc = undefined; // the adaptation with connector
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
	_makeStrapFor(pts, obj, a) {
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

		// cut from the adaptation
		if (this._a != undefined) {
			scene.remove(this._a.adaptation);
			this._awc = xacThing.subtract(getTransformedGeometry(this._a.adaptation), getTransformedGeometry(strap), this._a.adaptation.material);
			scene.add(this._awc);
		}

		setTimeout(function(strap) {
			scene.remove(strap)
		}, 1000, strap);
	}
}