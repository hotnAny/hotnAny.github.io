/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	a collection of routines to render ui elements
 *
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var FORTE = FORTE || {};

FORTE.WIDTHCONTAINER = 320;

FORTE.renderUI = function() {
    var container = $('<div></div>');
    container.css('width', FORTE.WIDTHCONTAINER + 'px');
    container.css('height', '100%');
    container.css('color', '#000000');
    container.css('background-color', 'rgba(192, 192, 192, 0.5)');
    container.css('top', '0px');
    container.css('right', '0px');
    container.css('position', 'absolute');
    container.css('font-family', 'Helvetica');
    container.css('font-size', '12px');
    container.css('overflow', 'auto');

    container.on('mousedown', function(e) {
        log('propagation stopped');
        e.stopPropagation();
    });

    var title = $('<h3></h3>');
    title.html('FORTE');
    title.css('margin-top', '10px');
    title.css('margin-bottom', '10px');
    title.css('margin-left', '10px');
    title.css('margin-right', '10px');
    container.append(title);

    var divAccordion = $('<div></div>');
    divAccordion.append($('<h3>Form</h3>'));
    divAccordion.append($('<div>Place holder</div>'));
    divAccordion.append($('<h3>Function</h3>'));
    divAccordion.append($('<div>Place holder</div>'));
    divAccordion.append($('<h3>Fabrication</h3>'));
    divAccordion.append($('<div>Place holder</div>'));
    container.append(divAccordion);
    divAccordion.accordion();

    return container;
}
