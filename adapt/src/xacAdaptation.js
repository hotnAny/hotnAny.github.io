"use strict";

var SIZEINIT = 1.25;
var FINGERINIT = 2;

class xacAdaptation {
	constructor(pc) {
		this._pc = pc;
		this._as = new Array(); // adaptation mesh
		// a factor that will dampen the growth of the adaptation
		// TODO: make this programmatic

		this._sizeFactor = SIZEINIT;
		this._fingerFactor = FINGERINIT;
	}

	update(params) {
		this._update(params);
	}
}

class xacEnlargement extends xacAdaptation {
	constructor(pc, params) {
		super(pc);

		// these parameters the optimize function will manipulate
		// TODO: rehink how to compute this parameter
		this.amnt = 5;

		this._pc = pc;
		this._update = function(params) {
			if (params != undefined) {
				this._sizeFactor = params.sizeFactor == undefined ? this._sizeFactor : params.sizeFactor;
				this._fingerFactor = params.fingerFactor == undefined ? this._fingerFactor : params.fingerFactor;
			}

			for (var pid in this._pc.parts) {
				if (this._as[pid] != undefined) {
					scene.remove(this._as[pid]);
				}

				if (this._pc.parts[pid] != undefined) {
					scene.remove(this._pc.parts[pid]);
				}

				var a = this._extrude(this._pc.parts[pid], this.amnt, this._sizeFactor, this._fingerFactor, undefined);
				this._as[pid] = a;
				scene.add(this._as[pid]);
			}
		}

		this._update();
	}

	_extrude(part, amnt, sizeFactor, fingerFactor, gripFactor) {
		// select a subset of aocÏÏ
		var r0 = 20; // temp: finger size
		var r = fingerFactor * r0;

		//	handling 'press' selection
		if (part.type == 'press') {
			var cylinderSel = new xacCylinder(r / 2, part.cylHeight, MATERIALCONTRAST);
			rotateObjTo(cylinderSel.m, part.normal);
			cylinderSel.m.position.copy(part.cylCenter);

			// select which bounding geometry to use
			var spaceSel = cylinderSel.m;
			scene.add(spaceSel);

			var aoc = xacThing.intersect(getTransformedGeometry(part), getTransformedGeometry(spaceSel), part.material);
			scene.add(aoc);

			var laoc = new THREE.Mesh(aoc.geometry.clone(), aoc.material.clone());
			scaleAlongVector(laoc, Math.pow(10, sizeFactor - 1), part.normal);
			scaleAroundVector(laoc, sizeFactor, part.normal);
			laoc = xacThing.intersect(getTransformedGeometry(laoc), getTransformedGeometry(part.selCyl), part.material);
			// scene.add(part.selCyl)
		}
		//	handling 'wrap' selection
		else if (part.type == 'wrap') {
			// TODO: check if need to get transformed geometry
			// var ctrPart = getCenter(part.geometry.vertices);
			var ctrPart = part.ctrSel;
			if (D == true) addABall(ctrPart);

			// bounding cylinder
			var cylinderSel = new xacCylinder(100, r, MATERIALCONTRAST);
			rotateObjTo(cylinderSel.m, part.normal);
			cylinderSel.m.position.copy(ctrPart);

			// select which bounding geometry to use
			var spaceSel = cylinderSel.m;
			scene.add(spaceSel);

			var aoc = xacThing.intersect(getTransformedGeometry(part), getTransformedGeometry(spaceSel), part.material);
			scene.add(aoc);

			var laoc = aoc.clone();
			scaleAroundVector(laoc, sizeFactor, part.normal);

			if (D == true) addALine(ctrPart, ctrPart.clone().add(part.normal.clone().multiplyScalar(100)));

		}

		scene.remove(aoc);
		scene.remove(spaceSel);
		return laoc;
	}
}