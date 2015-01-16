function detectInterlock() {
	var isInterlocking = false;
	var t0 = new Date().getTime();

	if(detectOverlap() == true) {
		findMutuallyBounded();
		if(!detectIntersection()) {
			
			isInterlocking = true;
		}
	}

	log((isInterlocking ? "" : "not") + " interlocking. found in " + timeElapsed(t0) + " msec");
	return isInterlocking;
}

function detectInterlockBetweenObjects(objD, objS) {

}