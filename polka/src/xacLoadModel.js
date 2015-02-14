function loadStl (objPath, objName, isStatic) {
  return stlLoader.load(objPath, function (geometry) {

    THREE.GeometryUtils.center(geometry);

    // geometry.dynamic = true;
    var material = new THREE.MeshPhongMaterial( { color: colorNormal} );  
    var object = new THREE.Mesh(geometry, material); 

    object.name = objName;

    /* manually positioning the objects */
    objects.push(object);
    scene.add(object);

    log("object #" + objects.length + " " + objName + " loaded");
    log(geometry.vertices.length + " vertices, " + geometry.faces.length + " faces");
    // console.log(object);

    object.geometry.computeBoundingBox();
    var bbox = object.geometry.boundingBox;
    // console.log(bbox);
    object.position.set(20 * Math.random(), (bbox.max.y - bbox.min.y) / 2, 20 * Math.random());

    var maxDimExisting = 0;
    maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.x - bbox.min.x));
    maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.y - bbox.min.y));
    maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.z - bbox.min.z));

    object.maxDimExisting = maxDimExisting;

    if(!isStatic) {
      for(var i=0; i<objects.length; i++) {
        if(objects[i].isStatic) {
          objects[i].geometry.computeBoundingBox();
          var bboxStatic = objects[i].geometry.boundingBox;

          var dy = maxDimExisting + objects[i].maxDimExisting / 2 - objects[i].position.y;
          objects[i].position.y += Math.max(dy, 0);

          var cubeHeight = maxDimExisting;
          var geometry = new THREE.CubeGeometry(5, cubeHeight, 5);
          var material = new THREE.MeshBasicMaterial( { color: 0x22FF66 } );
          var box = new Physijs.BoxMesh(geometry, material, 0);
          // box.position.y -= (cubeHeight + objects[i].maxDimExisting) / 2
          box.position.set(objects[i].position.x, cubeHeight/2, objects[i].position.z)
          // objects[i].add(box);
          scene.add(box);
        }
      }
    }
    object.isStatic = isStatic;

    if(isStatic) {
      // object.position.set(0, 0, 0); 

      /* add to the octree */
      // octree.add(object);
      // octree.add(object, { useVertices: true });
      octree.add(object, { useFaces: true });

      /* create pre-computed projections and their octrees */
      // makeProjections(object, projStatic);

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
      // object.rotation.x = -Math.PI/2;
    }

    // object.rotation.z = -Math.PI/2;
    // object.ctrMass = calCtrMass(object);
  });
}

/* loading the objects */
function loadObjToPrint() {
  // console.log(controlPanel.dd1.options[controlPanel.dd1.selectedIndex].value);
  cleanObjects(true);

  loadStl(controlPanel.dd1.options[controlPanel.dd1.selectedIndex].value, 
    controlPanel.dd1.options[controlPanel.dd1.selectedIndex].text, true);
}

function loadExistingObj() {
  var staticObjLoaded = false;

  for(var i=0; i<objects.length; i++) {
    if(objects[i].isStatic) {
      staticObjLoaded = true;
      break;
    }
  }

  if(!staticObjLoaded) {
    alert("Load an object to print first");
    controlPanel.dd2.selectedIndex = 0;
    return;
  }

  cleanObjects(false);

  loadStl(controlPanel.dd2.options[controlPanel.dd2.selectedIndex].value,
    controlPanel.dd2.options[controlPanel.dd2.selectedIndex].text, false);

  // console.log(objects.length);

  /* update the height of the object to print */
  // var maxDimExisting = 0;
  // for(var i=0; i<objects.length; i++) {
  //   if(!objects[i].isStatic) {
  //     objects[i].geometry.computeBoundingBox();
  //     var bbox = objects[i].geometry.boundingBox;
  //     console.log(bbox);
  //     maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.x - bbox.min.x));
  //     maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.y - bbox.min.y));
  //     maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.z - bbox.min.z));
  //   }
  // }

  

}

function cleanObjects(isStatic) {
  var objsToRemove = new Array();
  for(var i=0; i<objects.length; i++) {
    if(objects[i].isStatic == isStatic) {
      objsToRemove.push(i);
      break;
    }
  }

  for(var i=0; i<objsToRemove.length; i++) {
    scene.remove(objects[objsToRemove[i]]);
    objects.splice(objsToRemove[i], 1);
  }
}


/* below is legacy code */
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
    // console.log(triangleArea(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0), new THREE.Vector3(0, 10, 0)));
    // createBoxelizedSphere(7, 18);
    // createBoxelizedSphere(10, 36);

    // loadStl(ringStand, "ring", false);
    // loadStl(mug, "mug", true);

    /*
      example #1 key + ring
    */
    // loadStl(ring3, "ring", false);
    // loadStl(key, "key", true);

    // loadStl(ringStand, "ring", true);
    // loadStl(dodecahedron, "dodecahedron1", false);
    // loadStl(dodecahedron, "dodecahedron2", false);
    // loadStl(meshBall, "meshBall", true);

    // addTheBall();

    /* 
      exampe #2 heart+bracelet
    */
    // loadStl(heart, "heart", false);
    // loadStl(bracelet, "bracelet", true);
    

    // loadStl(scissors, "scissors", false);

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
  var geometry = new THREE.SphereGeometry( 5, 20, 20 );
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

  return box;
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
