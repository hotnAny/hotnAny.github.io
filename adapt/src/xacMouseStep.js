/**
 * mouse event handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var gPartSel = new PartSelector();

// TODO: make them jquery fashion
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
			for (var i = gAccessSel.length - 1; i >= 0; i--) {
				gAccessSel[i].mousedown(e);
			}
			break;
		case 2:
			if (activeCtrl != undefined) {
				var objInt = intersects[0];
				if (objInt != undefined) {
					activeCtrl.mouseDown(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					activeCtrl.mouseDown(e);
				}
			}

			break;
		case 3:
			if (gCurrAdapt != undefined && gCurrAdapt.mouseDown != undefined) {
				gCurrAdapt.mouseDown(e);
			}
			break;
		case 5:
			if (gCurrAttach != undefined) {
				if (objInt != undefined) {
					gCurrAttach.mousedown(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					gCurrAttach.mousedown(e);
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
		var objInt = intersects[0];
	}

	var ptMove = [e.clientX, e.clientY];
	e.ptDown = ptDown;
	e.ptMove = ptMove;

	var activeCtrl = getActiveCtrl();

	switch (gStep) {
		case 1:
			for (var i = gAccessSel.length - 1; i >= 0; i--) {
				gAccessSel[i].mousemove(e);
			}
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
		case 3:
			if (gCurrAdapt != undefined && gCurrAdapt.mouseMove != undefined) {
				gCurrAdapt.mouseMove(e); //, objInt.object, objInt.point.clone(), objInt.face.normal);
			}
			break;
		case 5:
			if (gCurrAttach != undefined) {
				if (objInt != undefined) {
					gCurrAttach.mousemove(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					gCurrAttach.mousemove(e);
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
			for (var i = gAccessSel.length - 1; i >= 0; i--) {
				gAccessSel[i].mouseup(e);
			}
			break;
		case 2:
			if (e.which == LEFTMOUSE) {
				if (activeCtrl != undefined) {
					activeCtrl.mouseUp(e);
				}
			}
			break;
		case 3:
			if (gCurrAdapt != undefined && gCurrAdapt.mouseUp != undefined) {
				gCurrAdapt.mouseUp(e); //, objInt.object, objInt.point.clone(), objInt.face.normal);
			}
			break;
		case 5:
			if (gCurrAttach != undefined) {
				// if (objInt != undefined) {
				gCurrAttach.mouseup(e); //, objInt.object, objInt.point.clone(), objInt.face.normal);
				// }
			}
			break;
	}

	if (gSticky == false) {
		ptDown = [];
	}
}