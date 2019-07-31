var XAC = XAC || {};

function log(msg) {
    console.log(msg);
}

function time(desc) {
    var t = new Date().getTime();
    if (XAC.t != undefined && desc != undefined) {
        console.info(desc + ': ' + (t - XAC.t) + ' ms');
    }
    XAC.t = t;
    return t;
}

function distance(p, q) {
    return Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));
}