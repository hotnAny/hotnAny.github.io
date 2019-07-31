//
//  main functions
//
//  xac@ucla.edu, 7/14/2019
//

var XDOLLAR = XDOLLAR || {};

//
//  set up the system
//
$(document).ready(function () {
    XDOLLAR.sandboxTest();

    $('#cvsMain')[0].width = 800;
    $('#cvsMain')[0].height = 500;
    $('#cvsMain').css('background-color', '#eeeeee');

    XDOLLAR.context = $('#cvsMain')[0].getContext('2d');
    // XDOLLAR.context.strokeStyle = "#df4b26";
    XDOLLAR.context.strokeStyle = "#888888";
    XDOLLAR.context.lineJoin = "round";
    XDOLLAR.context.lineWidth = 5;

    $('#cvsMain').on('mousedown', XDOLLAR.canvasMouseDown);
    $('#cvsMain').on('mousemove', XDOLLAR.canvasMouseMove);
    $('#cvsMain').on('mouseup', XDOLLAR.canvasMouseUp);

    XDOLLAR.dollar = new DollarRecognizer();
});

//
//  sandbox testing specific functions
//
XDOLLAR.sandboxTest = function () {}

//
//  handling mousedown on the main canvas
//
XDOLLAR.canvasMouseDown = function (e) {
    XDOLLAR.coords = [];
    XDOLLAR.context.clearRect(0, 0, $('#cvsMain').width(), $('#cvsMain').height());
    XDOLLAR.context.beginPath();

    var rect = $('#cvsMain')[0].getBoundingClientRect();
    XDOLLAR.context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    XDOLLAR.context.stroke();

    XDOLLAR.isDragging = true;

    XDOLLAR.coords.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    })
};

//
//  handling mousemove on the main canvas
//
XDOLLAR.canvasMouseMove = function (e) {
    if (!XDOLLAR.isDragging) return;

    var rect = $('#cvsMain')[0].getBoundingClientRect();
    XDOLLAR.context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    XDOLLAR.context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    XDOLLAR.context.stroke();


    XDOLLAR.coords.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    })
};

//
//  handling mouseup on the main canvas
//
XDOLLAR.canvasMouseUp = function (e) {
    var rect = $('#cvsMain')[0].getBoundingClientRect();
    XDOLLAR.coords.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    })

    // XDOLLAR.drawSeg(XDOLLAR.resample(XDOLLAR.coords))
    let resampled = XDOLLAR.resample(XDOLLAR.coords);

     // let gesture = XDOLLAR.recognize(XDOLLAR.coords);
     let gesture = XDOLLAR.dollar.Recognize(resampled);
     console.log(gesture);
     // $('#divInfo').html(gesture ? gesture : 'No gesture recognized')
     $('#divInfo').html(gesture.Name);
     let explanation = XDOLLAR.explain(resampled, XDOLLAR.dollar.Recognize, gesture.Name);
     log(explanation)
     XDOLLAR.drawSeg(explanation.maxScoreSeg);

    XDOLLAR.isDragging = false;
    XDOLLAR.context.closePath();

};

XDOLLAR.resample = function (points) {
    let resampled = [];
    const EPS = 5;
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        let q = resampled[resampled.length - 1];
        if (q == undefined || distance(q, p) > EPS) {
            resampled.push(p);
        }
    }

    return resampled;
}

XDOLLAR.drawSeg = function (seg) {
    let oldStyle = XDOLLAR.context.strokeStyle;
    XDOLLAR.context.strokeStyle = "#df4b26";
    XDOLLAR.context.beginPath();

    // XDOLLAR.context.moveTo(seg[0].x, seg[0].y);
    for (let i = 0; i < seg.length; i++) {
        XDOLLAR.context.lineTo(seg[i].x, seg[i].y);
        XDOLLAR.context.moveTo(seg[i].x, seg[i].y);

        // XDOLLAR.context.beginPath();
        // XDOLLAR.context.arc(seg[i].x, seg[i].y, 2, 0, 2 * Math.PI)
        // XDOLLAR.context.closePath();

        XDOLLAR.context.stroke();
    }

    XDOLLAR.context.closePath();
    XDOLLAR.context.strokeStyle = oldStyle;
}