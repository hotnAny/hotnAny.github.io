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
	event.preventDefault();

	// controlPanel.log(objects);

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
		if(idx < 0) {
			selected.push(obj);
			obj.material.color.setHex(colorSelected);
		}
	}

	isMouseDown = true;
}

function onMouseMove( event ) {
	event.preventDefault();

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
					obj.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(tx, 0, tz ) );
					// console.log(tx + ", " + tz);

					obj.position.x = intersects[0].point.x;
					obj.position.z = intersects[0].point.z;

				} else if (event.button == 2){
					obj.position.y = -intersects[0].point.z;
				}

				// obj.geometry.dynamic = true;
				
			}
		}
	}
	
}

function onMouseUp( event ) {
	event.preventDefault();
	isMouseDown = false;

	// detectCollision(objects[0], objects[1]);
}

