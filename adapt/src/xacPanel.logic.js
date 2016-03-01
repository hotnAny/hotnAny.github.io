/**
 * user interface for Adapt
 * 	- only the logic part
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */


$(document.body).append(container);

var initPanel = function() {
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 1 - model and measurement acquisition
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// step 1 - upload
	tblDropZone.on('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		e.dataTransfer.dropEffect = 'copy';
	});

	tblDropZone.on('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		var files = e.dataTransfer.files;

		var reader = new FileReader();
		reader.onload = (function(e) {
			loadStl(e.target.result);
		});
		reader.readAsBinaryString(files[0]);

		gStep = 1;
		showElm(partsCtrls, function() {
			btnAddPartsCtrls.trigger('click');
		});
	});

	// step 1 - simple shapes
	btnUpload.change(function() {
		if ($(this).is(':checked')) {
			trSelectArea.empty();
			trSelectArea.append(tblDropZone);
		}
	});
	btnShape.change(function() {
		if ($(this).is(':checked')) {
			trSelectArea.empty();
			trSelectArea.append(tblShapeOptions);

			$('#btnCylinder').click(function(event) {
				var cylinder = new xacCylinder(10, 30);
				scene.add(cylinder.m);
				objects.push(cylinder.m);
				gItems.push(cylinder);

				gStep = 1;
				showElm(partsCtrls, function() {
					btnAddPartsCtrls.trigger('click');
				});
			});

			$('#btnPrism').click(function(event) {
				var prism = new xacRectPrism(10, 20, 5);
				scene.add(prism.m);
				objects.push(prism.m);
				gItems.push(prism);

				gStep = 1;
				showElm(partsCtrls, function() {
					btnAddPartsCtrls.trigger('click');
				});
				btnAddPartsCtrls.trigger('click');
			});

			$('#btnPlane').click(function(event) {
				var plane = new xacPlane(40, 60);
				scene.add(plane.m);
				objects.push(plane.m);
				gItems.push(plane);

				gStep = 1;
				showElm(partsCtrls, function() {
					btnAddPartsCtrls.trigger('click');
				});
				btnAddPartsCtrls.trigger('click');
			});
		}
	});
	btnLibrary.change(function() {
		if ($(this).is(':checked')) {
			trSelectArea.empty();
		}
	});

	btnOptStartup.trigger('change');

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 2 - parts controls add button
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	btnAddPartsCtrls.button().click(function(event) {
		var trPartsCtrls = $("<tr></tr>");

		//
		// parts
		//
		trPartsCtrls.tdParts = $("<td width='60%'></td>");

		var lsParts = $('<ul></ul>');
		lsParts.pcId = gPartCtrlId;
		lsParts.tagit({
			onTagClicked: function(event, ui) {

				// set time out here because the row selection might be different once the event propagates
				setTimeout(function() {
					triggerUI2ObjAction(ui.tag, FOCUSACTION);
				}, 100);

				// let event propagate
				// event.stopPropagation();
			},
			afterTagRemoved: function(event, ui) {
				setTimeout(function() {
					triggerUI2ObjAction(ui.tag, DELETEACTION);
				}, 100);
			}
		});

		// highlight current row
		if (gCurrPartCtrl != undefined) {
			gCurrPartCtrl.css('background-color', 'rgba(255, 255, 255, 0.25)');
		}
		gCurrPartCtrl = trPartsCtrls.tdParts;
		gCurrPartCtrl.css('background-color', 'rgba(128, 128, 128, 0.25)');

		// store the new row into a global array
		gCurrPartCtrl.attr('pcId', 'pc' + Object.keys(gPartsCtrls).length);
		gPartsCtrls[gCurrPartCtrl.attr('pcId')] = {
			obj: undefined,
			parts: new Array(),
			ctrl: undefined
		};

		// click to acitivate a set of parts (to be modified or extended)
		trPartsCtrls.tdParts.click(function(event) {

			// if it's (1) directly (2) clikcing the same row
			if ($(event.target).is('td') && gCurrPartCtrl != undefined && gCurrPartCtrl.attr('pcId') == $(this).attr('pcId')) {
				$(this).css('background-color', '#rgba(255, 255, 255, 0.25)');
				gCurrPartCtrl = undefined;
			} else {
				if (gCurrPartCtrl != undefined) {
					gCurrPartCtrl.css('background-color', 'rgba(255, 255, 255, 0.25)');
				}
				$(this).css('background-color', 'rgba(128, 128, 128, 0.25)');
				gCurrPartCtrl = $(this);
			}
		});

		trPartsCtrls.tdParts.append(lsParts);

		//
		// controls
		//
		trPartsCtrls.tdCtrls = $("<td></td>");

		var smCtrls = $('<select></select>');
		smCtrls.attr('pcId', trPartsCtrls.tdParts.attr('pcId'));
		smCtrls.width('128px');
		smCtrls.pcId = gPartCtrlId;
		smCtrls.append('<option> - </option>');
		smCtrls.append('<option value=0>Grasp</option>');
		smCtrls.append('<option value=1>Push/Pull</option>');
		smCtrls.append('<option value=2>Rotate</option>');
		smCtrls.append('<option value=3>Clutch</option>');
		smCtrls.append('<option value=4>Join/Separate</option>');
		trPartsCtrls.tdCtrls.append(smCtrls);
		smCtrls.selectmenu({
			change: function(event, data) {
				var type = parseInt(data['item'].value);

				var ctrl = undefined;
				switch (type) {
					case GRASPCTRL:
						ctrl = new xacGrasp();
						log(ctrl)
						break;
				}

				var pcId = $(this).attr('pcId');
				gPartsCtrls[pcId].ctrl = ctrl;

				if (numValidPartsCtrl() > 0) {
					showElm(adaptations);
				}
			}
		});

		//
		// copy button
		//
		trPartsCtrls.tdCopy = $("<td></td>");
		var iconCopy = $('<span></span>')
			.addClass('ui-icon ui-icon-copy');
		trPartsCtrls.tdCopy.append(iconCopy);
		iconCopy.click(function(event) {

			//
			// TODO: copying the previous row and insert it to the end of the table
			//
			// var row = tblPartsCtrls.rows.slice(-1)[0]; // the row to copy
			// var rowNew = $('<tr></tr>');
			// rowNew.html(row.html());
			// tblPartsCtrls.append(rowNew);

		})

		//
		// del button
		//
		trPartsCtrls.tdDel = $("<td></td>");
		var iconDel = $('<span></span>')
			.addClass('ui-icon ui-icon-trash');
		trPartsCtrls.tdDel.append(iconDel);
		iconDel.click(function(event) {
			// tblPartsCtrls.rows.pop().remove();
			var row = $(this).parent().parent(); // the row to remove
			var idxRow = tblPartsCtrls.rows.indexOf(row);
			tblPartsCtrls.rows.splice(idxRow, 1);
			row.remove();
		})


		trPartsCtrls.append(trPartsCtrls.tdParts);
		trPartsCtrls.append(trPartsCtrls.tdCtrls);
		trPartsCtrls.append(trPartsCtrls.tdCopy);
		trPartsCtrls.append(trPartsCtrls.tdDel);

		tblPartsCtrls.append(trPartsCtrls);
		tblPartsCtrls.rows.push(trPartsCtrls);

		gPartCtrlId += 1;

		// once a button is pressed, the step becomes 2.1 specifying parts
		gStep = 2.1;

		// TODO: make this more strict: need to have at least one pair of parts-ctrls
		// if (gPartsCtrls.pc0 != undefined && Object.keys(gPartsCtrls.pc0.parts).length > 0 && gPartsCtrls.pc0.ctrl != undefined) {
		if (numValidPartsCtrl() > 0) {
			showElm(adaptations)
		}
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 3 - adaptations select menu
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	smAdapts.selectmenu({
		change: function(event, data) {
			gStep = 3;

			// init the container for adaptations
			if (gAdaptId == 0) {
				lsAdapts.tagit({
					onTagClicked: function(event, ui) {
						triggerUI2ObjAction(ui.tag, FOCUSACTION);
						event.stopPropagation();
					}
				});
				trAdaptations.prepend(lsAdapts);
			}

			// create a 'tag' to represent an added adaptation
			if (data.item.index > 0) {
				gAdaptId += 1;
				lsAdapts.tagit('createTag', gAdaptId + ' ' + data.item.value);
			}

			switch (data.item.value) {
				case 'Enlargement':

					// experimental: only dealing with 1st parts-ctrls now
					gAdaptations.push(new xacEnlargement(gPartsCtrls.pc0));
					break;
			}

			// reset the selection from the list
			var optionSelected = $("option:selected", this);
			optionSelected.removeAttr("selected");
			$('#noAdaptSel').attr('selected', 'selected');
			smAdapts.selectmenu("refresh");

			showElm(optimization, function() {



			});
		}
	});

	// step 4
	// $('#cbGrip').click(function(e) {
	// 	showElm(connectors);
	// });

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 4 - optimization
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	$('#sldFingers').slider({
		max: 50,
		min: 10,
		range: 'max',
		change: function(e) {
			var minValue = $("#sldFingers").slider("option", "min");
			var value = $('#sldFingers').slider('value') / minValue;
			var valueInt = float2int(value + 0.5);
			if (valueInt != value) {
				$('#sldFingers').slider('value', valueInt * minValue);
			} else {
				$('#lbFingers').html(value + ' Finger' + (value > 1 ? 's' : ''));
				gOptParams.fingerFactor = value;
			}
		},
		slide: function(e) {
			var minValue = $("#sldFingers").slider("option", "min");
			var value = float2int($('#sldFingers').slider('value') / minValue);
			$('#lbFingers').html(value + ' Finger' + (value > 1 ? 's' : ' '));
		}
	});
	var minSldFingersValue = $("#sldFingers").slider("option", "min");
	$('#sldFingers').slider('value', FINGERINIT * minSldFingersValue);
	// $('#sldFingers').trigger('change');
	$('#sldFingers').css('background-color', '#b7b7b4');


	$('#sldSize').slider({
		max: 100,
		range: 'max',
		change: function(e) {
			var minValue = $("#sldSize").slider("option", "min");
			var maxValue = $("#sldSize").slider("option", "max");
			var value = $('#sldSize').slider('value');
			gOptParams.sizeFactor = 1 + (value - minValue) * 1.0 / (maxValue - minValue);
		}
	});
	$('#sldSize').css('background-color', '#b7b7b4');
	var minsldSizeValue = $("#sldSize").slider("option", "min");
	var maxsldSizeValue = $("#sldSize").slider("option", "max");
	var valuesldSize = minsldSizeValue + (SIZEINIT - 1) * (maxsldSizeValue - minsldSizeValue);
	$('#sldSize').slider('value', valuesldSize);
	// $('#sldSize').trigger('change');


	// $('#sldAttach').slider();

	btnUpdate.click(function(e) {
		for (var i = gAdaptations.length - 1; i >= 0; i--) {
			gAdaptations[i].update(gOptParams);
		}
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 5 - connector
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	smConns.selectmenu({
		change: function(event, data) {
			gStep = 5;

			// init the container for Connsations
			if (gConnId == 0) {
				lsConns.tagit({
					onTagClicked: function(event, ui) {
						triggerUI2ObjAction(ui.tag, FOCUSACTION);
						event.stopPropagation();
					}
				});
				trConns.prepend(lsConns);

			}

			// create a 'tag' to represent an added Connsation
			if (data.item.index > 0) {
				gConnId += 1;
				lsConns.tagit('createTag', gConnId + ' ' + data.item.value);
			}

			// reset the selection from the list
			var optionSelected = $("option:selected", this);
			optionSelected.removeAttr("selected");
			$('#noConnSel').attr('selected', 'selected');
			smConns.selectmenu("refresh");
		}
	});

}

$(document).ready(function() {
	initPanel();
});


//
//	Global
//
var justFocusedUIs = new Array();
var justFocusedObjs = new Array();
var FOCUSACTION = 0;
var DELETEACTION = 1;
var ADDACTION = 2;

function triggerUI2ObjAction(ui, action, key) {
	switch (action) {
		case FOCUSACTION:
			// the ui part
			var wasHighlighted = $(ui).hasClass('ui-state-highlight');
			if (justFocusedUIs[gStep] != undefined) {
				justFocusedUIs[gStep].removeClass('ui-state-highlight');
			}
			if (!wasHighlighted) {
				ui.addClass('ui-state-highlight');
			}
			justFocusedUIs[gStep] = ui;

			// the obj part
			if (justFocusedObjs[gStep] != undefined) {
				justFocusedObjs[gStep].material.color.setHex(colorOverlay); // = MATERIALOVERLAY;
				// log('material changed to overlay')
				justFocusedObjs[gStep].material.needsUpdate = true;
			}

			// log(gCurrPartCtrl.attr('pcId'))
			var parts = gPartsCtrls[gCurrPartCtrl.attr('pcId')].parts;

			var namePart = $(ui[0]).text().slice(0, -1);
			// log(namePart)
			var part = parts[namePart];

			if (!wasHighlighted) {
				part.material.color.setHex(colorHighlight); // = MATERIALHIGHLIGHT;
				part.material.needsUpdate = true;
				justFocusedObjs[gStep] = part;
			}

			break;
		case DELETEACTION:
			var parts = gPartsCtrls[gCurrPartCtrl.attr('pcId')].parts;
			var namePart = $(ui[0]).text().slice(0, -1);
			var part = parts[namePart];

			partSel.clear();

			scene.remove(part);

			break;
	}
}

// TODO: do not require to have parts
function numValidPartsCtrl() {
	var n = 0;
	for (var pcId in gPartsCtrls) {
		pc = gPartsCtrls[pcId];
		if (Object.keys(pc.parts).length > 0 && pc.ctrl != undefined) {
			n++;
		}
	}
	return n;
}