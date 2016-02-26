/**
 * user interface for Adapt
 * 	- only the UI part
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var gPartCtrlId = 0; // global id for part-control
var gAdaptId = 0; // global id for adaptations
var gConnId = 0; // global id for connectors

//
// Helper functions
//
var _genSectionBar = function(text) {
	var sectionBar = $('<span class="ui-corner-all" style="padding:4px 15px 4px 15px;margin-left:10px;background-color:#878787;color:#ffffff;display: block; float: left; clear: left; width: 340px;"></span>');
	sectionBar.append('<b>' + text + '</b>');
	return sectionBar;
}


var container = $('<div></div>');
container.css('width', WIDTHCONTAINER + 'px');
container.css('height', '100%');
container.css('color', '#000000');
container.css('background-color', 'rgba(192, 192, 192, 0.5)');
container.css('top', '0px');
container.css('position', 'absolute');
container.css('font-family', 'Helvetica');
container.css('font-size', '12px');
container.css('overflow', 'auto');

var title = $('<h3></h3>');
title.html('ADAPT');
title.css('margin-top', '10px');
title.css('margin-bottom', '10px');
title.css('margin-left', '10px');
title.css('margin-right', '10px');
// container.append(title);

var panels = $('<div></div>');
panels.append('<br/>');

//
//	Step 1 - Geometry & Measurement
//
panels.append(_genSectionBar('Geometry & Measurement'));
var geomMeas = $('<table class="ui-step-area" cellspacing="10"></table>');

// 1.1	the buttons for different geometry options
var trButtons = $('<tr></tr>');
var divButtons = $('<div align="center"></div>');
var btnUpload = $('<input type="radio" id="rdUpload" name="radio"><label for="rdUpload">Upload Models</label>');
divButtons.append(btnUpload);
var btnShape = $('<input type="radio" id="rdShape" name="radio"><label for="rdShape">Use Simple Shapes</label>');
divButtons.append(btnShape);
var btnLibrary = $('<input type="radio" id="rdLibrary" name="radio"><label for="rdLibrary">From Library</label>');
divButtons.append(btnLibrary);

var optS1 = gup('s1', window.location.href);
var btnOptStartup = btnShape;
switch (optS1) {
	case 'upload':
		btnOptStartup = btnUpload;
		break;
	case 'shape':
		btnOptStartup = btnShape;
		break;
	case 'library':
		btnOptStartup = btnLibrary;
		break;
}
btnOptStartup.attr('checked', 'checked');


divButtons.buttonset();

trButtons.append(divButtons);
geomMeas.append(trButtons);

// 1.2	the area that shows UI for a selected option
var trSelectArea = $('<tr></tr>');
geomMeas.append(trSelectArea);

// 1.2.1	upload
var tblDropZone = $('<table align="center" cellspacing="10" table width="100%"></table>');
tblDropZone.append('<tr><td><div id="dropZone" align="center" class="ui-widget ui-corner-all ui-step-area" style="width: 95%; height: 50px; line-height: 50px; border-style: dotted; border-width: 2px;"><div>Drop .stl models here.</div></div></td></tr>');

// 1.2.2	simple shapes
var tblShapeOptions = $('<table align="center" cellspacing="10"></table>');
tblShapeOptions.append('<td><button id="btnCylinder" height="50px"><img height="50px" src="./misc/cylinder.png"/></button></td>');
tblShapeOptions.append('<td><button id="btnPrism" height="50px"><img height="50px" src="./misc/prism.png"/></button></td>');
tblShapeOptions.append('<td><button id="btnPlane" height="50px"><img height="50px" src="./misc/plane.png"/></button></td>');
trSelectArea.append(tblShapeOptions);

// 1.2.3	library
// TODO: implement this

panels.append(geomMeas);
panels.append('<br/><br/>');


//
//	Step 2 - Parts & Controls
//
panels.append(_genSectionBar('Parts & Controls'));
var partsCtrls = $("<table class='ui-step-area' cellspacing='10'></table>");

// 2.1	a table of specified parts & controls
var trPartsCtrlsList = $('<tr></tr>');
var tblPartsCtrls = $('<table width="100%"></table>');
tblPartsCtrls.rows = [];
trPartsCtrlsList.append(tblPartsCtrls);
partsCtrls.append(trPartsCtrlsList);

// 2.2	a button for adding a new parts-controls
var trAddPartsCtrls = $('<tr></tr>');
var btnAddPartsCtrls = $("<button>Add parts & controls</button>")
trAddPartsCtrls.append(btnAddPartsCtrls);
partsCtrls.append(trAddPartsCtrls);

panels.append(partsCtrls);
partsCtrls.hide();
panels.append('<br/><br/>');



//
//	Step 3 - Adaptation
//
panels.append(_genSectionBar('Adaptations'));
var adaptations = $("<table class='ui-step-area' cellspacing='10'></table>");

// 3.1	a list of added adaptations
var trAdaptations = $('<tr></tr>');
var lsAdapts = $('<ul></ul>');
// don't append until something is called to be added
adaptations.append(trAdaptations);

// 3.2	a dropdownlist of various adaptations
var trAddAdaptations = $('<tr></tr>');
var smAdapts = $('<select></select>');
smAdapts.width('128px');
smAdapts.append('<option id="noAdaptSel"> Add adaptations </option>');
smAdapts.append('<option>Enlargement</option>');
smAdapts.append('<option>Handle</option>');
smAdapts.append('<option>Lever</option>');
smAdapts.append('<option>Anchor</option>');
smAdapts.append('<option>Guide</option>');
smAdapts.append('<option>Mechanism</option>');
trAddAdaptations.append(smAdapts);
adaptations.append(trAddAdaptations);

panels.append(adaptations);
adaptations.hide();
panels.append('<br/><br/>');


//
//	Step 4 - Optimization
//
panels.append(_genSectionBar('Optimization'));
var optimization = $("<table class='ui-step-area' cellspacing='10'></table>");

// 4.1	what to optimize
var trOptim = $('<tr></tr>');
var divOptim = $('<div align="center"></div>');
divOptim.append($('<input type="checkbox" id="cbGrip"><label for="cbGrip">Grip</label>'));
divOptim.append($('<input type="checkbox" id="cbStrength"><label for="cbStrength">Strength</label>'));
divOptim.append($('<input type="checkbox" id="cbCoord"><label for="cbCoord">Coordination</label>'));
divOptim.buttonset().find('label').css('width', '30%');
optimization.append(divOptim);

// 4.2	other sliderable optimizations
var tblSldrOptim = $('<table cellspacing="5" cellpadding="5"></table>');
var trSize = $('<tr><td><label class="ui-widget">Size: </label></td><td width="200px"><div id="sldSize"></div></td></tr>');
var trAttach = $('<tr><td><label class="ui-widget">Attachability: </label></td><td width="200px"><div id="sldAttach"></div></td></tr>');
tblSldrOptim.append(trSize);
tblSldrOptim.append(trAttach);
trOptim.append(tblSldrOptim);
optimization.append(trOptim);

// 4.3	the update button
var trUpdate = $('<tr></tr>');
var btnUpdate = $('<button>Update</button>')
btnUpdate.button();
trUpdate.append(btnUpdate);
optimization.append(trUpdate);

panels.append(optimization);
optimization.hide();
panels.append('<br/><br/>');


//
//	Step 5 - Connector
//
panels.append(_genSectionBar('Connectors'));
var connectors = $("<table class='ui-step-area' cellspacing='10'></table>");

// 5.1	a list of added connectors
var trConns = $('<tr></tr>');
var lsConns = $('<ul></ul>');
// don't append until something is called to be added
connectors.append(trConns);

// 5.2 a dropdownlist of various connectors
var trAddConns = $('<tr></tr>');
var smConns = $('<select></select>');
smConns.width('128px');
smConns.append('<option id="noConnSel"> Add connectors </option>');
smConns.append('<option>Clamp</option>');
smConns.append('<option>Strap</option>');
smConns.append('<option>Bolt</option>');
smConns.append('<option>Adhesive</option>');
trAddConns.append(smConns);
connectors.append(trAddConns);

panels.append(connectors);
connectors.hide();
panels.append('<br/><br/>');


//
//	Final step - export
//
var btnExport = $('<button style="margin-left:10px"><b>Export models</b></button>');
btnExport.button();

panels.append(btnExport);
//
// Wrap up
//
container.append(panels);