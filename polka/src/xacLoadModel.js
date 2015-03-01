function loadStl (objPath, objName, isStatic, addToObjects) {
  return stlLoader.load(objPath, function (geometry) {

    THREE.GeometryUtils.center(geometry);

    // geometry.dynamic = true;
    var material = new THREE.MeshPhongMaterial( { color: colorNormal} );  
    // material.side = THREE.DoubleSide;
    var object = new THREE.Mesh(geometry, material); 

    object.name = objName;

    scene.add(object);

    if(addToObjects == undefined || addToObjects == true) {
      objects.push(object);  
    } else {
      legends.push(object);
      object.position.set(0, 50, 100);
      return;
    }
    
    log("object #" + objects.length + " " + objName + " loaded");
    log(geometry.vertices.length + " vertices, " + geometry.faces.length + " faces");
    // console.log(object);

    // object.geometry.computeBoundingBox();
    // var bbox = object.geometry.boundingBox;
    // object.bbox = bbox;
    // console.log(bbox);
    // object.position.set(20 * Math.random(), 0, 20 * Math.random());
    // (bbox.max.y - bbox.min.y) / 2 + 30 * Math.random()
    // var maxDimExisting = 0;
    // maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.x - bbox.min.x));
    // maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.y - bbox.min.y));
    // maxDimExisting = Math.max(maxDimExisting, Math.abs(bbox.max.z - bbox.min.z));

    // object.maxDimExisting = maxDimExisting;

    /*
      temperarily disabled  
    */

    // if(!isStatic) {
    //   for(var i=0; i<objects.length; i++) {
    //     if(objects[i].isStatic) {
    //       // objects[i].geometry.computeBoundingBox();
    //       // var bboxStatic = objects[i].geometry.boundingBox;

    //       var dy = maxDimExisting + objects[i].maxDimExisting / 2 - objects[i].position.y;
    //       objects[i].position.y += Math.max(dy, 0);
    //       objects[i].needRebuildOctree = true;

    //       generateSupport(objects[i]);
    //     }
    //   }
    // }
    object.isStatic = isStatic;

    voxelizeObject(object);

    if(isStatic) {
      // object.position.set(0, 0, 0); 

      /* add to the octree */
      // octree.add(object);
      // octree.add(object, { useVertices: true });
      octree.add(object, { useFaces: true });
      object.ot = octree;
      controlPanel.checkbox4.checked = staticObjLocked;
      // object.rotation.set(Math.PI / 2 * Math.random(), Math.PI / 2 * Math.random(), Math.PI / 2 * Math.random());
      
    } 
    // else {
    //   // object.rotation.x = -Math.PI/2;
    // }

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

  // voxelize();

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

  if(objectPair != undefined) {
    scene.remove(objectPair);
    objectPair.children.splice(0, objectPair.children.length);
    objectPair = undefined;
  }

  var objsToRemove = new Array();
  for(var i=0; i<objects.length; i++) {
    if(objects[i].isStatic == isStatic) {
      objsToRemove.push(i);
      // if(objectPair != undefined) {
      //   objectPair.remove(objects[i]);
      // }
      break;
    }
  }

  for(var i=0; i<objsToRemove.length; i++) {
    scene.remove(objects[objsToRemove[i]]);
    objects.splice(objsToRemove[i], 1);
  }
}

function generateSupport(obj) {
  var material = new THREE.MeshBasicMaterial( { color: 0x22FF66 } );

  /* making the base */
  var minBaseDim = 2;
  var baseDimX = Math.max(minBaseDim, Math.abs(obj.bbox.max.x - obj.bbox.min.x)),
      baseDimY = minBaseDim,
      baseDimZ = Math.max(minBaseDim, Math.abs(obj.bbox.max.z - obj.bbox.min.z));
  var geomBase = new THREE.CubeGeometry(baseDimX, baseDimY, baseDimZ);
  
  var base = new Physijs.BoxMesh(geomBase, material, 0);
  base.position.set(obj.position.x, obj.position.y - (obj.bbox.max.y - obj.bbox.min.y) / 2 - minBaseDim / 2, obj.position.z);
  scene.add(base);
  supports.push(base);

  /* making pillars */
  base.geometry.computeBoundingBox();
  var bbox = base.geometry.boundingBox;

  var heightPillar = base.position.y - minBaseDim/2;
  var geomPillar = new THREE.CubeGeometry(minBaseDim, heightPillar, minBaseDim);

  for(var i=-1; i<=1; i+=2) {
    for(var j=-1; j<=1; j+=2) {
      var pillar = new Physijs.BoxMesh(geomPillar, material, 0);
      pillar.position.set(
        obj.position.x + i * baseDimX / 2 - i * minBaseDim / 2, 
        heightPillar/2, 
        obj.position.z + j * baseDimZ / 2 - j * minBaseDim / 2
        );
      scene.add(pillar);
      supports.push(pillar);
    }
  }

}

function removeSupport() {
  for(var i=0; i<supports.length; i++) {
    scene.remove(supports[i]);
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
    // loadStl(arrow, 'arrow', false, false);
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
  tri.material.side = THREE.DoubleSide;

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
