/**
 * mouse event handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var partSel = new PartSelection();

document.addEventListener('mousedown', onMouseDownStep, false);
document.addEventListener('mousemove', onMouseMoveStep, false);
document.addEventListener('mouseup', onMouseUpStep, false);

function onMouseDownStep(event) {
	if (event.clientX < WIDTHCONTAINER) return;

	switch (gStep) {
		case 2.1:
			if (event.which == LEFTMOUSE && intersects.length > 0) {

				// find the object closest to the camera
				var objInt = undefined;
				var distObj = INFINITY;
				for (var i = intersects.length - 1; i >= 0; i--) {
					if (intersects[i].distance < distObj) {
						distObj = intersects[i].distance;
						objInt = intersects[i];
					}
				}

				partSel.cast(objInt.object, objInt.point.clone(), objInt.face.normal.clone(), partSel.FINGER);
			}

			break;
		case 2.2:
			break;
	}
}

function onMouseMoveStep(event) {
	if (event.clientX < WIDTHCONTAINER) return;

	switch (gStep) {
		case 2.1:
			break;
		case 2.2:
			break;
	}
}

function onMouseUpStep(event) {
	if (event.clientX < WIDTHCONTAINER) return;

	switch (gStep) {
		case 2.1:
			if (event.which == LEFTMOUSE && partSel.part != undefined) {
				gPartsCtrls[gCurrPartCtrl.attr('pcId')].obj = partSel.obj;

				var parts = gPartsCtrls[gCurrPartCtrl.attr('pcId')].parts;

				var tagName = 'Part ' + gPartSerial;//(Object.keys(parts).length + 1);
				var lsParts = $(gCurrPartCtrl.children()[0]); //.attr('lsParts');

				var tag = lsParts.tagit('createTag', tagName);

				parts[tagName] = partSel.part;
				gPartSerial += 1;

				triggerUI2ObjAction(tag, FOCUSACTION);

				partSel.clear();
			}
			break;
		case 2.2:
			break;
	}
}