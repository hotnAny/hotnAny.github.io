var strokes = [];
var strokePoints = [];
var strokeFaces = [];
var miny;
var maxy;

var layerThickness = 0.1;

var layerRanges = [];

function computeRangesLayers() {
	if(miny == undefined || maxy == undefined) {
		return;
	}
	// console.log(miny + ", " + maxy);
	for(var y=miny; y<=maxy; y+=layerThickness) {
		var layerRange = new Object();

		layerRange.y = y;
		layerRange.xmin = INFINITY;
		layerRange.xmax = -INFINITY;
		layerRange.zmin = INFINITY;
		layerRange.zmax = -INFINITY;

		var pointsFellInRange = false;
		for (var i = 0; i < strokePoints.length; i++) {
			if(y <= strokePoints[i].y && strokePoints[i].y < y + layerThickness) {
				layerRange.xmin = Math.min(layerRange.xmin, strokePoints[i].x);
				layerRange.xmax = Math.max(layerRange.xmax, strokePoints[i].x);
				layerRange.zmin = Math.min(layerRange.zmin, strokePoints[i].z);
				layerRange.zmax = Math.max(layerRange.zmax, strokePoints[i].z);
				pointsFellInRange = true;
			}
		}

		if(pointsFellInRange) {
			layerRanges.push(layerRange);
		}
	}

	var strData = "z,xmin,xmax,ymin,ymax\n";
	for (var i = 0; i < layerRanges.length; i++) {
		// console.log(layerRanges[i].z + 
		// 	": x:[" + layerRanges[i].xmin + ", " + layerRanges[i].xmax + "]" +
		// 	": y:[" + layerRanges[i].zmin + ", " + layerRanges[i].zmax + "]");

		strData += layerRanges[i].y + 
			"," + layerRanges[i].xmin + "," + layerRanges[i].xmax + "," +
			layerRanges[i].zmin + "," + layerRanges[i].zmax + "\n";
	};

	// console.log(strData);
	var data = new Blob([strData], {type: 'text/plain'});
	var textFile = window.URL.createObjectURL(data);

	controlPanel.a1.href = textFile;

	console.log("range!");

	strokePoints = [];
}