var lineMaterial = new THREE.LineBasicMaterial({
	color: GRIDCOLOR
});
var lineGeometry = new THREE.Geometry();
var floor = 0.5;
var step = 25;

for (var i = 0; i <= 40; i++) {

	lineGeometry.vertices.push(new THREE.Vector3(-500, floor, i * step - 500));
	lineGeometry.vertices.push(new THREE.Vector3(500, floor, i * step - 500));

	lineGeometry.vertices.push(new THREE.Vector3(i * step - 500, floor, -500));
	lineGeometry.vertices.push(new THREE.Vector3(i * step - 500, floor, 500));

}

var line = new THREE.Line(lineGeometry, lineMaterial, THREE.LinePieces);

scene.add(line);