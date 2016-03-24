"use strict";

/**
 * a simple set of attachment methods
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

class xacAttachment {
	constructor(a) {
		this._a = a; // the original adaptation 
		this._awc = undefined; // the adaptation with connector

		this._as = []; // an array for each adaptation
		for (var aid in this._a.adaptations) {
			this._as.push(this._a.adaptations[aid]);
		}

		this._everything = []; // everything including objects and adaptations
		this._everything = this._everything.concat(objects);
		this._everything = this._everything.concat(this._as);
	}

	get awc() {
		return this._awc;
	}
}

/*
	creating a 'tunnel' around part of an object for using zip ties or velcros
*/
class xacStrap extends xacAttachment {
	constructor(a) {
		super(a);

		this._strapWidth = 6;
		this._strapThickness = 3;
		this._inflateRatio = 1.1;
	}

	mousedown(e, obj, pt, fnml) {
		this._strokePoints = [];
	}

	mousemove(e, obj, pt, fnml) {
		this._obj = obj;
		this._strokePoints.push(pt);
		addABall(pt, colorStroke);
	}

	mouseup(e) {
		if (this._strokePoints.length > 3) {
			this._makeStrapFor(this._strokePoints, this._obj, this._a);
		}

		setTimeout(function() {
			removeBalls();
		}, 250);
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
		// TODO: 100 is a bug if the object has multiple disconnected components
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

/*
	let users split the object for assembling
*/
class xacSplit extends xacAttachment {
	constructor(a) {
		super(a);

	}

	mousedown(e) {
		this._strokePoints = [];
		this._splitee = undefined;
		this._pt1 = undefined;
		this._pt2 = undefined;
	}

	mousemove(e) {
		var intersects = rayCast(e.clientX, e.clientY, this._as);
		if (intersects[0] != undefined) {
			if (this._splitee == undefined) {
				this._splitee = intersects[0].object;
			}

			var pt = intersects[0].point;

			if (this._pt1 == undefined) {
				this._pt1 = pt;
				this._pt1.normal = intersects[0].face.normal;
			}
			this._pt2 = pt;
			this._pt2.normal = intersects[0].face.normal;

			this._strokePoints.push(pt);
			addABall(pt, colorStroke);
		}
	}

	mouseup(e) {
		removeBalls();
		//	1. find the split plane
		var midPt = new THREE.Vector3().addVectors(this._pt1, this._pt2).multiplyScalar(0.5);;
		var meanNml = new THREE.Vector3().addVectors(this._pt1.normal, this._pt2.normal).normalize();
		var splitLine = this._pt2.clone().sub(this._pt1);
		this._splitPlane = getPlaneFromPointVectors(midPt, meanNml, splitLine);

		//	2. perform the cutting
		var cutPlane = new xacRectPrism(1000, 2, 1000, MATERIALCONTRAST).m;
		var nmlPlane = new THREE.Vector3(this._splitPlane.A, this._splitPlane.B, this._splitPlane.C);
		rotateObjTo(cutPlane, nmlPlane);
		cutPlane.position.copy(getBoundingBoxCenter(this._splitee));

		//	3. update models
		scene.remove(this._splitee);
		this._splitee._awc = xacThing.subtract(getTransformedGeometry(this._splitee), getTransformedGeometry(cutPlane), this._splitee.material);
		scene.add(this._awc);
	}
}

/*
	create a pipe clamp around selected part
*/
class xacClamp extends xacAttachment {
	constructor(a) {
		super(a);

		this._TOMAKEPIPE = 0;
		this._TOMAKEBOLTHOLE = 1;
		this._step = this._TOMAKEPIPE;
	}

	mousedown(e) {
		this._strokePoints = [];
		this._obj = undefined;
		this._pt1 = undefined;
		this._pt2 = undefined;
	}

	mousemove(e) {
		var intersects = rayCast(e.clientX, e.clientY, e.shiftKey == true ? this._as : objects);
		if (intersects[0] != undefined) {
			var pt = intersects[0].point;

			if (this._obj == undefined) {
				if (e.shiftKey == true) {
					for (var i = this._as.length - 1; i >= 0; i--) {
						if (this._as[i] == intersects[0].object) {
							this._obj = this._as[i];
						}
					}
				} else {
					for (var i = objects.length - 1; i >= 0; i--) {
						if (objects[i] == intersects[0].object) {
							this._obj = objects[i];
						}
					}
				}
			}

			if (this._pt1 == undefined) {
				this._pt1 = pt;
				this._pt1.normal = intersects[0].face.normal;
			}
			this._pt2 = pt;
			this._pt2.normal = intersects[0].face.normal;

			this._strokePoints.push(pt);
			addABall(pt, colorStroke);
		}
	}

	mouseup(e) {
		removeBalls();

		var midPt = new THREE.Vector3().addVectors(this._pt1, this._pt2).multiplyScalar(0.5);
		var meanNml = new THREE.Vector3().addVectors(this._pt1.normal, this._pt2.normal).normalize();
		var drawnLine = this._pt2.clone().sub(this._pt1);
		var drawnPlane = getPlaneFromPointVectors(midPt, meanNml, drawnLine);
		var nmlPlane = new THREE.Vector3(drawnPlane.A, drawnPlane.B, drawnPlane.C).normalize();

		if (this._step == this._TOMAKEPIPE) {
			var partSel = new PartSelector();
			// partSel._doWrap(this._obj, midPt, drawnPlane);
			scene.remove(this._awc);
			scene.remove(this._pipe);
			this._pipe = partSel._doWrap(this._obj, midPt, drawnPlane); //new xacWrapper()._extrude(partSel.part, undefined, 1, 1.5);
			scaleAroundVector(this._pipe, 1.5, nmlPlane);
			scene.add(this._pipe);

			this._awc = this._pipe;
			this._step = this._TOMAKEBOLTHOLE;
		} else if (this._step == this._TOMAKEBOLTHOLE) {
			scene.remove(this._pipe);

			//	1. cut the pipe 
			var depthCutPlane = 1000;
			var thickCutPlane = 3;
			var heightCutPlane = 1000;
			var cutPlane = new xacRectPrism(depthCutPlane, thickCutPlane, heightCutPlane, MATERIALCONTRAST).m;

			rotateObjTo(cutPlane, nmlPlane);
			var ctrCutPlane = midPt.clone().add(meanNml.clone().multiplyScalar(depthCutPlane * 0.5));
			cutPlane.position.copy(ctrCutPlane);

			// 			scene.remove(this._cutPlane);
			// 			this._cutPlane = cutPlane;
			// 			scene.add(this._cutPlane);

			this._pipe = xacThing.subtract(getTransformedGeometry(this._pipe), getTransformedGeometry(cutPlane), this._pipe.material);

			//
			//	2. make structure for bolting
			//
			// stub values
			var rPlank = 8;
			var hPlank = 3;
			var ctrPlank = midPt.clone().add(meanNml.clone().multiplyScalar(rPlank * 0.25));

			var plank1 = new xacCylinder(rPlank, hPlank, MATERIALHIGHLIGHT).m;
			rotateObjTo(plank1, nmlPlane);
			plank1.position.copy(ctrPlank.clone().add(nmlPlane.clone().multiplyScalar(hPlank)));

			var plank2 = new xacCylinder(rPlank, hPlank, MATERIALHIGHLIGHT).m;
			rotateObjTo(plank2, nmlPlane);
			plank2.position.copy(ctrPlank.clone().sub(nmlPlane.clone().multiplyScalar(hPlank)));

			this._plank = xacThing.union(getTransformedGeometry(plank1), getTransformedGeometry(plank2));


			//
			//	3. drill bolt holes
			//
			var screwStub = new xacCylinder(RADIUSM3, hPlank * 4).m;
			rotateObjTo(screwStub, nmlPlane);
			screwStub.position.copy(ctrPlank.clone().add(meanNml.clone().multiplyScalar(rPlank * 0.25)));
			this._plank = xacThing.subtract(getTransformedGeometry(this._plank), getTransformedGeometry(screwStub), MATERIALHIGHLIGHT);

			//
			//	finish up
			//
			scene.remove(this._awc);
			this._awc = xacThing.union(getTransformedGeometry(this._pipe), getTransformedGeometry(this._plank), MATERIALHIGHLIGHT);
			scene.add(this._awc);

			// TODO: change it to active adaptation
			this._a.awc = xacThing.union(getTransformedGeometry(justFocusedObjs[3]), getTransformedGeometry(this._awc), MATERIALHIGHLIGHT);

			this._step = this._TOMAKEPIPE;
		}
	}
}