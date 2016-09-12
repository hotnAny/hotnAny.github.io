/* 
 *	parameters for the trackball control library
 */

controls.rotateSpeed = 5.0;
controls.zoomSpeed = 0.5;
controls.panSpeed = 2;

controls.noZoom = false;
controls.noPan = true;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

/*
 *	object manipulation
 */

var isMouseDown = false;
var isMouseDownOnObject = false;

/* for visual feedback */
var visualMarks = [];

/* for ADHERE */
var angleToRotate;
var axisToRotate;

/* for general manipulation */
var downX;
var downY;

var prevX;
var prevY;
var prevZ;

var rateY = 0.9;
var rateXZ = 0.9;

var rateRot = 0.1;

var prevGrndX;
var prevGrndZ;

document.addEventListener( 'mousedown', onMouseDown, false );
document.addEventListener( 'mousemove', onMouseMove, false );
document.addEventListener( 'mouseup', onMouseUp, false );


/*
 *	function for performing raycasting
 */
function rayCast(x, y, objs) {
	var rayCaster = new THREE.Raycaster();
	var vector = new THREE.Vector3();
	vector.set( ( x / window.innerWidth ) * 2 - 1, - ( y / window.innerHeight ) * 2 + 1, 0.5 );
	var projector = new THREE.Projector();
	projector.unprojectVector( vector, camera );
	// controlPanel.log(vector);
	// vector.unproject( camera );
	rayCaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );
	return rayCaster.intersectObjects( objs );
}


function onMouseDown( event ) {
	// event.preventDefault();

	// TODO: fix the hardcoding
	if(event.clientX < 256) return;

	controlPanel.checkbox3.checked = usingPhysics;

	downX = event.clientX;
	downY = event.clientY;

	// need to click on an object to stroke
	isMouseDownOnObject = false;
	var intersects = rayCast(event.clientX, event.clientY, objects);

	// deselect selected objects
	// if(event.button == 0) {
	for(var i=0; i<selected.length; i++) {
		var obj = selected[i];		// }
		obj.material.color.setHex(colorNormal);
	}
	selected.splice(0, selected.length);

	/* deal with multiple selection */
	if(intersects.length > 0) {
		if(isKeyHeld && lastPressedKey == CMDKEYCODE) {
			
		} else {
			for (var i = 0; i < visualMarks.length; i++) {
				scene.remove(visualMarks[i]);
			}
			visualMarks.splice(0, visualMarks.length);
			facesSelected.splice(0, facesSelected.length);
		}
	}
	

	// selecting objects
	for (var i = 0; i < intersects.length; i++) {
		isMouseDownOnObject = true;

		var obj = intersects[i].object;

		var f = intersects[i].face;
		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
		var nmlFace = new THREE.Vector3().crossVectors(
						new THREE.Vector3().subVectors(vb, va),
						new THREE.Vector3().subVectors(vc, va));

		
		// visualMarks.push(addABall(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z, 
			// 0xffffff, 1));

		if(attachmentMethod == ADHERE && staticObjLocked == true) {
			f.actualPoint = intersects[i].point;
			facesSelected.push(f);
			// addATriangle(va, vb, vc, 0x0000ff);	
		} else if(attachmentMethod == STRAP || attachmentMethod == ADHESIVE) {
			f.actualPoint = intersects[i].point;
			facesSelected.push(f);
			strokePoints = [];
			// facesToStrapOn = [];
			// verticesToStrapOn = [];
		}

		var idx = selected.indexOf(obj);
		if(idx < 0 && (obj.isStatic != true || staticObjLocked == false)) {
			selected.push(obj);
			obj.material.color.setHex(colorSelected);
			controlPanel.slider1.value = obj.rotation.x * 180 / Math.PI;
			controlPanel.slider2.value = obj.rotation.y * 180 / Math.PI;
			controlPanel.slider3.value = obj.rotation.z * 180 / Math.PI;

			// addATriangle(va, vb, vc, 0x0000ff);	
			break;
		}
	}

	isMouseDown = true;
	prevGrndX = undefined;
	prevGrndZ = undefined;
}

function onMouseMove( event ) {
	// event.preventDefault();

	if(!isMouseDown) {
		return;
	}

	// var intersects = rayCast(event.clientX, event.clientY, [ground]);

	// if(attachmentMethod == INTERLOCK) {
	for (var i = 0; i < selected.length; i++) {
		var obj = selected[i];
		
		/* 
			for interlocking, positioning the objects 
		*/
		
		/* left button */
		if(event.button == 0) {
			var intersects = rayCast(event.clientX, event.clientY, [ground]);
			if(intersects.length <= 0) {
				continue;
			}

			var tx = intersects[0].point.x - obj.position.x;
			var tz = intersects[0].point.z - obj.position.z;

			if(prevGrndX != undefined && prevGrndZ != undefined) {
				obj.position.x += (intersects[0].point.x - prevGrndX);
				obj.position.z += (intersects[0].point.z - prevGrndZ);
			}
			
			prevGrndX = intersects[0].point.x;
			prevGrndZ = intersects[0].point.z;

		}

		/* right button */
		else if (event.button == 2){
			
			/* approach 1: use mouse coordinates */
			// if(prevY != undefined) {
			// 	var deltaScreenY = event.clientY - prevY;
			// 	obj.position.y -= rateY * deltaScreenY;
			// }

			/* approach 2: use object's y */
			var intersects = rayCast(event.clientX, event.clientY, [obj]);
			if(intersects.length > 0) {
				obj.position.y = obj.position.y * rateY + intersects[0].point.y * (1 - rateY);
			} else {
				var deltaScreenY = event.clientY - prevY;
				obj.position.y -= rateY * deltaScreenY;
			}
		}

		/* wheel */
		// else if(event.button == 1) {
		// 	var intersects = rayCast(event.clientX, event.clientY, [obj]);
		// 	// if(intersects.length > 0) {
		// 	// 	obj.rotation.x = obj.rotation.x * rateXZ + intersects[0].point.x * (1 - rateXZ);
		// 	// 	obj.rotation.z = obj.rotation.z * rateY + intersects[0].point.y * (1 - rateY);
		// 	// } else {
			
		// 	// TODO: fix this code
		// 	if(prevX != undefined && prevY != undefined) {

		// 		var offsetX = Math.abs(event.clientX - downX);
		// 		var offsetY = Math.abs(event.clientY - downY);

		// 		var dx = event.clientX - prevX;
		// 		var dy = event.clientY - prevY;

		// 		if(offsetX > 32 && offsetY > 32) {
		// 			obj.rotation.y += rateY * 0.1 * Math.sqrt(dx*dx + dy*dy);
		// 		} else if(offsetX > 32) {
		// 			obj.rotation.z += rateXZ * 0.1 * dx;
		// 		} else {
		// 			obj.rotation.x += rateXZ * 0.1 * dy;
		// 		}
		// 	}
		// }
	}
	// }

	// else 
	if(attachmentMethod == STRAP || attachmentMethod == ADHESIVE) {
		if(event.button == 0 && staticObjLocked == true) {

			for (var i = 0; i < visualMarks.length; i++) {
				scene.remove(visualMarks[i]);
			}
			visualMarks.splice(0, visualMarks.length);

			var intersects = rayCast(event.clientX, event.clientY, objects);

			if(isMouseDownOnObject) {
				for (var i = 0; i < intersects.length; i++) {
				
				// 	var obj = intersects[i].object;
				// 	var f = intersects[i].face;
				// 	var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
				// 	var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
				// 	var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

				// 	// addATriangle(va, vb, vc, 0x0000ff);
				// }

					strokePoints.push(intersects[i].point);
				  //   strokes.push(addABall(intersects[i].point.x, 
				  //   	intersects[i].point.y, intersects[i].point.z, 
						// 0xffffff, 1));
					break;
				}
			}
		}
	} 

	prevX = event.clientX;
	prevY = event.clientY;
	
}

function onMouseUp( event ) {
	// event.preventDefault();

	isMouseDown = false;

	var obj;
	var intersects = rayCast(event.clientX, event.clientY, objects);
	for(var i=0; i<intersects.length; i++) {
		obj = intersects[i].object;		// }
		obj.__dirtyPosition = true;
		obj.__dirtyRotation = true;

		break;
	}

	// TODO make the conditional loogic consistent
	if(obj != undefined && event.button == 0) {
		// console.log(obj);
		if((attachmentMethod == STRAP || attachmentMethod == ADHESIVE) && strokePoints.length > 0) {

			gatherStrappableFaces(obj, strokePoints);

			analyzeStrapMethod(obj, facesToStrapOn);
		}
	}
}
