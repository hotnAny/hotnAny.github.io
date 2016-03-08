/**
 * mouse e handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var gPartSel = new PartSelector();

document.addEventListener('mousedown', onMouseDownStep, false);
document.addEventListener('mousemove', onMouseMoveStep, false);
document.addEventListener('mouseup', onMouseUpStep, false);

var ptDown = [];

var gSticky = false;

function onMouseDownStep(e) {
	if (e.which != LEFTMOUSE) {
		return;
	}

	if (e.clientX < WIDTHCONTAINER) return;
	intersects = rayCast(e.clientX, e.clientY, objects);
	ptDown = [e.clientX, e.clientY];
	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 1:
			gAccessSel.mousedown(e);
			break;
		case 2:
			if (activeCtrl != undefined) {
				var objInt = getClosestIntersected();
				if (objInt != undefined) {
					activeCtrl.mouseDown(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					activeCtrl.mouseDown(e);
				}
			}

			break;

		case 5:
			if (gConnMethod != undefined) {
				if (objInt != undefined) {
					gConnMethod.mousedown(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					gConnMethod.mousedown(e);
				}
			}
			break;
	}
}

function onMouseMoveStep(e) {
	if (gSticky == false) {
		if (e.which != LEFTMOUSE) {
			return;
		}
		if (ptDown.length == 0) return;
		if (e.clientX < WIDTHCONTAINER) return;

		intersects = rayCast(e.clientX, e.clientY, objects);
		var objInt = getClosestIntersected();
	}

	var ptMove = [e.clientX, e.clientY];
	e.ptDown = ptDown;
	e.ptMove = ptMove;

	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 1:
			gAccessSel.mousemove(e);
			break;
		case 2:
			if (activeCtrl != undefined) {
				if (objInt != undefined) {
					activeCtrl.mouseMove(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					activeCtrl.mouseMove(e);
				}
			}
			break;
		case 5:
			if (gConnMethod != undefined) {
				if (objInt != undefined) {
					gConnMethod.mousemove(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				}
			}
			break;
	}
}

function onMouseUpStep(e) {
	if (e.which != LEFTMOUSE) {
		return;
	}

	if (e.clientX < WIDTHCONTAINER) return;
	intersects = rayCast(e.clientX, e.clientY, objects);
	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 1:
			gAccessSel.mouseup(e);
			break;
		case 2:
			if (e.which == LEFTMOUSE) {
				if (activeCtrl != undefined) {
					activeCtrl.mouseUp(e);
				}
			}
			break;
		case 5:
			if (gConnMethod != undefined) {
				// if (objInt != undefined) {
				gConnMethod.mouseup(e); //, objInt.object, objInt.point.clone(), objInt.face.normal);
				// }
			}
			break;
	}

	if (gSticky == false) {
		ptDown = [];
	}
}