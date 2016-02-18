var strokes = [];
var strokePoints = [];
var strokeFaces = [];
var miny = INFINITY;
var maxy = -INFINITY;

var layerThickness = 0.5;

var layerRanges = [];

function computeRangesLayers() {

	var obj = objects[0];

	if(miny == undefined || maxy == undefined) {

		return;
	}
	
	console.log("min: " + miny + ", max: " + maxy);

	// obj.geometry.computeBoundingBox();
	// var boxHelper = obj.geometry.boundingBox;

	var boxHelper = new THREE.BoundingBoxHelper( obj, 0xff0000 );
	boxHelper.update();
	scene.add( boxHelper );

	// console.log(miny + ", " + maxy);
	for(var y=miny; y<=maxy; y+=layerThickness) {
		var layerRange = new Object();

		layerRange.y = (y - boxHelper.box.min.y) / (boxHelper.box.max.y - boxHelper.box.min.y);
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

		strData += layerRanges[i].y.toFixed(2) + 
			"," + layerRanges[i].xmin + "," + layerRanges[i].xmax + "," +
			layerRanges[i].zmin + "," + layerRanges[i].zmax + "\n";
	};

	// console.log(strData);
	var data = new Blob([strData], {type: 'text/plain'});
	var textFile = window.URL.createObjectURL(data);

	controlPanel.a1.href = textFile;

	console.log("range!");

	// strokePoints = [];
}