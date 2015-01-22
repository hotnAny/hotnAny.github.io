var ts = new Date().getTime();

function timeStamp() {
	var now = new Date().getTime();
	var elapsed = now - ts;
	ts = now;
	return elapsed;
}

function timeElapsed(t) {
	var now = new Date().getTime();
	return now - t;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function log(msg) {
	controlPanel.log(msg);
}

function toggleOctreeVisibility() {
	// controlPanel.log("showing/hiding octree visibility ...");
	octree.setVisibility(controlPanel.checkbox2.checked);

	for(var i=0, len=octreesProj.length; i<len; i++) {
		octreesProj[i].setVisibility(controlPanel.checkbox2.checked);
	}
}

function toggleDebugMode() {

	/*
		no need to display all of it
	*/

	// D_INTERSECTION = controlPanel.checkbox1.checked;
	// if(D_INTERSECTION) {
	// 	// log("now in debug mode ...");
	// } else {
	// 	// log("out of debug mode ...");
	// 	scene.remove(balls);
	// 	scene.remove(boxes);
	// 	octree.setVisibility(false);
	// }

	// D_OVERLAP = controlPanel.checkbox1.checked;
	// if(D_OVERLAP) {
	// 	showProjections();
	// } else {
	// 	hideProjections();
	// }

	D_INTERLOCK = controlPanel.checkbox1.checked;
}

function checkInitialization() {
	if(objStatic == null) objStatic = objects[0];
	if(objDynamic == null) objDynamic = objects[1];
}

function refreshDebugView() {
	octree.setVisibility(false);
	scene.remove(balls);
	scene.remove(boxes);
	balls = new THREE.Object3D();
	boxes = new THREE.Object3D();
}

function updateDebugView() {
	scene.add(balls);
	scene.add(boxes);
}

function togglePhysics() {
	usingPhysics = controlPanel.checkbox3.checked;

	if(usingPhysics) {
		scene.simulate();
	} 
}

function surfaceSubdivision() {
	controlPanel.label4.innerHTML = controlPanel.slider1.value + "%";
	// console.log(controlPanel.slider1.value);
	for(var i=0; i<selected.length; i++) {
		subDivide(selected[i], controlPanel.slider1.value / 100.0);
		console.log(controlPanel.slider1.value / 100.0);
	}
}