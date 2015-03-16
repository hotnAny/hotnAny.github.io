function setAttachmentMethod() {
	attachmentMethod = controlPanel.dd3.value;
	// console.log(attachmentMethod);

	if(attachmentMethod == INTERLOCK) {
		for(var i=0; i<objects.length; i++) {
			if(objects[i].isStatic == false) {
				scene.add(objects[i]);
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
		// makeAdherePrintable();
	} else if(attachmentMethod == INTERLOCK) {
		makeInterlockPrintable();
	}
}