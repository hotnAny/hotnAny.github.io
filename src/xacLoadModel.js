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

function loadStl (objName, isStatic) {
  return stlLoader.load(objName, function (geometry) {

    // geometry.dynamic = true;
    var material = new THREE.MeshPhongMaterial( { color: colorNormal} );  
    var object = new THREE.Mesh(geometry, material); 

    /* manually positioning the objects */
    objects.push(object);
    scene.add(object);
    // scenePhysics.add(object);

    log("#" + objects.length + ": " + objName + " loaded");
    log(geometry.vertices.length + " vertices, " + geometry.faces.length + " faces");

    
    if(isStatic) {
      object.position.set(0, 0, 0); 

      /* add to the octree */
      // octree.add(object);
      // octree.add(object, { useVertices: true });
      octree.add(object, { useFaces: true });

      /* create pre-computed projections and their octrees */
      makeProjections(object, projStatic);

      var len = projStatic.length;
      for(var i=0; i<len; i++) {
        // console.log(projStatic[i]);
        var ot = new THREE.Octree({
          undeferred: false,
          depthMax: Infinity,
          objectsThreshold: 1,
          scene: scene
        });
        ot.add(projStatic[i], { useFaces: true});
        octreesProj.push(ot); 
      }
      // if(!D_OVERLAP) hideProjections();
    } else {
      object.position.set(20 * Math.random(), 20 + 10 * Math.random(), 20 * Math.random()); 
      object.rotation.y = -Math.PI/2 * Math.random();
    }

  });
}

/* loading the objects */
if(D_MOUSE) {
  addTheBall();
} else {
  // addTheBall();
  // var v1 = new THREE.Vector3(10, 0, 10);
  // var v2 = new THREE.Vector3(5, 0, 7);
  // var v3 = new THREE.Vector3(3, 0, 12);
  // addATriangle(v1, v2, v3);
  // ball.position.set(-4, 0, 0);
  // addABox(-1, 1, 1, -1, 1, -1, true);

  if(D_PHYSICS) {
    addAPhyCube();
    addAPhyCube();
  }
  else {
    loadStl(ringStand, false);
    loadStl(dodecahedron, true);
    // console.log(scene);
  }
  
  // intersect_plane = new THREE.Mesh(
  //   new THREE.PlaneGeometry( 150, 150 ),
  //   new THREE.MeshBasicMaterial({ opacity: 0, transparent: true })
  // );
  // intersect_plane.rotation.x = Math.PI / -2;
  // scene.add( intersect_plane );
}


/*
  below are functions that render debugging objects
  */

function addAPhyCube() {
  var material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF} );  
  var object = new Physijs.BoxMesh(new THREE.CubeGeometry( 10 * Math.random(), 10 * Math.random(), 10 * Math.random() ), material);
  object.position.set(20 * Math.random(), 20 + 10 * Math.random(), 20 * Math.random()); 
  object.rotation.set(-Math.PI/2 * Math.random(), -Math.PI/2 * Math.random(), -Math.PI/2 * Math.random());
  object.castShadow = true;
  object.receiveShadow = true;
  scene.add(object); 
  objects.push(object);
}

function addTheBall() {
  var geometry = new THREE.SphereGeometry( 2, 20, 20 );
  var material = new THREE.MeshBasicMaterial( { color: 0xf0ff00 } );
  ball = new THREE.Mesh( geometry, material );
  
  scene.add( ball );
  objects.push(ball);
}

function addABox(l, r, t, b, f, b, addToObjects) {
  var geometry = new THREE.CubeGeometry(r-l, t-b, f-b);
  console.log(geometry);
  var material = new THREE.MeshBasicMaterial( { color: 0xFF0066, wireframe: true, wireframeLinewidth: 1 } );
  var box = new THREE.Mesh(geometry, material);
  box.position.set((l+r)/2, (t+b)/2, (f+b)/2);

  // scene.add(box);
  if(addToObjects) {
    objects.push(box);
  } else {
    boxes.add(box);
  }
}

function addATriangle(v1, v2, v3, clr) {
  var vs = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z];
  var fs = new THREE.Face3(0, 1, 2);

  var geometry = new THREE.Geometry(); //PolyhedronGeometry(vs, fs, 1, 1);
  geometry.vertices.push(v1);
  geometry.vertices.push(v2);
  geometry.vertices.push(v3);
  geometry.faces.push(new THREE.Face3(0, 1, 2));
  var material = new THREE.MeshBasicMaterial( { color: clr } );
  var tri = new THREE.Mesh(geometry, material);

  scene.add(tri);
}

function addABall(x, y, z, clr, radius) {
  var geometry = new THREE.SphereGeometry( radius, 10, 10 );
    var material = new THREE.MeshBasicMaterial( { color: clr } );
  var ball = new THREE.Mesh( geometry, material );
  ball.position.set(x, y, z);
  
  // console.log(ball.position);
  balls.add(ball);
 //   scene.add( ball1 );
 //   ball2 = new THREE.Mesh( geometry, material );
 //   scene.add( ball2 );
}

function addALine(v1, v2, clr) {
  var geometry = new THREE.Geometry();
  geometry.vertices.push(v1);
  geometry.vertices.push(v2);
  var material = new THREE.LineBasicMaterial({color: clr});
  var line = new THREE.Line(geometry, material);

  scene.add(line);
}
