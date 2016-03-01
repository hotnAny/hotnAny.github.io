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


