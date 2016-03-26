"use strict";

/**
 * a simple set of attachment methods
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

class xacAttachment {
	constructor(a) {
		this._a = a; // the original adaptation 
		if (this._a.attachables == undefined) {
			this._a.attachables = [];
		}
		this._awc = undefined; // the adaptation with connector

		this._as = []; // an array for each adaptation
		for (var aid in this._a.adaptations) {
			this._as.push(this._a.adaptations[aid]);
		}

		this._everything = []; // everything including objects and adaptations
		this._everything = this._everything.concat(objects);
		this._everything = this._everything.concat(this._as);

		// this._attachables = [];
	}

	get awc() {
		return this._awc;
	}

	// merge() {
	// 	if(this._awc != undefined) {
	// 		for (var i = this._attachables.length - 1; i >= 0; i--) {
	// 			this._awc = xacThing.union(getTransformedGeometry(this._awc), getTransformedGeometry(this._attachables[i]), MATERIALHIGHLIGHT);
	// 		}
	// 	}
	// }
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

			var adaptation = gJustFocusedObjs[3];
			adaptation.awc = this._awc;
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
		this._splitee.awc = xacThing.subtract(getTransformedGeometry(this._splitee), getTransformedGeometry(cutPlane), this._splitee.material);
		scene.add(this._splitee.awc);
	}
}

/*
	create a pipe clamp around selected part
*/
class xacClamp extends xacAttachment {
	constructor(a) {
		super(a);

		this._TOSELECTPIPE = 0; // select the cross section for generating pipes
		this._TOMAKEPIPE = 1; // make the pipe
		this._TOMAKEBOLTHOLE = 2; // make the bolt holes
		this._step = this._TOSELECTPIPE;

		this._ve = [];

	}

	mousedown(e) {
		if (this._step == this._TOSELECTPIPE) {
			scene.remove(this._awc);
			scene.remove(this._pipe);

			var intersects = rayCast(e.clientX, e.clientY, e.shiftKey == true ? this._as : objects);
			var obj = intersects[0].object;
			var pt = intersects[0].point;
			var fnml = intersects[0].face.normal;
			if (obj != undefined && pt != undefined && fnml != undefined) {
				this._partSel = new PartSelector();
				this._partSel.grab(obj, pt, fnml, true);
			}
		} else if (this._step == this._TOMAKEPIPE) {
			this._pipe = this._partSel.release();
			scaleAroundVector(this._pipe, 1.5, this._partSel.part.normal);
			scene.add(this._pipe);
			this._awc = this._pipe;
		} else if (this._step == this._TOMAKEBOLTHOLE) {
			this._strokePoints = [];
			this._obj = undefined;
			this._pt1 = undefined;
			this._pt2 = undefined;
		}
	}

	mousemove(e) {
		if (this._step == this._TOMAKEPIPE) {
			this._partSel.rotateHand(e.ptMove, e.ptDown);
		} else if (this._step == this._TOMAKEBOLTHOLE) {
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
	}

	mouseup(e) {
		removeBalls();

		if (this._step == this._TOSELECTPIPE) {
			this._step = this._TOMAKEPIPE;
		} else if (this._step == this._TOMAKEPIPE) {
			this._step = this._TOMAKEBOLTHOLE;
		} else if (this._step == this._TOMAKEBOLTHOLE) {
			var midPt = new THREE.Vector3().addVectors(this._pt1, this._pt2).multiplyScalar(0.5);
			var meanNml = new THREE.Vector3().addVectors(this._pt1.normal, this._pt2.normal).normalize();
			var drawnLine = this._pt2.clone().sub(this._pt1);
			var drawnPlane = getPlaneFromPointVectors(midPt, meanNml, drawnLine);
			var nmlPlane = new THREE.Vector3(drawnPlane.A, drawnPlane.B, drawnPlane.C).normalize();

			scene.remove(this._pipe);

			//	1. cut the pipe 
			var depthCutPlane = 1000;
			var thickCutPlane = 3;
			var heightCutPlane = 1000;
			var cutPlane = new xacRectPrism(depthCutPlane, thickCutPlane, heightCutPlane, MATERIALCONTRAST).m;

			rotateObjTo(cutPlane, nmlPlane);
			var ctrCutPlane = midPt.clone().add(meanNml.clone().multiplyScalar(depthCutPlane * 0.5));
			cutPlane.position.copy(ctrCutPlane);

			this._pipe = xacThing.subtract(getTransformedGeometry(this._pipe), getTransformedGeometry(cutPlane), this._pipe.material);

			//
			//	2. make structure for bolting
			//
			// stub values
			var rPlank = 8;
			var hPlank = 3;
			var ctrPlank = midPt.clone().add(meanNml.clone().multiplyScalar(rPlank * 0.5));

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
			screwStub.position.copy(ctrPlank.clone().add(meanNml.clone().multiplyScalar(rPlank * 0.5)));
			this._plank = xacThing.subtract(getTransformedGeometry(this._plank), getTransformedGeometry(screwStub), MATERIALHIGHLIGHT);

			//
			//	finish up
			//
			scene.remove(this._awc);
			this._awc = xacThing.union(getTransformedGeometry(this._pipe), getTransformedGeometry(this._plank), MATERIALHIGHLIGHT);
			scene.add(this._awc);

			// TODO: change it to active adaptation
			var adaptation = gJustFocusedObjs[3];
			adaptation.awc = xacThing.union(getTransformedGeometry(adaptation), getTransformedGeometry(this._awc), MATERIALHIGHLIGHT);

			this._step = this._TOSELECTPIPE;
		}
	}
}

class xacBeam extends xacAttachment {
	constructor(a) {
		super(a);

		this._TOMAKEENDONE = 0;
		this._TOMAKEENDTWO = 1;
		this._step = this._TOMAKEENDONE;

		this._partSel = new PartSelector();
		this._rBeam = 5;
	}

	mousedown(e) {
		var intersects = rayCast(e.clientX, e.clientY, this._everything);

		if (intersects[0] == undefined) {
			return;
		}

		for (var i = objects.length - 1; i >= 0; i--) {
			if (objects[i] == intersects[0].object) {
				gPartSel.press(intersects[0].object, intersects[0].point, intersects[0].face.normal, true);
				scene.remove(gPartSel.part.display);
			}
		}

		// for (var i = this._as.length - 1; i >= 0; i--) {
		// 	if (this._as[i] == intersects[0].object) {
		// 		this._adaptation = objects[i];
		// 	}
		// }

		if (this._step == this._TOMAKEENDONE) {
			this._end1 = intersects[0].point;
			this._step = this._TOMAKEENDTWO;
		} else if (this._step == this._TOMAKEENDTWO) {
			this._end2 = intersects[0].point;

			// generate the beam
			var ctrBeam = this._end1.clone().add(this._end2).multiplyScalar(0.5);
			var nmlBeam = this._end2.clone().sub(this._end1).normalize();
			var lBeam = this._end1.distanceTo(this._end2) + 2 * this._rBeam;
			var beam = new xacCylinder(this._rBeam, lBeam, MATERIALHIGHLIGHT).m;
			beam.position.copy(ctrBeam);
			rotateObjTo(beam, nmlBeam);

			// add a pad to conform to the object
			var pad = gPartSel.part.display;
			scaleAlongVector(pad, 2, gPartSel.part.nmlPt);
			scaleAroundVector(pad, 1.5, gPartSel.part.nmlPt);

			beam = xacThing.union(getTransformedGeometry(beam), getTransformedGeometry(pad), MATERIALHIGHLIGHT);
			scene.add(beam);
			this._a.attachables.push(beam);

			this._step = this._TOMAKEENDONE;
		}
	}

	mousemove(e) {}

	mouseup(e) {}
}