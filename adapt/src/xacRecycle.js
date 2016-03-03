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