var ts = new Date().getTime();

function timeStamp() {
	var now = new Date().getTime();
	var elapsed = now - ts;
	ts = now;
	return elapsed;
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

function toggleDebugMode() {
	D_INTERSECTION = controlPanel.checkbox1.checked;

	if(D_INTERSECTION) {
		log("now in debug mode ...");
	} else {
		log("out of debug mode ...");
		scene.remove(balls);
		scene.remove(boxes);
		octree.setVisibility(false);
	}
}