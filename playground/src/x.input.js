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

	if (gVoxelGrid == undefined) {
		return;
	}

	// gMouseDown = true;
	gMousePrev = XAC.hitPoint(e, [gGround]);

	if (e.shiftKey) {
		gVoxelSelected = XAC.hitObject(e, gVoxelGrid.voxels);
		if (gVoxelSelected != undefined) {
			gMedialAxis.addNode(gMousePrev, gGlue);
			// snapVoxelToMediaAxis(gVoxelSelected.index[0], gVoxelSelected.index[1], gVoxelSelected.index[2], gMedialAxis, 10);
			gGlue = true;
		}
	}

}

function onMouseMove(e) {
	// if (gMouseDown) {
	// 	if (gVoxelSelected != undefined) {
	// 		var mouseCurr = XAC.hitPoint(e, [gGround]);
	// 		gVoxelSelected = gMedialAxis.updateNode(gVoxelSelected, mouseCurr);
	// 		gMouseDragged = true;
	// 	}
	// }
}

function onMouseUp(e) {
	// if (gMouseDragged) {
	// 	updateVoxels(gVoxelGrid, DIMVOXEL, gMedialAxis);
	// }
	// gMouseDown = false;
}

function onKeyDown(e) {
	switch (e.keyCode) {
		case 13: // ENTER
			gMedialAxis.snapVoxelGrid(gVoxelGrid);
			gVoxelGrid.hide();
		case 27: // ESC
			gGlue = false;
			break;
	}
}