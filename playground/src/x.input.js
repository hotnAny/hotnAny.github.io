/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * mouse event handlers for the operation in the various steps
 * 
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

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

var gMouseDown = false;
var gMouseDragged = false;
var gMousePrev = undefined;
var gVoxelSelected;
var gGlue = false;

function onMouseDown(e) {
	if (e.which != LEFTMOUSE) {
		return;
	}
	gMouseDown = true;
	gMousePrev = hitPoint(e, [gGround]);

	gVoxelSelected = hitObject(e, gVoxelGrid.voxels());

	if (gVoxelSelected != undefined) {
		gMedialAxis.addNode(gVoxelSelected, gVoxelGrid, gGlue);
		// snapVoxelToMediaAxis(gVoxelSelected.index[0], gVoxelSelected.index[1], gVoxelSelected.index[2], gMedialAxis, 10);
		gGlue = true;
	}

}

function onMouseMove(e) {
	if (gMouseDown) {
		if (gVoxelSelected != undefined) {
			var mouseCurr = hitPoint(e, [gGround]);
			gVoxelSelected = gMedialAxis.updateNode(gVoxelSelected, mouseCurr);
			gMouseDragged = true;
		}
	}
}

function onMouseUp(e) {
	if (gMouseDragged) {
		updateVoxels(gVoxelGrid, DIMVOXEL, gMedialAxis);
	}
	gMouseDown = false;
}

function onKeyDown(e) {
	switch (e.keyCode) {
		case 13: // ENTER
			// snapToMedialAxis(gVoxelGrid, gMedialAxis, 10);
			// tSnapMode = true;
		case 27: // ESC
			gGlue = false;
			snapVoxelGridToMedialAxis(gVoxelGrid, gMedialAxis, DIMVOXEL);
			break;
	}
}

function hitObject(e, objs) {
	var hits = rayCast(e.clientX, e.clientY, objs);
	if (hits.length > 0) {
		return hits[0].object;
	}
	return undefined;
}

function hitPoint(e, objs) {
	var hits = rayCast(e.clientX, e.clientY, objs);
	if (hits.length > 0) {
		return hits[0].point;
	}
}