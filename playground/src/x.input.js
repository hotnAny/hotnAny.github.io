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
	gMouseDown = true;
	gMousePrev = hitPoint(e, [gGround]);

	gVoxelSelected = hitObject(e, gVoxels);

	// TODO: avoid adding redundant nodes
	if (gVoxelSelected != undefined) {
		
		// TEMP
		// if(tSnapMode) {
		// 	snapVoxelToMediaAxis(gVoxelSelected.index[0], gVoxelSelected.index[1], gVoxelSelected.index[2], gma, 10);
		// 	return;
		// }

		gma.addNode(gVoxelSelected, gGlue);
		// snapVoxelToMediaAxis(gVoxelSelected.index[0], gVoxelSelected.index[1], gVoxelSelected.index[2], gma, 10);
		gGlue = true;
	}

}

function onMouseMove(e) {
	if(gMouseDown) {
		// var node = hitObject(e, gma.nodes);
		if(gVoxelSelected != undefined) {
			var mouseCurr = hitPoint(e, [gGround]);
			// addABall(mouseCurr);
			// var dPos = new THREE.Vector3().subVectors(mouseCurr, gMousePrev);
			gVoxelSelected = gma.updateNode(gVoxelSelected, mouseCurr);
			// gMousePrev = mouseCurr;
		}
	}
}

function onMouseUp(e) {
	gMouseDown = false;
}

function onKeyDown(e) {
	switch(e.keyCode) {
		case 13: // ENTER
			// snapToMedialAxis(gVoxelGrid, gma, 10);
			// tSnapMode = true;
		case 27: // ESC
			gGlue = false;
			snapVoxelGridToMedialAxis(gVoxelGrid, gma, DIMVOXEL);
			break;
	}
}

