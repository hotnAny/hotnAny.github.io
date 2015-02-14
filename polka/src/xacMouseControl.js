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

var rateY = 0.5;
var rateXZ = 0.9;

var rateRot = 0.1;

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

	usingPhysics = false;
	controlPanel.checkbox3.checked = usingPhysics;

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

		var idx = selected.indexOf(obj);
		if(idx < 0 && obj.isStatic != true) {
			selected.push(obj);
			obj.material.color.setHex(colorSelected);
		}
	}

	isMouseDown = true;
}

function onMouseMove( event ) {
	// event.preventDefault();

	if(!isMouseDown) {
		return;
	}

	var intersects = rayCast(event.clientX, event.clientY, [ground]);

	if(D_MOUSE) {
		if(intersects.length == 1) {
			ball.position.x = intersects[0].point.x;
			ball.position.z = intersects[0].point.z;
		}
	} else {
		// move selected objects
		if(intersects.length == 1) {
			for (var i = 0; i < selected.length; i++) {
				var obj = selected[i];
				if(event.button == 0) {
					var tx = intersects[0].point.x - obj.position.x;
					var tz = intersects[0].point.z - obj.position.z;
					// obj.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(tx, 0, tz ) );
					// console.log(tx + ", " + tz);

					rateXZ = Math.min(1.0, Math.max(Math.abs(obj.position.x - intersects[0].point.x), 
						Math.abs(obj.position.z - intersects[0].point.z)) / 100);
					obj.position.x = obj.position.x * rateXZ + intersects[0].point.x * (1 - rateXZ);
					obj.position.z = obj.position.z * rateXZ + intersects[0].point.z * (1 - rateXZ);

				} else if (event.button == 2){
					// obj.position.y = -intersects[0].point.z;
					if(prevY != undefined) {
						var deltaScreenY = event.clientY - prevY;
						obj.position.y -= rateY * deltaScreenY;
					}
				} else if (event.button == 1) {
					if(prevX != undefined && prevY != undefined) {
						obj.rotation.x += (event.clientY - prevY) * rateRot;
						obj.rotation.z += (event.clientX - prevX) * rateRot;
					}
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
	
	for(var i=0; i<selected.length; i++) {
		var obj = selected[i];		// }
		obj.__dirtyPosition = true;
		obj.__dirtyRotation = true;
	}
}

