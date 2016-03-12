// function update(mesh) {
// 	mesh.updateMatrixWorld();
// 	mesh.geometry.applyMatrix(mesh.matrixWorld);
// 	mesh.matrix.identity();
// }

// if(intersects.length > 0) {
			// 	console.log(intersects[0].point);
			// 	selSphere.update(intersects[0].point, 2);
			// 	selSphere.show();
			// } else {
			// 	selSphere.hide();
			// }
// var _expandAccordion = function() {

// 	$('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
// 		'aria-selected': 'true',
// 		'tabindex': '0'
// 	});
// 	$('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
// 	$('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
// 		'aria-expanded': 'true',
// 		'aria-hidden': 'false'
// 	}).show();
// }

// var _closeAccordion = function() {
// 	$('.ui-accordion-header').removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-corner-all').attr({
// 		'aria-selected': 'false',
// 		'tabindex': '-1'
// 	});
// 	$('.ui-accordion-header-icon').removeClass(icons.headerSelected).addClass(icons.header);
// 	$('.ui-accordion-content').removeClass('ui-accordion-content-active').attr({
// 		'aria-expanded': 'false',
// 		'aria-hidden': 'true'
// 	}).hide();
// 	$(this).attr("disabled", "disabled");
// 	$('.open').removeAttr("disabled");


// var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');

			// // NOTE: this has a bug of halding all tags with highlight status, which happens to be fine
			// $('.ui-state-highlight').removeClass('ui-state-highlight');
			// if (wasHighlighted == false) {
			// 	$(ui.tag).addClass('ui-state-highlight')
			// }

	// var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');
					// $('.ui-state-highlight').removeClass('ui-state-highlight');
					// if (wasHighlighted == false) {
					// 	$(ui.tag).addClass('ui-state-highlight')
					// }

// this._part.position = ctrWrap.clone();
			// addABall(this._part.position);
			// this._part.geometry.scale(factorEatIn, factorEatIn, factorEatIn);					

// this.wrapIn.scale.set(factorEatIn, factorEatIn, factorEatIn);
			// this.wrapIn.position = ctrWrap.clone();

			

			// this.wrapOut = xacThing.subtract(gtCylWrap, this.wrapIn.geometry, MATERIALCONTRAST);
			// scene.add(this.wrapOut);
			// scene.remove(obj);

			// // let it eat in the object an epsilon to get the minimal intersection
			// var vEatIn = pt.clone().sub(cylPartSelection.m.position);
			// var dEatIn = 0.01;
			// cylPartSelectionOut.translateOnAxis(vEatIn.clone().normalize(), dEatIn);
			// var factorEatIn = 1.5;
			// var gObj = obj.clone();
			// gObj.scale.set(factorEatIn, factorEatIn, factorEatIn);
			// this._part = xacThing.intersect(getTransformedGeometry(gObj), getTransformedGeometry(this.wrapOut), MATERIALCONTRAST);

// addABall(ctrWrap, 0xffffff, 2);
			// addALine(ctrWrap, ctrWrap.clone().add(new THREE.Vector3(a, b, c).multiplyScalar(100)));
			

			// scene.add(this.cylWrap.m);

				// // get the geometric representation of the shadow
			// this._part = xacThing.intersect(obj, getTransformedGeometry(cylPartSelectionOut), MATERIALHIGHLIGHT);
			// // eat out a little for better display
			// this._part.translateOnAxis(vEatIn.clone().normalize().multiplyScalar(-1), 2 * dEatIn);
			// scene.add(this._part);

			
	scaleMap(a, factor) {
		return a * factor + 1;
	}

	optimize(params) {
		if (params.grip == true) {

		}

		if (params.strength == true) {

		}

		if (parames.coordination == true) {

		}

		this._sizeFactor = params.sizeFactor;

		this._extrude
	}

// scene.add(part.selCyl);
			// scene.add(part.selCyl);

			// var geoWall = new THREE.Geometry();
			// var geoAoc = getTransformedGeometry(aoc);
			// var geoLaoc = getTransformedGeometry(laoc);
			// // var geoLaoc = laoc.geometry;
			// for (var i = geoAoc.faces.length - 1; i >= 0; i--) {
			// 	var f = geoAoc.faces[i];
			// 	var lf = geoLaoc.faces[i];

			// 	var vs = [f.a, f.b, f.c];
			// 	for (var j = 0; j < 3; j++) {
			// 		var n = vs[j];
			// 		var np = vs[(j + 1) % vs.length];

			// 		var m = geoWall.vertices.length;
			// 		geoWall.vertices.push(
			// 			geoAoc.vertices[n].clone(),
			// 			geoAoc.vertices[np].clone(),

			// 			geoLaoc.vertices[n].clone(),
			// 			geoLaoc.vertices[np].clone()
			// 		);

			// 		var wf1 = new THREE.Face3(m, m + 3, m + 2);
			// 		wf1.normal = computeFaceNormal(geoWall.vertices[wf1.a], geoWall.vertices[wf1.b], geoWall.vertices[wf1.c]);
			// 		geoWall.faces.push(wf1);

			// 		var wf2 = new THREE.Face3(m, m + 1, m + 3);
			// 		wf2.normal = computeFaceNormal(geoWall.vertices[wf2.a], geoWall.vertices[wf2.b], geoWall.vertices[wf2.c]);
			// 		geoWall.faces.push(wf2);
			// 	}
			// }

			// if (this._wall != undefined) scene.remove(this._wall);
			// var wall = new THREE.Mesh(geoWall, MATERIALHIGHLIGHT.clone());
			// var a = mergeObjs([aoc, wall, laoc]);


// scene.remove(cylPartSelection.m);

		// remove original objects for better visibility
		// scene.remove(obj);

		//
		//	4. removing excessive faces
		//
		// var clrTrans = new THREE.Color("#ff0000");
		// var facesToRemove = [];
		// for (var i = this._part.geometry.faces.length - 1; i >= 0; i--) {
		// 	var f = this._part.geometry.faces[i];
		// 	var bendAngle = size == this.FINGER ? Math.PI / 4 : Math.PI / 2;
		// 	if (f.normal.angleTo(nml) > bendAngle) {
		// 		facesToRemove.push(f);
		// 	}
		// }

		// for (var i = facesToRemove.length - 1; i >= 0; i--) {
		// 	removeFromArray(this._part.geometry.faces, facesToRemove[i]);
		// }


// optimizeGrip(a, ctrl, gripFactor) {

	// 	//
	// 	//	preprocessing
	// 	//
	// 	if (!a.preprocessed) {
	// 		tessellate(a, 5);

	// 		a.geometry.computeFaceNormals();
	// 		a.geometry.computeVertexNormals();
	// 		a.vnormals = [a.geometry.vertices.length];
	// 		for (var i = a.geometry.faces.length - 1; i >= 0; i--) {
	// 			var f = a.geometry.faces[i];
	// 			a.vnormals[f.a] = f.vertexNormals[0];
	// 			a.vnormals[f.b] = f.vertexNormals[1];
	// 			a.vnormals[f.c] = f.vertexNormals[2];
	// 		}

	// 		computeFaceArea(a);
	// 		markVertexNeighbors(a);

	// 		a.preprocessed = true;
	// 	}

	// 	return;

	// 	//
	// 	// init
	// 	//
	// 	var spacing = 50 * (1 - gripFactor);
	// 	var sphereSet = undefined;
	// 	var ag = getTransformedGeometry(a);

	// 	//
	// 	ctrl.gravity = new THREE.Vector3(0, -1, 0);
	// 	//

	// 	a.updateMatrixWorld();
	// 	for (var i = ag.vertices.length - 1; i >= 0; i--) {
	// 		var v = ag.vertices[i];

	// 		v.activated = undefined;
	// 	}

	// 	//
	// 	//	making dents/grooves
	// 	//
	// 	for (var i = ag.vertices.length - 1; i >= 0; i--) {
	// 		var v = ag.vertices[i];
	// 		v.normal = getTransformedVector(a.vnormals[i], a);

	// 		if (v.activated != false) {
	// 			var toOpt = false;
	// 			var eps = Math.PI / 8;
	// 			// log(v.normal.angleTo(ctrl.gravity))
	// 			if (toOpt == false && ctrl.gravity != undefined && Math.abs(v.normal.angleTo(ctrl.gravity) - Math.PI / 2) < eps) {
	// 				toOpt = true;
	// 			}

	// 			if (toOpt == false && ctrl.force != undefined && Math.abs(v.normal.angleTo(ctrl.force)) < eps) {
	// 				toOpt = true;
	// 			}

	// 			if (toOpt) {
	// 				// add to the sphere set
	// 				var sphere = new xacSphere(5);
	// 				addABall(v);
	// 				sphere.m.position.copy(v.clone());
	// 				if (sphereSet == undefined) {
	// 					sphereSet = sphere.m;
	// 				} else {
	// 					// sphereSet = xacThing.union(getTransformedGeometry(sphereSet), getTransformedGeometry(sphere.m));
	// 				}

	// 				// mark its neighbors within spacing as not activated
	// 				// log((ag.vertices.length - i) + "/" + ag.vertices.length);
	// 				this.nudgeNeighbors(a, ag, i, v, spacing);
	// 			} else {
	// 				addABall(v, 0xaaaaaa)
	// 			}
	// 		} else {
	// 			// log("skipped " + i);
	// 			// addABall(v, 0xaaaaaa)
	// 		}
	// 	}

	// 	// wrap up
	// 	a = xacThing.subtract(ag, getTransformedGeometry(sphereSet));

	// }

	// nudgeNeighbors(a, ag, idx, ctr, d) {
	// 	var v = ag.vertices[idx];
	// 	if (v.activated != undefined || v.distanceTo(ctr) > d) {
	// 		log(idx + " out!")
	// 		return false;
	// 	}

	// 	v.activated = false;
	// 	var vneighbors = a.vneighbors[idx];
	// 	log(vneighbors);
	// 	for (var i = vneighbors.length - 1; i >= 0; i--) {
	// 		var nidx = vneighbors[i];
	// 		this.nudgeNeighbors(a, ag, nidx, ctr, d);
	// 	}
	// }

// gtCylWrapDisplay = getTransformedGeometry(wrapDisplay.m);
			// wrapInDisplay = xacThing.subtract(gtCylWrapDisplay, obj, MATERIALHIGHLIGHT);

			// flash a cylinder to show selection volume
			// scene.add(this.cylWrap.m);
			// setTimeout(function(m) {
			// 	scene.remove(m);
			// }, 1000, this.cylWrap.m);

			// scene.add(this._part);
			

			//
			//	4. remove unused faces
			//
			// var facesToRemove = [];
			// var graspAngle = Math.PI * 0.45;
			// this._part.material.needsUpdate = true;
			// for (var i = this._part.geometry.faces.length - 1; i >= 0; i--) {
			// 	var f = this._part.geometry.faces[i];
			// 	if (Math.abs(Math.PI / 2 - f.normal.angleTo(nmlWrap)) > graspAngle) {
			// 		facesToRemove.push(f);
			// 	}
			// }
			// this._part.geometry.colorsNeedUpdate = true;

			// for (var i = facesToRemove.length - 1; i >= 0; i--) {
			// 	removeFromArray(this._part.geometry.faces, facesToRemove[i]);
			// }
/*
		wrapping an object by drawing a stroke on it
	*/
	// wrap(obj, pt, done) {
	// 	if (done) {
	// 		//
	// 		//	1. find points surrounding the cross section
	// 		//
	// 		var ptsWrap = []; // points sampled to rep the wrap
	// 		var maxDistAbove = 0; // max signed distances to the cross section
	// 		var maxDistBelow = 0;

	// 		// bounding box of the stroke
	// 		var min = new THREE.Vector3(INFINITY, INFINITY, INFINITY);
	// 		var max = new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY);

	// 		for (var i = 0; i < this._strokePoints.length; i++) {
	// 			var p = this._strokePoints[i];

	// 			min.x = Math.min(min.x, p.x);
	// 			min.y = Math.min(min.y, p.y);
	// 			min.z = Math.min(min.z, p.z);

	// 			max.x = Math.max(max.x, p.x);
	// 			max.y = Math.max(max.y, p.y);
	// 			max.z = Math.max(max.z, p.z);
	// 		}

	// 		var scale = min.distanceTo(max);
	// 		var ctr = new THREE.Vector3().addVectors(min, max).divideScalar(2);

	// 		// calculate intersection plane
	// 		var planeParams = findPlaneToFitPoints(this._strokePoints);
	// 		var a = planeParams.A;
	// 		var b = planeParams.B;
	// 		var c = planeParams.C;
	// 		var d = planeParams.D;

	// 		// find intersecting triangles
	// 		// ref: http://mathworld.wolfram.com/Point-PlaneDistance.html
	// 		var obj = this._obj;
	// 		for (var i = 0; i < obj.geometry.faces.length; i++) {
	// 			var f = obj.geometry.faces[i];

	// 			var indices = [f.a, f.b, f.c];
	// 			var vertices = [];
	// 			var faceInRange = true;
	// 			for (var j = 0; j < indices.length; j++) {
	// 				var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
	// 				vertices.push(v);
	// 				var dist = (a * v.x + b * v.y + c * v.z + d) / Math.sqrt(a * a + b * b + c * c);

	// 				/*
	// 					for faces to be included they need to be
	// 						1) close to the cutting plane
	// 						2) close to the firstly selected points
	// 				*/

	// 				if (Math.abs(dist) < HANDSIZE && v.distanceTo(ctr) < 2 * scale) {
	// 					ptsWrap.push(v);
	// 					maxDistAbove = Math.max(maxDistAbove, dist);
	// 					maxDistBelow = Math.min(maxDistBelow, dist);
	// 				}
	// 			}
	// 		}

	// 		//
	// 		//	2. find a wrapping cylinder
	// 		//
	// 		var ctrWrap = getCenter(ptsWrap);

	// 		var nmlWrap = new THREE.Vector3(a, b, c);
	// 		nmlWrap.normalize();

	// 		var rWrap = 0;
	// 		var ctrWrapProj = getProjection(ctrWrap, a, b, c, d);
	// 		for (var i = ptsWrap.length - 1; i >= 0; i--) {
	// 			var ptProj = getProjection(ptsWrap[i], a, b, c, d);
	// 			rWrap = Math.max(rWrap, ptProj.distanceTo(ctrWrapProj));
	// 		}
	// 		rWrap *= 1.1;

	// 		this.cylWrap = new xacCylinder(rWrap, HANDSIZE, MATERIALCONTRAST);
	// 		var wrapDisplay = new xacCylinder(rWrap, FINGERSIZE * 2, MATERIALCONTRAST);
	// 		rotateObjTo(this.cylWrap.m, nmlWrap);
	// 		rotateObjTo(wrapDisplay.m, nmlWrap);
	// 		this.cylWrap.m.position.copy(ctrWrap.clone());

	// 		// var ctrStroke = getCenter(this._strokePoints);
	// 		// ctrStroke = getProjection(ctrStroke, a, b, c, d);
	// 		wrapDisplay.m.position.copy(ctrWrapProj.clone());

	// 		//
	// 		//	3. make wraps
	// 		//
	// 		var gtCylWrap = getTransformedGeometry(this.cylWrap.m);
	// 		this.wrapIn = xacThing.intersect(gtCylWrap, obj, this._part == undefined ? MATERIALCONTRAST : this._part.material);

	// 		var gtCylWrapDisplay = getTransformedGeometry(wrapDisplay.m);
	// 		var wrapInDisplay = xacThing.intersect(gtCylWrapDisplay, obj, MATERIALHIGHLIGHT);
	// 		scene.add(wrapInDisplay);

	// 		if (this._part != undefined)
	// 			scene.remove(this._part);
	// 		this._part = this.wrapIn;

	// 		var factorInflate = 1.1;
	// 		scaleAroundCenter(this._part, factorInflate);
	// 		scaleAroundCenter(wrapInDisplay, factorInflate);

	// 		this._part.center = getCenter(this._part.geometry.vertices);
	// 		this._part.normal = nmlWrap;

	// 		// scene.remove(obj);

	// 		//
	// 		//	5. finishing up
	// 		//
	// 		this._part.type = 'wrap';
	// 		this._part.ctrSel = getProjection(ctrWrap, a, b, c, d);
	// 		this.isWrapping = false;

	// 	} else {
	// 		this._obj = obj;
	// 		addABall(pt, colorHighlight, 0.5);
	// 		this._strokePoints.push(pt);
	// 	}
	// }

	// function getAspectRatios(obj) {


// 	var ratios = [1 / (ly * lz), 1 / (lz * lx), 1 / (lx * ly)];
// 	// log(ratios)
// 	var minRatio = ratios[0];
// 	for (var i = ratios.length - 1; i > 0; i--) {
// 		minRatio = Math.min(minRatio, ratios[i]);
// 	}

// 	// TODO denominator zero check
// 	for (var i = ratios.length - 1; i >= 0; i--) {
// 		ratios[i] /= minRatio;
// 	}

// 	return ratios;
// }

	// var ny = Math.min(n * aspectRatios[1], 80);
		// for (var i = 0; i < ny; i++) {
		// 	for (var j = 0; j < n; j++) {
		// 		// for(var k=0; k<n; k++) {
		// 		var v = new THREE.Vector3();

		// 		var theta = Math.PI * 2 * i / n;
		// 		v.y = 0;//ctr.y + r * Math.cos(theta) * aspectRatios[1];

		// 		var phi = Math.PI * 2 * j / n;
		// 		v.x = ctr.x + r * Math.sin(theta) * Math.cos(phi) * aspectRatios[2];
		// 		v.z = ctr.z + r * Math.sin(theta) * Math.sin(phi) * aspectRatios[0];

		// 		addALine(ctr, v);
		// 		var rayCaster = new THREE.Raycaster();
		// 		rayCaster.ray.set(ctr, v.clone().sub(ctr).normalize());
		// 		var ints = rayCaster.intersectObjects([a]);

		// 		if (ints[0] != undefined) {
		// 			addABall(ints[0].point, 0xaaaaaa);
		// 		}

		// 	}
		// }


	// var cylinderSel = new xacCylinder([rLarge, rSmall], part.cylHeight, MATERIALCONTRAST);
			// rotateObjTo(cylinderSel.m, part.normal);
			// cylinderSel.m.position.copy(part.cylCenter);

			// scene.remove(gObjTemp);
			// scene.add(cylinderSel.m);
			// gObjTemp = cylinderSel.m;

			// var aoc = new THREE.Mesh(part.geometry.clone(), part.material.clone());
			// var laoc = scaleAroundVector(aoc, sizeFactor, part.normal);
			// scaleAlongVector(laoc, Math.pow(10, sizeFactor - 1), part.normal);

			// laoc = xacThing.intersect(getTransformedGeometry(laoc), getTransformedGeometry(cylinderSel.m), part.material);

			// var laoc = new THREE.Mesh(aoc.geometry.clone(), aoc.material.clone());
			
			
			// laoc = xacThing.intersect(getTransformedGeometry(laoc), getTransformedGeometry(part.selCyl), part.material);



var cylinderSel = new xacCylinder(r / 2, part.cylHeight, MATERIALCONTRAST);
			rotateObjTo(cylinderSel.m, part.normal);
			cylinderSel.m.position.copy(part.cylCenter);

			// select which bounding geometry to use
			var spaceSel = cylinderSel.m;
			var aoc = xacThing.intersect(getTransformedGeometry(part), getTransformedGeometry(spaceSel), part.material);

			var laoc = new THREE.Mesh(aoc.geometry.clone(), aoc.material.clone());
			scaleAlongVector(laoc, Math.pow(10, sizeFactor - 1), part.normal);
			scaleAroundVector(laoc, sizeFactor, part.normal);
			laoc = xacThing.intersect(getTransformedGeometry(laoc), getTransformedGeometry(part.selCyl), part.material);
		