
/**
 * mouse event handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

// mouse controls
gMouseCtrls.rotateSpeed = 5.0;
gMouseCtrls.zoomSpeed = 0.5;
gMouseCtrls.panSpeed = 2;

gMouseCtrls.noZoom = false;
// gMouseCtrls.noPan = true;

gMouseCtrls.staticMoving = true;
gMouseCtrls.dynamicDampingFactor = 0.3;

var gPartSel = new PartSelector();

// TODO: make them jquery fashion
document.addEventListener('mouseDown', onMouseDownStep, false);
document.addEventListener('mouseMove', onMouseMoveStep, false);
document.addEventListener('mouseUp', onMouseUpStep, false);

// global variable of mouse down coordinates
var ptDown = [];

// whether should respond to mouse move in a sticky fashion (rather than requiring dragging)
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
				gAccessSel[i].mouseDown(e);
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
					gCurrAttach.mouseDown(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					gCurrAttach.mouseDown(e);
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
				gAccessSel[i].mouseMove(e);
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
					gCurrAttach.mouseMove(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					gCurrAttach.mouseMove(e);
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
				gAccessSel[i].mouseUp(e);
			}
			break;
		case 2:
			if (e.which == LEFTMOUSE && activeCtrl.mouseUp != undefined) {
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
			if (gCurrAttach != undefined && gCurrAttach.mouseUp != undefined) {
				gCurrAttach.mouseUp(e);
			}
			break;
	}

	if (gSticky == false) {
		ptDown = [];
	}
}