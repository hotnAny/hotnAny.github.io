var stlLoader = new THREE.STLLoader();
var objLoader = new THREE.OBJLoader();
var jsonLoader = new THREE.JSONLoader();

var tree = 'things/xmas-tree-v1.stl';
var chess = 'things/classic_bishop.stl';
var bunny = 'things/bunny.stl';
var dragon = 'things/dragon.stl';
var dodecahedron = 'things/dodecahedron.stl';
var key = 'things/key.stl';

var ring = 'things/ring.stl';
var ringStand = 'things/ring-stand.stl';
var lucy = 'things/lucy.js';

function loadStl (objName, addToOctree) {
  stlLoader.load(objName, function (geometry) {
    
    var material = new THREE.MeshPhongMaterial( { color: colorNormal} );  
    var object = new THREE.Mesh(geometry, material); 
    // object.position.set(0, 10, 0);  
    // object.rotation.x = -Math.PI/2;
    scene.add(object);
    
    objects.push(object);
    objectMoved.push(false);
    
    if(addToOctree) {
      // octree.add(object);
      // octree.add(object, { useVertices: true });
      octree.add(object, { useFaces: true });
    }
  });
}

function loadObj(objName, addToOctree) {
  objLoader.load(objName, function (object) {
    // object.geometry.center();
    var material = new THREE.MeshPhongMaterial( { color: colorNormal} ); 
    object.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        child.material = material;
      }
    } );

    scene.add(object);
    objects.push(object);

    if(addToOctree) {
      octree.add(object);
      // octree.add(object, { useVertices: true });
      // octree.add(object, { useFaces: true });
    }
  });
}

function loadJSON(objName, addToOctree) {
  jsonLoader.load( objName, function ( geometry ) {
        geometry.computeVertexNormals();
        
        var material = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0x030303, specular: 0x030303, shininess: 30 } );
        var mesh = new THREE.Mesh(geometry, material); 
        // object.rotation.x = -Math.PI/2;

        if(addToOctree) {
          // octree.add(object);
          octree.add(object, { useVertices: true });
          // octree.add(mesh, { useFaces: true });
        }

        scene.add(mesh);
        
        objects.push(mesh);
      } );
}

if(D_MOUSE) {
  addTheBall();
} else {
  addTheBall();
  
  // loadObj(ring, true);
  // loadJSON(lucy, true);

  loadStl(ringStand, true);
  // loadStl(ring, true);

  // loadStl(tree, true);
  // loadStl(chess, false);

  // octree.add(objects[1], { useVertices: true });
  // loadObject(bunny);
  // octree.add(objects[1]);

}


function addTheBall() {
  var geometry = new THREE.SphereGeometry( 0.5, 20, 20 );
  var material = new THREE.MeshBasicMaterial( { color: 0xf0ff00 } );
  ball = new THREE.Mesh( geometry, material );
  
  scene.add( ball );
  objects.push(ball);
}

