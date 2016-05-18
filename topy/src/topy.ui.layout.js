/*------------------------------------------------------------------------------------*
 *
 * ui layout (widgets and controls), based on jquery
 * 
 * by xiang 'anthony' chen, xiangchen@acm.org
 *
 *------------------------------------------------------------------------------------*/

var panel = $('<div></div>');
panel.css('width', WIDTHPANEL + 'px');
panel.css('height', '100%');
panel.css('color', '#000000');
panel.css('background-color', 'rgba(192, 192, 192, 0.5)');
panel.css('top', '0px');
panel.css('position', 'absolute');
panel.css('font-family', 'Helvetica');
panel.css('font-size', '12px');
panel.css('overflow', 'auto');

var title = $('<h3>Topy</h3>');
title.html('Topy');
title.css('margin-top', '10px');
title.css('margin-bottom', '10px');
title.css('margin-left', '10px');
title.css('margin-right', '10px');
panel.append(title);

var subPanel = $('<div></div>');

//
//	numbers of elements along x, y and z
// 
subPanel.append($('<h3>Number of elements</h3>'));
var divNumElms = $('<div></div>');

subPanel.append(divNumElms);

//
//	boundary condition
//
subPanel.append($('<h3>Boundary</h3>'));
var divBoundary = $('<div></div>');

subPanel.append(divBoundary);

//
//	load
//
subPanel.append($('<h3>Load</h3>'));
var divLoad = $('<div></div>');

subPanel.append(divLoad);

panel.append(subPanel);

//
//	finish-up buttons
//
var tblButtons = $('<table><tr></tr></table>');
tblButtons.css('margin', '10px');

var btnClear = $('<div>Clear</div>');
var tdClear = $('<td></td>');
tdClear.append(btnClear);
tblButtons.append(tdClear);

var btnSave = $('<div>Save</div>');
var tdSave = $('<td></td>');
tdSave.append(btnSave);
tblButtons.append(tdSave);

var btnRun = $('<div>Run</div>');
var tdRun = $('<td></td>');
tdRun.append(btnRun);
tblButtons.append(tdRun);

panel.append(tblButtons);