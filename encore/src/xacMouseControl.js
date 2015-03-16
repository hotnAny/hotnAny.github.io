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

/* for ADHERE */
var angleToRotate;
var axisToRotate;

/* for INTERLOCK */
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

// for strapping
var strokePoints = [];

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

// var _vector = new THREE.Vector3,
// 	projector = new THREE.Projector(),
// 	selected_block, mouse_position = new THREE.Vector3, block_offset = new THREE.Vector3, _i, _v3 = new THREE.Vector3, intersect_plane;


function onMouseDown( event ) {
	// event.preventDefault();

	// TODO: fix the hardcoding
	if(event.clientX < 256) return;

	// usingPhysics = false;
	controlPanel.checkbox3.checked = usingPhysics;

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

		// TODO: standardize the color
		if(attachmentMethod != undefined) {
			addATriangle(va, vb, vc, 0x0000ff);	
		}

		if(attachmentMethod == ADHERE && staticObjLocked == true) {

			// TODO reset collected marks

			/* ----------------------------------------------------------------------------- 
				for debugging neighbor finding
			*/
			// var radiusHandle = 5;

			faceSelected.push(f);
			
			// var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
			// neighbors = [f]; // need to check if this f is out of bound
			// findNeighbors(obj, f, ctr, radiusHandle * 1.5, neighbors);
			
			/* ----------------------------------------------------------------------------- */



			/* -----------------------------------------------------------------------------
				for debugging flatness assessment
			*/

			// var nmlStats = assessFlatness(obj, neighbors);
			// var nmlSd = nmlStats.sd;
			// console.log("normal sd: " + nmlStats.sd);

			// addALine(ctr, new THREE.Vector3().addVectors(ctr, nmlStats.mean.clone().multiplyScalar(2)), 0x0000ff);

			/* ----------------------------------------------------------------------------- */



			/* ----------------------------------------------------------------------------- 
				for debugging occlusion assessment
			*/
			// var percUnsup = assessStability(obj, neighbors, radiusPrinthead);
			// console.log("percentage unsupported: " + percUnsup);

			/* ----------------------------------------------------------------------------- */



			/* ----------------------------------------------------------------------------- 
				TODO: rethink about it

				for debugging occlusion assessment
			*/
			// var yUp = new THREE.Vector3(0, 1, 0);
			// angleToRotate = nmlStats.mean.angleTo(yUp);
			// axisToRotate = new THREE.Vector3().crossVectors(nmlStats.mean, yUp).normalize();

			// // var objWithVisual = new THREE.Object3D();
			// // obj.rotateOnAxis(axisToRotate, angleToRotate);
			// var theta = 15 * Math.PI / 180;
			// var percOccl = assessOcclusion(obj, neighbors, axisToRotate, angleToRotate, theta);
			// console.log("percentage occluded: " + percOccl);
			/* ----------------------------------------------------------------------------- */

		} else if(attachmentMethod == STRAP) {
			strokePoints = [];
		}

		var idx = selected.indexOf(obj);
		if(idx < 0 && (obj.isStatic != true || staticObjLocked == false)) {
			selected.push(obj);
			obj.material.color.setHex(colorSelected);
			controlPanel.slider1.value = obj.rotation.x * 180 / Math.PI;
			controlPanel.slider2.value = obj.rotation.y * 180 / Math.PI;
			controlPanel.slider3.value = obj.rotation.z * 180 / Math.PI;

			addATriangle(va, vb, vc, 0x0000ff);	
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

	if(attachmentMethod == INTERLOCK) {
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
		}
	}

	else if(attachmentMethod == STRAP) {
		if(event.button == 0) {
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
				addABall(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z, 
					0xff8844, 0.5);
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

	if(obj != undefined) {
		// console.log(obj);
		if(attachmentMethod == STRAP) {

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
					if(dist > radiusHandle || v.distanceTo(ctr) > 2 * scale) {
						faceInRange = false;
						break;
					}
				}

				if(faceInRange) {
					addATriangle(vertices[0], vertices[1], vertices[2], 0xff8844);
				}

			}
			// find intersecting triangles

			// ref: http://mathworld.wolfram.com/Point-PlaneDistance.html
		}
	}
}
