var controlPanel = new ControlPanel();
controlPanel.domElement.style.position = 'absolute';
controlPanel.domElement.style.top = '0px';
document.body.appendChild( controlPanel.domElement);

/* 
	control buttons 
*/
// controlPanel.button1.onclick = analyzePrintability;


controlPanel.checkbox1.onchange = toggleDebugMode;
controlPanel.dd1.onchange = loadObjToPrint;
controlPanel.button1.onclick = computeRangesLayers;

controlPanel.slider1.oninput = rotateObjectX;
controlPanel.slider2.oninput = rotateObjectY;
controlPanel.slider3.oninput = rotateObjectZ;

/* populating objects into lists */
controlPanel.dd1.appendChild(controlPanel.ddOption("-----------", undefined));
controlPanel.dd1.appendChild(controlPanel.ddOption("Teddy", teddy));
controlPanel.dd1.appendChild(controlPanel.ddOption("Wrench", wrench));
controlPanel.dd1.appendChild(controlPanel.ddOption("Mug", mug));
controlPanel.dd1.appendChild(controlPanel.ddOption("Troll", troll));
controlPanel.dd1.appendChild(controlPanel.ddOption("Head", head));
controlPanel.dd1.appendChild(controlPanel.ddOption("Cube", cube));
controlPanel.dd1.appendChild(controlPanel.ddOption("Half dome", halfdome));
controlPanel.dd1.appendChild(controlPanel.ddOption("Horse", horse));
controlPanel.dd1.onchange = loadObjToPrint;

// controlPanel.dd2.appendChild(controlPanel.ddOption("-----------", undefined));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Big ring", ring3));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Small ring", ringSmall));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Tetra", tetra));
// // controlPanel.dd2.appendChild(controlPanel.ddOption("Mesh", meshinner));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Small ball", ballInner));
// controlPanel.dd2.appendChild(controlPanel.ddOption("Heart", heart));

// controlPanel.dd2.onchange = loadExistingObj;