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

var _vector = new THREE.Vector3,
	projector = new THREE.Projector(),
	selected_block, mouse_position = new THREE.Vector3, block_offset = new THREE.Vector3, _i, _v3 = new THREE.Vector3, intersect_plane;

function onMouseDown( event ) {
	// event.preventDefault();
	if(event.clientX < 256) return;

	// usingPhysics = false;
	// controlPanel.checkbox3.checked = usingPhysics;

	var intersects = rayCast(event.clientX, event.clientY, objects);

	// deselect selected objects
	// if(event.button == 0) {
	for(var i=0; i<selected.length; i++) {
		var obj = selected[i];		// }
		obj.material.color.setHex(colorNormal);
	}
	selected.splice(0, selected.length);
	// }
	// selecting objects
	for (var i = 0; i < intersects.length; i++) {
		var obj = intersects[i].object;

		// strokePoints = [];

		/* set orientation sliders to match the object selected */
		var idx = selected.indexOf(obj);
		if(idx < 0 && (obj.isStatic != true || staticObjLocked == false)) {
			selected.push(obj);
			// obj.material.color.setHex(colorSelected);
			controlPanel.slider1.value = obj.rotation.x * 180 / Math.PI;
			controlPanel.slider2.value = obj.rotation.y * 180 / Math.PI;
			controlPanel.slider3.value = obj.rotation.z * 180 / Math.PI;
			break;
		}


	}

	isMouseDown = true;
	// miny = INFINITY;
	// maxy = -INFINITY;
	prevGrndX = undefined;
	prevGrndZ = undefined;
}

function onMouseMove( event ) {
	// event.preventDefault();

	if(!isMouseDown) {
		return;
	}

	if(event.button == 0) {
		var intersects = rayCast(event.clientX, event.clientY, objects);
		for (var i = 0; i < intersects.length; i++) {
			miny = Math.min(intersects[i].point.y, miny);
			maxy = Math.max(intersects[i].point.y, maxy);
			strokePoints.push(intersects[i].point);
			strokeFaces.push(intersects[i].face);
		    strokes.push(addABall(intersects[i].point.x, 
		    	intersects[i].point.y, intersects[i].point.z, 
				0xff8844, 0.5));
		    // console.log("ball!")
			break;
		}
	}	

	// for (var i = 0; i < selected.length; i++) {
	// 	var obj = selected[i];
		
	// 	/* left button */
	// 	if(event.button == 0) {
	// 		var intersects = rayCast(event.clientX, event.clientY, [ground]);
	// 		if(intersects.length <= 0) {
	// 			continue;
	// 		}

	// 		// console.log(intersects[0]);
	// 		var tx = intersects[0].point.x - obj.position.x;
	// 		var tz = intersects[0].point.z - obj.position.z;
			
	// 		if(prevGrndX != undefined && prevGrndZ != undefined) {
	// 			obj.position.x += (intersects[0].point.x - prevGrndX);
	// 			obj.position.z += (intersects[0].point.z - prevGrndZ);
	// 		}
			
	// 		prevGrndX = intersects[0].point.x;
	// 		prevGrndZ = intersects[0].point.z;

	// 	} 
	// 	/* right button */
	// 	else if (event.button == 2){
			
	// 		var intersects = rayCast(event.clientX, event.clientY, [obj]);
	// 		if(intersects.length > 0) {
	// 			obj.position.y = obj.position.y * rateY + intersects[0].point.y * (1 - rateY);
	// 		} else {
	// 			var deltaScreenY = event.clientY - prevY;
	// 			obj.position.y -= rateY * deltaScreenY;
	// 		}
	
	// 	} 

	// 	// consider one object at a time
	// 	// break;
	// }

	prevX = event.clientX;
	prevY = event.clientY;
	
}

function onMouseUp( event ) {
	// event.preventDefault();

	isMouseDown = false;
	
	for(var i=0; i<selected.length; i++) {
		var obj = selected[i];		// }
		obj.__dirtyPosition = true;
		obj.__dirtyRotation = true;
	}

	// if(strokePoints.length > 0) {
	// 	computeRangesLayers(obj);
	// }	

	if(event.button == 0)
		console.log("number of stroke points: " + strokePoints.length);
}

