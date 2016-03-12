/**
 * 3d ui widgets for selecting or specifying objects
 * 	
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

"use strict";

class BboxUI {
	constructor(obj) {
		this._obj = obj;
		this._ctrObj = getBoundingBoxCenter(this._obj);
		this._bboxParmas = getBoundingBoxEverything(obj);
		this._update(this._bboxParmas)
	}

	_addPlane(lx, ly, lz, nml, cx, cy, cz) {
		var pl = new xacRectPrism(lx, ly, lz, MATERIALCONTRAST);
		rotateObjTo(pl.m, nml);
		pl.m.normal = nml;
		pl.m.position.copy(new THREE.Vector3(cx, cy, cz));
		scene.add(pl.m);
		pl.m.selector = this;
		return pl.m;
	}

	get box() {
		return this._box;
	}

	// update all the planes based on the object's bbox parameters
	_update(bb) {
		var boxNew = [];
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.lenz, new THREE.Vector3(0, 1, 0), bb.ctrx, bb.cmax.y, bb.ctrz));
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.lenz, new THREE.Vector3(0, -1, 0), bb.ctrx, bb.cmin.y, bb.ctrz));
		boxNew.push(this._addPlane(bb.leny, 0.1, bb.lenz, new THREE.Vector3(1, 0, 0), bb.cmax.x, bb.ctry, bb.ctrz));
		boxNew.push(this._addPlane(bb.leny, 0.1, bb.lenz, new THREE.Vector3(-1, 0, 0), bb.cmin.x, bb.ctry, bb.ctrz));
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.leny, new THREE.Vector3(0, 0, 1), bb.ctrx, bb.ctry, bb.cmax.z));
		boxNew.push(this._addPlane(bb.lenx, 0.1, bb.leny, new THREE.Vector3(0, 0, -1), bb.ctrx, bb.ctry, bb.cmin.z));

		if (this._box != undefined && this._box.length > 0) {
			for (var i = this._box.length - 1; i >= 0; i--) {
				if (this._box[i] != this._pl) {
					scene.remove(this._box[i]);
					// scene.remove(boxNew[i]);
					this._box[i] = boxNew[i];
				} else {
					scene.remove(boxNew[i]);
				}
			}
		} else {
			this._box = boxNew;
		}
	}

	clear() {
		for (var i = this._box.length - 1; i >= 0; i--) {
			scene.remove(this._box[i]);
		}
	}
}

class BboxResizer extends BboxUI {
	constructor(obj) {
		super(obj);
	}

	mousedown(e) {
		// select a plane, if there is any
		var ints = rayCast(e.clientX, e.clientY, this._box);
		if (ints.length > 0) {
			this._pl = ints[0].object; // the plane being moved
			this._point = ints[0].point; // last intersecting point
			this._normal = this._pl.normal; // the normal of this plane


			var dragPlane = new xacRectPrism(1000, 1000, 0.1, MATERIALINVISIBLE);
			rotateObjTo(dragPlane.m, this._normal);
			// log(this._normal)
			dragPlane.m.position.copy(this._point);
			scene.add(dragPlane.m);

			this._dragPlane = dragPlane.m;
			dragPlane.m.material.side = THREE.DoubleSide;
		}
	}

	mousemove(e) {
		// move the selected plane, if dragging, and update
		if (e.which != LEFTMOUSE || this._pl == undefined) {
			return;
		}

		var ints = rayCast(e.clientX, e.clientY, [this._dragPlane]);
		if (ints.length > 0) {
			var dirDrag = ints[0].point.clone().sub(this._point);

			// DEBUG
			// scene.remove(this._tmpVE);
			// removeBalls();
			// addABall(ints[0].point, 0x00ff00)
			// this._tmpVE = addAVector(this._point, dirDrag);

			var lenOff = dirDrag.dot(this._normal);
			var vecOff = this._normal.clone().multiplyScalar(lenOff);
			var sign = dirDrag.angleTo(this._normal) < Math.PI / 2 ? 1 : -1;
			var posNew = this._pl.position.clone().add(vecOff);

			// a plane cannot go across the centroid to the other side
			if (posNew.clone().sub(this._ctrObj).angleTo(this._normal) < Math.PI / 2) {
				this._pl.position.copy(posNew);

				this._bboxParmas.ctrx += vecOff.x / 2;
				this._bboxParmas.ctry += vecOff.y / 2;
				this._bboxParmas.ctrz += vecOff.z / 2;

				this._bboxParmas.lenx += sign * Math.abs(vecOff.x);
				this._bboxParmas.leny += sign * Math.abs(vecOff.y);
				this._bboxParmas.lenz += sign * Math.abs(vecOff.z);

				this._bboxParmas.cmin.x = this._bboxParmas.ctrx - this._bboxParmas.lenx * 0.5;
				this._bboxParmas.cmax.x = this._bboxParmas.ctrx + this._bboxParmas.lenx * 0.5;
				this._bboxParmas.cmin.y = this._bboxParmas.ctry - this._bboxParmas.leny * 0.5;
				this._bboxParmas.cmax.y = this._bboxParmas.ctry + this._bboxParmas.leny * 0.5;
				this._bboxParmas.cmin.z = this._bboxParmas.ctrz - this._bboxParmas.lenz * 0.5;
				this._bboxParmas.cmax.z = this._bboxParmas.ctrz + this._bboxParmas.lenz * 0.5;

				this._point.add(vecOff);

				// update the other planes
				this._update(this._bboxParmas);
			}
		}
	}

	mouseup(e) {
		this._pl = undefined;
		this._point = undefined;
		this._normal = undefined;

		// compute accessible boundaries
		this._obj.accessibleBoundaries = [];
		var bbOriginal = getBoundingBoxEverything(this._obj);
		log(bbOriginal)
		var bbNow = this._bboxParmas;
		log(bbNow)

		var eps = 0.1
		this._obj.accessibleBoundaries[0] = (bbNow.cmin.x > bbOriginal.cmin.x + eps) ? bbNow.cmin.x : undefined;
		this._obj.accessibleBoundaries[1] = (bbNow.cmax.x < bbOriginal.cmax.x - eps) ? bbNow.cmax.x : undefined;
		this._obj.accessibleBoundaries[2] = (bbNow.cmin.y > bbOriginal.cmin.y + eps) ? bbNow.cmin.y : undefined;
		this._obj.accessibleBoundaries[3] = (bbNow.cmax.y < bbOriginal.cmax.y - eps) ? bbNow.cmax.y : undefined;
		this._obj.accessibleBoundaries[4] = (bbNow.cmin.z > bbOriginal.cmin.z + eps) ? bbNow.cmin.z : undefined;
		this._obj.accessibleBoundaries[5] = (bbNow.cmax.z < bbOriginal.cmax.z - eps) ? bbNow.cmax.z : undefined;

		// log(this._accessibleBoundaries);
		log(this._obj)
	}



}

/*
	a visual selector for specifying which of the six faces on the bounding box
*/
class BboxSelector extends BboxUI {
	constructor(obj) {
		super(obj);
	}

	select(pl) {
		// for (var i = this._box.length - 1; i >= 0; i--) {
		// 	this._box[i].material.opacity = 0.25;
		// }
		// pl.material.opacity = 0.5;
	}
}

/*
	showing xy-yz-zx planes for selection
	specific to adapt, also let the user subsequently select a point on the selected plane
*/
class PlaneSelector {
	constructor(pt, nml) {
		addABall(pt);

		this._dim = 1000;
		this._planes = new THREE.Object3D();

		//
		// generate a plane based on pt (multiple points) and a vector nml from it
		//
		if (Array.isArray(pt)) {
			this._pt = pt;

			this._pl = new xacRectPrism(this._dim, 0.1, this._dim, MATERIALINVISIBLE);
			rotateObjTo(this._pl.m, nml);
			this._pl.m.normal = nml;

			this._planes.add(this._pl.m);
			this._planes.position.copy(getCenter(pt));
		}
		// generate xy, yz, zx plane surrounding pt
		else {
			this._pt = pt.clone(); // the point selected on the object

			this._pxy = new xacRectPrism(this._dim, this._dim, 0.1, MATERIALCONTRAST);
			this._pxy.m.normal = new THREE.Vector3(0, 0, 1);
			this._pyz = new xacRectPrism(0.1, this._dim, this._dim, MATERIALCONTRAST);
			this._pyz.m.normal = new THREE.Vector3(1, 0, 0);
			this._pzx = new xacRectPrism(this._dim, 0.1, this._dim, MATERIALCONTRAST);
			this._pzx.m.normal = new THREE.Vector3(0, 1, 0);

			this._planes.add(this._pxy.m);
			this._planes.add(this._pyz.m);
			this._planes.add(this._pzx.m);

			this._planes.position.copy(pt);
		}


		scene.add(this._planes);
	}

	//
	// for selecting fulcrum, specific to the adapt app
	//
	hitTest(e) {
		var intPlane = rayCast(e.clientX, e.clientY, this._planes.children);

		if (intPlane[0] != undefined) {
			if (this._point == undefined) {
				if (this._pxy != undefined && this._pyz != undefined && this._pzx != undefined) {
					this._planes.remove(this._pxy.m);
					this._planes.remove(this._pyz.m);
					this._planes.remove(this._pzx.m);
					this._planes.add(intPlane[0].object);
					scene.remove(this._planes);
				}

				this._point = new THREE.Object3D();

				var circle = new xacCylinder(25, 0.1, MATERIALCONTRAST).m;
				// circle.material.wireframe = true;
				rotateObjTo(circle, intPlane[0].object.normal, true);
				// rotateObjTo(circle, new THREE.Vector3(0, 0, 1), true);

				// this._point.add(circle);
				this._point.add(new xacSphere(1, MATERIALFOCUS, true).m);

				scene.add(this._point);
			}

			this._point.position.copy(intPlane[0].point);

			// if there are multiple points of control (e.g., clutching)
			if (Array.isArray(this._pt)) {
				if (this._leverLines == undefined) {
					this._leverLines = [];
				} else {
					for (var i = this._leverLines.length - 1; i >= 0; i--) {
						scene.remove(this._leverLines[i]);
					}
					this._leverLines = [];
				}

				for (var i = this._pt.length - 1; i >= 0; i--) {
					this._leverLines.push(addAVector(intPlane[0].point, this._pt[i].clone().sub(intPlane[0].point)));
				}

			}
			// for single point cases
			else {
				if (this._leverLine != undefined) {
					scene.remove(this._leverLine);
				}
				this._leverLine = addAVector(intPlane[0].point, this._pt.clone().sub(intPlane[0].point));
			}

			return true;
		}
		return false;
	}

	clear() {
		setTimeout(function(planes, point) {
			planes.children.length = 0;
			scene.remove(planes);
			scene.remove(point);
		}, 1000, this._planes, this._point);
	}

	get selection() {
		return this._point.position;
	}
}

/*
	a visualization that shows where the user selects on an object as control point/area
*/

class PartSelector {
	constructor() {
		this.FINGER = 10;

		this._obj = undefined;

		this.isEngaged = false;
		this.MINWRAPMOUSEOFFSET = 5;
		this.isWrapping = false;

		this._strokePoints = [];
	}

	get part() {
		return this._part;
	}

	get obj() {
		return this._obj;
	}

	clear() {
		this._part = undefined;
		this._strokePoints = [];
	}

	/*
		casting a finger or hand print on the object by single clicks
	*/
	press(obj, pt, nml, isSmall) {
		this.clear();
		this._obj = obj;

		//
		//	1. sample a set of 'finger points'
		//
		nml = nml.normalize();
		var nmlOpp = nml.clone().multiplyScalar(-1);

		var rPartSelection = isSmall == true ? FINGERSIZE : HANDSIZE;

		// before: hardcoded, usually too mcuh
		var distAbove = HANDSIZE * 2; // hyperthetical dist between finger(s) and the ctrl point
		// now: use the bbox to estimate
		var distAbove = getDimAlong(obj, nml) / 2;


		var yUp = new THREE.Vector3(0, 1, 0);
		var angleToRotate = yUp.angleTo(nml);
		var axisToRotate = new THREE.Vector3().crossVectors(yUp, nml).normalize();

		// find the max distance to press
		var ctrlPts = [];
		var tess = 32;
		var rayCaster = new THREE.Raycaster();
		var maxDist2PartSelection = distAbove;
		for (var i = 0; i < tess; i++) {
			var x = rPartSelection * Math.sin(i * 2 * Math.PI / tess);
			var z = rPartSelection * Math.cos(i * 2 * Math.PI / tess);
			var p = new THREE.Vector3(x, distAbove, z);
			p.applyAxisAngle(axisToRotate, angleToRotate);
			p.add(pt);

			rayCaster.ray.set(p, nmlOpp);
			var ints = rayCaster.intersectObjects([obj]);

			if (ints[0] != undefined) {
				maxDist2PartSelection = Math.max(ints[0].distance, maxDist2PartSelection);
			}
		}

		maxDist2PartSelection += 1;

		//
		//	2. create a normal-orthogonal cylinder
		//
		var cylPartSelection = new xacCylinder(rPartSelection, maxDist2PartSelection + 1);

		var midPt = pt.clone().add(nml.clone().multiplyScalar(distAbove - maxDist2PartSelection * 0.5));

		var vOffset = midPt.clone().sub(cylPartSelection.m.position.clone());
		cylPartSelection.m.translateOnAxis(vOffset.clone().normalize(), vOffset.length());
		cylPartSelection.m.rotateOnAxis(axisToRotate, angleToRotate);
		// scene.add(cylPartSelection.m);

		//
		//	3. intersect it with the object to obtain ctrl area
		//
		var vEatIn = pt.clone().sub(midPt).normalize();
		var dEatIn = 5;
		var cylEatIn = cylPartSelection.m.clone();
		cylEatIn.position.copy(cylEatIn.position.clone().add(vEatIn.multiplyScalar(dEatIn)));
		var cylPartSelectionIn = xacThing.intersect(getTransformedGeometry(cylEatIn), obj, MATERIALOVERLAY);

		var cylPartSelectionOut = xacThing.subtract(cylPartSelection.gt, cylPartSelectionIn.geometry, MATERIALOVERLAY);
		// scene.add(cylPartSelectionOut);

		// get the geometric representation of the press
		this._part = cylPartSelectionIn;

		// eat out a little for better display
		this._part.translateOnAxis(vEatIn.clone().normalize().multiplyScalar(-1), 1);


		//
		//	4. finish up
		//
		this._part.type = 'press';
		this._part.normal = nml;
		this._part.center = pt;
		this._part.cylCenter = cylPartSelection.m.position;
		this._part.cylHeight = maxDist2PartSelection;
		this._part.selCyl = cylPartSelectionOut; //xacThing.intersect(cylPartSelection.gt, obj, MATERIALCONTRAST);

		this._part.display = this._part.clone();
		scene.add(this._part.display);
	}

	_doWrap(obj, pt, planeParams) {
		//
		//	1. compute points of interest/in range
		//
		var a = planeParams.A;
		var b = planeParams.B;
		var c = planeParams.C;
		var d = planeParams.D;

		// DEBUG: show the cutting plane
		// var v1 = new THREE.Vector3(-d/a, 0, 0);
		// var v2 = new THREE.Vector3(0, -b/d, 0);
		// var v3 = new THREE.Vector3(0, 0, -c/d);
		// addATriangle(v1, v2, v3, 0x0ff00f);

		var nmlWrap = new THREE.Vector3(a, b, c);

		var ptsWrap = []; // points sampled to rep the wrap
		var maxDistAbove = 0; // max signed distances to the cross section
		var maxDistBelow = 0;

		var obj = this._obj;
		var gtObj = getTransformedGeometry(obj);
		for (var i = 0; i < gtObj.faces.length; i++) {
			var f = gtObj.faces[i];

			var indices = [f.a, f.b, f.c];
			var faceInRange = true;
			for (var j = 0; j < indices.length; j++) {
				// var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
				var v = gtObj.vertices[indices[j]];
				var dist = (a * v.x + b * v.y + c * v.z + d) / Math.sqrt(a * a + b * b + c * c);
				if (Math.abs(dist) < HANDSIZE / 2) {
					ptsWrap.push(v);
					// addABall(v, 0xffffff)
					maxDistAbove = Math.max(maxDistAbove, dist);
					maxDistBelow = Math.min(maxDistBelow, dist);
				}
			}
		}

		//
		//	2. find a wrapping cylinder
		//
		var ctrObjInHold = getCenter(ptsWrap);
		// addABall(ctrObjInHold, 0x0000ff);
		var ctrWrap = getProjection(ctrObjInHold, a, b, c, d);
		// addABall(ctrWrap, 0x00ff00)

		nmlWrap.normalize();

		var rWrap = 0;
		var ctrWrapProj = getProjection(ctrWrap, a, b, c, d);
		for (var i = ptsWrap.length - 1; i >= 0; i--) {
			var ptProj = getProjection(ptsWrap[i], a, b, c, d);
			rWrap = Math.max(rWrap, ptProj.distanceTo(ctrWrapProj));
		}
		rWrap *= 1.1;

		this.cylWrap = new xacCylinder(rWrap, HANDSIZE, MATERIALCONTRAST);
		var wrapDisplay = new xacCylinder(rWrap, FINGERSIZE * 2, MATERIALCONTRAST);
		rotateObjTo(this.cylWrap.m, nmlWrap);
		rotateObjTo(wrapDisplay.m, nmlWrap);
		this.cylWrap.m.position.copy(ctrWrap.clone());

		// var ctrStroke = getCenter(this._strokePoints);
		// ctrStroke = getProjection(ctrStroke, a, b, c, d);
		wrapDisplay.m.position.copy(ctrWrapProj.clone());
		// scene.add(wrapDisplay.m);

		//
		//	3. make wraps
		//
		var gtCylWrap = getTransformedGeometry(this.cylWrap.m);
		this.wrapIn = xacThing.intersect(gtCylWrap, obj, this._part == undefined ? MATERIALCONTRAST : this._part.material);

		var gtCylWrapDisplay = getTransformedGeometry(wrapDisplay.m);
		var wrapInDisplay = xacThing.intersect(gtCylWrapDisplay, obj, MATERIALOVERLAY);
		scene.add(wrapInDisplay);

		if (this._part != undefined)
			scene.remove(this._part);
		this._part = this.wrapIn;

		var factorInflate = 1.5;
		scaleAroundCenter(this._part, factorInflate);
		scaleAroundCenter(wrapInDisplay, 1.1);

		this._part.center = getCenter(this._part.geometry.vertices);
		this._part.normal = nmlWrap;

		// scene.remove(obj);

		//
		//	5. finishing up
		//
		this._part.type = 'wrap';
		this._part.ctrSel = getProjection(ctrWrap, a, b, c, d);
		this._part.display = wrapInDisplay;

		this.isWrapping = false;

		return wrapInDisplay;
	}

	grab(obj, pt, fnml, done) {
		loadStlFromFile(HANDMODELPATH, MATERIALCONTRAST);

		setTimeout(function(hand) {
			gHand = new THREE.Object3D();

			gHand.add(objectDelay.clone());

			var ctr = getBoundingBoxCenter(objectDelay);

			// thumb pointer
			var dirThumb = new THREE.Vector3(1, 0, 0);
			var arrowThumb = xacThing.line(ctr, dirThumb, MATERIALINVISIBLE);
			gHand.add(arrowThumb);
			gHand.arrowThumb = arrowThumb;

			// fingers pointer
			var dirFingers = new THREE.Vector3(0, 0, 1);
			var arrowFingers = xacThing.line(ctr, dirFingers);
			gHand.add(arrowFingers);

			rotateObjTo(gHand, fnml);
			gHand.fnml = fnml;

			gHand.axis = new THREE.Vector3(0, -1, 0);

			gHand.position.copy(pt);
			scene.add(gHand);

		}, 250);
		gSticky = true;
		log("xac3dui")
		this._obj = obj;
		this._pt = pt;
	}

	release() {
		gSticky = false;

		var p0 = gHand.position;
		var p1 = p0.clone().add(gHand.fnml.clone().multiplyScalar(100));
		// addALine(p0, p1, 0xff00ff);

		var gtFingers = getTransformedGeometry(gHand.arrowThumb); //new THREE.Vector3(1, 0, 0);
		var dirThumb = gtFingers.vertices[1].clone().sub(gtFingers.vertices[0]);
		// dirThumb = getTransformedVector(dirThumb, gHand.arrowThumb);
		var p2 = p0.clone().add(dirThumb.clone().multiplyScalar(100));

		var params = getPlaneFromPointVectors(p0, gHand.fnml.clone().normalize(), dirThumb.clone().normalize());

		var wrapDisplayed = this._doWrap(this._obj, this._pt, params);

		setTimeout(function() {
			scene.remove(gHand);
		}, 1000);

		return wrapDisplayed;
	}

	rotateHand(ptMove, ptDown) {
		if (gHand == undefined) {
			return;
		}

		var vMove = new THREE.Vector3(ptMove[0] - ptDown[0], 0, ptMove[1] - ptDown[1]);
		var axisFixed = new THREE.Vector3(0, 0, -1);
		var angle = vMove.angleTo(axisFixed) * Math.sign(vMove.x);
		// log(angle)
		if (this._anglePrev != undefined) {
			// log(angle - this._anglePrev);
			gHand.rotateOnAxis(gHand.axis, angle - this._anglePrev);
		}
		this._anglePrev = angle;
	}

	finishUp() {
		if (this._part != undefined) {
			var parts = gPartsCtrls[gCurrPartCtrl.attr('pcId')].parts;
			gPartsCtrls[gCurrPartCtrl.attr('pcId')].obj = this._obj;
			gPartSerial += 1;
			var tagName = 'Part ' + gPartSerial; //(Object.keys(parts).length + 1);
			var lsParts = $(gCurrPartCtrl.children()[0]); //.attr('lsParts');
			var tag = lsParts.tagit('createTag', tagName);
			parts[tagName] = this._part;
			triggerUI2ObjAction(tag, FOCUSACTION);
		}
	}
}