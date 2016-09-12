var controlPanel = new ControlPanel();
controlPanel.domElement.style.position = 'absolute';
controlPanel.domElement.style.top = '0px';
document.body.appendChild( controlPanel.domElement);

/* 
	control buttons 
*/
// controlPanel.button1.onclick = function(){detectIntersection};

controlPanel.button2.onclick = detectIntersection;
// controlPanel.button3.onclick = detectOverlap;
controlPanel.button5.onclick = detectInterlock;
controlPanel.button6.onclick = voxelize;
controlPanel.button1.onclick = slice;
controlPanel.button8.onclick = reverseGravity;
controlPanel.button4.onclick = computeLayerToPause;
controlPanel.button7.onclick = saveObjects; //saveBothObjs;
controlPanel.button9.onclick = restoreObjects;
controlPanel.button10.onclick = makeItPrintable;
controlPanel.button11.onclick = toggleSupport;
controlPanel.button12.onclick = analyze;

controlPanel.checkbox1.onchange = toggleDebugMode;
controlPanel.checkbox2.onchange = toggleOctreeVisibility;
controlPanel.checkbox3.onchange = togglePhysics;
controlPanel.checkbox4.onchange = lockObjToPrint;

controlPanel.slider1.oninput = rotateObjectX;
controlPanel.slider2.oninput = rotateObjectY;
controlPanel.slider3.oninput = rotateObjectZ;


controlPanel.slider4.onchange = adjustAttachabilityWeight;
controlPanel.slider5.onchange = adjustUsabilityWeight;
// controlPanel.slider6.onchange = adjustStrengthWeight;

// controlPanel.slider4.onchange = analyzeAttachmentMethod();
// controlPanel.slider5.onchange = analyzeAttachmentMethod();
// controlPanel.slider6.onchange = analyzeAttachmentMethod();

/* 
	populating objects into lists 
*/
controlPanel.dd1.appendChild(controlPanel.ddOption("-----------", undefined));
// controlPanel.dd1.appendChild(controlPanel.ddOption("Key", key));
// controlPanel.dd1.appendChild(controlPanel.ddOption("Mesh", meshouter));
controlPanel.dd1.appendChild(controlPanel.ddOption("Small ring", ringSmall));
controlPanel.dd1.appendChild(controlPanel.ddOption("Bracelet", bracelet));
controlPanel.dd1.appendChild(controlPanel.ddOption("Frame", frame));
// controlPanel.dd1.appendChild(controlPanel.ddOption("Can", can));
controlPanel.dd1.appendChild(controlPanel.ddOption("Bottle", bottle));
controlPanel.dd1.appendChild(controlPanel.ddOption("Zipper pull", zipperPull));
controlPanel.dd1.appendChild(controlPanel.ddOption("Teddy", teddy));
controlPanel.dd1.appendChild(controlPanel.ddOption("Wrench", wrench));
controlPanel.dd1.appendChild(controlPanel.ddOption("Cup", cup));
controlPanel.dd1.appendChild(controlPanel.ddOption("Screw driver", screwDriver));
// controlPanel.dd1.appendChild(controlPanel.ddOption("PrintOver1", printOverBatch1));
controlPanel.dd1.appendChild(controlPanel.ddOption("Minion", minion));
controlPanel.dd1.appendChild(controlPanel.ddOption("LED", led));
controlPanel.dd1.appendChild(controlPanel.ddOption("Big handle #1", ringBig));
controlPanel.dd1.appendChild(controlPanel.ddOption("Label handle", labelRing));
controlPanel.dd1.appendChild(controlPanel.ddOption("Amex", amex));
controlPanel.dd1.appendChild(controlPanel.ddOption("Gatorade", gatorade));
controlPanel.dd1.appendChild(controlPanel.ddOption("Glue gun", gluegun));
controlPanel.dd1.appendChild(controlPanel.ddOption("Batteries", batteries));
controlPanel.dd1.appendChild(controlPanel.ddOption("Wine bottle", winebottle));
controlPanel.dd1.appendChild(controlPanel.ddOption("Teapot", teapot));
controlPanel.dd1.appendChild(controlPanel.ddOption("Small handle #2", smallHandle));
controlPanel.dd1.onchange = loadObjToPrint;

/*
	supposed to be handles
*/
controlPanel.dd2.appendChild(controlPanel.ddOption("-----------", undefined));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Big handle #1", ringBig));
controlPanel.dd2.appendChild(controlPanel.ddOption("Small handle #1", ringSmall));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Tetra", tetra));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Mesh", meshinner));
controlPanel.dd2.appendChild(controlPanel.ddOption("Small handle #2", smallHandle));
controlPanel.dd2.appendChild(controlPanel.ddOption("Magnet base", magnet));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Heart", heart));
controlPanel.dd2.appendChild(controlPanel.ddOption("Key", key));
controlPanel.dd2.appendChild(controlPanel.ddOption("Scissors", scissors));
controlPanel.dd2.appendChild(controlPanel.ddOption("Heart", heart));
controlPanel.dd2.appendChild(controlPanel.ddOption("Teapot", teapot));
controlPanel.dd2.onchange = loadExistingObj;

/*
	attachment methods
*/
controlPanel.dd3.appendChild(controlPanel.ddOption("-----------", undefined));

controlPanel.dd3.appendChild(controlPanel.ddOption("Print over", ADHERE));
controlPanel.dd3.appendChild(controlPanel.ddOption("Affix (adhesive)", ADHESIVE));
controlPanel.dd3.appendChild(controlPanel.ddOption("Affix (strap)", STRAP));
controlPanel.dd3.appendChild(controlPanel.ddOption("Interlock", INTERLOCK));

controlPanel.dd3.onchange = setAttachmentMethod;