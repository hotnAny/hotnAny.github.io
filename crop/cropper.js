//
//  cropping an image with non-axis aligned rectangle
//

var XAC = XAC || {};

//
//  constructor, input is the left, top, width and height of the Image object
//
XAC.Cropper = function(left, top, width, height) {
    this._canvas = $(
        '<canvas id="canvasForeground" style="z-index: 1000; position: absolute;"></canvas>'
    );
    this._canvas.css('margin-left', left);
    this._canvas.css('margin-top', top);
    this._canvas.on('mousedown', this._mouseDown.bind(this));
    this._canvas.on('mousemove', this._mouseMove.bind(this));
    this._canvas.on('mouseup', this._mouseUp.bind(this));
    $(document).on('keydown', this._keydown.bind(this));

    $(document.body).append(this._canvas);
    this._canvas = document.getElementById('canvasForeground');

    this._canvas.width = width;
    this._canvas.height = height;

    var ctxfg = this._canvas.getContext('2d');
    ctxfg.fillStyle = "rgba(0, 0, 0, 0)";
    ctxfg.fillRect(0, 0, this._canvas.width, this._canvas.height);


    this._points = [];
    this._color = '#ff0000';
}

//
//  mousedown handler
//
XAC.Cropper.prototype._mouseDown = function(e) {
    this._isSelecting = true;
    this._p = this._p || {
        x: e.offsetX,
        y: e.offsetY
    };

    this._points.push(this._p);
    if (this._points.length == 3) {
        var xctr = (this._points[0].x + this._points[2].x) / 2;
        var yctr = (this._points[0].y + this._points[2].y) / 2;
        this._points.push({
            x: (2 * xctr - this._points[1].x) | 0,
            y: (2 * yctr - this._points[1].y) | 0
        });
        this._isSelecting = false;
    }

    this._update(this._points);
}

//
//  mousemove handler
//
XAC.Cropper.prototype._mouseMove = function(e) {
    if (!this._isSelecting) return;
    var ctx = this._canvas.getContext('2d');

    this._p = {
        x: e.offsetX,
        y: e.offsetY
    };
    if (this._points.length == 2) {
        var dx = this._points[1].x - this._points[0].x;
        var dy = this._points[1].y - this._points[0].y;
        var pperp = {
            x: this._points[1].x - dy,
            y: this._points[1].y + dx
        };
        this._p = this._project(this._p, this._points[1], pperp);
        this._p.x = this._p.x | 0;
        this._p.y = this._p.y | 0;
    }

    var points = this._points.concat([this._p]);

    this._update(points);
}

//
//  mouseup handler
//
XAC.Cropper.prototype._mouseUp = function(e) {

}

//
//  keydown handler - press ESC to cancel selection
//
XAC.Cropper.prototype._keydown = function(e) {
    if (e.which == 27) { // ESC
        this._isSelecting = false;
        this._p = undefined;
        this._points = [];
        this._update(this._points);
    }
}

//
//  update the visual of the selection
//
XAC.Cropper.prototype._update = function(points) {
    var ctx = this._canvas.getContext('2d');
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    ctx.strokeStyle = this._color;
    $('.spot').each(function() {
        $(this).remove();
    });

    var rect = this._canvas.getBoundingClientRect();

    var oldx, oldy;
    if (points.length == 4) {
        points.push(points[0]);
    }

    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var pointer = $('<span class="spot">').css({
            'position': 'absolute',
            'background-color': this._color,
            'width': '5px',
            'height': '5px',
            'top': rect.top + p.y - 1,
            'left': rect.left + p.x - 1,
        });
        $(document.body).append(pointer);

        if (oldx != undefined && oldy != undefined) {
            ctx.beginPath();
            ctx.moveTo(oldx, oldy);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }

        oldx = p.x;
        oldy = p.y;
    }

    if (points.length > 4) {
        points.pop();
    }
}

//
//  project p onto the line by p0 and p1
//
XAC.Cropper.prototype._project = function(p, p0, p1) {
    var t = -((p.x - p0.x) * (p0.x - p1.x) + (p.y - p0.y) * (p0.y - p1.y)) / ((p0.x - p1.x) * (p0.x -
        p1.x) + (p0.y - p1.y) * (p0.y - p1.y));
    return {
        x: (1 - t) * p0.x + t * p1.x,
        y: (1 - t) * p0.y + t * p1.y
    };
}

//
//  get the 4-point coordinates
//
XAC.Cropper.prototype.getCoordinates = function() {
    return this._points;
}
