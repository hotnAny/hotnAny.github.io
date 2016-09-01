/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	handling adding detla of design to an object and interacting with it
 *
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var FORTE = FORTE || {};

FORTE.Delta = function(designOriginal, designNew, canvas, scene, camera) {
    FORTE.deltas = FORTE.deltas || [];

    var id = FORTE.deltas.length;
    FORTE.deltas.push(this);
    this._interpolation = new FORTE.Interpolation(designOriginal, designNew, scene, camera);

    //
    // make the transient slider
    //
    var bbox = FORTE.Delta._findBoundingBox(designNew);

    // unproject it to screen coordinates

    // create a slider
    this._slider = $('<div id=' + id + '></div>');
    this._slider.slider({
        orientation: "vertical",
        range: "min",
        min: FORTE.Delta.SLIDERMIN,
        max: FORTE.Delta.SLIDERMAX,
        // height: FORTE.Delta.SLIERHEIGHT,
        value: FORTE.Delta.SLIDERMAX,
        slide: function(event, ui) {
            var t = (ui.value - FORTE.Delta.SLIDERMIN) / (FORTE.Delta.SLIDERMAX - FORTE.Delta
                .SLIDERMIN);
            var delta = FORTE.deltas[this.id];
            delta._designNew = delta._interpolation.interpolate(t);
            FORTE.updateDeltas();
        }
    });

    this._designNew = this._interpolation.interpolate(1);
    FORTE.updateDeltas(true);

    var rect = canvas.getBoundingClientRect();
    this._slider.css('position', 'absolute');
    this._slider.css('left', (rect.left + 5) + 'px');
    this._slider.css('top', (rect.top + 5) + 'px');
    this._slider.css('height', FORTE.Delta.SLIERHEIGHT + 'px');
    FORTE.tdCanvas.append(this._slider);
}

FORTE.Delta.SLIDERMAX = 100;
FORTE.Delta.SLIDERMIN = 0;
FORTE.Delta.SLIERHEIGHT = 200;

FORTE.Delta.prototype = {
    constructor: FORTE.Delta
}

FORTE.Delta._findBoundingBox = function(design) {

}
