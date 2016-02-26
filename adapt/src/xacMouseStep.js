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

function onMouseDownStep(event) {
	if (event.clientX < WIDTHCONTAINER) return;

	intersects = rayCast(event.clientX, event.clientY, objects);

	ptDown = [event.clientX, event.clientY];

	switch (gStep) {
		case 2.1:
			if (event.which == LEFTMOUSE && intersects.length > 0) {
				partSel.isEngaged = true;
				partSel.isWrapping = false;
			}

			break;
		case 2.2:
			break;
	}
}

function onMouseMoveStep(event) {
	if (ptDown.length == 0) return;
	if (event.clientX < WIDTHCONTAINER) return;

	var ptMove = [event.clientX, event.clientY];
	intersects = rayCast(event.clientX, event.clientY, objects);

	switch (gStep) {
		case 2.1:
			if (partSel.isEngaged) {
				// log(getDist(ptDown, ptMove));
				if (partSel.isWrapping == false) {
					partSel.isWrapping = getDist(ptDown, ptMove) > partSel.MINWRAPMOUSEOFFSET;
				} else {
					var objInt = getClosestIntersected();
					if (objInt != undefined) partSel.wrap(objInt.object, objInt.point.clone());
				}
			}
			break;
		case 2.2:
			break;
	}
}

function onMouseUpStep(event) {
	if (event.clientX < WIDTHCONTAINER) return;

	intersects = rayCast(event.clientX, event.clientY, objects);
	switch (gStep) {
		case 2.1:
			if (event.which == LEFTMOUSE) {

				if (partSel.isWrapping) {
					partSel.wrap(undefined, undefined, partSel.HAND, true);
				} else {
					var objInt = getClosestIntersected();
					if (objInt != undefined) {
						// find the object closest to the camera
						partSel.cast(objInt.object, objInt.point.clone(), objInt.face.normal.clone(), partSel.FINGER);

						gPartsCtrls[gCurrPartCtrl.attr('pcId')].obj = partSel.obj;

						var parts = gPartsCtrls[gCurrPartCtrl.attr('pcId')].parts;

						var tagName = 'Part ' + gPartSerial; //(Object.keys(parts).length + 1);
						var lsParts = $(gCurrPartCtrl.children()[0]); //.attr('lsParts');

						var tag = lsParts.tagit('createTag', tagName);

						parts[tagName] = partSel.part;
						gPartSerial += 1;

						triggerUI2ObjAction(tag, FOCUSACTION);

						partSel.clear();
					}
				}
				partSel.isEngaged = false;
			}
			break;
		case 2.2:
			break;
	}

	ptDown = [];
}