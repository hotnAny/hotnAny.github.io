function setAttachmentMethod() {
	checkInitialization();
	attachmentMethod = controlPanel.dd3.value;
	// console.log(attachmentMethod);

	if(attachmentMethod == INTERLOCK) {
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

function makeItPrintable() {
	checkInitialization();

	if(attachmentMethod == ADHERE) {
		if(makeAdherePrintable(objStatic) == true) {
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
		
	} else if(attachmentMethod == INTERLOCK) {
		savePrintObj();
	}
}