/*------------------------------------------------------------------------------------*
 *
 * mouse event handlers for the operation in the various steps
 * 
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *------------------------------------------------------------------------------------*/

gMouseCtrls.rotateSpeed = 5.0;
gMouseCtrls.zoomSpeed = 0.5;
gMouseCtrls.panSpeed = 2;

gMouseCtrls.noZoom = false;

gMouseCtrls.staticMoving = true;
gMouseCtrls.dynamicDampingFactor = 0.3;

document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('keydown', onKeyDown, false);

function onMouseDown(e) {
	if (e.which != LEFTMOUSE) {
		return;
	}
	var node = getVoxel(e, gVoxels);

	if (node != undefined) {
		gma.addNodes(node, gGlue);
		gGlue = true;
	}

}

function onMouseMove(e) {

}

function onMouseUp(e) {
	// 
}

function onKeyDown(e) {
	switch(e.keyCode) {
		case 27: // ESC
			gGlue = false;
			break;
	}
}

function getVoxel(e, voxels) {
	var objs = rayCast(e.clientX, e.clientY, voxels);
	if (objs.length > 0) {
		return objs[0].object;
	}
	return undefined;
}