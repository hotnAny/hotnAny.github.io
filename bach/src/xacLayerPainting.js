var strokes = [];
var strokePoints = [];
var strokeFaces = [];
var minz;
var maxz;

var layerThickness = 0.1;

var layerRanges = [];

function computeRangesLayers() {
	if(minz == undefined || maxz == undefined) {
		return;
	}
	// console.log(minz + ", " + maxz);
	for(var z=minz; z<=maxz; z+=layerThickness) {
		var layerRange = new Object();

		layerRange.z = z;
		layerRange.xmin = INFINITY;
		layerRange.xmax = -INFINITY;
		layerRange.ymin = INFINITY;
		layerRange.ymax = -INFINITY;

		for (var i = 0; i < strokePoints.length; i++) {
			if(z <= strokePoints[i].z && strokePoints[i].z < z + layerThickness) {
				layerRange.xmin = Math.min(layerRange.xmin, strokePoints[i].x);
				layerRange.xmax = Math.max(layerRange.xmax, strokePoints[i].x);
				layerRange.ymin = Math.min(layerRange.ymin, strokePoints[i].y);
				layerRange.ymax = Math.max(layerRange.ymax, strokePoints[i].y);
			}
		}

		layerRanges.push(layerRange);
	}

	var strData = "z,xmin,xmax,ymin,ymax\n";
	for (var i = 0; i < layerRanges.length; i++) {
		// console.log(layerRanges[i].z + 
		// 	": x:[" + layerRanges[i].xmin + ", " + layerRanges[i].xmax + "]" +
		// 	": y:[" + layerRanges[i].ymin + ", " + layerRanges[i].ymax + "]");

		strData += layerRanges[i].z + 
			"," + layerRanges[i].xmin + "," + layerRanges[i].xmax + "" +
			"" + layerRanges[i].ymin + "," + layerRanges[i].ymax + "\n";
	};

	// console.log(strData);
	var data = new Blob([strData], {type: 'text/plain'});
	var textFile = window.URL.createObjectURL(data);

	controlPanel.a1.href = textFile;
}