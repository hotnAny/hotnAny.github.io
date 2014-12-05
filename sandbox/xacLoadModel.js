var loader = new THREE.STLLoader(); 

var tree = 'things/xmas-tree-v1.stl';
var chess = 'things/classic_bishop.stl';
var bunny = 'things/bunny.stl';


loader.load(bunny, function (geometry) {
  
  // center the object
  // THREE.GeometryUtils.center( geometry );
  geometry.center();
  
  // var material = new THREE.LineDashedMaterial( { linewidth:0.1 } );

  var material = new THREE.MeshPhongMaterial( { color: 0xffffff} );
  // var material = new THREE.MeshNormalMaterial( {color: 0x000000, shading: THREE.SmoothShading} );

  // var material = new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x666666, emissive: 0xff0000, ambient: 0x00ff00, shininess: 50, 
  //   shading: THREE.SmoothShading, opacity: 0.9, transparent: true } );

  var mesh = new THREE.Mesh(geometry, material); 
  mesh.rotation.x = -Math.PI/2;
  scene.add(mesh);
  // meshes.push(mesh);

  camera.position.set(-0, 180, 200);
  camera.rotation.x -= Math.PI / 6;
  
});

