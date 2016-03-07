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
	if (event.which != LEFTMOUSE) {
		return;
	}

	if (event.clientX < WIDTHCONTAINER) return;
	intersects = rayCast(event.clientX, event.clientY, objects);
	ptDown = [event.clientX, event.clientY];
	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 2.1:
			if (activeCtrl != undefined) {
				var objInt = getClosestIntersected();
				if (objInt != undefined) {
					activeCtrl.mouseDown(event, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					activeCtrl.mouseDown(event);
				}
			}

			break;
		case 2.2:
			break;
		case 5:
			if (gConnMethod != undefined) {
				if (objInt != undefined) {
					gConnMethod.mousedown(event, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					gConnMethod.mousedown(event);
				}
			}
			break;
	}
}

function onMouseMoveStep(event) {
	if (gSticky == false) {
		if (event.which != LEFTMOUSE) {
			return;
		}
		if (ptDown.length == 0) return;
		if (event.clientX < WIDTHCONTAINER) return;

		intersects = rayCast(event.clientX, event.clientY, objects);
		var objInt = getClosestIntersected();
	}

	var ptMove = [event.clientX, event.clientY];
	event.ptDown = ptDown;
	event.ptMove = ptMove;

	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 2.1:
			if (activeCtrl != undefined) {
				if (objInt != undefined) {
					activeCtrl.mouseMove(event, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					activeCtrl.mouseMove(event);
				}
			}
			break;
		case 2.2:
			break;
		case 5:
			if (gConnMethod != undefined) {
				if (objInt != undefined) {
					gConnMethod.mousemove(event, objInt.object, objInt.point.clone(), objInt.face.normal);
				}
			}
			break;
	}
}

function onMouseUpStep(event) {
	if (event.which != LEFTMOUSE) {
		return;
	}

	if (event.clientX < WIDTHCONTAINER) return;
	intersects = rayCast(event.clientX, event.clientY, objects);
	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 2.1:
			if (event.which == LEFTMOUSE) {
				if (activeCtrl != undefined) {
					activeCtrl.mouseUp(event);
				}
			}
			break;
		case 5:
			if (gConnMethod != undefined) {
				// if (objInt != undefined) {
				gConnMethod.mouseup(event); //, objInt.object, objInt.point.clone(), objInt.face.normal);
				// }
			}
			break;
	}

	if (gSticky == false) {
		ptDown = [];
	}
}