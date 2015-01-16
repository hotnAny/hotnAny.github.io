/* obselete */
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

/* obselete */
function loadJSON(objName, isStatic) {
  jsonLoader.load( objName, function ( geometry ) {
        geometry.computeVertexNormals();
        
        var material = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0x030303, specular: 0x030303, shininess: 30 } );
        var mesh = new THREE.Mesh(geometry, material); 
        // object.rotation.x = -Math.PI/2;

        if(isStatic) {
          
          // octree.add(object);
          octree.add(object, { useVertices: true });
          // octree.add(mesh, { useFaces: true });

        }

        scene.add(mesh);
        
        objects.push(mesh);
      } );
}

// var mWorld = new THREE.Matrix4();
  // console.log(obj.matrixWorld);
  // console.log(obj.matrixWorld.elements);
  // mWorld.copy(obj.matrixWorld);
  // console.log(mWorld.elements);
  // var cw = mWorld.elements[0];
  
  // console.log(cw);

//  var objProj = obj.clone();  
  //  // objProj.applyMatrix(mWorld);
  //  // objProj.position.set(0, 10 * Math.random(), 0);
    
  //  var cwProj = new Float32Array(16);
  //  // console.log(cw);
  //  for(var j=0; j<16; j++) {
  //    if(i*4 <= j && j < (i+1)*4) {
  //      cwProj[j] = 0;
  //    } else {
  //      cwProj[j] = cw[j];
  //    }
  //  }

  //  var mProj = new THREE.Matrix4();
  //  // console.log(cwProj);
  //  mProj.set(cwProj[0], cwProj[4], cwProj[8], cwProj[12],
  //        cwProj[1], cwProj[5], cwProj[9], cwProj[13],
  //        cwProj[2], cwProj[6], cwProj[10], cwProj[14],
  //        cwProj[3], cwProj[7], cwProj[11], cwProj[15]);

  //  // console.log(cw);
  //  // console.log(mProj);

  //  objProj.applyMatrix(mProj);
  //  objProj.position.set(0, 10 * Math.random(), 0);
    
  //  scene.add(objProj);
  //  array.push(objProj);
    
  // }

  // if(D_INTERSECTION) {
  //  scene.remove(balls);
  //  balls = new THREE.Object3D();

  //  scene.remove(boxes);
 //     boxes = new THREE.Object3D();

 //     for (var i = 0; i < objects.length; i++) {
  //    objects[i].material.color.setHex(colorNormal);
  //  };
  // }

  if(Math.random() < 0.01) {
        // addABall(v1.x, v1.y, v1.z, 0xff0000, 0.1);
        // addABall(va.x, va.y, va.z, 0xff0000, 0.15);
        // addABall(vb.x, vb.y, vb.z, 0x00ff00, 0.15);
        // addABall(vc.x, vc.y, vc.z, 0x0000ff, 0.15);
        // addATriangle(va, vb, vc);
        // console.log(va);
        // console.log(vb);
        // console.log(vc);
        // console.log("========");
        // console.log(elms[i]);
      }


  // function buildBoundingBox(obj) {
//  var rot = obj.rotation.clone();
//  obj.rotation.set(0, 0, 0);
//  obj.updateMatrixWorld();
//  var bbh = new THREE.BoundingBoxHelper(obj, 0xff0000);
//  bbh.rotation.set(rot.x, rot.y, rot.z);
//  obj.rotation.set(rot.x, rot.y, rot.z);
//  return bbh;
// }

// function isInBoundingBox(v, objStatic) {
//  var b = objStatic.geometry.boundingBox.clone();
//  b.min.add(new THREE.Vector3().getPositionFromMatrix(objStatic.matrixWorld));
//  b.max.add(new THREE.Vector3().getPositionFromMatrix(objStatic.matrixWorld));

//  return b.min.x < v.x && v.x < b.max.x &&
//       b.min.y < v.y && v.y < b.max.y &&
//       b.min.z < v.z && v.z < b.max.z;  
// }

// elms[i].object.material.color.setHex(colorCollided);

// var nml = elms[i].faces.normal.clone();

    // var pointToFace = new THREE.Vector3();
    // pointToFace.subVectors(elms[i].faces.centroid, v1)
    // pointToFace.subVectors(c, v1)
    
    // var angleToFace = pointToFace.dot(elms[i].faces.normal);
    // var angleToFace = pointToFace.dot(nml);

    // var dist = pointToFace.length();

    // if(minDist < 0) {
    //  minDist = dist;
    // } else {
    //  if(dist < minDist) {
    //    idxClosestFace = i;
    //  }
    // }

    //  if(idxClosestFace >= 0) {
//    var fClosest = elms[idxClosestFace].faces;

//    var f = fClosest;
//    var va = objS.geometry.vertices[f.a].clone().applyMatrix4(objS.matrixWorld);
//    var vb = objS.geometry.vertices[f.b].clone().applyMatrix4(objS.matrixWorld);
//    var vc = objS.geometry.vertices[f.c].clone().applyMatrix4(objS.matrixWorld);

//    // var v1Outside = isPointOutsideFace(v1, fClosest, objS);
//    // var v2Outside = isPointOutsideFace(v2, fClosest, objS);

//    // if((v1Outside && !v2Outside) || (!v1Outside && v2Outside)) {
//    //  // addABall(v1.x, v2.y, v2.z, 0xff0000, 0.5);
//    //  // addABall(v1.x, v2.y, v2.z, 0xff0000, 0.5);
//    //  if(!oneTimeStopper) {
//    //    addALine(v1, v2, 0xffff00);
//    //    addATriangle(va, vb, vc, 0xffff00);
//    //    oneTimeStopper = true;

//    //    isPointOutsideFace(v1, fClosest, objS, true);
//    //    isPointOutsideFace(v2, fClosest, objS, true);
//    //  }
//    //  // console.log(v1);
//    //    return true;
//    // }

//    var v = fClosest.centroid.clone();
//    v.applyMatrix4(objS.matrixWorld);

//    var nml = fClosest.normal.clone();
//    var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / 
//        nml.dot(new THREE.Vector3().subVectors(v2, v1));
//    var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

// // 0 <= r && r <= 1 && 
//    if(0 <= r && r <= 1 && isInTriangle(pr, va, vb, vc)) {
//      if(stopper < 5) {
//        addALine(v, new THREE.Vector3().addVectors(v, nml), 0x00ff00);
//        addALine(v1, v2, 0xffff00);
//        addALine(new THREE.Vector3().addVectors(v1, v2).divideScalar(2), pr, 0xff0000);
//        addATriangle(va, vb, vc, 0xffff00);
//        // addABall(pr.x, pr.y, pr.z, 0xff0000, 0.1);
        
//        stopper++;

//        console.log("r = " + r);
//      }

//      return true;
//    }


  // }

/*
  v: point of query
  f: one face of obj
  obj: an object
*/
// function isPointOutsideFace(v, f, obj, show) {
//  var c = f.centroid.clone();
//  c.applyMatrix4(obj.matrixWorld);
//  var pointToFace = new THREE.Vector3().subVectors(c, v);

//  var nml = f.normal.clone();
//  var angleToFace = pointToFace.dot(nml);

//  if(show) {
//    addALine(c, new THREE.Vector3().addVectors(c, nml), 0x00ff00);
//    addALine(v, c, 0x0000ff);
//    console.log(angleToFace);
//  }
//  // outside<0 inside>0
//  return angleToFace < 0;
// }