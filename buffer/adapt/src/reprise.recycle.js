// // function update(mesh) {
// // 	mesh.updateMatrixWorld();
// // 	mesh.geometry.applyMatrix(mesh.matrixWorld);
// // 	mesh.matrix.identity();
// // }

// // if(intersects.length > 0) {
// 			// 	console.log(intersects[0].point);
// 			// 	selSphere.update(intersects[0].point, 2);
// 			// 	selSphere.show();
// 			// } else {
// 			// 	selSphere.hide();
// 			// }
// // var _expandAccordion = function() {

// // 	$('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
// // 		'aria-selected': 'true',
// // 		'tabindex': '0'
// // 	});
// // 	$('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
// // 	$('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
// // 		'aria-expanded': 'true',
// // 		'aria-hidden': 'false'
// // 	}).show();
// // }

// // var _closeAccordion = function() {
// // 	$('.ui-accordion-header').removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-corner-all').attr({
// // 		'aria-selected': 'false',
// // 		'tabindex': '-1'
// // 	});
// // 	$('.ui-accordion-header-icon').removeClass(icons.headerSelected).addClass(icons.header);
// // 	$('.ui-accordion-content').removeClass('ui-accordion-content-active').attr({
// // 		'aria-expanded': 'false',
// // 		'aria-hidden': 'true'
// // 	}).hide();
// // 	$(this).attr("disabled", "disabled");
// // 	$('.open').removeAttr("disabled");


// // var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');

// 			// // NOTE: this has a bug of halding all tags with highlight status, which happens to be fine
// 			// $('.ui-state-highlight').removeClass('ui-state-highlight');
// 			// if (wasHighlighted == false) {
// 			// 	$(ui.tag).addClass('ui-state-highlight')
// 			// }

// 	// var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');
// 					// $('.ui-state-highlight').removeClass('ui-state-highlight');
// 					// if (wasHighlighted == false) {
// 					// 	$(ui.tag).addClass('ui-state-highlight')
// 					// }

// // this._part.position = ctrWrap.clone();
// 			// addABall(this._part.position);
// 			// this._part.geometry.scale(factorEatIn, factorEatIn, factorEatIn);					

// // this.wrapIn.scale.set(factorEatIn, factorEatIn, factorEatIn);
// 			// this.wrapIn.position = ctrWrap.clone();

			

// 			// this.wrapOut = xacThing.subtract(gtCylWrap, this.wrapIn.geometry, MATERIALCONTRAST);
// 			// scene.add(this.wrapOut);
// 			// scene.remove(obj);

// 			// // let it eat in the object an epsilon to get the minimal intersection
// 			// var vEatIn = pt.clone().sub(cylPartSelection.m.position);
// 			// var dEatIn = 0.01;
// 			// cylPartSelectionOut.translateOnAxis(vEatIn.clone().normalize(), dEatIn);
// 			// var factorEatIn = 1.5;
// 			// var gObj = obj.clone();
// 			// gObj.scale.set(factorEatIn, factorEatIn, factorEatIn);
// 			// this._part = xacThing.intersect(gettg(gObj), gettg(this.wrapOut), MATERIALCONTRAST);

// // addABall(ctrWrap, 0xffffff, 2);
// 			// addALine(ctrWrap, ctrWrap.clone().add(new THREE.Vector3(a, b, c).multiplyScalar(100)));
			

// 			// scene.add(this.cylWrap.m);

// 				// // get the geometric representation of the shadow
// 			// this._part = xacThing.intersect(obj, gettg(cylPartSelectionOut), MATERIALHIGHLIGHT);
// 			// // eat out a little for better display
// 			// this._part.translateOnAxis(vEatIn.clone().normalize().multiplyScalar(-1), 2 * dEatIn);
// 			// scene.add(this._part);

			
// 	scaleMap(a, factor) {
// 		return a * factor + 1;
// 	}

// 	optimize(params) {
// 		if (params.grip == true) {

// 		}

// 		if (params.strength == true) {

// 		}

// 		if (parames.coordination == true) {

// 		}

// 		this._sizeFactor = params.sizeFactor;

// 		this._extrude
// 	}

// // scene.add(part.selCyl);
// 			// scene.add(part.selCyl);

// 			// var geoWall = new THREE.Geometry();
// 			// var geoAoc = gettg(aoc);
// 			// var geoLaoc = gettg(laoc);
// 			// // var geoLaoc = laoc.geometry;
// 			// for (var i = geoAoc.faces.length - 1; i >= 0; i--) {
// 			// 	var f = geoAoc.faces[i];
// 			// 	var lf = geoLaoc.faces[i];

// 			// 	var vs = [f.a, f.b, f.c];
// 			// 	for (var j = 0; j < 3; j++) {
// 			// 		var n = vs[j];
// 			// 		var np = vs[(j + 1) % vs.length];

// 			// 		var m = geoWall.vertices.length;
// 			// 		geoWall.vertices.push(
// 			// 			geoAoc.vertices[n].clone(),
// 			// 			geoAoc.vertices[np].clone(),

// 			// 			geoLaoc.vertices[n].clone(),
// 			// 			geoLaoc.vertices[np].clone()
// 			// 		);

// 			// 		var wf1 = new THREE.Face3(m, m + 3, m + 2);
// 			// 		wf1.normal = computeFaceNormal(geoWall.vertices[wf1.a], geoWall.vertices[wf1.b], geoWall.vertices[wf1.c]);
// 			// 		geoWall.faces.push(wf1);

// 			// 		var wf2 = new THREE.Face3(m, m + 1, m + 3);
// 			// 		wf2.normal = computeFaceNormal(geoWall.vertices[wf2.a], geoWall.vertices[wf2.b], geoWall.vertices[wf2.c]);
// 			// 		geoWall.faces.push(wf2);
// 			// 	}
// 			// }

// 			// if (this._wall != undefined) scene.remove(this._wall);
// 			// var wall = new THREE.Mesh(geoWall, MATERIALHIGHLIGHT.clone());
// 			// var a = mergeObjs([aoc, wall, laoc]);


// // scene.remove(cylPartSelection.m);

// 		// remove original objects for better visibility
// 		// scene.remove(obj);

// 		//
// 		//	4. removing excessive faces
// 		//
// 		// var clrTrans = new THREE.Color("#ff0000");
// 		// var facesToRemove = [];
// 		// for (var i = this._part.geometry.faces.length - 1; i >= 0; i--) {
// 		// 	var f = this._part.geometry.faces[i];
// 		// 	var bendAngle = size == this.FINGER ? Math.PI / 4 : Math.PI / 2;
// 		// 	if (f.normal.angleTo(nml) > bendAngle) {
// 		// 		facesToRemove.push(f);
// 		// 	}
// 		// }

// 		// for (var i = facesToRemove.length - 1; i >= 0; i--) {
// 		// 	removeFromArray(this._part.geometry.faces, facesToRemove[i]);
// 		// }


// // optimizeGrip(a, ctrl, gripFactor) {

// 	// 	//
// 	// 	//	preprocessing
// 	// 	//
// 	// 	if (!a.preprocessed) {
// 	// 		tessellate(a, 5);

// 	// 		a.geometry.computeFaceNormals();
// 	// 		a.geometry.computeVertexNormals();
// 	// 		a.vnormals = [a.geometry.vertices.length];
// 	// 		for (var i = a.geometry.faces.length - 1; i >= 0; i--) {
// 	// 			var f = a.geometry.faces[i];
// 	// 			a.vnormals[f.a] = f.vertexNormals[0];
// 	// 			a.vnormals[f.b] = f.vertexNormals[1];
// 	// 			a.vnormals[f.c] = f.vertexNormals[2];
// 	// 		}

// 	// 		computeFaceArea(a);
// 	// 		markVertexNeighbors(a);

// 	// 		a.preprocessed = true;
// 	// 	}

// 	// 	return;

// 	// 	//
// 	// 	// init
// 	// 	//
// 	// 	var spacing = 50 * (1 - gripFactor);
// 	// 	var sphereSet = undefined;
// 	// 	var ag = gettg(a);

// 	// 	//
// 	// 	ctrl.gravity = new THREE.Vector3(0, -1, 0);
// 	// 	//

// 	// 	a.updateMatrixWorld();
// 	// 	for (var i = ag.vertices.length - 1; i >= 0; i--) {
// 	// 		var v = ag.vertices[i];

// 	// 		v.activated = undefined;
// 	// 	}

// 	// 	//
// 	// 	//	making dents/grooves
// 	// 	//
// 	// 	for (var i = ag.vertices.length - 1; i >= 0; i--) {
// 	// 		var v = ag.vertices[i];
// 	// 		v.normal = getTransformedVector(a.vnormals[i], a);

// 	// 		if (v.activated != false) {
// 	// 			var toOpt = false;
// 	// 			var eps = Math.PI / 8;
// 	// 			// log(v.normal.angleTo(ctrl.gravity))
// 	// 			if (toOpt == false && ctrl.gravity != undefined && Math.abs(v.normal.angleTo(ctrl.gravity) - Math.PI / 2) < eps) {
// 	// 				toOpt = true;
// 	// 			}

// 	// 			if (toOpt == false && ctrl.force != undefined && Math.abs(v.normal.angleTo(ctrl.force)) < eps) {
// 	// 				toOpt = true;
// 	// 			}

// 	// 			if (toOpt) {
// 	// 				// add to the sphere set
// 	// 				var sphere = new xacSphere(5);
// 	// 				addABall(v);
// 	// 				sphere.m.position.copy(v.clone());
// 	// 				if (sphereSet == undefined) {
// 	// 					sphereSet = sphere.m;
// 	// 				} else {
// 	// 					// sphereSet = xacThing.union(gettg(sphereSet), gettg(sphere.m));
// 	// 				}

// 	// 				// mark its neighbors within spacing as not activated
// 	// 				// log((ag.vertices.length - i) + "/" + ag.vertices.length);
// 	// 				this.nudgeNeighbors(a, ag, i, v, spacing);
// 	// 			} else {
// 	// 				addABall(v, 0xaaaaaa)
// 	// 			}
// 	// 		} else {
// 	// 			// log("skipped " + i);
// 	// 			// addABall(v, 0xaaaaaa)
// 	// 		}
// 	// 	}

// 	// 	// wrap up
// 	// 	a = xacThing.subtract(ag, gettg(sphereSet));

// 	// }

// 	// nudgeNeighbors(a, ag, idx, ctr, d) {
// 	// 	var v = ag.vertices[idx];
// 	// 	if (v.activated != undefined || v.distanceTo(ctr) > d) {
// 	// 		log(idx + " out!")
// 	// 		return false;
// 	// 	}

// 	// 	v.activated = false;
// 	// 	var vneighbors = a.vneighbors[idx];
// 	// 	log(vneighbors);
// 	// 	for (var i = vneighbors.length - 1; i >= 0; i--) {
// 	// 		var nidx = vneighbors[i];
// 	// 		this.nudgeNeighbors(a, ag, nidx, ctr, d);
// 	// 	}
// 	// }

// // gtCylWrapDisplay = gettg(wrapDisplay.m);
// 			// wrapInDisplay = xacThing.subtract(gtCylWrapDisplay, obj, MATERIALHIGHLIGHT);

// 			// flash a cylinder to show selection volume
// 			// scene.add(this.cylWrap.m);
// 			// setTimeout(function(m) {
// 			// 	scene.remove(m);
// 			// }, 1000, this.cylWrap.m);

// 			// scene.add(this._part);
			

// 			//
// 			//	4. remove unused faces
// 			//
// 			// var facesToRemove = [];
// 			// var graspAngle = Math.PI * 0.45;
// 			// this._part.material.needsUpdate = true;
// 			// for (var i = this._part.geometry.faces.length - 1; i >= 0; i--) {
// 			// 	var f = this._part.geometry.faces[i];
// 			// 	if (Math.abs(Math.PI / 2 - f.normal.angleTo(nmlWrap)) > graspAngle) {
// 			// 		facesToRemove.push(f);
// 			// 	}
// 			// }
// 			// this._part.geometry.colorsNeedUpdate = true;

// 			// for (var i = facesToRemove.length - 1; i >= 0; i--) {
// 			// 	removeFromArray(this._part.geometry.faces, facesToRemove[i]);
// 			// }
// /*
// 		wrapping an object by drawing a stroke on it
// 	*/
// 	// wrap(obj, pt, done) {
// 	// 	if (done) {
// 	// 		//
// 	// 		//	1. find points surrounding the cross section
// 	// 		//
// 	// 		var ptsWrap = []; // points sampled to rep the wrap
// 	// 		var maxDistAbove = 0; // max signed distances to the cross section
// 	// 		var maxDistBelow = 0;

// 	// 		// bounding box of the stroke
// 	// 		var min = new THREE.Vector3(INFINITY, INFINITY, INFINITY);
// 	// 		var max = new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY);

// 	// 		for (var i = 0; i < this._strokePoints.length; i++) {
// 	// 			var p = this._strokePoints[i];

// 	// 			min.x = Math.min(min.x, p.x);
// 	// 			min.y = Math.min(min.y, p.y);
// 	// 			min.z = Math.min(min.z, p.z);

// 	// 			max.x = Math.max(max.x, p.x);
// 	// 			max.y = Math.max(max.y, p.y);
// 	// 			max.z = Math.max(max.z, p.z);
// 	// 		}

// 	// 		var scale = min.distanceTo(max);
// 	// 		var ctr = new THREE.Vector3().addVectors(min, max).divideScalar(2);

// 	// 		// calculate intersection plane
// 	// 		var planeParams = findPlaneToFitPoints(this._strokePoints);
// 	// 		var a = planeParams.A;
// 	// 		var b = planeParams.B;
// 	// 		var c = planeParams.C;
// 	// 		var d = planeParams.D;

// 	// 		// find intersecting triangles
// 	// 		// ref: http://mathworld.wolfram.com/Point-PlaneDistance.html
// 	// 		var obj = this._obj;
// 	// 		for (var i = 0; i < obj.geometry.faces.length; i++) {
// 	// 			var f = obj.geometry.faces[i];

// 	// 			var indices = [f.a, f.b, f.c];
// 	// 			var vertices = [];
// 	// 			var faceInRange = true;
// 	// 			for (var j = 0; j < indices.length; j++) {
// 	// 				var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
// 	// 				vertices.push(v);
// 	// 				var dist = (a * v.x + b * v.y + c * v.z + d) / Math.sqrt(a * a + b * b + c * c);

// 	// 				/*
// 	// 					for faces to be included they need to be
// 	// 						1) close to the cutting plane
// 	// 						2) close to the firstly selected points
// 	// 				*/

// 	// 				if (Math.abs(dist) < HANDSIZE && v.distanceTo(ctr) < 2 * scale) {
// 	// 					ptsWrap.push(v);
// 	// 					maxDistAbove = Math.max(maxDistAbove, dist);
// 	// 					maxDistBelow = Math.min(maxDistBelow, dist);
// 	// 				}
// 	// 			}
// 	// 		}

// 	// 		//
// 	// 		//	2. find a wrapping cylinder
// 	// 		//
// 	// 		var ctrWrap = getCenter(ptsWrap);

// 	// 		var nmlWrap = new THREE.Vector3(a, b, c);
// 	// 		nmlWrap.normalize();

// 	// 		var rWrap = 0;
// 	// 		var ctrWrapProj = getProjection(ctrWrap, a, b, c, d);
// 	// 		for (var i = ptsWrap.length - 1; i >= 0; i--) {
// 	// 			var ptProj = getProjection(ptsWrap[i], a, b, c, d);
// 	// 			rWrap = Math.max(rWrap, ptProj.distanceTo(ctrWrapProj));
// 	// 		}
// 	// 		rWrap *= 1.1;

// 	// 		this.cylWrap = new xacCylinder(rWrap, HANDSIZE, MATERIALCONTRAST);
// 	// 		var wrapDisplay = new xacCylinder(rWrap, FINGERSIZE * 2, MATERIALCONTRAST);
// 	// 		rotateObjTo(this.cylWrap.m, nmlWrap);
// 	// 		rotateObjTo(wrapDisplay.m, nmlWrap);
// 	// 		this.cylWrap.m.position.copy(ctrWrap.clone());

// 	// 		// var ctrStroke = getCenter(this._strokePoints);
// 	// 		// ctrStroke = getProjection(ctrStroke, a, b, c, d);
// 	// 		wrapDisplay.m.position.copy(ctrWrapProj.clone());

// 	// 		//
// 	// 		//	3. make wraps
// 	// 		//
// 	// 		var gtCylWrap = gettg(this.cylWrap.m);
// 	// 		this.wrapIn = xacThing.intersect(gtCylWrap, obj, this._part == undefined ? MATERIALCONTRAST : this._part.material);

// 	// 		var gtCylWrapDisplay = gettg(wrapDisplay.m);
// 	// 		var wrapInDisplay = xacThing.intersect(gtCylWrapDisplay, obj, MATERIALHIGHLIGHT);
// 	// 		scene.add(wrapInDisplay);

// 	// 		if (this._part != undefined)
// 	// 			scene.remove(this._part);
// 	// 		this._part = this.wrapIn;

// 	// 		var factorInflate = 1.1;
// 	// 		scaleAroundCenter(this._part, factorInflate);
// 	// 		scaleAroundCenter(wrapInDisplay, factorInflate);

// 	// 		this._part.center = getCenter(this._part.geometry.vertices);
// 	// 		this._part.normal = nmlWrap;

// 	// 		// scene.remove(obj);

// 	// 		//
// 	// 		//	5. finishing up
// 	// 		//
// 	// 		this._part.type = 'wrap';
// 	// 		this._part.ctrSel = getProjection(ctrWrap, a, b, c, d);
// 	// 		this.isWrapping = false;

// 	// 	} else {
// 	// 		this._obj = obj;
// 	// 		addABall(pt, COLORHIGHLIGHT, 0.5);
// 	// 		this._strokePoints.push(pt);
// 	// 	}
// 	// }

// 	// function getAspectRatios(obj) {


// // 	var ratios = [1 / (ly * lz), 1 / (lz * lx), 1 / (lx * ly)];
// // 	// log(ratios)
// // 	var minRatio = ratios[0];
// // 	for (var i = ratios.length - 1; i > 0; i--) {
// // 		minRatio = Math.min(minRatio, ratios[i]);
// // 	}

// // 	// TODO denominator zero check
// // 	for (var i = ratios.length - 1; i >= 0; i--) {
// // 		ratios[i] /= minRatio;
// // 	}

// // 	return ratios;
// // }

// 	// var ny = Math.min(n * aspectRatios[1], 80);
// 		// for (var i = 0; i < ny; i++) {
// 		// 	for (var j = 0; j < n; j++) {
// 		// 		// for(var k=0; k<n; k++) {
// 		// 		var v = new THREE.Vector3();

// 		// 		var theta = Math.PI * 2 * i / n;
// 		// 		v.y = 0;//ctr.y + r * Math.cos(theta) * aspectRatios[1];

// 		// 		var phi = Math.PI * 2 * j / n;
// 		// 		v.x = ctr.x + r * Math.sin(theta) * Math.cos(phi) * aspectRatios[2];
// 		// 		v.z = ctr.z + r * Math.sin(theta) * Math.sin(phi) * aspectRatios[0];

// 		// 		addALine(ctr, v);
// 		// 		var rayCaster = new THREE.Raycaster();
// 		// 		rayCaster.ray.set(ctr, v.clone().sub(ctr).normalize());
// 		// 		var ints = rayCaster.intersectObjects([a]);

// 		// 		if (ints[0] != undefined) {
// 		// 			addABall(ints[0].point, 0xaaaaaa);
// 		// 		}

// 		// 	}
// 		// }


// 	// var cylinderSel = new xacCylinder([rLarge, rSmall], part.cylHeight, MATERIALCONTRAST);
// 			// rotateObjTo(cylinderSel.m, part.normal);
// 			// cylinderSel.m.position.copy(part.cylCenter);

// 			// scene.remove(gObjTemp);
// 			// scene.add(cylinderSel.m);
// 			// gObjTemp = cylinderSel.m;

// 			// var aoc = new THREE.Mesh(part.geometry.clone(), part.material.clone());
// 			// var laoc = scaleAroundVector(aoc, sizeFactor, part.normal);
// 			// scaleAlongVector(laoc, Math.pow(10, sizeFactor - 1), part.normal);

// 			// laoc = xacThing.intersect(gettg(laoc), gettg(cylinderSel.m), part.material);

// 			// var laoc = new THREE.Mesh(aoc.geometry.clone(), aoc.material.clone());
			
			
// 			// laoc = xacThing.intersect(gettg(laoc), gettg(part.selCyl), part.material);



// var cylinderSel = new xacCylinder(r / 2, part.cylHeight, MATERIALCONTRAST);
// 			rotateObjTo(cylinderSel.m, part.normal);
// 			cylinderSel.m.position.copy(part.cylCenter);

// 			// select which bounding geometry to use
// 			var spaceSel = cylinderSel.m;
// 			var aoc = xacThing.intersect(gettg(part), gettg(spaceSel), part.material);

// 			var laoc = new THREE.Mesh(aoc.geometry.clone(), aoc.material.clone());
// 			scaleAlongVector(laoc, Math.pow(10, sizeFactor - 1), part.normal);
// 			scaleAroundVector(laoc, sizeFactor, part.normal);
// 			laoc = xacThing.intersect(gettg(laoc), gettg(part.selCyl), part.material);
		

		
// 		//
// 		// copy button
// 		// NOW: don't do it
// 		//
// 		// trPartsCtrls.tdCopy = $("<td></td>");
// 		// var iconCopy = $('<span></span>').addClass('ui-icon ui-icon-copy');
// 		// trPartsCtrls.tdCopy.append(iconCopy);
// 		// iconCopy.click(function(event) {

// 		// 	//
// 		// 	// TODO: copying the previous row and insert it to the end of the table
// 		// 	//
// 		// 	// var row = tblPartsCtrls.rows.slice(-1)[0]; // the row to copy
// 		// 	// var rowNew = $('<tr></tr>');
// 		// 	// rowNew.html(row.html());
// 		// 	// tblPartsCtrls.append(rowNew);

// 		// })

// 		// create a 'tag' to represent an added adaptation
// 			// if (data.item.index > 0) {
// 			// 	for (pid in gCurrAdapt.adaptations) {
// 			// 		// gAdaptId += 1;
// 			// 		// var tagName = gAdaptId + ' ' + data.item.label;
// 			// 		// var tag = lsAdapts.tagit('createTag', tagName); // + String.fromCharCode(charCode));

// 			// 		// gAdaptationComponents[tagName] = gCurrAdapt.adaptations[pid];

// 			// 		// triggerUI2ObjAction(tag, FOCUSACTION);
// 			// 	}
// 			// }



// class xacBolt extends xacAttachment {
// 	constructor(a) {
// 		super(a);
// 	}

// 	mousedown(e, obj, pt, fnml) {
// 		this._strokePoints = [];
// 	}

// 	mousemove(e, obj, pt, fnml) {
// 		this._obj = obj;
// 		this._strokePoints.push(pt);
// 		addABall(pt, COLORSTROKE);
// 	}

// 	mouseup(e) {
// 		if (this._strokePoints.length > 3) {
// 			this._makeBoltStruct(this._strokePoints, this._obj);
// 		}

// 		setTimeout(function() {
// 			removeBalls();
// 		}, 500);
// 	}

// 	_makeBoltStruct(pts, obj) {
// 		var widthCluth = 10;
// 		var depthClampNeck = 10;
// 		var thicknessClampNeck = 3;

// 		//
// 		//	0. get a wrap
// 		var planeParams = findPlaneToFitPoints(this._strokePoints);

// 		this._pt = this._strokePoints[float2int(this._strokePoints.length / 2)];
// 		var partSel = new PartSelector();
// 		partSel._doWrap(this._obj, this._pt, planeParams);

// 		//
// 		//	1. make a partial bounding cylinder
// 		var part = partSel.part;
// 		var ctrDisplay = getBoundingBoxCenter(part.display);
// 		this._nml = this._pt.clone().sub(ctrDisplay).normalize();

// 		var cylParams = getBoundingCylinder(part.display, part.normal);
// 		cylParams.radius *= 1.1;

// 		var clampBody = new xacCylinder(cylParams.radius, cylParams.height).m;
// 		rotateObjTo(clampBody, part.normal);
// 		clampBody.position.copy(getBoundingBoxCenter(part.display));

// 		var clampNeck = new xacRectPrism(widthCluth, 0.5 * FINGERDIM, (depthClampNeck + cylParams.radius), MATERIALHIGHLIGHT).m;
// 		var clampNeckStub = new xacRectPrism(widthCluth - thicknessClampNeck * 2, 2 * FINGERDIM, (depthClampNeck + cylParams.radius), MATERIALHIGHLIGHT).m;

// 		var ctrNeck = this._pt.clone().sub(this._nml.clone().multiplyScalar((cylParams.radius - depthClampNeck) * 0.5));
// 		var ctrClampBody = getBoundingBoxCenter(clampBody);

// 		var projctrNeck = ctrNeck.clone();
// 		projctrNeck.y = 0;
// 		var projctrClampBody = ctrClampBody.clone();
// 		projctrClampBody.y = 0;

// 		var dirToCtr = projctrNeck.clone().sub(projctrClampBody);

// 		var angleToAlign = new THREE.Vector3(0, 0, 1).angleTo(dirToCtr);
// 		var axisToRotate = new THREE.Vector3(0, 0, 1).cross(dirToCtr).normalize();
// 		var matRotate = new THREE.Matrix4();
// 		matRotate.makeRotationAxis(axisToRotate, angleToAlign);

// 		rotateObjTo(clampNeck, part.normal);
// 		clampNeck.applyMatrix(matRotate);
// 		clampNeck.position.copy(ctrNeck);

// 		rotateObjTo(clampNeckStub, part.normal);
// 		clampNeckStub.applyMatrix(matRotate);
// 		clampNeckStub.position.copy(ctrNeck);

// 		clampNeck = xacThing.subtract(gettg(clampNeck), gettg(clampNeckStub));
// 		var clamp = xacThing.union(gettg(clampBody), gettg(clampNeck));
// 		clamp = xacThing.subtract(gettg(clamp), gettg(clampNeckStub));
// 		clamp = xacThing.subtract(gettg(clamp), gettg(this._obj));


// 		//
// 		//	2. drill a hole for bolts
// 		//
// 		var screwStub = new xacCylinder(RADIUSM3, widthCluth * 1.5).m;
// 		screwStub.geometry.rotateZ(Math.PI / 2);
// 		// scene.add(screwStub);
// 		rotateObjTo(screwStub, part.normal);
// 		screwStub.applyMatrix(matRotate);

// 		screwStub.position.copy(this._pt.clone().add(this._nml.multiplyScalar(depthClampNeck * 0.5)));

// 		scene.remove(this._clamp);
// 		this._clamp = xacThing.subtract(gettg(clamp), gettg(screwStub), MATERIALHIGHLIGHT);

// 		scene.remove(part.display);
// 		scene.add(this._clamp);


// 		//
// 		//	3. finish up
// 		//
// 		this._awa = xacThing.union(gettg(this._clamp), gettg(this._a.adaptation), MATERIALHIGHLIGHT);
// 		if (this._a != undefined) {
// 			scene.remove(this._awa);
// 			scene.remove(this._a.adaptation);
// 			// this._awa = xacThing.subtract(gettg(this._a.adaptation), gettg(strap), this._a.adaptation.material);
// 			scene.add(this._awa);
// 			this._a.awa = this._awa;
// 		}
// 	}
// }

// /*
// 	marking part of the adaptation to be printed with flexible material
// */
// class xacFlexiblePart extends xacAttachment {
// 	constructor(a) {
// 		super(a);

// 		this._flexiblePart = undefined;

// 		// TODO: this can be improved by considering interpolating btwn the adaptation & the object
// 		this._ratio = 0.8;

// 		this._makeFlexiblePart();

// 	}

// 	// TODO: further debug this
// 	_makeFlexiblePart() {
// 		// enlarge the original object
// 		// var objInflated = this._a.adaptation.obj.clone();

// 		// objInflated.scale.set(1 + this._ratio, 1 + this._ratio, 1 + this._ratio);
// 		// scaleAroundCenter(objInflated, 1 + this._ratio);

// 		// get its intersection with the adaptation

// 		var aDeflated = new THREE.Mesh(this._a.adaptation.geometry.clone(), MATERIALOVERLAY);

// 		scaleAroundVector(aDeflated, this._ratio, this._a.adaptation.part.normal);
// 		scaleAlongVector(aDeflated, 1.01, this._a.adaptation.part.normal);

// 		var fp = xacThing.subtract(gettg(aDeflated), gettg(this._a.adaptation.obj), MATERIALOVERLAY);
// 		scene.add(fp);
// 		this._flexiblePart = fp;

// 		this._awa = xacThing.subtract(gettg(this._a.adaptation), gettg(fp), this._a.adaptation.material);
// 		scene.add(this._awa);

// 		this._a.awa = this._awa;
// 		this._a.fp = this._flexiblePart;
// 	}
// }

// var partSel = new PartSelector();
			// partSel._doWrap(this._obj, midPt, drawnPlane);
			// scene.remove(this._awa);
			// scene.remove(this._pipe);
			// // this._pipe = partSel._doWrap(this._obj, midPt, drawnPlane); //new xacWrapper()._extrude(partSel.part, undefined, 1, 1.5);
			// this._pipe = this._partSel.part.display;
			// scaleAroundVector(this._pipe, 1.5, nmlPlane);
			// scene.add(this._pipe);

			// this._awa = this._pipe;
			// this._step = this._TOMAKEBOLTHOLE;

			// BEFORE: based on extrusion
		// var aNew = new THREE.Mesh(a.geometry.clone(), a.material);
		// scaleAlongVector(aNew, Math.pow(3, this._strengthFactor), dirLever);
		// var l = getDimAlong(aNew, dirLever);
		// // TODO: make 0.3 programmatic
		// aNew.translateOnAxis(dirLever, l * 0.3);

		// NOW: use bounding cylinder

class xacMechanism extends xacAdaptation {
	constructor(type, pc, params) {
		super(pc);

		// TODO: be more specific
		this._label = 'Mechanism';

		this._type = type;

		this._update = function(pid) {
			var a;
			switch (this._type) {
				case CLAMP:
					a = this._makeClamp(this._pc.parts[pid]);
					break;
				case CAM:
					this._axisRadius = 3;
					this._axisLength = 20;
					a = this._makeCam(this._pc);
					break;
				case UNIVJOINT:
					a = this._makeUnivJoint(this._pc.parts[pid]);
					break;
			}

			if (a != undefined) {
				scene.remove(this._a);
				scene.add(a);
				this._a = a;
			}

			return a;

		}

		if (this._type == CAM || this._type == UNIVJOINT) {
			this.update();
		}
	}

	// this version is currently specific to clutching
	// fulcrum - the position of the axis
	// dir axis - the orientation of the axis
	// fixed point - where a wrapper can be attached, and a scaffold can be extended
	_makeCam(pc) {
		var ctrl = pc.ctrl;
		var freeEnd = pc.parts['Part 1'];
		var fixedEnd = pc.parts['Part 2'];
		var nmlRotation = new THREE.Vector3(ctrl.plane.A, ctrl.plane.B, ctrl.plane.C).normalize();

		if (nmlRotation.angleTo(freeEnd.normal) < Math.PI / 2) {
			nmlRotation.multiplyScalar(-1);
		}

		//
		// 1. generate an axis (free end)
		//
		var dirLeverFree = ctrl.pocFree.clone().sub(ctrl.fulcrum);
		var dirToAxis = getVerticalOnPlane(dirLeverFree, ctrl.plane.A, ctrl.plane.B, ctrl.plane.C, ctrl.plane.D); // how to go from free end to the axis
		var rCam = 10 * this._sizeFactor;
		var ctrAxis = ctrl.pocFree.clone().add(dirToAxis.clone().normalize().multiplyScalar(rCam));
		// addABall(ctrAxis, 0xf00fff);

		var camAxis = new xacCylinder(this._axisRadius, this._axisLength, MATERIALOVERLAY).m;
		rotateObjTo(camAxis, nmlRotation);
		camAxis.position.copy(ctrAxis);
		// scene.add(camAxis);

		//
		// 2. generate a wrapper (fixed end)
		//
		var camAnchor = this._extrude(fixedEnd, ctrl, this._sizeFactor, this._fingerFactor);
		var ctrAnchor = getBoundingBoxCenter(camAnchor);
		// scene.add(camAnchor);

		//
		// 3. generate bar 1 (holding the axis)
		//
		var endAxis = ctrAxis.clone().sub(nmlRotation.clone().multiplyScalar(this._axisLength * 0.5));
		addABall(endAxis, 0x0000ff);
		var lenBar = ctrAnchor.distanceTo(endAxis) + this._axisRadius * 2;
		var ctrBar = ctrAnchor.clone().add(endAxis).multiplyScalar(0.5);
		var nmlBar = ctrAnchor.clone().sub(endAxis).normalize();

		var camBar = new xacCylinder(this._axisRadius, lenBar, MATERIALOVERLAY).m;
		rotateObjTo(camBar, nmlBar);
		camBar.position.copy(ctrBar);
		// scene.add(camBar);

		var camStruct = xacThing.union(gettg(camAxis), gettg(camAnchor));
		camStruct = xacThing.union(gettg(camStruct), gettg(camBar), MATERIALOVERLAY);

		//
		// 4. generate bar 2 (holding bar 1)
		// skip this for now

		//
		// 5. put the cam in place
		//
		scene.remove(this._cam);
		this._cam = new THREE.Mesh(gCam.geometry, MATERIALOVERLAY);
		var dimsCam = getBoundingBoxDimensions(this._cam);
		this._cam.scale.set(this._sizeFactor, this._sizeFactor, this._sizeFactor);

		var posCam = ctrAxis.clone().add(nmlRotation.clone().multiplyScalar(this._axisLength * 0.5 + dimsCam[1]));

		// manually align the cam with the axis to make it look better
		posCam.add(dirToAxis.clone().multiplyScalar(dimsCam[0] * 0.5));

		// addABall(posCam, 0x44ee55);
		rotateObjTo(this._cam, nmlRotation);
		this._cam.position.copy(posCam);
		scene.add(this._cam);

		return camStruct;
	}

	// assume the part is a wrapping selection
	_makeClamp(part) {
		//
		//	0. params
		//
		var widthCluth = 50; // the width of the clutch part (how wide to leave an openning for the wrap)
		var depthClampNeck = 15; // the 'depth' of the part that sticks out to be connected to the clutch
		var thicknessClampNeck = 5;

		//	1. make a wrap
		// use the wrap display as wrap

		//
		//	2. add & cut a fixed size extrusion as piple clamp openning material
		//
		var cylParams = getBoundingCylinder(part.display, part.normal);

		// one exit possibility - cross section too small
		if (cylParams.radius < depthClampNeck) {
			return;
		}

		var clampNeck = new xacRectPrism(widthCluth, 0.75 * FINGERDIM, (depthClampNeck + cylParams.radius), MATERIALOVERLAY).m;
		var clampNeckStub = new xacRectPrism(widthCluth - thicknessClampNeck * 2, 2 * FINGERDIM, (depthClampNeck + cylParams.radius), MATERIALOVERLAY).m;

		var ctrNeck = this._pt.clone().sub(this._nml.clone().multiplyScalar((cylParams.radius - depthClampNeck) * 0.5));
		var ctrWrapDisplay = getBoundingBoxCenter(part.display);

		var projctrNeck = ctrNeck.clone();
		projctrNeck.y = 0;
		var projCtrWrapDisplay = ctrWrapDisplay.clone();
		projCtrWrapDisplay.y = 0;

		var dirToCtr = projctrNeck.clone().sub(projCtrWrapDisplay);
		addAVector(ctrNeck, dirToCtr);
		addAVector(new THREE.Vector3(), new THREE.Vector3(1, 0, 0));
		addAVector(new THREE.Vector3(), new THREE.Vector3(0, 0, 1));

		var angleToAlign = new THREE.Vector3(0, 0, 1).angleTo(dirToCtr);
		var axisToRotate = new THREE.Vector3(0, 0, 1).cross(dirToCtr).normalize();
		var matRotate = new THREE.Matrix4();
		matRotate.makeRotationAxis(axisToRotate, angleToAlign);

		rotateObjTo(clampNeck, part.normal);
		clampNeck.applyMatrix(matRotate);
		clampNeck.position.copy(ctrNeck);

		rotateObjTo(clampNeckStub, part.normal);
		clampNeckStub.applyMatrix(matRotate);
		clampNeckStub.position.copy(ctrNeck);

		clampNeck = xacThing.subtract(gettg(clampNeck), gettg(clampNeckStub));
		var clamp = xacThing.union(gettg(part.display), gettg(clampNeck));
		clamp = xacThing.subtract(gettg(clamp), gettg(clampNeckStub));
		clamp = xacThing.subtract(gettg(clamp), gettg(this._pc.obj));

		// scene.remove(this._pc.obj);

		//
		//	3. drill TWO holes for bolts
		//
		var screwStub = new xacCylinder(RADIUSM3, widthCluth * 1.5).m;
		screwStub.geometry.rotateZ(Math.PI / 2);
		// scene.add(screwStub);
		rotateObjTo(screwStub, part.normal);
		screwStub.applyMatrix(matRotate);
		screwStub.position.copy(this._pt.clone()); //.add(this._nml.clone().multiplyScalar(depthClampNeck/10)));
		clamp = xacThing.subtract(gettg(clamp), gettg(screwStub), MATERIALOVERLAY);
		screwStub.position.add(this._nml.clone().multiplyScalar(10));
		clamp = xacThing.subtract(gettg(clamp), gettg(screwStub), MATERIALOVERLAY);

		//
		//	4. connect it with the clutch
		//
		scene.remove(this._clamp);

		var clampCopy = new THREE.Mesh(gClamp.geometry.clone(), gClamp.material.clone());
		rotateObjTo(clampCopy, part.normal);
		clampCopy.applyMatrix(matRotate);
		clampCopy.position.copy(this._pt.clone().add(this._nml.clone().multiplyScalar(50)));
		scene.add(clampCopy);

		this._clamp = clampCopy;

		return clamp;
	}

	_makeUnivJoint(part) {
		var uj = undefined;
		var ctrl = this._pc.ctrl;

		if (ctrl.type != ROTATECTRL) {
			return;
		}

		//	1. extrude a base to situate the yoke
		var base = this._extrude(part, undefined, this._sizeFactor, this._fingerFactor);
		var ctrBase = getBoundingBoxCenter(base);
		//	2. situate one of the two yokes
		var yoke1 = new THREE.Mesh(gYoke.geometry.clone(), gYoke.material.clone());
		var dimsYoke = getBoundingBoxDimensions(yoke1);

		scene.remove(gYoke);
		var ctrYoke1 = ctrBase.clone().add(part.normal.clone().multiplyScalar(dimsYoke[1] * 0.5));
		rotateObjTo(yoke1, part.normal);
		yoke1.position.copy(ctrYoke1);

		//	3. display the other yoke and cross
		scene.remove(gYokeCross);
		var yoke2cross = new THREE.Mesh(gYokeCross.geometry.clone(), gYokeCross.material.clone());
		rotateObjTo(yoke2cross, part.normal);
		var dimsYokeCross = getBoundingBoxDimensions(yoke2cross);
		yoke2cross.position.copy(ctrYoke1.clone().add(part.normal.clone().multiplyScalar((dimsYoke[1] + dimsYokeCross[1]) * 0.5)));

		scene.remove(this._yoke2cross);
		scene.add(yoke2cross);
		this._yoke2cross = yoke2cross;

		// uj = xacThing.union(gettg(base), gettg(yoke1), MATERIALOVERLAY);
		uj = yoke1;
		return uj;
	}

	mousedown(e) {
		var arrParts = [];
		for (var idx in this._pc.parts) {
			arrParts.push(this._pc.parts[idx].display);
		}
		var intersects = rayCast(e.clientX, e.clientY, arrParts);

		if (intersects.length == 0) {
			intersects = rayCast(e.clientX, e.clientY, [this._pc.obj]);
		}

		if (intersects[0] != undefined) {
			this._pt = intersects[0].point;
			this._nml = intersects[0].face.normal;

			this.update();
		}
	}
}

var _vector = new THREE.Vector3,
// 	projector = new THREE.Projector(),
// 	selected_block, mouse_position = new THREE.Vector3,
// 	block_offset = new THREE.Vector3,
// 	_i, _v3 = new THREE.Vector3,
// 	intersect_plane;

// function onMouseDownCtrl(event) {
// 	// event.preventDefault();
	
// 	// TODO: fix this hardcoded width
// 	if (event.clientX < WIDTHCONTAINER) return;

// 	// usingPhysics = false;
// 	// controlPanel.checkbox3.checked = usingPhysics;

// 	intersects = rayCast(event.clientX, event.clientY, objects);

// 	// console.log(intersects[0]);

// 	isMouseDown = true;
// 	prevGrndX = undefined;
// 	prevGrndZ = undefined;
// }

// function onMouseMoveCtrl(event) {
// 	// event.preventDefault();

// 	if (!isMouseDown) {
// 		return;
// 	}

// 	// var intersects = rayCast(event.clientX, event.clientY, [ground]);

// 	// if(D_MOUSE) {
// 	// 	if(intersects.length == 1) {
// 	// 		ball.position.x = intersects[0].point.x;
// 	// 		ball.position.z = intersects[0].point.z;
// 	// 	}
// 	// } else {
// 	// move selected objects
// 	// if(intersects.length == 1) {
// 	for (var i = 0; i < selected.length; i++) {
// 		var obj = selected[i];

// 		/* left button */
// 		if (event.button == 0) {
// 			var intersects = rayCast(event.clientX, event.clientY, [ground]);
// 			if (intersects.length <= 0) {
// 				continue;
// 			}

// 			// console.log(intersects[0]);
// 			var tx = intersects[0].point.x - obj.position.x;
// 			var tz = intersects[0].point.z - obj.position.z;
// 			// obj.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(tx, 0, tz ) );
// 			// console.log(tx + ", " + tz);

// 			// rateXZ = Math.min(1.0, Math.max(Math.abs(obj.position.x - intersects[0].point.x), 
// 			// 	Math.abs(obj.position.z - intersects[0].point.z)) / 100);
// 			// rateXZ = 0.9;
// 			// obj.position.x = obj.position.x * rateXZ + intersects[0].point.x * (1 - rateXZ);
// 			// obj.position.z = obj.position.z * rateXZ + intersects[0].point.z * (1 - rateXZ);

// 			if (prevGrndX != undefined && prevGrndZ != undefined) {
// 				obj.position.x += (intersects[0].point.x - prevGrndX);
// 				obj.position.z += (intersects[0].point.z - prevGrndZ);
// 			}

// 			prevGrndX = intersects[0].point.x;
// 			prevGrndZ = intersects[0].point.z;

// 		}
// 		/* right button */
// 		else if (event.button == 2) {

// 			/* approach 1: use mouse coordinates */
// 			// if(prevY != undefined) {
// 			// 	var deltaScreenY = event.clientY - prevY;
// 			// 	obj.position.y -= rateY * deltaScreenY;
// 			// }

// 			/* approach 2: use object's y */
// 			var intersects = rayCast(event.clientX, event.clientY, [obj]);
// 			if (intersects.length > 0) {
// 				obj.position.y = obj.position.y * rateY + intersects[0].point.y * (1 - rateY);
// 			} else {
// 				var deltaScreenY = event.clientY - prevY;
// 				obj.position.y -= rateY * deltaScreenY;
// 			}


// 		}
// 		// else if (event.button == 1) {
// 		// 	if(prevX != undefined && prevY != undefined) {
// 		// 		obj.rotation.x += (event.clientY - prevY) * rateRot;
// 		// 		obj.rotation.z += (event.clientX - prevX) * rateRot;
// 		// 	}
// 		// }
// 	}

// 	// }
// 	// }

// 	prevX = event.clientX;
// 	prevY = event.clientY;

// }

// function onMouseUpCtrl(event) {
// 	// event.preventDefault();

// 	isMouseDown = false;
// 	selected = [];

// 	// for (var i = 0; i < selected.length; i++) {
// 	// 	var obj = selected[i]; // }
// 	// 	obj.__dirtyPosition = true;
// 	// 	obj.__dirtyRotation = true;
// 	// }
// }