var loader = new THREE.STLLoader(); 

var tree = 'things/xmas-tree-v1.stl';
var chess = 'things/classic_bishop.stl';
var bunny = 'things/bunny.stl';

function loadObject (objName) {
  loader.load(objName, function (geometry) {
    // center the object
    geometry.center();

    var material = new THREE.MeshPhongMaterial( { color: colorNormal} );  
    var object = new THREE.Mesh(geometry, material); 
    object.rotation.x = -Math.PI/2;
    scene.add(object);
    
    objects.push(object);
  
  });
}

if(D) {
  var geometry = new THREE.SphereGeometry( 5, 20, 20 );
  var material = new THREE.MeshBasicMaterial( { color: 0xf0ff00 } );
  ball = new THREE.Mesh( geometry, material );
  
  scene.add( ball );
  objects.push(ball);
} else {
  loadObject(bunny);
  // loadObject(chess);
}

