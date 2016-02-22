/**
 * user interface for Adapt
 * 	- only the logic part
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */


$(document.body).append(container);

var _expandAccordion = function() {

	$('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
		'aria-selected': 'true',
		'tabindex': '0'
	});
	$('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
	$('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
		'aria-expanded': 'true',
		'aria-hidden': 'false'
	}).show();
}

var _closeAccordion = function() {
	$('.ui-accordion-header').removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-corner-all').attr({
		'aria-selected': 'false',
		'tabindex': '-1'
	});
	$('.ui-accordion-header-icon').removeClass(icons.headerSelected).addClass(icons.header);
	$('.ui-accordion-content').removeClass('ui-accordion-content-active').attr({
		'aria-expanded': 'false',
		'aria-hidden': 'true'
	}).hide();
	$(this).attr("disabled", "disabled");
	$('.open').removeAttr("disabled");
}

var initPanel = function() {
	// step 1
	btnUpload.change(function() {
		if ($(this).is(':checked')) {
			trSelectArea.empty();
		}
	});
	btnShape.change(function() {
		if ($(this).is(':checked')) {
			trSelectArea.empty();
			trSelectArea.append(tblShapeOptions);
		}
	});
	btnLibrary.change(function() {
		if ($(this).is(':checked')) {
			trSelectArea.empty();
		}
	});

	// step 4
	$('#sldSize').slider();
	$('#sldAttach').slider();

}
initPanel();

//
//	Step 1 - button to obtain geometry
//
$('#btnCylinder').click(function(event) {
	var cylinder = new xacCylinder(5, 16);
	scene.add(cylinder.m);
	gItems.push(cylinder);

	gStep = 1;
});

$('#btnPrism').click(function(event) {
	var prism = new xacRectPrism(10, 20, 5);
	scene.add(prism.m);
	gItems.push(prism);

	gStep = 1;
});

$('#btnPlane').click(function(event) {
	var plane = new xacPlane(40, 60);
	scene.add(plane.m);
	gItems.push(plane);

	gStep = 1;
});

//
//	Step 2 - parts controls add button
//
btnAddPartsCtrls.button().click(function(event) {
	var trPartsCtrls = $("<tr></tr>");

	//
	// parts
	//
	trPartsCtrls.tdParts = $("<td width='60%'></td>");

	trPartsCtrls.tdParts.lsParts = $('<ul></ul>');
	trPartsCtrls.tdParts.lsParts.pcId = gPartCtrlId;
	trPartsCtrls.tdParts.lsParts.tagit({
		onTagClicked: function(event, ui) {
			var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');
			$('.ui-state-highlight').removeClass('ui-state-highlight');
			if (wasHighlighted == false) {
				$(ui.tag).addClass('ui-state-highlight')
			}
			event.stopPropagation();
		}
	});

	// highlight current row
	if (gCurrPartCtrl != undefined) {
		gCurrPartCtrl.css('background-color', 'rgba(255, 255, 255, 0.25)');
	}
	gCurrPartCtrl = trPartsCtrls.tdParts;
	gCurrPartCtrl.css('background-color', '#rgba(128, 128, 128, 0.25)');

	// store the new row into a global array
	gCurrPartCtrl.attr('pcId', 'pc' + Object.keys(gPartsCtrls).length);
	gPartsCtrls[gCurrPartCtrl.attr('pcId')] = {
		parts: undefined,
		ctrls: undefined
	};
	
	// click to acitivate a set of parts (to be modified or extended)
	trPartsCtrls.tdParts.click(function(event) {
		if (gCurrPartCtrl != undefined && $(this).attr('pcId') == gCurrPartCtrl.attr('pcId')) {
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

	// exemplar code for adding parts
	// trPartsCtrls.tdParts.lsParts.tagit('createTag', 'Part 1');
	// trPartsCtrls.tdParts.lsParts.tagit('createTag', 'Part 2');

	trPartsCtrls.tdParts.append(trPartsCtrls.tdParts.lsParts);

	//
	// controls
	//
	trPartsCtrls.tdCtrls = $("<td></td>");

	var smCtrls = $('<select></select>');
	smCtrls.width('128px');
	smCtrls.pcId = gPartCtrlId;
	smCtrls.append('<option> - </option>');
	smCtrls.append('<option>Grasp</option>');
	smCtrls.append('<option>Push/Pull</option>');
	smCtrls.append('<option>Rotate</option>');
	smCtrls.append('<option>Clutch</option>');
	smCtrls.append('<option>Join/Separate</option>');
	trPartsCtrls.tdCtrls.append(smCtrls);
	smCtrls.selectmenu();

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
});

//
//	Step 3 - adaptations select menu
//
smAdapts.selectmenu({
	change: function(event, data) {
		// init the container for adaptations
		if (gAdaptId == 0) {
			lsAdapts.tagit({
				onTagClicked: function(event, ui) {
					var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');
					$('.ui-state-highlight').removeClass('ui-state-highlight');
					if (wasHighlighted == false) {
						$(ui.tag).addClass('ui-state-highlight')
					}
				}
			});
			trAdaptations.prepend(lsAdapts);

		}

		// create a 'tag' to represent an added adaptation
		if (data.item.index > 0) {
			gAdaptId += 1;
			lsAdapts.tagit('createTag', gAdaptId + ' ' + data.item.value);
		}

		// reset the selection from the list
		var optionSelected = $("option:selected", this);
		optionSelected.removeAttr("selected");
		$('#noAdaptSel').attr('selected', 'selected');
		smAdapts.selectmenu("refresh");
	}
});

//
//	Step 5 - connector select menu
//
smConns.selectmenu({
	change: function(event, data) {
		// init the container for Connsations
		if (gConnId == 0) {
			lsConns.tagit({
				onTagClicked: function(event, ui) {
					var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');
					$('.ui-state-highlight').removeClass('ui-state-highlight');
					if (wasHighlighted == false) {
						$(ui.tag).addClass('ui-state-highlight')
					}
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