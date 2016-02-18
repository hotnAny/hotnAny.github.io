/**
 * user interface for Adapt
 * 	- only the UI part
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var gPartCtrlId = 0; // global id for part-control
var gAdaptId = 0; // global id for adaptations
var gConnId = 0; // global id for connectors

var icons = $("#accordion").accordion("option", "icons");

var container = $('<div></div>');
container.css('width', '388px');
container.css('height', '100%');
container.css('color', '#000000');
container.css('background-color', 'rgba(192, 192, 192, 0.5)');
container.css('top', '0px');
container.css('position', 'absolute');
container.css('font-family', 'Helvetica');
container.css('font-size', '12px');


var title = $('<h3></h3>');
title.html('ADAPT');
title.css('margin-top', '10px');
title.css('margin-bottom', '10px');
title.css('margin-left', '10px');
title.css('margin-right', '10px');
container.append(title);


var panels = $('<div></div>');


//
// Step 1 - Geometry & Measurement
//
panels.append("<h3>Geometry & Measurement</h3>");
var geomMeas = $('<div></div>');

var divButtons = $('<div></div>');

var btnUpload = $('<input type="radio" id="rdUpload" name="radio"><label for="rdUpload">Upload Models</label>');
var btnShape = $('<input type="radio" id="rdShape" name="radio"><label for="rdShape">Use Simple Shapes</label>');
var btnLibrary = $('<input type="radio" id="rdLibrary" name="radio"><label for="rdLibrary">From Library</label>');

divButtons.append(btnUpload);
divButtons.append(btnShape);
divButtons.append(btnLibrary);
divButtons.buttonset();

geomMeas.append(divButtons);

panels.append(geomMeas);


//
// Step 2 - Parts & Controls
//
panels.append("<h3>Parts & Controls</h3>");
var partsCtrls = $("<div></div>");

var tblPartsCtrls = $('<table class="display"><tbody></tbody></table>');
tblPartsCtrls.rows = [];
partsCtrls.append(tblPartsCtrls);
partsCtrls.append('<br>');

var btnAddPartsCtrls = $("<button>Add parts & controls</button>")
partsCtrls.append(btnAddPartsCtrls);

panels.append(partsCtrls);


//
// Step 3 - Adaptation
//
panels.append("<h3>Adaptation</h3>");
var adaptations = $("<div></div>");

var lsAdapts = $('<ul></ul>');
// don't append until something is called to be added

var smAdapts = $('<select></select>');
smAdapts.width('128px');
smAdapts.append('<option id="noAdaptSel"> Add adaptations </option>');
smAdapts.append('<option>Enlargement</option>');
smAdapts.append('<option>Handle</option>');
smAdapts.append('<option>Lever</option>');
smAdapts.append('<option>Anchor</option>');
smAdapts.append('<option>Guide</option>');
smAdapts.append('<option>Mechanism</option>');
adaptations.append(smAdapts);

panels.append(adaptations);



//
// Step 4 - Optimization
//
panels.append("<h3>Optimization</h3>")
var optimization = $("<div></div>");

// what to optimize
var divOptim = $("<div></div>");
divOptim.append($('<input type="checkbox" id="cbGrip"><label for="cbGrip">Grip</label>'));
divOptim.append($('<input type="checkbox" id="cbStrength"><label for="cbStrength">Strength</label>'));
divOptim.append($('<input type="checkbox" id="cbCoord"><label for="cbCoord">Coordination</label>'));
divOptim.buttonset().find('label').css('width', '30%');
optimization.append(divOptim);

optimization.append('<br/>');

var tbOptim = $('<table cellspacing="5" cellpadding="5"></table>');
var trSize = $('<tr><td><label class="ui-widget">Size: </label></td><td width="200px"><div id="sldSize"></div></td></tr>');
var trAttach = $('<tr><td><label class="ui-widget">Attachability: </label></td><td width="200px"><div id="sldAttach"></div></td></tr>');
// $('#sldSize').slider();
tbOptim.append(trSize);
tbOptim.append(trAttach);
optimization.append(tbOptim);

optimization.append('<br/>');

var btnUpdate = $('<button>Update</button>')
btnUpdate.button();
optimization.append(btnUpdate);

panels.append(optimization);



//
// Step 5 - Connector
//
panels.append("<h3>Connection</h3>")
var connectors = $("<div></div>");

var lsConns = $('<ul></ul>');
// don't append until something is called to be added

var smConns = $('<select></select>');
smConns.width('128px');
smConns.append('<option id="noConnSel"> Add Connector </option>');
smConns.append('<option>Clamp</option>');
smConns.append('<option>Strap</option>');
smConns.append('<option>Bolt</option>');
smConns.append('<option>Adhesive</option>');

connectors.append(smConns);

panels.append(connectors);


//
// Wrap up
//
container.append(panels);