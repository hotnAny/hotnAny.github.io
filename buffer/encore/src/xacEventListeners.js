function setAttachmentMethod() {

	checkInitialization();
	attachmentMethod = controlPanel.dd3.value;
	// console.log(attachmentMethod);

	if(attachmentMethod == ADHERE) {
		createNeighborList(objStatic, radiusAdhereHandle);
		computeCtrOfMass(objStatic);
	} else if(attachmentMethod == STRAP || attachmentMethod == ADHESIVE) {
		createNeighborList(objStatic, radiusHandleStrap);
		computeCtrOfMass(objStatic);
	} else if(attachmentMethod == INTERLOCK) {
		// scene.remove(objStatic);
		// generateSupport(objStatic, objDynamic)
		for(var i=0; i<objects.length; i++) {
			if(objects[i].isVoxelized == false) {
				voxelizeObject(objects[i]);
			}
		}

		// generateSupport(objStatic, objDynamic);
	}
}

function analyze() {
	checkInitialization();

	if(attachmentMethod == ADHERE) {
		analyzeAdhereMethod();
	} else if(attachmentMethod == STRAP) {
		// analyzeStrapMethod(objStatic, facesToStrapOn);
		gatherStrappableFaces(objStatic, strokePoints);
		analyzeStrapMethod(objStatic, facesToStrapOn);
	} else if(attachmentMethod == INTERLOCK) {
		
	}
}

function makeItPrintable() {
	checkInitialization();

	if(attachmentMethod == ADHERE) {
		if(makeAdherePrintable(objStatic, facesSelected) == true) {
			// should do this
			if(EVALUATIONMODE == false) {
				makeSupport(objStatic);
			}

			// do this instead for the eval
			// makeMarkers(objStatic);
		}
	} else if(attachmentMethod == STRAP || attachmentMethod == ADHESIVE) {
		makeStrapPrintable(objStatic, facesSelected[0]);
	} else if(attachmentMethod == INTERLOCK) {
		makeInterlockPrintable();
	}

	// clean up
	for (var i = 0; i < visualMarks.length; i++) {
		scene.remove(visualMarks[i]);
	}
	visualMarks.splice(0, visualMarks.length);

}

function saveObjects() {
	checkInitialization();

	if(attachmentMethod == ADHERE) {
		saveAdhereObjects();
	} else if(attachmentMethod == STRAP || attachmentMethod == ADHESIVE) {
		saveStrapObjects();
	} else if(attachmentMethod == INTERLOCK) {
		savePrintObj();
	}
}


function adjustAttachabilityWeight() {
	wAttachability = controlPanel.slider4.value / 100;
	analyze();
}


function adjustUsabilityWeight() {
	wUsability = controlPanel.slider5.value / 100;
	analyze();
}


function adjustStrengthWeight() {
	wStrength = controlPanel.slider6.value / 100;
	analyze();
}


function updateAllWeightSliders() {
	controlPanel.slider4.value = wocc * 100;
	controlPanel.slider5.value = wfla * 100;
	controlPanel.slider6.value = wsta * 100;
}
