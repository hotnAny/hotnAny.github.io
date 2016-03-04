/**
 * mouse event handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var partSel = new PartSelection();

document.addEventListener('mousedown', onMouseDownStep, false);
document.addEventListener('mousemove', onMouseMoveStep, false);
document.addEventListener('mouseup', onMouseUpStep, false);

var ptDown = [];

var gSticky = false;

function onMouseDownStep(event) {
	if (event.clientX < WIDTHCONTAINER) return;

	intersects = rayCast(event.clientX, event.clientY, objects);

	ptDown = [event.clientX, event.clientY];

	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 2.1:
			if (event.which == LEFTMOUSE) {
				// if (event.shiftKey == false) {
				// 	partSel.clear();
				// }
				// partSel.isEngaged = true;
				// partSel.isWrapping = false;
				if (activeCtrl != undefined && intersects.length > 0) {
					var objInt = getClosestIntersected();
					if (activeCtrl.type == GRASPCTRL) {
						if (gSticky == false) {
							partSel.grab(objInt.object, objInt.point.clone(), objInt.face.normal);
						} else if (gSticky) {
							partSel.release();
						}
					} else {
						// show rotation planes to select
						// tentative - let xacControl handle the events
						activeCtrl.mouseDown(event, objInt.object, objInt.point.clone(), objInt.face.normal);
					}
				}
			}

			break;
		case 2.2:
			break;
	}
}

function onMouseMoveStep(event) {
	if (gSticky == false) {
		if (ptDown.length == 0) return;
		if (event.clientX < WIDTHCONTAINER) return;

		intersects = rayCast(event.clientX, event.clientY, objects);
	}

	var ptMove = [event.clientX, event.clientY];

	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 2.1:
			// if (partSel.isEngaged) {
			// if (partSel.isWrapping == false) {
			// 	partSel.isWrapping = getDist(ptDown, ptMove) > partSel.MINWRAPMOUSEOFFSET;
			// } else {
			// 	var objInt = getClosestIntersected();
			// 	if (objInt != undefined) partSel.wrap(objInt.object, objInt.point.clone());
			// }
			if (activeCtrl != undefined) {
				if (activeCtrl.type == GRASPCTRL) {
					if (gSticky) {
						partSel.rotateHand(ptMove, ptDown);
					}
				} else {
					activeCtrl.mouseMove(event, objInt.object, objInt.point.clone(), objInt.face.normal);
				}
			}
			// rotateHand([event.movementX , event.movementY]);

			// }
			break;
		case 2.2:
			break;
	}
}

function onMouseUpStep(event) {
	if (event.clientX < WIDTHCONTAINER) return;

	intersects = rayCast(event.clientX, event.clientY, objects);

	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 2.1:
			if (event.which == LEFTMOUSE) {
				// 	$("html,body").css("cursor", "progress");
				// 	if (partSel.isWrapping) {
				// 		var objInt = getClosestIntersected();
				// 		partSel.wrap(undefined, undefined, HANDSIZE / 2, true);
				// 	} else {
				if (activeCtrl != undefined && activeCtrl.type == GRASPCTRL) {
					//
				} else {
					var objInt = getClosestIntersected();
					if (objInt != undefined) {
						partSel.press(objInt.object, objInt.point.clone(), objInt.face.normal.clone(), partSel.FINGER);
					}
				}
				// 	}

				if (partSel.part != undefined) {
					var parts = gPartsCtrls[gCurrPartCtrl.attr('pcId')].parts;
					if (event.shiftKey == false) {
						gPartsCtrls[gCurrPartCtrl.attr('pcId')].obj = partSel.obj;
						gPartSerial += 1;
						var tagName = 'Part ' + gPartSerial; //(Object.keys(parts).length + 1);
						var lsParts = $(gCurrPartCtrl.children()[0]); //.attr('lsParts');
						var tag = lsParts.tagit('createTag', tagName);
						parts[tagName] = partSel.part;
						triggerUI2ObjAction(tag, FOCUSACTION);
					} else {
						var ui = justFocusedUIs[gStep];
						var tagName = $(ui[0]).text().slice(0, -1);
						parts[tagName] = partSel.part;
					}
				}

				// 	partSel.isEngaged = false;

				// 	if (D != 'true' || event.shiftKey == false) removeBalls();

				// 	$("html,body").css("cursor", "default");
			}
			break;
		case 2.2:
			break;
	}

	if (gSticky == false) {
		ptDown = [];
	}
}