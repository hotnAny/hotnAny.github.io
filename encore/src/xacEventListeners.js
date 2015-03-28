function setAttachmentMethod() {

	checkInitialization();
	attachmentMethod = controlPanel.dd3.value;
	// console.log(attachmentMethod);

	if(attachmentMethod == ADHERE) {
		createNeighborList(objStatic);
		computeCtrOfMass(objStatic);
	} else if(attachmentMethod == STRAP) {
		createNeighborList(objStatic);
		computeCtrOfMass(objStatic);
	} else if(attachmentMethod == INTERLOCK) {
		for(var i=0; i<objects.length; i++) {
			if(objects[i].isStatic == false) {
				scene.add(objects[i]);
			}

			if(objects[i].isVoxelized == false) {
				voxelizeObject(objects[i]);
			}
		}
	}
}

function analyze() {
	checkInitialization();

	if(attachmentMethod == ADHERE) {
		analyzeAdhereMethod();
	} else if(attachmentMethod == STRAP) {
		analyzeStrapMethod(objStatic, facesToStrapOn);
	} else if(attachmentMethod == INTERLOCK) {
		
	}
}

function makeItPrintable() {
	checkInitialization();

	if(attachmentMethod == ADHERE) {
		if(makeAdherePrintable(objStatic, faceSelected[0]) == true) {
			makeSupport(objStatic);
		}
	} else if(attachmentMethod == STRAP) {
		makeStrapPrintable(objStatic);
	} else if(attachmentMethod == INTERLOCK) {
		makeInterlockPrintable();
	}
}

function saveObjects() {
	checkInitialization();

	if(attachmentMethod == ADHERE) {
		saveAdhereObjects();
	} else if(attachmentMethod == STRAP) {
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
