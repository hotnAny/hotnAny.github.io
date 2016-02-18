/**
 * user interface for Adapt
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var gPartCtrlId = 0; // global id for part-control
var gAdaptId = 0; // global id for adaptations
var gConnId = 0; // global id for connectors

var ControlPanel = function() {

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

	btnAddPartsCtrls.button().click(function(event) {
		var trPartsCtrls = $("<tr></tr>");

		//
		// parts
		//
		trPartsCtrls.tdParts = $("<td></td>");

		// do not use fixed width for the parts' labels
		// trPartsCtrls.tdParts.width('192px');

		trPartsCtrls.tdParts.lsParts = $('<ul></ul>');
		trPartsCtrls.tdParts.lsParts.pcId = gPartCtrlId;
		trPartsCtrls.tdParts.lsParts.tagit({
			onTagClicked: function(event, ui) {
				var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');
				$('.ui-state-highlight').removeClass('ui-state-highlight');
				if (wasHighlighted == false) {
					$(ui.tag).addClass('ui-state-highlight')
				}
			}
		});

		// exemplar code for adding parts
		trPartsCtrls.tdParts.lsParts.tagit('createTag', 'Part 1');
		trPartsCtrls.tdParts.lsParts.tagit('createTag', 'Part 2');

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
		// del button
		//
		trPartsCtrls.tdDel = $("<td></td>");
		var iconDel = $('<span></span>')
			.addClass('ui-icon ui-icon-circle-minus');
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
		trPartsCtrls.append(trPartsCtrls.tdDel);

		tblPartsCtrls.append(trPartsCtrls);
		tblPartsCtrls.rows.push(trPartsCtrls);

		gPartCtrlId += 1;

	});

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
				adaptations.prepend(lsAdapts);

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
	panels.append(adaptations);


	//
	// Step 4 - Optimization
	//
	panels.append("<h3>Optimization</h3>")
	var optimization = $("<div></div>");
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
				connectors.prepend(lsConns);

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
	panels.append(connectors);


	//
	// Wrap up
	//
	container.append(panels);

	var initPanel = function() {
		panels.accordion({
			heightStyle: "content"
		});



	}

	return {
		domElement: container,
		panels: panels,
		initPanel: initPanel
	}
};