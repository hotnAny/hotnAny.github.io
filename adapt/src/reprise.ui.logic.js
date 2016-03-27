/**
 * user interface logic
 * 	
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */


$(document.body).append(container);

$(document.body).keydown(function(e) {
	// escape key to cancle to current selection
	if (e.which == 27) {
		gToCancel = true;
		var pc = gPartsActions[gCurrPartsAction.attr('pcId')];

		// clean up control
		var ctrl = pc.ctrl;
		if (ctrl.cancel != undefined) {
			ctrl.cancel();
		}

		// clean up parts
		var parts = pc.parts;
		var lsParts = $(gCurrPartsAction.children()[0]);
		for (pid in parts) {
			var part = parts[pid];
			triggerUI2ObjAction(part.tag, DELETEACTION);
			lsParts.tagit("removeTagByLabel", pid);
		}
	}
});

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
	$(document).on('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		e.dataTransfer.dropEffect = 'copy';
	});

	$(document).on('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer;
		var files = e.dataTransfer.files;

		for (var i = files.length - 1; i >= 0; i--) {
			var reader = new FileReader();
			reader.onload = (function(e) {
				loadStl(e.target.result);
			});
			reader.readAsBinaryString(files[i]);
		}

		hideElm(geomMeas);

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
		if (gCurrPartsAction != undefined) {
			gCurrPartsAction.css('background-color', 'rgba(255, 255, 255, 0.25)');
			showPartsInSelectedRow(false);
			if (gJustFocusedUIs[gStep] != undefined) {
				triggerUI2ObjAction(gJustFocusedUIs[gStep], FOCUSACTION);
				gJustFocusedUIs[gStep] = undefined;
			}
		}
		gCurrPartsAction = trPartsCtrls.tdParts;
		gCurrPartsAction.css('background-color', 'rgba(128, 128, 128, 0.25)');

		// store the new row into a global array
		gCurrPartsAction.attr('pcId', 'pc' + Object.keys(gPartsActions).length);
		gPartsActions[gCurrPartsAction.attr('pcId')] = {
			obj: undefined,
			parts: new Array(),
			ctrl: undefined
		};

		//
		// click to acitivate a set of parts (to be modified or extended)
		//
		trPartsCtrls.tdParts.click(function(event) {

			// EXPERIMENTAL: remove all the display/visuals of the last selected row
			if (gCurrPartsAction != undefined) {
				showPartsInSelectedRow(false);

				if (gJustFocusedUIs[gStep] != undefined) {
					triggerUI2ObjAction(gJustFocusedUIs[gStep], FOCUSACTION);
					gJustFocusedUIs[gStep] = undefined;
				}
			}

			// if it's (1) directly (2) clikcing the same row
			if ($(event.target).is('td') && gCurrPartsAction != undefined && gCurrPartsAction.attr('pcId') == $(this).attr('pcId')) {
				$(this).css('background-color', '#rgba(255, 255, 255, 0.25)');
				gCurrPartsAction = undefined;

			} else {
				if (gCurrPartsAction != undefined) {
					gCurrPartsAction.css('background-color', 'rgba(255, 255, 255, 0.25)');
				}
				$(this).css('background-color', 'rgba(128, 128, 128, 0.25)');
				gCurrPartsAction = $(this);
			}

			// EXPERIMENTAL: show all the display/visuals of the newly selected row
			if (gCurrPartsAction != undefined) {
				showPartsInSelectedRow(true);
			}

			gStep = 2;
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
		smCtrls.append('<option value=0>Grasp/Hold</option>');
		smCtrls.append('<option value=1>Push/Pull</option>');
		smCtrls.append('<option value=2>Rotate</option>');
		smCtrls.append('<option value=3>Clutch/Squeeze</option>');
		smCtrls.append('<option value=4>Join/Separate</option>');
		trPartsCtrls.tdCtrls.append(smCtrls);
		smCtrls.selectmenu({
			change: function(event, data) {
				var type = parseInt(data['item'].value);
				var pcId = $(this).attr('pcId');
				var ctrl = undefined;
				switch (type) {
					case GRASPCTRL:
						gPartsActions[pcId].ctrl = new xacGrasp();
						break;
					case PUSHPULLCTRL:
						gPartsActions[pcId].ctrl = new xacPushPull();
						break;
					case ROTATECTRL:
						gPartsActions[pcId].ctrl = new xacRotate();
						break;
					case CLUTCHCTRL:
						gPartsActions[pcId].ctrl = new xacClutch();
						break;
					case JOINSEPCTRL:
						gPartsActions[pcId].ctrl = new xacJoinSeparate(objects);

						// TODO fix these stub values
						gPartsActions[pcId].parts['Part 1'] = objects[0]; // as a placeholder
						gPartsActions[pcId].obj = objects[0];
						break;
				}

				if (numValidPartsCtrl() > 0) {
					showElm(adaptations);
				}

				// once a button is pressed, the step becomes 2 specifying parts
				gStep = 2;

				for (var i = gAccessSel.length - 1; i >= 0; i--) {
					gAccessSel[i].clear();
				}
				gAccessSel = [];
				// gAccessSel.clear();
			}
		});

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

		trPartsCtrls.append(trPartsCtrls.tdCtrls);
		trPartsCtrls.append(trPartsCtrls.tdParts);
		trPartsCtrls.append(trPartsCtrls.tdCopy);
		trPartsCtrls.append(trPartsCtrls.tdDel);

		tblPartsCtrls.append(trPartsCtrls);
		tblPartsCtrls.rows.push(trPartsCtrls);

		gPartCtrlId += 1;


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

	// preload some models
	// loadStlFromFile(CAMMODELPATH, MATERIALHIGHLIGHT);
	// setTimeout(function() {
	// 	gCam = gObjectDelay;
	// 	loadStlFromFile(CLAMPMODELPATH, MATERIALHIGHLIGHT);
	// }, 250);

	// setTimeout(function() {
	// 	gClamp = gObjectDelay;
	// 	loadStlFromFile(YOKEPATH, MATERIALHIGHLIGHT);
	// }, 500);

	// setTimeout(function() {
	// 	gYoke = gObjectDelay;
	// 	loadStlFromFile(YOKECROSSPATH, MATERIALHIGHLIGHT);
	// 	// scene.add(gYoke);
	// }, 750);

	// setTimeout(function() {
	// 	gYokeCross = gObjectDelay;
	// 	// loadStlFromFile(YOKECROSSPATH, MATERIALHIGHLIGHT);
	// 	// scene.add(gYokeCross)
	// }, 1000);

	lsAdapts.tagit({
		onTagClicked: function(event, ui) {
			triggerUI2ObjAction(ui.tag, FOCUSACTION);
		},
		afterTagRemoved: function(event, ui) {
			triggerUI2ObjAction(ui.tag, DELETEACTION);
		}
	});

	smAdapts.selectmenu({
		change: function(event, data) {
			gStep = 3;

			// clicking at the tags highlights adaptations and show sliders accordingly
			if (gAdaptId == 0) {
				lsAdapts.tagit({
					onTagClicked: function(event, ui) {
						triggerUI2ObjAction(ui.tag, FOCUSACTION);
						event.stopPropagation();
					}
				});
				trAdaptations.prepend(lsAdapts);
			}

			// get the selected parts-ctrl
			var pc = gPartsActions[gCurrPartsAction.attr('pcId')];

			var type = parseInt(data['item'].value);
			switch (type) {
				case WRAPPER:
					gCurrAdapt = new xacWrapper(pc);
					break;
				case HANDLE:
					gCurrAdapt = new xacHandle(pc);
					break;
				case LEVER:
					gCurrAdapt = new xacLever(pc);
					break;
				case GUIDE:
					gCurrAdapt = new xacGuide(pc);
					break;
				case ANCHOR:
					gCurrAdapt = new xacAnchor(pc);
					break;
				case CLAMP:
					gCurrAdapt = new xacMechanism(CLAMP, pc);
					break;
				case UNIVJOINT:
					gCurrAdapt = new xacMechanism(UNIVJOINT, pc);
					break;
				case CAM:
					gCurrAdapt = new xacMechanism(CAM, pc);
					break;
			}

			gAdaptations.push(gCurrAdapt);

			// reset the selection from the list
			var optionSelected = $("option:selected", this);
			optionSelected.removeAttr("selected");
			$('#noAdaptSel').attr('selected', 'selected');
			smAdapts.selectmenu("refresh");

			showElm(customization);
			showElm(connectors);
		}
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 4 - adjustment
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// # of fingers
	// $('#sldFingers').slider({
	// 	max: 70,
	// 	min: 5,
	// 	range: 'max',
	// 	change: function(e) {
	// 		var value = $('#sldFingers').slider('value');
	// 		value = value * value / 100 / 10;
	// 		var valueInt = Math.max(1, float2int(value + 0.5));
	// 		$('#lbFingers').html(valueInt + ' Finger' + (valueInt > 1 ? 's' : ''));

	// 		gOptParams.fingerFactor = value;
	// 	},
	// 	slide: function(e) {
	// 		var value = $('#sldFingers').slider('value');
	// 		value = value * value / 100 / 10;
	// 		var valueInt = Math.max(1, float2int(value + 0.5));
	// 		$('#lbFingers').html(valueInt + ' Finger' + (valueInt > 1 ? 's' : ' '));
	// 	}
	// });
	// $('#sldFingers').slider('value', Math.sqrt(FINGERINIT * 1000));
	// $('#sldFingers').css('background-color', '#b7b7b4');

	// // grip
	// $('#sldGrip').slider({
	// 	max: 100,
	// 	min: 0,
	// 	range: 'max',
	// 	change: function(e) {
	// 		var minValue = $("#sldGrip").slider("option", "min");
	// 		var maxValue = $("#sldGrip").slider("option", "max");
	// 		var value = $('#sldGrip').slider('value');
	// 		gOptParams.gripFactor = (value - minValue) * 1.0 / (maxValue - minValue);
	// 	}
	// });
	// $('#sldGrip').css('background-color', '#b7b7b4');
	// var minSldGripValue = $("#sldGrip").slider("option", "min");
	// var maxSldGripValue = $("#sldGrip").slider("option", "max");
	// $('#sldGrip').slider('value', GRIPINIT * (maxSldGripValue - minSldGripValue));

	// // strength
	// $('#sldStrength').slider({
	// 	max: 100,
	// 	range: 'max',
	// 	change: function(e) {
	// 		var minValue = $("#sldStrength").slider("option", "min");
	// 		var maxValue = $("#sldStrength").slider("option", "max");
	// 		var value = $('#sldStrength').slider('value');
	// 		gOptParams.strengthFactor = 1 + (value - minValue) * 1.0 / (maxValue - minValue);
	// 	}
	// });
	// $('#sldStrength').css('background-color', '#b7b7b4');
	// var minsldStrengthValue = $("#sldStrength").slider("option", "min");
	// var maxsldStrengthValue = $("#sldStrength").slider("option", "max");
	// var valuesldStrength = minsldStrengthValue + (STRENGTHINT - 1) * (maxsldStrengthValue - minsldStrengthValue);
	// $('#sldStrength').slider('value', valuesldStrength);

	// // TODO: make it 'target'?
	// // coord
	// $('#sldCoord').slider({
	// 	max: 100,
	// 	range: 'max',
	// 	change: function(e) {
	// 		var minValue = $("#sldCoord").slider("option", "min");
	// 		var maxValue = $("#sldCoord").slider("option", "max");
	// 		var value = $('#sldCoord').slider('value');
	// 		gOptParams.targetFactor = (value - minValue) * 1.0 / (maxValue - minValue);
	// 	}
	// })
	// $('#sldCoord').css('background-color', '#b7b7b4');
	// var minsldCoordValue = $("#sldCoord").slider("option", "min");
	// var maxsldCoordValue = $("#sldCoord").slider("option", "max");
	// var valuesldCoord = minsldCoordValue + TARGETINIT * (maxsldCoordValue - minsldCoordValue);
	// $('#sldCoord').slider('value', valuesldCoord);

	// // size
	// $('#sldSize').slider({
	// 	max: 100,
	// 	range: 'max',
	// 	change: function(e) {
	// 		var minValue = $("#sldSize").slider("option", "min");
	// 		var maxValue = $("#sldSize").slider("option", "max");
	// 		var value = $('#sldSize').slider('value');
	// 		gOptParams.sizeFactor = 1 + (value - minValue) * 1.0 / (maxValue - minValue);
	// 	}
	// });
	// $('#sldSize').css('background-color', '#b7b7b4');
	// var minsldSizeValue = $("#sldSize").slider("option", "min");
	// var maxsldSizeValue = $("#sldSize").slider("option", "max");
	// var valuesldSize = minsldSizeValue + (SIZEINIT - 1) * (maxsldSizeValue - minsldSizeValue);
	// $('#sldSize').slider('value', valuesldSize);

	btnUpdate.click(function(e) {
		gStep = 3;
		gJustFocusedObjs[gStep].parentAdaptation.update();
		// gJustFocusedObjs[gStep] = undefined;

		// for (var i = gAdaptations.length - 1; i >= 0; i--) {
		// 	if (gAdaptations[i] == undefined) {
		// 		continue;
		// 	}
		// 	gAdaptations[i].update(gOptParams);
		// }

	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Step 5 - attachment
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	smAttachments.selectmenu({
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
			smAttachments.selectmenu("refresh");

			// TODO: fix the gAdaptations[0] hard coding
			var activeAdaptation = gJustFocusedObjs[3].parentAdaptation;
			switch (data.item.value) {
				case 'Split':
					gCurrAttach = new xacSplit(activeAdaptation);
					break;
				case 'Strap':
					gCurrAttach = new xacStrap(activeAdaptation);
					break;
				case 'Clamp':
					gCurrAttach = new xacClamp(activeAdaptation);
					break;
				case 'Beam':
					gCurrAttach = new xacBeam(activeAdaptation);
					break;
			}

		}
	});

	btnExport.click(function(e) {
		// do not remove the objects
		// for (var i = objects.length - 1; i >= 0; i--) {
		// 	scene.remove(objects[i]);
		// }

		var adaptation = gAdaptations.slice(-1)[0];
		var modelToSave = undefined;
		var objOriginal = adaptation.obj;

		var idx = 0;

		// shift key downloads flexible part, if there is any
		if (e.shiftKey == true) {
			modelToSave = adaptations[idx].fp;
		} else {
			// alt key download secondary/paired adaptation
			idx = e.altKey == true ? 1 : 0;

			var cnt = 0;
			for (var pid in adaptation.adaptations) {
				if (cnt == idx) {
					modelToSave = adaptation.adaptations[pid].awa;
					// no attachables added
					if (modelToSave == undefined) {
						modelToSave = adaptation.adaptations[pid];
					}
					// need to merge attachables
					for (var i = adaptation.attachables.length - 1; i >= 0; i--) {
						modelToSave = xacThing.union(gettg(modelToSave), gettg(adaptation.attachables[i]), MATERIALHIGHLIGHT);
					}
					break;
				}
				cnt++;
			}
		}

		if (modelToSave == undefined) {
			modelToSave = adaptation.adaptation;
		}

		for (var i = objects.length - 1; i >= 0; i--) {
			modelToSave = xacThing.subtract(gettg(modelToSave), gettg(objects[i]), MATERIALHIGHLIGHT);
		}

		var stlStr = stlFromGeometry(modelToSave.geometry);
		var blob = new Blob([stlStr], {
			type: 'text/plain'
		});
		saveAs(blob, 'adaptation.stl');

	});

}

$(document).ready(function() {
	initPanel();
});


function triggerUI2ObjAction(ui, action, key) {
	var nameUI = $(ui[0]).text().slice(0, -1);

	switch (action) {
		case FOCUSACTION:
			// the ui part
			var wasHighlighted = $(ui).hasClass('ui-state-highlight');
			if (gJustFocusedUIs[gStep] != undefined) {
				gJustFocusedUIs[gStep].removeClass('ui-state-highlight');
			}
			if (wasHighlighted == false) {
				ui.addClass('ui-state-highlight');
			}
			gJustFocusedUIs[gStep] = ui;

			// the obj part
			if (gJustFocusedObjs[gStep] != undefined) {
				gJustFocusedObjs[gStep].material.color.setHex(COLOROVERLAY);
				gJustFocusedObjs[gStep].material.needsUpdate = true;
			}

			switch (gStep) {
				case 2:
					var parts = gPartsActions[gCurrPartsAction.attr('pcId')].parts;
					var part = parts[nameUI];
					if (part != undefined && wasHighlighted == false) {
						part.display.material.color.setHex(COLORHIGHLIGHT);
						part.display.material.needsUpdate = true;
						gJustFocusedObjs[gStep] = part.display;
					}
					break;
				case 3:
					var adaptationComponent = gAdaptationComponents[nameUI];
					if (adaptationComponent != undefined && wasHighlighted == false) {
						adaptationComponent.material.color.setHex(COLORHIGHLIGHT);
						adaptationComponent.material.needsUpdate = true;
						gJustFocusedObjs[gStep] = adaptationComponent;
						adaptationComponent.parentAdaptation.renderSliders();
					}
					break;
				case 5:
					break;
			}

			break;
		case DELETEACTION:
			switch (gStep) {
				case 2:
					// part
					var parts = gPartsActions[gCurrPartsAction.attr('pcId')].parts;
					var part = parts[nameUI];
					part.deleted = true;
					gPartSel.clear();
					scene.remove(part.display);

					// ctrl
					var ctrl = gPartsActions[gCurrPartsAction.attr('pcId')].ctrl;
					ctrl.clear();
					break;
				case 3:
					var adaptation = gAdaptationComponents[nameUI];
					adaptation.deleted = true;
					scene.remove(adaptation);
					break;
				case 5:
					break;
			}

			break;
	}
}

// TODO: do not require to have parts
function numValidPartsCtrl() {
	var n = 0;
	for (var pcId in gPartsActions) {
		pc = gPartsActions[pcId];
		// either one is none empty is fine
		if (Object.keys(pc.parts).length > 0 || pc.ctrl != undefined) {
			n++;
		}
	}
	return n;
}

function getActiveCtrl() {
	if (gCurrPartsAction != undefined) {
		return gPartsActions[gCurrPartsAction.attr('pcId')].ctrl;
	}
}

function showPartsInSelectedRow(flag) {
	var pcId = gCurrPartsAction.attr('pcId');
	var parts = gPartsActions[pcId].parts;
	for (var idx in parts) {
		// scene.remove(parts[idx]);
		if (parts[idx].display != undefined) {
			if (flag == true && parts[idx].deleted != true) {
				scene.add(parts[idx].display);
			} else {
				scene.remove(parts[idx].display);
			}
		}
	}
}