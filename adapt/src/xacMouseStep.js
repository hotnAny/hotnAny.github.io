/**
 * mouse event handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var gPartSel = new PartSelector();

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
				// 	gPartSel.clear();
				// }
				// gPartSel.isEngaged = true;
				// gPartSel.isWrapping = false;
				if (activeCtrl != undefined) {
					var objInt = getClosestIntersected();
					if (activeCtrl.type == GRASPCTRL && objInt != undefined) {
						if (gSticky == false) {
							gPartSel.grab(objInt.object, objInt.point.clone(), objInt.face.normal);
						} else if (gSticky) {
							gPartSel.release();
						}
					} else {
						// show rotation planes to select
						// tentative - let xacControl handle the events
						if (objInt != undefined) {
							activeCtrl.mouseDown(event, objInt.object, objInt.point.clone(), objInt.face.normal);
						} else {
							activeCtrl.mouseDown(event);
						}
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
		var objInt = getClosestIntersected();
	}

	var ptMove = [event.clientX, event.clientY];

	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 2.1:
			// if (gPartSel.isEngaged) {
			// if (gPartSel.isWrapping == false) {
			// 	gPartSel.isWrapping = getDist(ptDown, ptMove) > gPartSel.MINWRAPMOUSEOFFSET;
			// } else {
			// 	var objInt = getClosestIntersected();
			// 	if (objInt != undefined) gPartSel.wrap(objInt.object, objInt.point.clone());
			// }
			if (activeCtrl != undefined) {
				if (activeCtrl.type == GRASPCTRL) {
					if (gSticky) {
						gPartSel.rotateHand(ptMove, ptDown);
					}
				} else {
					if (objInt != undefined) {
						activeCtrl.mouseMove(event, objInt.object, objInt.point.clone(), objInt.face.normal);
					} else {
						activeCtrl.mouseMove(event);
					}
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
				// 	if (gPartSel.isWrapping) {
				// 		var objInt = getClosestIntersected();
				// 		gPartSel.wrap(undefined, undefined, HANDSIZE / 2, true);
				// 	} else {
				if (activeCtrl != undefined) {
					if (activeCtrl.type == GRASPCTRL) {
						//
					} else {

						activeCtrl.mouseUp(event); //, objInt.object, objInt.point.clone(), objInt.face.normal);

						// TODO: maybe move it to down?
						// var objInt = getClosestIntersected();
						// if (objInt != undefined) {
						// 	gPartSel.press(objInt.object, objInt.point.clone(), objInt.face.normal.clone(), gPartSel.FINGER);
						// }
					}
				}
				// 	}



				// 	gPartSel.isEngaged = false;

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