
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
document.addEventListener('mousedown', onMouseDownStep, false);
document.addEventListener('mousemove', onMouseMoveStep, false);
document.addEventListener('mouseup', onMouseUpStep, false);

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
	var activeAction = getActiveAction();

	switch (gStep) {
		case 1:
			for (var i = gAccessSel.length - 1; i >= 0; i--) {
				gAccessSel[i].mousedown(e);
			}
			break;
		case 2:
			if (activeAction != undefined) {
				var objInt = intersects[0];
				if (objInt != undefined) {
					activeAction.mousedown(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					activeAction.mousedown(e);
				}
			}

			break;
		case 3:
			if (gCurrAdapt != undefined && gCurrAdapt.mousedown != undefined) {
				gCurrAdapt.mousedown(e);
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

	var activeAction = getActiveAction();

	switch (gStep) {
		case 1:
			for (var i = gAccessSel.length - 1; i >= 0; i--) {
				gAccessSel[i].mousemove(e);
			}
			break;
		case 2:
			if (activeAction != undefined) {
				if (objInt != undefined) {
					activeAction.mousemove(e, objInt.object, objInt.point.clone(), objInt.face.normal);
				} else {
					activeAction.mousemove(e);
				}
			}
			break;
		case 3:
			if (gCurrAdapt != undefined && gCurrAdapt.mousemove != undefined) {
				gCurrAdapt.mousemove(e); //, objInt.object, objInt.point.clone(), objInt.face.normal);
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
	var activeAction = getActiveAction();

	switch (gStep) {
		case 1:
			for (var i = gAccessSel.length - 1; i >= 0; i--) {
				gAccessSel[i].mouseup(e);
			}
			break;
		case 2:
			if (e.which == LEFTMOUSE && activeAction.mouseup != undefined) {
				if (activeAction != undefined) {
					activeAction.mouseup(e);
				}
			}
			break;
		case 3:
			if (gCurrAdapt != undefined && gCurrAdapt.mouseup != undefined) {
				gCurrAdapt.mouseup(e); //, objInt.object, objInt.point.clone(), objInt.face.normal);
			}
			break;
		case 5:
			if (gCurrAttach != undefined && gCurrAttach.mouseup != undefined) {
				gCurrAttach.mouseup(e);
			}
			break;
	}

	if (gSticky == false) {
		ptDown = [];
	}
}