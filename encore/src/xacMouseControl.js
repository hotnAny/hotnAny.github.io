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

/* for visual feedback */
var visualMark;

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

	var intersects = rayCast(event.clientX, event.clientY, objects);

	// deselect selected objects
	// if(event.button == 0) {
	for(var i=0; i<selected.length; i++) {
		var obj = selected[i];		// }
		obj.material.color.setHex(colorNormal);
	}
	selected.splice(0, selected.length);

	faceSelected.splice(0, faceSelected.length);
	// }
	// selecting objects
	for (var i = 0; i < intersects.length; i++) {
		var obj = intersects[i].object;

		var f = intersects[i].face;
		var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
		var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
		var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

		var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
		var nmlFace = new THREE.Vector3().crossVectors(
						new THREE.Vector3().subVectors(vb, va),
						new THREE.Vector3().subVectors(vc, va));

		if(visualMark != undefined) {
			scene.remove(visualMark);
		}
		visualMark = addACircle(ctr, 0.5, 0xdd4411);

		var yUp = new THREE.Vector3(0, 1, 0);
		var angleMark = yUp.angleTo(nmlFace);
		var axisMark = new THREE.Vector3().crossVectors(yUp, nmlFace).normalize();
		visualMark.rotateOnAxis(axisMark, angleMark);
		visualMark.position.add(nmlFace.multiplyScalar(0.1));

		if(attachmentMethod == ADHERE && staticObjLocked == true) {
			faceSelected.push(f);
			// addATriangle(va, vb, vc, 0x0000ff);	
		} else if(attachmentMethod == STRAP) {
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
	if(attachmentMethod == STRAP) {
		if(event.button == 0 && staticObjLocked == true) {
			var intersects = rayCast(event.clientX, event.clientY, objects);
			for (var i = 0; i < intersects.length; i++) {
			// 	var obj = intersects[i].object;
			// 	var f = intersects[i].face;
			// 	var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld);
			// 	var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld);
			// 	var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld);

			// 	// addATriangle(va, vb, vc, 0x0000ff);
			// }
			strokePoints.push(intersects[i].point);
		    strokes.push(addABall(intersects[i].point.x, 
		    	intersects[i].point.y, intersects[i].point.z, 
				0xff8844, 0.5));
			break;
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
		if(attachmentMethod == STRAP && strokePoints.length > 0) {

			// find out the 'scale' of the specified cross section
			var min = new THREE.Vector3(INFINITY, INFINITY, INFINITY);
			var max = new THREE.Vector3(-INFINITY, -INFINITY, -INFINITY);
			for(var i=0; i<strokePoints.length; i++) {
				var p = strokePoints[i];
				
				min.x = Math.min(min.x, p.x);
				min.y = Math.min(min.y, p.y);
				min.z = Math.min(min.z, p.z);

				max.x = Math.max(max.x, p.x);
				max.y = Math.max(max.y, p.y);
				max.z = Math.max(max.z, p.z);
			}

			var scale = min.distanceTo(max);
			var ctr = new THREE.Vector3().addVectors(min, max).divideScalar(2);
			console.log("scale:" + scale);

			// calculate intersection plane
			var planeParams = findPlaneToFitPoints(strokePoints);
			var a = planeParams.A;
			var b = planeParams.B;
			var c = planeParams.C;
			var d = planeParams.D;
			
			// console.log(planeParams);

			/*
				for debugging the plane
			*/
			// var v0 = new THREE.Vector3(0, 0, -d/c);
			// var v1 = new THREE.Vector3(0, -d/b, 0);
			// var v2 = new THREE.Vector3(-d/a, 0, 0);

			// addATriangle(v0, v1, v2, 0xffff00);

			// find intersecting triangles
			// ref: http://mathworld.wolfram.com/Point-PlaneDistance.html
			for(var i=0; i<obj.geometry.faces.length; i++) {
				var f = obj.geometry.faces[i];

				var indices = [f.a, f.b, f.c];
				var vertices = [];
				var faceInRange = true;
				for(var j=0; j<indices.length; j++) {
					var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
					vertices.push(v);
					var dist = Math.abs(a*v.x + b*v.y + c*v.z + d) / Math.sqrt(a*a + b*b + c*c);

					/*
						for faces to be included they need to be
							1) close to the cutting plane
							2) close to the firstly selected points
					*/
					if(dist > radiusHandle * 2 || v.distanceTo(ctr) > 2 * scale) {
						faceInRange = false;
						break;
					}
				}

				if(faceInRange) {
					facesToStrapOn.push(f);
					// verticesToStrapOn.push(addATriangle(vertices[0], vertices[1], vertices[2], 0xff8844));
					verticesToStrapOn.push(vertices);
				}

			}

			for (var i = 0; i < strokes.length; i++) {
				scene.remove(strokes[i]);
			}
			
			analyzeStrapMethod(obj, facesToStrapOn);
		}
	}
}
