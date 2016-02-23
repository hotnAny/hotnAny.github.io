

// function loadStl (objFile, objName, isStatic, addToObjects) {
//   return stlLoader.parse(objFile, function (geometry) {
//     log('callback of loading model!');
//     THREE.GeometryUtils.center(geometry);

//     // geometry.dynamic = true;
//     // var material = new THREE.MeshPhongMaterial( { color: colorNormal });
//     var material = new THREE.MeshPhongMaterial( { color: colorNormal, transparent: true, opacity: 0.5} );
//     // material.side = THREE.DoubleSide;
//     var object = new THREE.Mesh(geometry, material); 

//     object.name = objName;

//     object.castShadow = true;
//     object.receiveShadow = true;

//     if(addToObjects == undefined || addToObjects == true) {
//       objects.push(object);  
//     } else {
//       legends.push(object);
//       object.position.set(0, 50, 100);
//       return;
//     }
    
//     log("object #" + objects.length + " " + objName + " loaded");
//     log(geometry.vertices.length + " vertices, " + geometry.faces.length + " faces");
    
//     object.isStatic = isStatic;

//     // if(attachmentMethod != INTERLOCK) {
//     //   object.isVoxelized = false;
//     // } else {
//     //   voxelizeObject(object);
//     // }
//     // to be added: computeMedialAxis

//     if(isStatic) {
//       // object.position.set(0, 0, 0); 

//       /* add to the octree */
//       // octree.add(object);
//       // octree.add(object, { useVertices: true });
//       octree.add(object, { useFaces: true });
//       object.ot = octree;
//       // controlPanel.checkbox4.checked = staticObjLocked;
//       // object.rotation.set(Math.PI / 2 * Math.random(), Math.PI / 2 * Math.random(), Math.PI / 2 * Math.random());
//     }

//     scene.add(object); 
//   });
// }

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