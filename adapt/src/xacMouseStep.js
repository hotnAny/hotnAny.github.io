/**
 * mouse event handlers for the operation in the various steps
 *
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

// var selSphere = new SelectionSphere();
var selShadow = new SelectionShadow();

document.addEventListener('mousedown', onMouseDownStep, false);
document.addEventListener('mousemove', onMouseMoveStep, false);
document.addEventListener('mouseup', onMouseUpStep, false);

function onMouseDownStep(event) {
	switch (gStep) {
		case 2.1:
			// if(intersects.length > 0) {
			// 	console.log(intersects[0].point);
			// 	selSphere.update(intersects[0].point, 2);
			// 	selSphere.show();
			// } else {
			// 	selSphere.hide();
			// }

			if (intersects.length > 0) {
				// console.log(intersects[0]);
				selShadow.cast(intersects[0].object, intersects[0].point.clone(), intersects[0].face.normal.clone(), selShadow.FINGER);
			}

			break;
		case 2.2:
			break;
	}
}

function onMouseMoveStep(event) {
	switch (gStep) {
		case 2.1:
			break;
		case 2.2:
			break;
	}
}

function onMouseUpStep(event) {
	switch (gStep) {
		case 2.1:
			// selSphere.hide();
			break;
		case 2.2:
			break;
	}
}