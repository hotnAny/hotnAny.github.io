// function update(mesh) {
// 	mesh.updateMatrixWorld();
// 	mesh.geometry.applyMatrix(mesh.matrixWorld);
// 	mesh.matrix.identity();
// }

// if(intersects.length > 0) {
			// 	console.log(intersects[0].point);
			// 	selSphere.update(intersects[0].point, 2);
			// 	selSphere.show();
			// } else {
			// 	selSphere.hide();
			// }
// var _expandAccordion = function() {

// 	$('.ui-accordion-header').removeClass('ui-corner-all').addClass('ui-accordion-header-active ui-state-active ui-corner-top').attr({
// 		'aria-selected': 'true',
// 		'tabindex': '0'
// 	});
// 	$('.ui-accordion-header-icon').removeClass(icons.header).addClass(icons.headerSelected);
// 	$('.ui-accordion-content').addClass('ui-accordion-content-active').attr({
// 		'aria-expanded': 'true',
// 		'aria-hidden': 'false'
// 	}).show();
// }

// var _closeAccordion = function() {
// 	$('.ui-accordion-header').removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-corner-all').attr({
// 		'aria-selected': 'false',
// 		'tabindex': '-1'
// 	});
// 	$('.ui-accordion-header-icon').removeClass(icons.headerSelected).addClass(icons.header);
// 	$('.ui-accordion-content').removeClass('ui-accordion-content-active').attr({
// 		'aria-expanded': 'false',
// 		'aria-hidden': 'true'
// 	}).hide();
// 	$(this).attr("disabled", "disabled");
// 	$('.open').removeAttr("disabled");


// var wasHighlighted = $(ui.tag).hasClass('ui-state-highlight');

			// // NOTE: this has a bug of halding all tags with highlight status, which happens to be fine
			// $('.ui-state-highlight').removeClass('ui-state-highlight');
			// if (wasHighlighted == false) {
			// 	$(ui.tag).addClass('ui-state-highlight')
			// }